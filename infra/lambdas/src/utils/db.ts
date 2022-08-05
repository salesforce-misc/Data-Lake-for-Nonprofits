import { Client, Configuration, ResultIterator, Value } from 'ts-postgres';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { inspect } from 'util';

let dbSecretName = process.env.DB_SECRET_NAME;
if (dbSecretName === undefined && dbSecretName !== '') {
  throw new Error("Must set DB_SECRET_NAME environment variable!");
}
export const DB_SECRET_NAME = dbSecretName;

const secrets = new SecretsManagerClient({ region: process.env.AWS_REGION });
const DATA_LOADING_SCHEMA = 'dataload';
const TEMP_SCHEMA = 'temp';
const PUBLIC_SCHEMA = 'public';

export interface TableInfo {
  tableName: string;
  tableSchema: string;
  columnCount: number;
}

// This message is caused by concurrently creating a schema/table with IF EXISTS. When this happens the system just needs to wait a short period of time to
// ensure the DDL action which is in progress is done rather than failing immediately.
// See explanation here:
// https://stackoverflow.com/questions/29900845/create-schema-if-not-exists-raises-duplicate-key-error
const CREATE_CONCURRENTLY_FAILURE_MESSAGE = 'duplicate key value violates unique constraint';

export const IMPORT_LOG_NAME = '__import_log';
const IGNORE_TABLES = [IMPORT_LOG_NAME];
const MAX_SQL_LOG_LIMIT = 1_000;
const MAX_SQL_PARAMETERS = 100;

export class Database {
    private postgres: Client | undefined;

    private async delay(seconds: number) {
      return new Promise((resolve) => {
        setTimeout(resolve, seconds * 1000);
      });
    }

    async setupImportLog() {
      try {
        await this.execute(`
        CREATE TABLE IF NOT EXISTS "public"."${IMPORT_LOG_NAME}" (
          id SERIAL, 
          object_name varchar NOT NULL, 
          imported_at timestamp NOT NULL DEFAULT NOW(), 
          row_count bigint NOT NULL,
          column_count bigint NOT NULL,
          import_seconds int NOT NULL,
          import_size_bytes bigint NOT NULL
        );
        `);
      } catch (error: unknown) {
        if (error instanceof Error && error.message.includes(CREATE_CONCURRENTLY_FAILURE_MESSAGE)) {
          this.delay(5);
          await this.setupImportLog();
        } else {
          throw error;
        }
      }
    }

    async insertImportLog(schemaName: string, rowCount: number, columnCount: number, importSeconds: number, bytes: number) {
      await this.execute(`
      INSERT INTO "public"."${IMPORT_LOG_NAME}" (object_name, row_count, column_count, import_seconds, import_size_bytes) VALUES ($1, $2, $3, $4, $5);
      `, [schemaName, rowCount, columnCount, importSeconds, bytes]);
    }

    async setupDataLoadingSchema() {
      try{
        await this.execute(`CREATE SCHEMA IF NOT EXISTS "${DATA_LOADING_SCHEMA}";`);
      } catch (error: unknown) {
        if (error instanceof Error && error.message.includes(CREATE_CONCURRENTLY_FAILURE_MESSAGE)) {
          this.delay(5);
          await this.setupDataLoadingSchema();
        } else {
          throw error;
        }
      }
    }

    async setupTempSchema() {
      try {
        await this.execute(`CREATE SCHEMA IF NOT EXISTS "${TEMP_SCHEMA}";`);
      } catch (error: unknown) {
        if (error instanceof Error && error.message.includes(CREATE_CONCURRENTLY_FAILURE_MESSAGE)) {
          this.delay(5);
          await this.setupTempSchema();
        } else {
          throw error;
        }
      }
    }

    async prepareDataLoadingTable(schemaName: string) {
        // Ensure to drop indexes too with CASCADE
        await this.execute(`DROP TABLE IF EXISTS ${this.dataLoadingTableName(schemaName)} CASCADE;`);
    }

    async prepareTempTable(schemaName: string) {
        // Ensure to drop indexes too with CASCADE
        await this.execute(`DROP TABLE IF EXISTS ${this.tempTableName(schemaName)} CASCADE;`);
    }

    dataLoadingSchema(quoted: boolean = true): string {
      return quoted ? `"${DATA_LOADING_SCHEMA}"` : DATA_LOADING_SCHEMA;
    }

    dataLoadingTableName(schemaName: string): string {
        return `${this.dataLoadingSchema()}."${schemaName.toLowerCase()}"`;
    }

    tempSchema(quoted: boolean = true): string {
      return quoted ? `"${TEMP_SCHEMA}"` : TEMP_SCHEMA;
    }

    tempTableName(schemaName: string): string {
      return `${this.tempSchema()}."${schemaName.toLowerCase()}"`;
    }

    finalSchema(quoted: boolean = true): string {
      return quoted ? `"${PUBLIC_SCHEMA}"` : PUBLIC_SCHEMA;
    }

    finalTableName(schemaName: string): string {
      return `${this.finalSchema()}."${schemaName.toLowerCase()}"`;
    }

    async gatherTableInformation(schemaName: string): Promise<TableInfo[]> {
      const result = await this.execute(`
      SELECT table_schema, table_name, count(*) as column_count 
      FROM information_schema.columns
      GROUP BY table_schema, table_name
      HAVING table_schema IN ('${this.tempSchema(false)}', '${this.finalSchema(false)}', '${this.dataLoadingSchema(false)}')
      AND table_name = '${schemaName.toLowerCase()}';`);

      const ret: TableInfo[] = [];
      for await (const row of result) {
        const tableName = row.get('table_name');
        const tableSchema = row.get('table_schema');
        const columnCount = row.get('column_count');
        if (tableName && tableSchema && columnCount && typeof tableName === 'string' && typeof tableSchema === 'string' && typeof columnCount === 'bigint') {
          ret.push({ tableName, tableSchema, columnCount: Number(columnCount) });
        } else {
          throw new Error(`Got unexpected type or missing values: ${inspect(row, false, null)}`);
        }
      }

      return ret;
    }

    async gatherTables(): Promise<string[]> {
      const result = await this.execute(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name NOT IN (${IGNORE_TABLES.map((t) => `'${t}'`).join(', ')});
      `);

      const tables: string[] = []
      for await (const row of result) {
        const tableName = row.get('table_name');
        if (tableName && typeof tableName === 'string') {
          tables.push(tableName);
        }
      }

      return tables;
    }

    async dropTable(tableName: string) {
      await this.execute(`DROP TABLE ${this.finalTableName(tableName)} CASCADE;`);
    }

    async countRecords(schemaName: string): Promise<number> {
      const result = await this.execute(`SELECT count(*) as count FROM ${this.finalTableName(schemaName)};`);

      let count: number = -1;
      for await (const row of result) { // Should only be one row
        const tempCount = row.get('count');
        if (tempCount != undefined && (typeof tempCount === 'bigint' || typeof tempCount === 'number')) {
          count = Number(tempCount);
        } else {
          console.error("Exepcted a count value of type number but got someething else:", inspect(row));
        }
      }

      if (count === -1) {
        console.error("Count metric for table", schemaName, "did not report any record count, response:", inspect(result));
      }

      return count;
    }

    async execute(sql: string, parameters: Value[] = []): Promise<ResultIterator> {
        if (!this.isConnected()) {
            await this.connect();
        }

        // Prevent filling up log space too quickly by making any large request not logged
        if (sql.length < MAX_SQL_LOG_LIMIT && parameters.length < MAX_SQL_PARAMETERS) {
          console.log("Executing SQL:", sql, "... parameters:", inspect(parameters, false, null));
        }
        return await this.postgres!.execute({ text: sql, values: parameters });
    }

    isConnected(): boolean {
        return this.postgres !== undefined && !this.postgres.closed;
    }

    private async connect() {
        this.postgres = new Client(await this.getDbConnectionInfo());
        await this.postgres.connect();

        console.log("Connected to database!");
    }

    private async getDbConnectionInfo(): Promise<Configuration> {
        const command = new GetSecretValueCommand({ SecretId: DB_SECRET_NAME });
        const response = await secrets.send(command);
      
        let secret: string | undefined;
        if (response.SecretString) {
          secret = response.SecretString;
        } else {
          throw new Error("Unable to get secret string!");
        }
      
        const unsafeJson: any = JSON.parse(secret);
      
        return {
          host: unsafeJson.host,
          port: unsafeJson.port ? parseInt(unsafeJson.port, 10) : 5432,
          user: unsafeJson.username,
          database: unsafeJson.dbname,
          password: unsafeJson.password,
        }
      }
}
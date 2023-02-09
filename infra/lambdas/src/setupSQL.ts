import { S3ListingEvent, Schema, flowName, SchemaField, SchemaFieldType } from './utils/schema';
import { processSchema } from './utils/readSchema';
import { Database } from './utils/db';

interface SetupSQLResult {
  flowName: string;
}

export const handler = async function(event: S3ListingEvent): Promise<SetupSQLResult> {
  console.log("Incoming parameters:", event);

  return processSchema(event, handle);
}

const db = new Database();

async function handle(schema: Schema, s3Key: string): Promise<SetupSQLResult> {
  console.log("Processing", s3Key);

  await db.setupDataLoadingSchema();
  await db.prepareDataLoadingTable(schema.name);

  let [createTable, comments, indexes] = generateCreateTable(schema, db.dataLoadingTableName(schema.name));
  await db.execute(createTable);
  for (const comment of comments) {
    await db.execute(comment);
  }
  for (const index of indexes) {
    await db.execute(index);
  }

  return {
    flowName: flowName(schema),
  }
}

function generateCreateTable(schema: Schema, tableName: string): [string, string[], string[]] {
  const columns: string[] = [];
  const comments: string[] = [];
  const indexes: string[] = [];
  for (const fieldName in schema.properties) {
    const field: SchemaField = schema.properties[fieldName];
    columns.push(`"${fieldName.toLowerCase()}" ${typeFromSalesforceType(field.type)}`);
    comments.push(`COMMENT ON COLUMN ${tableName}."${fieldName.toLowerCase()}" is '${field.$comment.replace(/'/g, "''")}';`);
    const index: string | undefined = indexForField(field, schema.name.toLowerCase(), fieldName.toLowerCase(), tableName);
    if (index) {
      indexes.push(index);
    }
  }
  return [
    `CREATE TABLE IF NOT EXISTS ${tableName} (${columns.join(",\n")});`,
    comments,
    indexes,
  ];
}

function typeFromSalesforceType(type: SchemaFieldType): string {
  switch (type) {
    case "id":
      return "VARCHAR(19) PRIMARY KEY"; // i.e. 0015f00000I00vaAAB
    case "reference":
      return "VARCHAR(19)"; // i.e. 0015f00000I00vaAAB
    case "string":
    case "picklist":
    case "multipicklist":
    case "textarea":
    case "url":
    case "encryptedstring":
    case "anyType":
    case "phone":
    case "email":
    case "combobox":
    case "base64":
      return "TEXT";
    case "boolean":
      return "BOOLEAN";
    case "double":
      return "DOUBLE PRECISION";
    case "currency":
      return "DOUBLE PRECISION"; // Will need to parse when data is inserted
    case "int":
      return "integer";
    case "long":
      return "bigint";
    case "datetime":
      return "TIMESTAMP WITH TIME ZONE";
    case "date":
      return "DATE";
    case "time":
      return "TIME";
    case "percent":
      return "REAL";
    // Compound field types should not get here
    case "address":
    case "location":
    case "calculated":
    case "complexvalue":
    case "datacategorygroupreference":
    case "junctionidlist":
    case "masterrecord":
    case "byte":
      throw new Error(`Cannot create table column definition for compound type: "${type}"`);
    default:
      return unableToConvertType(type);
  }
}

// Local function to handle runtime failure and provide type saftey to ensure all values are checked and the default case is not hit
function unableToConvertType(type: never): never;
function unableToConvertType(type: SchemaFieldType): never {
  throw new Error(`Unable to convert type "${type}" to PostgresSQL data type!`);
}

function indexForField(field: SchemaField, schemaName: string, fieldName: string, tableName: string): string | undefined {
  switch (field.type) {
    case "reference":
      return `CREATE INDEX CONCURRENTLY IF NOT EXISTS "index_${schemaName.toLowerCase()}_${fieldName}" ON ${tableName} USING BTREE ("${fieldName.toLowerCase()}");`
    default:
      return undefined;
  }
}
import { Value } from 'ts-postgres';
import { format } from 'node-pg-format';
import { Database } from './db';
import { IDENTIFIER_TYPE, Schema, SchemaField, SchemaFieldType } from './schema';

const db = new Database();
// Even though we are not using node-postgres, this issue explains the reason for escaping input rather than using parameters. Postgres has a 
// restriction for a maximum number of parameters in a prepared statement: 34,464. This would mean, for the Account object with 533 columns
// only 34,464 / 533 = 64 rows could be inserted in one statement, leading to 1000 rows taking 1000 / 64 = 16 insert statments per thousand.
// For 1 million records, thats 16,000 insert statements using parameters as opposed to 1,000 without, making for escaping have far less overhead.
// https://github.com/brianc/node-postgres/issues/1091

// The columns sizes and row counts are limited such that there is no SQL statement which will try to insert too much at once. If more than the below
// columns exist in an object, the code will perform an UPSERT operation with the ID field so that the additional columns will trigger the ON CONFLICT
// clause and update the record with the additional column data thereby breaking the single insert statement into multiple. It is not expected, when
// using AppFlow without aggregation, for the row count to be above the constant value below because the file sizes should be based upon Salesforce
// pagination size. This means the typical execution, even for large objects, will only result in a single INSERT statement executed even though
// there is an O(n^2) insert algorithm below.
const MAX_COLUMN_SIZE = 600;
const MAX_ROW_BATCH_SIZE = 1000;

export async function processRecords(schema: Schema, allRecords: object[]): Promise<void> {
    // There should only be one IDENTIFIER_TYPE in a schema, since all other identifiers are typed as "reference" for foreign keys
    const allColumns: string[] = Object.keys(schema.properties).filter((col) => schema.properties[col].type !== IDENTIFIER_TYPE);
    const idCol: string | undefined = Object.keys(schema.properties).find((col) => schema.properties[col].type === IDENTIFIER_TYPE);
    if (!idCol) {
        throw new Error(`Unable to find ID type for schema "${schema.name}" within schema properties which is required, none of the following columns are of type "${IDENTIFIER_TYPE}": ${allColumns.join(", ")}`);
    }

    for (let i = 0; i < allColumns.length; i = i + MAX_COLUMN_SIZE) {
        const columns: string[] = allColumns.slice(i, i + MAX_COLUMN_SIZE);

        for (let j = 0; j < allRecords.length; j = j + MAX_ROW_BATCH_SIZE) {
            const records = allRecords.slice(j, j + MAX_ROW_BATCH_SIZE);

            const parameters: Value[] = [];
            for (const record of records) {
                const idVal = recordGet(record, idCol);
                if (idVal) {
                    parameters.push(idVal);
                } else {
                    throw new Error(`Primary key column not found on record: ${record}`);
                }
                // Have to push them in the same order they were mentioned in the columns
                for (const column in columns) {
                    const field = columns[column];
                    const val: Value | undefined = recordGet(record, field);
                    if (val) {
                        parameters.push(convertValue(val, schema.properties[field]));
                    } else {
                        // Must push a value so the array index is not off
                        parameters.push(null);
                    }
                }
            }

            console.log("Inserting data into", schema.name, "record count:", records.length, "with total parameter length:", parameters.length);
            const insertSQL = generateInsertSql(db.dataLoadingTableName(schema.name), columns, idCol, records.length, parameters);
            console.log("Insert SQL: ", insertSQL);
            await db.execute(insertSQL);

            console.log("Batch Insert Complete!");
        }
    }

    console.log("All Batches Completed!");
}

function recordGet(record: object, field: string): Value | undefined {
    if (field in record && (record as any)[field]) {
        return (record as any)[field];
    }

    return undefined;
}

function convertValue(value: Value, field: SchemaField): Value {
    if (value === undefined || value === null) {
        return null;
    }
    // If is not a supported type
    if (!(field.type in SchemaFieldType)) {
        // Prevent double quotes at start/finish
        if (typeof value === 'string') {
            return value;
        }
        // Otherwise, all others are handled properly (i.e. JSON.stringify(1234.45) or JSON.stringify(true) etc.)
        return JSON.stringify(value);
    }

    // Otherwise handle conversion of known types
    switch (field.type) {
        case "currency":
            if (typeof value === 'string' || typeof value === 'number') {
                // @ts-ignore This is actually ok, parseFloat(300320.33) === 300320.33
                const floatVal = parseFloat(value);
                if (floatVal !== NaN) {
                    return floatVal;
                } else {
                    throw new Error(`Parsing float value returned NaN: ${value}`);
                }
            } else {
                throw new Error(`Unable to convert currency type to float value: (${typeof value}) ${value}`);
            }
        default:
            // Is a known type but needs no special handling
            return value;
    }
}

function generateInsertSql(tableName: string, columns: string[], idCol: string, numberOfRecords: number, parameters: Value[]): string {
    const colNames = columns.map((col) => col.toLowerCase());

    const rows = Array(numberOfRecords).fill(null).map(() => {
        // generate idCol + all columns like
        // (%L, %L, %L, %L, ...)
        return `(%L, ${colNames.map(() => "%L").join(", ")})`
    });
    

    // Use ON CONFLICT DO UPDATE so that the second grouping of columns works as well as
    // retry attempts that may have partially succeeded
    const sql = `
    INSERT INTO ${tableName} (${idCol.toLowerCase()}, ${colNames.join(", ")}) VALUES
    ${rows.join(",\n    ")}
    ON CONFLICT (${idCol.toLowerCase()}) DO UPDATE SET
    ${colNames.map((col) => `${col} = EXCLUDED.${col}`).join(",\n    ")};
    `;

    return format(sql, ...parameters);
}

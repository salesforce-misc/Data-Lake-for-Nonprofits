import { Database, TableInfo } from './utils/db';
import { S3ListingEvent, extractSchemaName, flowName } from './utils/schema';

const db = new Database();

interface Flow {
  flowName: string;
}

export const handler = async function(event: S3ListingEvent): Promise<Flow> {
  console.log("Incoming parameters:", event);

  return await handle(...extractSchemaName(event));
}

async function handle(schemaName: string, installationId: string): Promise<Flow> {
  const tableInfo = await db.gatherTableInformation(schemaName);
  const schemas = schemaLocations(tableInfo);
  console.log("Table information for", schemaName, "=>", tableInfo);

  const dataLoadingSchema = db.dataLoadingSchema(false);
  const tempSchema = db.tempSchema(false);
  const finalSchema = db.finalSchema(false);

  
  if (schemas[tempSchema] && !schemas[finalSchema]) { // Failure after successfully moving final data to temp schema
    await moveTempBack(schemaName);
    console.log("Moving data from dataload to final schema after having reverted temp");
    await moveLoadedData(schemaName, false);
  } else if (schemas[tempSchema] && schemas[finalSchema] && !schemas[dataLoadingSchema]) { // Import was successful but something errored after that
    console.log("Nothing to do for", schemaName, "since data exists in temp and final destination, this means the final destination is the recent import.");
  } else if (schemas[dataLoadingSchema]) { // Normal case, data being in the final schema is unnecessary because the first time it is not there, but every time after that it is
    console.log("Setting up temp schema and temp table");
    await db.setupTempSchema();
    await db.prepareTempTable(schemaName);
    console.log("Moving data from dataload to final schema");
    await moveLoadedData(schemaName, schemas[finalSchema]);
  } else if (schemas[finalSchema] && !schemas[dataLoadingSchema] && !schemas[tempSchema]) {
    // Successful in prior execution, nothing to do
  } else {
    // Here we don't understand how the data could be in any other configuration. If we get here, code changes are necessary to handle this situation
    throw new Error(`Unable to handle data movement to final schema, data locations: ${schemas}`);
  }

  console.log("Import for", schemaName, "completed!");

  return { flowName: flowName(schemaName, installationId) };
}

function schemaLocations(tableInfo: TableInfo[]) {
  return Object.fromEntries(tableInfo.map((t) => [t.tableSchema, true]));
}

// This funciton needs to do two things atomically.
//   1. Move data from the final schema to the temp schema
//   2. Move data from the dataload schema to the final schema
//   3. Drop the temp data
// If the first does not succeed, then a retry can be done without issue. However, if the first succeeds but fails after that,
// Then a retry could end up dropping the data in the temp schema when the prepareTempTable function runs
async function moveLoadedData(schemaName: string, finalExists: boolean) {
  if (finalExists) {
    console.log("Not the first attepmt, moving the live data out of the way");
    try {
      // Up to this point nothing has happened which may result in the data not being able to be put back
      // After this line though, data is missing from the public schema, so on failure it may need to be moved back
      await db.execute(`ALTER TABLE ${db.finalTableName(schemaName)} SET SCHEMA ${db.tempSchema()};`);
    } catch (error: unknown) {
      console.error("Error in moving table to temp schema:", error);
      const tableInfo = await db.gatherTableInformation(schemaName);
      const schemas = schemaLocations(tableInfo);
      console.log("Current table data locations:", tableInfo);
      if (schemas[db.tempSchema(false)] && !schemas[db.finalSchema(false)]) {
        moveTempBack(schemaName);
      }
      // Throw the error to prevent the next line
      throw error;
    }
  }
  console.log("Moving the loaded data to the final destination");
  try {
    // At this stage, the data has been moved to the temp schema, so as long as this works we are done
    await db.execute(`ALTER TABLE ${db.dataLoadingTableName(schemaName)} SET SCHEMA ${db.finalSchema()};`);
  } catch (error: unknown) {
    console.error("Error in moving temp table to final schema:", error);
    const tableInfo = await db.gatherTableInformation(schemaName);
    const schemas = schemaLocations(tableInfo);
    console.log("Current table data locations:", tableInfo);
    // If nothing changed, move the temp table back to the final schema
    if (schemas[db.tempSchema(false)] && !schemas[db.finalSchema(false)]) {
      moveTempBack(schemaName);
    }

    // Throw error to report failure
    throw error;
  }

  try {
    await db.execute(`DROP TABLE IF EXISTS ${db.tempTableName(schemaName)};`);
  } catch (error: unknown) {
    // Don't retrhow, if this happens it is not critical to a successful import
    console.error("Unable to drop temp data after successful import, will be erased on next import or when schema is dropped", error);
  }
}

async function moveTempBack(schemaName: string) {
  console.log("Moving temp back to final schema location");
  try {
    await db.execute(`ALTER TABLE ${db.tempTableName(schemaName)} SET SCHEMA ${db.finalSchema()};`)
  } catch (error: unknown) {
    console.error("Error in moving table back from temp:", error);
    const tableInfo = await db.gatherTableInformation(schemaName);
    console.log("Current table data locations:", tableInfo);
  }
}

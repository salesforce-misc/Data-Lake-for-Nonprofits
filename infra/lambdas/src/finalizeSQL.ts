import { Database } from './utils/db';
import { EntityMap } from './utils/schema';

interface FinalizeSQLEvent {
  objects: EntityMap;
}

const db = new Database();

export const handler = async function(event: FinalizeSQLEvent): Promise<void> {
  console.log("Incoming parameters:", event);

  console.log("Dropping temp schema");
  // Clean up extra schemas used for data loading and transfer
  await db.execute(`DROP SCHEMA IF EXISTS ${db.tempSchema()} CASCADE;`);
  console.log("Dropping dataload schema");
  await db.execute(`DROP SCHEMA IF EXISTS ${db.dataLoadingSchema()} CASCADE;`);

  const objects = event.objects;
  if (objects) {
    const tables = await db.gatherTables();
    console.log("Total list of tables in the system:", tables);
    for (const table of tables) {
      // If this table is not in Salesforce
      if (!objects[table]) {
        console.log('Table', table, 'does not exist in Salesforce, dropping in RDS');
        await db.dropTable(table);
      }
    }
  }

  console.log("Finalize complete!");
}

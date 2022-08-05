import { Value } from "ts-postgres";
import { TableInfo } from "../db";

const mock = jest.fn().mockImplementation(() => {
  return {
    gatherTableInformation(_schemaName: string): TableInfo[] {
      return [{
        tableName: 'tableName',
        tableSchema: 'tableSchema',
        columnCount: 20,
      },
      {
        tableName: 'test',
        tableSchema: 'dataload',
        columnCount: 1,
      }
      ];
    },

    gatherTables() {
      return ['test'];
    },

    setupDataLoadingSchema() {
      // Nothing to do
    },

    prepareDataLoadingTable(_schemaName: string) {
      // Nothing to do
    },

    dataLoadingSchema(_quoted: boolean) {
      return "dataload";
    },

    tempSchema(_quoted: boolean) {
      return "temp";
    },

    finalSchema(_quoted: boolean) {
      return "final";
    },

    dataLoadingTableName(_schemaName: string) {
      return "TEST_DATA_TABLE_NAME";
    },

    tempTableName(_schemaName: string) {
      return "TEST_TEMP_TABLE_NAME";
    },

    setupTempSchema() {
      // Nothing to do
    },

    prepareTempTable(_schemaName: string) {
      // Nothing to do
    },

    execute(_sql: string, _parameters: Value[] = []) {

    },

    setupImportLog() {
      // Nothing to do
    },

    countRecords(_schemaName: string) {
      return 3829;
    },

    insertImportLog(_schemaName: string, _rows: number, _columns: number, _seconds: number, _bytes: number) {
      // Nothing to do
    }
  }
})

export const Database = mock;
import { inspect } from "util";
import { Database, IMPORT_LOG_NAME } from "./utils/db";
import { extractSchemaName, partialS3EventFrom, PartialS3EventListing, S3ListingEvent, schemaNameFromFlow } from "./utils/schema";
import { ImportMetadata, Status, writeStatus } from "./utils/status";

export enum ImportStage {
    PREPARE = 'PREPARE',
    BEGIN = 'BEGIN',
    IMPORT = 'IMPORT',
    CLEANUP = 'CLEANUP',
    NONE = 'NONE'
}

export interface StatusReportEvent { 
    s3?: S3ListingEvent;
    flowName?: string;
    flowStatus?: string;
    flow?: {
        ExecutionResult: {
            // This will get parsed as a number up to 1e307
            BytesProcessed: number; // 194888
            BytesWritten: number; // 137879
            RecordsProcessed: number; // 70
        };
        LastUpdatedAt: string; // '2022-04-06T14:19:46.750Z'
        StartedAt: string; // '2022-04-06T14:19:39.337Z'
    };
    executionId: string;
    importStage: ImportStage;
}

const db = new Database();

export const handler = async function(event: StatusReportEvent): Promise<PartialS3EventListing | S3ListingEvent> {
    console.log("Incoming parameters:", event);

    const flowStatus = event.flowStatus || "Successful";
    
    if (flowStatus === "Error") {
        event.importStage = ImportStage.NONE;
    }
    
    let s3Event: PartialS3EventListing;
    if (event.s3) {
        s3Event = event.s3;
    } else if (event.flowName) {
        const [schemaName, installationId] = schemaNameFromFlow(event.flowName);
        s3Event = partialS3EventFrom(schemaName, installationId);
    } else {
        throw new Error(`Unable to construct S3 event to get schema name and installation ID from: ${event}`);
    }

    const [schemaName, installationId] = extractSchemaName(s3Event);

    switch(event.importStage) {
        case ImportStage.PREPARE:
            await writeStatus(schemaName, event.executionId, {
                status: Status.PREPARING,
            });
            break;
        case ImportStage.BEGIN:
            await writeStatus(schemaName, event.executionId, {
                status: Status.IN_PROGRESS,
            });
            break;
        case ImportStage.IMPORT:
            await writeStatus(schemaName, event.executionId, {
                status: Status.IMPORTING,
            });
            break;
        case ImportStage.CLEANUP:
            await db.setupImportLog();
            const metadata = await getImportMetadata(schemaName, installationId, event.flow);
            console.log("Metadata for import", inspect(metadata));
            await db.insertImportLog(schemaName, metadata.rowCount, metadata.columnCount, metadata.importSeconds, metadata.bytesWritten);
            console.log(`Metadata recorded in ${IMPORT_LOG_NAME}!`);

            await writeStatus(schemaName, event.executionId, {
                status: Status.SUCCESSFUL,
                metadata: metadata,
            });
            break;
        default:
            // If a case is not handled, this code will have a compiler error 
            return nonExistentImportStage(event);
    }

    return s3Event;
}

function nonExistentImportStage(event: StatusReportEvent): never;
function nonExistentImportStage(event: StatusReportEvent): void {
    console.log(`Unable to handle import stage: ${event}`);
}
  
async function getImportMetadata(schemaName: string, _installationId: string, flow?: StatusReportEvent['flow']): Promise<ImportMetadata> {
    const tableStats = await db.gatherTableInformation(schemaName);
    const finalSchemaStats = tableStats.find((t) => t.tableSchema === db.finalSchema(false));
    let rowCount = await db.countRecords(schemaName);

    let importSeconds = -1;
    let bytesWritten = -1;

    if (flow && flow.ExecutionResult && flow.StartedAt && flow.StartedAt !== '' && flow.LastUpdatedAt && flow.LastUpdatedAt !== '') {
        const lastUpdated = new Date(flow.LastUpdatedAt);
        const startedAt = new Date(flow.StartedAt);
        importSeconds = (lastUpdated.getTime() - startedAt.getTime()) / 1000;

        // Bytes processed includes overhead of AppFlow, so use bytes written as an indication of the size of the data in JSON format
        bytesWritten = flow.ExecutionResult.BytesWritten;

        if (rowCount === -1 && flow.ExecutionResult.RecordsProcessed) {
            rowCount = flow.ExecutionResult.RecordsProcessed;
        }
    }

    const metrics = { 
        rowCount: rowCount,
        columnCount: finalSchemaStats?.columnCount || -1,
        importSeconds: importSeconds, 
        bytesWritten: bytesWritten,
    };

    if (importSeconds === -1 || bytesWritten === -1 || rowCount === -1 || finalSchemaStats?.columnCount === undefined) {
        console.error("Error gathering metrics about import for", schemaName, "got the following metrics:", metrics);
    }

    return metrics;
}
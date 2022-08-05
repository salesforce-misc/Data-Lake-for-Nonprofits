import { inspect } from 'util';
import { listEntities } from './utils/readAppFlow';
import { buildEntityMap, extractSchemaName, S3ListingEvent } from './utils/schema';
import { removeSchema } from './utils/writeSchema';

interface FilterSchemaListingInput {
  schemas: S3ListingEvent[];
}

 // If removing more than 10 schemas in a single execution the system should halt and fail
 const MAX_SCHEMA_REMOVAL = 10;

// Use async handler so that lambda reads the return result rather than waiting for
// done callback and ignoring function result.
export const handler = async function(events: FilterSchemaListingInput): Promise<S3ListingEvent[]> {
  console.log(events);

  // Step functions JSONPath language does not allow for dropping an array element
  // based upon a value within the element. Doing `OutputPath: $.Contents.[?(@.Key!='schemas/')]`
  // does not work, but `OutputPath: $.Contents.[?(@.Key=='schemas/')]` does.
  let schemas = events.schemas.filter((s3) => s3.Key !== "schemas/");;
  
  let entityFilterSuccess = false;
  const entities = await listEntities();
  if (entities.connectorEntityMap) {
    const objects = buildEntityMap(entities.connectorEntityMap);
    if (objects && Object.keys(objects).length > 0) {

      // Array.filter does not work with async/await, so must use for loop and build a new list
      const newSchemas: S3ListingEvent[] = [];
      let removedObjects = [];
      for (const s3 of schemas) {
        const [schemaName, _installationId] = extractSchemaName(s3);

        // If this is still a valid object, keep it, otherwise remove the file
        if (!objects[schemaName]) {
          if (removedObjects.length < MAX_SCHEMA_REMOVAL) {
            console.log('System configured for object', schemaName, 'but does not exist in Salesforce, will remove!');
            await removeSchema(s3.Key);
            removedObjects.push(s3.Key);
            continue;
          } else {
            throw new Error(`Already removed ${removedObjects.length} objects during this execution and now have detected another object which was removed, over the max of ${MAX_SCHEMA_REMOVAL}. Failing to avoid removing all schema files. Missing object: ${schemaName}; Already removed object: ${removedObjects}`);
          }
        }

        newSchemas.push(s3);
      };
      schemas = newSchemas;

      entityFilterSuccess = true;
    }

    if (!entityFilterSuccess) {
      throw new Error(`Unable to filter entities which have been deleted, list entity response: ${inspect(entities, false, null)}`);
    }
  }
  
  return schemas;
}

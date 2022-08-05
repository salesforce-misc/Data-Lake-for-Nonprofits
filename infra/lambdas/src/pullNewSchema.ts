import { S3ListingEvent, Schema, toSchemaFieldType, COMPLEX_FIELDS, SchemaField, SchemaFieldType } from './utils/schema';
import { processSchema } from './utils/readSchema';
import { writeSchema } from './utils/writeSchema';
import { describeEntity } from './utils/readAppFlow';
import { ConnectorEntityField } from '@aws-sdk/client-appflow';

export const handler = async function(event: S3ListingEvent): Promise<S3ListingEvent> {
  console.log("Incoming parameters:", event);
  
  return processSchema(event, handle);
}

async function handle(schema: Schema, s3Key: string) {
  const newSchema = schema;
  // Clean existing properties
  newSchema.properties = {};

  const response = await describeEntity(schema);
  console.log("Describe connector entity", schema.name, "response:", response);

  const fields = response.connectorEntityFields;
  if (fields !== undefined && fields.length > 0) {
    for (let field of fields) {
      const type = toSchemaFieldType(field.supportedFieldTypeDetails?.v1?.fieldType);
      if (field.identifier &&
        type &&
        // COMPLEX_FIELDS.includes() does not work because COMPLEX_FIELDS is type narrowed to less than schemaFieldType
        COMPLEX_FIELDS.filter((c) => c === type).length === 0 &&
        !schema.exclude[field.identifier]) {
        newSchema.properties[field.identifier] = propertyFor(field, field.identifier, type);
      } else if (field.identifier && type && COMPLEX_FIELDS.filter((c) => c === type).length !== 0) {
        console.log("Add", field.identifier, "to exclude list due to it being a compound field:", type);
        newSchema.exclude[field.identifier] = propertyFor(field, field.identifier, type);
      }
    }
  } else {
    throw new Error(`Received successful response from AppFlow with no fields defined: ${JSON.stringify(response.connectorEntityFields)}`);
  }

  await writeSchema(s3Key, newSchema);
}

function propertyFor(field: ConnectorEntityField, identifier: string, type: SchemaFieldType): SchemaField {
  return {
    type: type,
    label: field.label || identifier,
    $comment: field.description || field.label || identifier,
  };
}

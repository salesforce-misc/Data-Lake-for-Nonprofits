import { ConnectorEntity } from '@aws-sdk/client-appflow';
import invert from 'lodash/invert';

export interface S3ListingEvent {
  ETag: string;
  Key: string;
  LastModified: string;
  Size: number;
  StorageClass: 'STANDARD';
}

export type PartialS3EventListing = Pick<S3ListingEvent, 'Key'> & Partial<S3ListingEvent>;

export interface Schema {
  type: "object";
  name: string;
  label: string;
  installationId: string;
  properties: SchemaProperties;
  exclude: SchemaProperties;
}

export type SchemaProperties = {
  [k in string]: SchemaField;
}

export interface SchemaField {
  type: SchemaFieldType;
  label: string;
  $comment: string;
}

// Primitive Data Types:
// https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/primitive_data_types.htm
// And other Field Types:
// https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/field_types.htm
export const SchemaFieldType = {
  ADDRESS: "address",
  // ANY: "anytype",
  // CALCULATED: "calculated",
  COMBOBOX: "combobox",
  CURRENCY: "currency", 
  // DATA_CATEGORY_GROUP_REFERENCE: "datacategorygroupreference",
  EMAIL: "email", 
  ENCRYPTED_STRING: "encryptedstring",
  ID: "id",
  // JUNCTION_ID_LIST: "junctionidlist",
  LOCATION: "location",
  // MASTER_RECORD: "masterrecord",
  MULTIPICKLIST: "multipicklist", 
  PERCENT: "percent", 
  PHONE: "phone", 
  PICKLIST: "picklist",
  REFERENCE: "reference", 
  TEXTAREA: "textarea", 
  URL: "url", 

  // Primitives
  BASE64: "base64",
  BOOLEAN: "boolean",
  // BYTE: "byte",
  DATE: "date", 
  DATETIME: "datetime", 
  DOUBLE: "double", 
  INT: "int",
  LONG: "long",
  STRING: "string",
  TIME: "time",
} as const;
type SchemaFieldTypeOf = typeof SchemaFieldType;
export type SchemaFieldTypeReverse<T extends Record<keyof T, string>> = {
  [P in keyof T as T[P]]: P
};
export type SchemaFieldType = keyof typeof SchemaFieldTypeReverse;
export const SchemaFieldTypeReverse: SchemaFieldTypeReverse<SchemaFieldTypeOf> = invert(SchemaFieldType) as SchemaFieldTypeReverse<SchemaFieldTypeOf>;
export const COMPLEX_FIELDS = [SchemaFieldType.LOCATION, SchemaFieldType.ADDRESS];
export const IDENTIFIER_TYPE = SchemaFieldType.ID;

export function toSchemaFieldType(type: string | undefined): SchemaFieldType | undefined {
  if (type === undefined) {
    return undefined;
  }
  
  // May return undefined if the type is not on the object
  if (SchemaFieldTypeReverse[type as keyof typeof SchemaFieldTypeReverse]) {
    return type as keyof typeof SchemaFieldTypeReverse;
  } else {
    throw new Error(`Unable to convert "${type}" to SchemaFieldType!`);
  }
}

export function flowName(schemaName: string, installationId: string): string;
export function flowName(schema: Schema): string;
export function flowName(schemaOrSchemaName: Schema | string, installationId?: string): string {
  if (typeof schemaOrSchemaName === 'string' && installationId) {
    return `${schemaOrSchemaName}-${installationId}`;
  } else if (typeof schemaOrSchemaName !== 'string') {
    return flowName(schemaOrSchemaName.name, schemaOrSchemaName.installationId);
  }

  return 'UNKNOWN';
}

export function schemaNameFromFlow(flowName: string): [string, string] {
  const [schemaName, installationId] = flowName.split('-');

  return [schemaName, installationId];
}

export function partialS3EventFrom(schemaName: string, installationId: string): PartialS3EventListing {
  return { Key: `schemas/${schemaName}.${installationId}.schema.json` };
}

export function extractSchemaName(event: PartialS3EventListing | S3ListingEvent): [string, string] {
  const [schemaName, installationId] = event.Key.replace(/schemas\/|\.schema\.json/ig, "").split(".");

  return [schemaName, installationId];
}

 // Response comes back with the following keys in the connectorEntityMap: `["Change Event", "Objects", "Platform Event"]`
 const OBJECTS_KEY = 'Objects';

 export type EntityMap = {
  [k in string]: boolean
 }
 
 export function buildEntityMap(entities: { [k in string]: ConnectorEntity[] }, lowercase: boolean = false): EntityMap {
   const objects = entities[OBJECTS_KEY];
   const map: EntityMap = {};
   for (const obj of objects) {
    if (obj.name) {
      if (lowercase) {
        map[obj.name.toLowerCase()] = true;
      } else {
        map[obj.name] = true;
      }
    }
   }
   
   return map;
 }
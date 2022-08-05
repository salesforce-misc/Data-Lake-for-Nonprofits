import { inspect } from "util";
import { listEntities } from "./utils/readAppFlow";
import { buildEntityMap, EntityMap } from "./utils/schema";

export const handler = async function(): Promise<EntityMap> {
  console.log("Listing entities");

  const entities = await listEntities();
  if (entities && entities.connectorEntityMap) {
    return buildEntityMap(entities.connectorEntityMap, true);
  } else {
    throw new Error(`Unable to list entities, got response: ${inspect(entities, false, null)}`);
  }
}
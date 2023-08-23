import keyBy from "lodash/keyBy";
import sortBy from "lodash/sortBy";

export const defaultObjects: {name: string; label: string }[] = sortBy([
  {
    name: "ampi__Project__c",
    label: "Amp Project",
  },
  {
    name: "Account",
    label: "Organization",
  },
  {
    name: "Contact",
    label: "Contact",
  },

  // {
  //   name: "objectTypeTest1",
  //   label: "Object Type Test 1"
  // },
  // {
  //   name: "objectTypeTest2",
  //   label: "Object Type Test 2"
  // }
], ['label', 'name']);

export const defaultObjectsMap = keyBy(defaultObjects, "name");

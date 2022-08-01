import { types, Instance } from "mobx-state-tree";

import { isCompoundType } from "./utils";

/**
 * Represents a field in a Salesforce object
 */

const fieldProps = {
  name: "",
  label: "",
  type: "",
  excluded: false,
};

const fieldViews = (self: any) => ({
  get compound() {
    return isCompoundType(self.type);
  },
  get canExclude(): boolean {
    // Certain field types can not be excluded
    const types = ["id"];
    const names = ["SystemModstamp", "LastModifiedDate", "LastModifiedById", "CreatedDate", "CreatedById"];

    return !types.includes(self.type) && !names.includes(self.name) && !self.compound;
  },
});

const fieldActions = (self: any) => ({
  toggleExclude() {
    if (!self.canExclude || self.compound) return;
    self.excluded = !self.excluded;
  },
});

export const Field = types.model("Field", fieldProps).views(fieldViews).actions(fieldActions);

export interface IField extends Instance<typeof Field> {}

import filter from "lodash/filter";
import has from "lodash/has";
import sortBy from "lodash/sortBy";

import { types, Instance } from "mobx-state-tree";
import { values } from "mobx";

import { IRawSalesforceObject } from "api/list-salesforce-objects";
import { defaultObjectsMap } from "data/default-npsp-objects";
import { Field, IField } from "models/helpers/Field";
import { isCompoundType } from "models/helpers/utils";

/**
 * Represents a Salesforce object
 */

const sfProps = {
  name: "",
  label: "",
  fields: types.map(Field),
  fieldsLoaded: false,
  selected: false,
  stale: false,
};

const sfActions = (self: any) => ({
  setObject(rawObject: IRawSalesforceObject) {
    self.fields.clear();
    self.name = rawObject.name;
    self.label = rawObject.label;
    self.fieldsLoaded = false;
    self.selected = false;
    self.stale = false;
  },

  setFields(rawFields: { name: string; label: string; type: string }[]) {
    self.fields.clear();
    for (const rawField of rawFields) {
      // Compound fields are excluded
      self.fields.set(rawField.name, { ...rawField, excluded: isCompoundType(rawField.type) });
    }
  },

  setField(rawField: { name: string; label: string; type: string; excluded: boolean }) {
    self.fields.set(rawField.name, { ...rawField, excluded: rawField.excluded || isCompoundType(rawField.type) });
  },

  setFieldsLoaded(flag: boolean) {
    self.fieldsLoaded = flag;
  },

  setSelected(flag: boolean) {
    self.selected = flag;
  },

  markStale() {
    self.stale = true;
  },
});

const sfViews = (self: any) => ({
  get selectableFields(): IField[] {
    // Returns the list of fields that can be selected
    const filtered = filter(values(self.fields), ["canExclude", true]);
    const result: unknown[] = sortBy(filtered, ["label", "name"]);

    return result as IField[];
  },

  get listableFields(): IField[] {
    // listable fields are all the fields with the exception of the compound field
    const filtered = filter(values(self.fields), ["compound", false]);
    const result: unknown[] = sortBy(filtered, ["label", "name"]);

    return result as IField[];
  },

  get immutableFields(): IField[] {
    const filtered = filter(values(self.fields), { compound: false, canExclude: false });
    const result: unknown[] = sortBy(filtered, ["label", "name"]);

    return result as IField[];
  },

  get selectedFields(): IField[] {
    // Returns all fields that are included (including immutable fields)
    const filtered = filter(values(self.fields), ["excluded", false]);
    const result: unknown[] = sortBy(filtered, ["label", "name"]);

    return result as IField[];
  },

  get userSelectedFields(): IField[] {
    // Returns all fields that are included (excluded immutable fields)
    const filtered = filter(values(self.fields), { excluded: false, canExclude: true });
    const result: unknown[] = sortBy(filtered, ["label", "name"]);

    return result as IField[];
  },

  get excludedFields(): IField[] {
    // Returns excluded fields (with the exception of compound fields)
    const filtered = filter(values(self.fields), { excluded: true, compound: false });
    const result: unknown[] = sortBy(filtered, ["label", "name"]);

    return result as IField[];
  },

  get allExcludedFields(): IField[] {
    // Returns all excluded fields including the compound field
    const filtered = filter(values(self.fields), ["excluded", true]);
    const result: unknown[] = sortBy(filtered, ["label", "name"]);

    return result as IField[];
  },
  get fieldsCount(): number {
    // All fields (selected or not) excluding compound fields
    return self.listableFields.length;
  },

  get selectedFieldsCount(): number {
    const result = self.selectedFields;
    return result.length;
  },

  get excludedFieldsCount(): number {
    const result = self.excludedFields;
    return result.length;
  },

  get excluded() {
    // Returns the excluded fields as expected by the step functions lambdas. The following is an example of the
    // expected exclude:
    // "exclude": {
    //   "CompoundField__c": { "type": "location", "label": "<field label>", "$comment": "Compound Field" },
    //   "ABC__c": { "type": "string", "label", "<field label>", "$comment": "ABC field" },
    //   "...": { ... },
    // },
    const excludedFields = self.allExcludedFields;
    const exclude: { [index: string]: { type: string; label: string } } = {};
    for (const field of excludedFields) {
      exclude[field.name] = {
        type: field.type,
        label: field.label,
      };
    }

    return exclude;
  },

  get isDefault(): boolean {
    // Is this object one of the default NPSP objects?
    return has(defaultObjectsMap, self.name);
  },
});

export const SFObject = types.model("SFObject", sfProps).actions(sfActions).views(sfViews);

export interface ISFObject extends Instance<typeof SFObject> {}

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
   {
    name: "ampi__Result__c",
    label: "Result",
  },
  {
    name: "ampi__Indicator__c",
    label: "Indicator",
  },
   {
    name: "ampi__Project_Indicator__c",
    label: "Project Indicator",
  },
  {
    name: "ampi__Project_Indicator_Geographic_Area__c",
    label: "Project Indicator Geographic Area",
  },
   {
    name: "ampi__Indicator_Thematic_Area__c",
    label: "Indicator Thematic Area",
  },
   {
    name: "ampi__Geographical_Area__c",
    label: "Geographic Area",
  },
    {
    name: "ampi__Budget__c",
    label: " Budget",
  },
   {
    name: "ampi__Financial__c",
    label: "Financial",
  },
   {
    name: "ampi__Disbursement__c",
    label: "Disbursement",
  },
  {
    name: "ampi__Implementation_Plan__c",
    label: "Implementation Plan",
  },
    {
    name: "ampi__Activity__c",
    label: "Activity",
  },
  {
    name: "ampi__Reporting_Period__c	",
    label: "Reporting Period",
  },
    {
    name: "ampi__Project_Indicator_Reporting_Period__c",
    label: "Project Indicator Reporting Period",
  },
   {
    name: "ampi__Project_Role__c",
    label: " Project Role",
  },
  {
    name: "ampi__Project_Thematic_Area__c",
    label: "Project Thematic Area",
  },
  {
    name: "ampi__Thematic_Area__c",
    label: "Thematic Area",
  },
  {
    name: "ampi__Project_Indicator_Thematic_Area__c",
    label: "Project Indicator Thematic Area",
  },
   {
    name: "ampi__Disaggregation_Group__c",
    label: "Disaggregation Group",
  },
  {
    name: "ampi__Disaggregation_Value__c",
    label: "Disaggregation Value",
  },
  {
    name: "ampi__Disaggregated_Indicator__c",
    label: "Disaggregated Indicator",
  },
  {
    name: "ampi__Disaggregated_Project_Indicator__c",
    label: "Disaggregated Project Indicator",
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

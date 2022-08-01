import keyBy from "lodash/keyBy";
import sortBy from "lodash/sortBy";

export const defaultObjects: {name: string; label: string }[] = sortBy([
  {
    name: "npsp__Account_Soft_Credit__c",
    label: "Account Soft Credit",
  },
  {
    name: "npsp__Address__c",
    label: "Address",
  },
  {
    name: "npe5__Affiliation__c",
    label: "Affiliation",
  },
  {
    name: "npsp__Grant_Deadline__c",
    label: "Deliverable",
  },
  {
    name: "npsp__Engagement_Plan__c",
    label: "Engagement Plan",
  },
  {
    name: "npsp__Engagement_Plan_Task__c",
    label: "Engagement Plan Task",
  },
  {
    name: "npsp__Allocation__c",
    label: "GAU Allocation",
  },
  {
    name: "npsp__General_Accounting_Unit__c",
    label: "General Accounting Unit",
  },
  {
    name: "npsp__Level__c",
    label: "Level",
  },
  {
    name: "npsp__Partial_Soft_Credit__c",
    label: "Partial Soft Credit",
  },
  {
    name: "npe01__OppPayment__c",
    label: "Payment",
  },
  {
    name: "npe03__Recurring_Donation__c",
    label: "Recurring Donation",
  },
  {
    name: "npe4__Relationship__c",
    label: "Relationship",
  },
  {
    name: "Account",
    label: "Account",
  },
  {
    name: "Contact",
    label: "Contact",
  },
  {
    name: "Lead",
    label: "Lead",
  },
  {
    name: "Campaign",
    label: "Campaign",
  },
  {
    name: "CampaignMember",
    label: "Campaign Member",
  },
  {
    name: "Opportunity",
    label: "Donation",
  },
  {
    name: "OpportunityContactRole",
    label: "Donation Contact Role",
  },
  {
    name: "Task",
    label: "Task",
  },
  {
    name: "Event",
    label: "Event",
  },
  {
    name: "OpportunityStage",
    label: "Opportunity Stage",
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

import isEmpty from "lodash/isEmpty";
import isNumber from "lodash/isNumber";
import padStart from "lodash/padStart";
import { types, Instance } from "mobx-state-tree";

import { humanDay } from "helpers/utils";

import { BaseStep } from "./BaseStep";

/**
 * Represents the import frequency
 */
export enum ImportFrequency {
  Monthly = "MONTHLY",
  Weekly = "WEEKLY",
  Daily = "DAILY",
}

export enum MonthlySettingsSelection {
  LastDay = "LAST_DAY",
  LastWeekDay = "LAST_WEEK_DAY",
  OnDay = "ON_DAY",
}

export enum DataModelSelection {
  Standard = "STANDARD",
  Custom = "CUSTOM",
  MissingAnswer = "MissingAnswer",
}

/**
 * Represents the hour and the minute in a 24-hour format
 */
const TimeParts = types
  .model("TimeParts", {
    hour: "23",
    minute: "00",
  })

  .actions((self) => ({
    setHour(hh: string) {
      if (isEmpty(hh)) return;
      let num = parseInt(hh);
      if (!isNumber(num)) return;
      if (num < 0) num = 0;
      if (num > 23) num = 23;
      self.hour = padStart(`${num}`, 2, "0");
    },

    setMinute(mm: string) {
      if (isEmpty(mm)) return;
      let num = parseInt(mm);
      if (!isNumber(num)) return;
      if (num < 0) num = 0;
      if (num > 59) num = 59;
      self.minute = padStart(`${num}`, 2, "0");
    },
  }))

  .views((self) => ({
    get cronExpressionPart(): string {
      // Returns the first two parts of the cron expression (minute and hour)
      // For minute and hour (we need to parse them first, to get rid of any padded "0", then turn them into a string)
      return `${parseInt(self.minute)} ${parseInt(self.hour)}`;
    },
  }));

/**
 * Represents the monthly settings
 */
const MonthlySettings = types
  .model("MonthlySettings", {
    selection: types.optional(
      types.enumeration<MonthlySettingsSelection>("MonthlySettingsSelection", Object.values(MonthlySettingsSelection)),
      MonthlySettingsSelection.LastDay
    ),
    day: 1, // Default to be day 1 if the selection is 'OnDay'
    time: types.optional(TimeParts, {}),
  })

  .actions((self) => ({
    setSelection(value: MonthlySettingsSelection) {
      self.selection = value;
    },

    setDay(num: number) {
      self.day = num;
    },
  }))

  .views((self) => ({
    get isLastDay(): boolean {
      return self.selection === MonthlySettingsSelection.LastDay;
    },

    get isLastWeekday(): boolean {
      return self.selection === MonthlySettingsSelection.LastWeekDay;
    },

    get isOnDay(): boolean {
      return self.selection === MonthlySettingsSelection.OnDay;
    },
  }))

  .views((self) => ({
    get cronExpression(): string {
      // https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-create-rule-schedule.html#eb-cron-expressions
      // We need to return a cron expression that event bridge will accept
      const cron: string[] = [];

      // The hour and minute parts
      cron.push(self.time.cronExpressionPart);

      // The day of the month part
      if (self.isLastDay) cron.push("L");
      else if (self.isLastWeekday) cron.push("LW");
      else if (self.isOnDay) cron.push(`${self.day}`);

      // The month, day of week and year parts
      cron.push("* ? *");

      return cron.join(" ");
    },

    get infoMessage(): string {
      let desc = "last day of the month";
      if (self.isLastWeekday) desc = "last weekday of the month";
      if (self.isOnDay) desc = `${humanDay(self.day)} day of the month`;

      return `We will import the data every month, on the ${desc} at ${self.time.hour}:${self.time.minute} UTC`;
    },
  }));

export interface IMonthlySettings extends Instance<typeof MonthlySettings> {}

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const WeeklySettings = types
  .model("WeeklySettings", {
    // Per cron expression https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-create-rule-schedule.html#eb-cron-expressions
    day: 1, // 1-7 (SUN-SAT)
    time: types.optional(TimeParts, {}),
  })

  .actions((self) => ({
    setDay(num: number) {
      if (num < 1) num = 1;
      if (num > 7) num = 7;
      self.day = num;
    },
  }))

  .views((self) => ({
    /**
     * Helpful list of days with values (useful for when used in drop down list, etc), it lists Monday as the first day
     */
    get daysList(): { name: string; value: number }[] {
      const result = days.slice(1).map((day, index) => {
        // Cron expression treats days as 1-7 (SUN-SAT), so we want Monday = 2, etc.
        return { name: day, value: index + 2 };
      });

      return [...result, { name: days[0], value: 1 }];
    },

    get humanDay(): string {
      return days[self.day - 1];
    },

    get cronExpression(): string {
      // https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-create-rule-schedule.html#eb-cron-expressions
      // We need to return a cron expression that event bridge will accept
      const cron: string[] = [];

      // The hour and minute parts
      cron.push(self.time.cronExpressionPart);

      // The day of the month and month parts
      cron.push("? *");

      // The day of week and year part
      cron.push(`${self.day} *`);

      return cron.join(" ");
    },
  }))

  .views((self) => ({
    get infoMessage(): string {
      return `We will import the data every week, on ${self.humanDay} at ${self.time.hour}:${self.time.minute} UTC`;
    },
  }));

const DailySettings = types
  .model("DailySettings", {
    time: types.optional(TimeParts, {}),
  })

  .views((self) => ({
    get cronExpression(): string {
      // https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-create-rule-schedule.html#eb-cron-expressions
      // We need to return a cron expression that event bridge will accept
      const cron: string[] = [];

      // The hour and minute parts
      cron.push(self.time.cronExpressionPart);

      // The day of the month, the month, the day of the week and the year parts
      cron.push("* * ? *");

      return cron.join(" ");
    },
  }))

  .views((self) => ({
    get infoMessage(): string {
      return `We will import the data every day at ${self.time.hour}:${self.time.minute} UTC`;
    },
  }));

/**
 * A step model for the step where we ask the user to configure the frequency and the salesforce objects to import
 */
export const ImportOptionsStep = BaseStep.named("ImportOptionsStep")
  .props({
    modelSelection: types.optional(
      types.enumeration<DataModelSelection>("DataModelSelection", Object.values(DataModelSelection)),
      DataModelSelection.Standard
    ),
    frequency: types.optional(types.enumeration<ImportFrequency>("ImportFrequency", Object.values(ImportFrequency)), ImportFrequency.Monthly),
    monthlySettings: types.optional(MonthlySettings, {}),
    weeklySettings: types.optional(WeeklySettings, {}),
    dailySettings: types.optional(DailySettings, {}),
  })

  .actions((self) => {
    return {
      setFrequency(frequency: ImportFrequency) {
        self.frequency = frequency;
      },

      setModelSelection(selection: DataModelSelection) {
        self.modelSelection = selection;
      },
    };
  })

  .views((self) => ({
    get isMonthly(): boolean {
      return self.frequency === ImportFrequency.Monthly;
    },

    get isWeekly(): boolean {
      return self.frequency === ImportFrequency.Weekly;
    },

    get isDaily(): boolean {
      return self.frequency === ImportFrequency.Daily;
    },

    get isCustomSelection(): boolean {
      return self.modelSelection === DataModelSelection.Custom;
    },

    get isStandardSelection(): boolean {
      return self.modelSelection === DataModelSelection.Standard;
    },
  }))

  .views((self) => ({
    get cronExpression(): string {
      if (self.isMonthly) return self.monthlySettings.cronExpression;
      if (self.isWeekly) return self.weeklySettings.cronExpression;
      return self.dailySettings.cronExpression;
    },

    get infoMessage(): string {
      if (self.isMonthly) return self.monthlySettings.infoMessage;
      if (self.isWeekly) return self.weeklySettings.infoMessage;
      return self.dailySettings.infoMessage;
    },
  }));

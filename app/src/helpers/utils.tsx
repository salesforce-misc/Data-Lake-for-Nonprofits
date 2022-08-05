import isEmpty from "lodash/isEmpty";
import isNil from "lodash/isNil";
import isString from "lodash/isString";
import numeral from "numeral";

export const delay = (seconds: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
};

export function humanDay(num: number): string {
  // Account for x11 to x13
  const remainder100 = num % 100;
  if (remainder100 >= 11 && remainder100 <= 13) return `${num}th`;

  const remainder = num % 10;

  if (remainder === 1) return `${num}st`;
  if (remainder === 2) return `${num}nd`;
  if (remainder === 3) return `${num}rd`;

  return `${num}th`;
}

export function humanProcessingTime(seconds: number): string {
  return numeral(seconds).format("00:00:00");
}

export function niceNumber(value: number | string | null | undefined) {
  if (isNil(value)) return "N/A";
  if (isString(value) && isEmpty(value)) return "N/A";
  return numeral(value).format("0,0");
}

export function niceByte(value: number | string | null | undefined) {
  if (isNil(value)) return "N/A";
  if (isString(value) && isEmpty(value)) return "N/A";
  return numeral(value).format("0b");
}

class LocalPersistance {
  // https://developer.mozilla.org/en-US/docs/Web/API/Storage

  supported: boolean = typeof Storage !== "undefined";

  private wrap(fn: () => unknown): unknown {
    if (!this.supported) return;
    try {
      return fn();
    } catch (error) {
      console.error(error);
    }
  }

  clear() {
    this.wrap(() => localStorage.clear());
  }

  getItem(key: string): string | null | undefined {
    return this.wrap(() => localStorage.getItem(key)) as string | null | undefined;
  }

  setItem(key: string, value: string) {
    return this.wrap(() => localStorage.setItem(key, value));
  }

  removeItem(key: string) {
    return this.wrap(() => localStorage.removeItem(key));
  }
}

export const storage = new LocalPersistance();

export function removeSpaces(text: string): string {
  if (isEmpty(text)) return "";

  return text.replace(/^\s+|\s+$/gm,'');
}
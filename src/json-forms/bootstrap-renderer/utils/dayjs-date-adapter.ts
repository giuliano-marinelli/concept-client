import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

import { defaultDateFormat } from '@jsonforms/core';

import dayjs from 'dayjs';
import customParsing from 'dayjs/plugin/customParseFormat';

// allows to parse date strings with custom format
dayjs.extend(customParsing);

/**
 * date adapter for dayjs to parse and format dates
 */
@Injectable()
export class DayJsDateAdapter extends NativeDateAdapter {
  saveFormat: string = defaultDateFormat;

  setSaveFormat(format: string) {
    this.saveFormat = format;
  }

  /**
   * parses a given data prop string in the save-format into a date object
   * @param value date string to be parsed
   * @returns date object or null if parsing failed
   */
  parseSaveFormat(value: string): Date | null {
    return this.parse(value, this.saveFormat);
  }

  override parse(value: string, format: string): Date | null {
    if (!value) {
      return null;
    }
    const date = dayjs(value, format);

    if (date.isValid()) {
      return date.toDate();
    } else {
      return null;
    }
  }

  toSaveFormat(value: Date) {
    if (!value) {
      return undefined;
    }
    const date = dayjs(value);
    if (date.isValid()) {
      return date.format(this.saveFormat);
    } else {
      return undefined;
    }
  }

  /**
   * transforms the date to a string representation for display
   * @param date date to be formatted
   * @param displayFormat format to be used for formatting the date e.g. YYYY-MM-DD
   * @returns string representation of the date
   */
  override format(date: Date, displayFormat: string): string {
    return dayjs(date).format(displayFormat);
  }

  override deserialize(value: any): Date | null {
    if (!value) {
      return null;
    }
    const date = dayjs(value);
    if (date.isValid()) {
      return date.toDate();
    } else {
      return null;
    }
  }
}

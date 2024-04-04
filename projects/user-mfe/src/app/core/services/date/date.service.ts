import * as moment from 'moment';
import { Injectable } from '@angular/core';

@Injectable()
export class DateService {
  constructor() {}

  public toISOString(date: Date) {
    return date.toISOString();
  }

  /**
   * @description: Format the date to midnight 12 am
   * @param date
   */
  public toDaysStart(date: Date) {
    const apoche = date.setHours(0, 0, 0, 0);
    return new Date(apoche);
  }

  /**
   * @description: Format the date to midnight 11:59 pm
   * @param date
   */
  public toDaysEnd(date: Date) {
    const apoche = date.setHours(23, 59, 59, 999);
    return new Date(apoche);
  }

  /**
   * @description: return ISO string format of start date
   * @param date
   */
  public toDaysStartISO(date: Date) {
    return moment(new Date(date)).format('YYYY-MM-DD') + 'T00:00:00.000Z';
  }

  /**
   * @description: return ISO string format of end date
   * @param date
   */
  public toDaysEndISO(date: Date) {
    return moment(new Date(date)).format('YYYY-MM-DD') + 'T23:59:59.999Z';
  }

  /**
   * Add one day to the given date
   * @param date
   */
  public toDaysEndISOPlusOne(date: Date) {
    return moment(new Date(date)).add(1, 'd').format('YYYY-MM-DD') + 'T23:59:59.999Z';
  }

  public addOrSubtractDays(date: any, days: number, operation = 'add') {
    if (operation === 'add') {
      return moment(new Date(date)).add(days, 'd').toISOString();
    }
    return moment(new Date(date)).subtract(days, 'd').toISOString();
  }

  public getDateRangeInISO(number?: number) {
    const to = new Date(moment().add(1, 'd').toDate());
    let from: Date;
    if (number === 0) {
      from = new Date();
    } else if (number) {
      number = +number;
      from = new Date(moment(to).subtract(number, 'd').toDate());
    } else {
      from = new Date(1000);
    }

    return {
      from: this.toDaysStartISO(from),
      to: this.toDaysEndISO(to),
    };
  }

  public getDateRange(number: number) {
    const to = new Date(moment().toDate());
    let from: Date;
    if (number === 0) {
      from = new Date();
    } else if (number) {
      number = +number;
      from = new Date(moment(to).add(1, 'd').subtract(number, 'd').toDate());
    } else {
      from = new Date(1000);
    }
    return {
      from: this.toDaysStart(from),
      to: this.toDaysEnd(to),
    };
  }

  /**
   * Subtract months to a given date
   * @param dateInIsoString Date in ISO string format
   * @param months no of months to be subtracted
   */
  public subtractMonths(dateInIsoString: string, months = 0): string {
    if (!dateInIsoString || typeof dateInIsoString !== 'string') {
      return '';
    }
    const date = new Date(dateInIsoString);
    const currentMonth = date.getMonth();
    date.setMonth(currentMonth - months);
    return date.toISOString();
  }

  public getNoOfDays(startDate: string | Date, endDate: string | Date): number {
    if (!startDate || !endDate) {
      return 0;
    }
    const date1 = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const date2 = typeof endDate === 'string' ? new Date(endDate) : endDate;
    const milliSecondsPerDays = 24 * 60 * 60 * 1000;
    return Math.floor(Math.abs((date2.getTime() - date1.getTime()) / milliSecondsPerDays));
  }

  public getDurationText(startDate: Date, endDate: Date, noOfDays: number): string {
    if (!startDate || !endDate) {
      return '';
    }
    const startTime = startDate.setHours(0, 0, 0, 0);
    const endTime = endDate.setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    const isEndDateToday = today === endTime;
    const isStartDateToday = today === startTime;
    if (isEndDateToday && isStartDateToday) {
      return 'Today';
    }
    const yesterdayDate = new Date().getDate() - 1;
    const yesterday = new Date(new Date().setDate(yesterdayDate)).setHours(0, 0, 0, 0);
    const isEndDateYesterday = yesterday === endTime;
    const isStartDateyesterday = yesterday === startTime;
    if (isEndDateYesterday && isStartDateyesterday) {
      return 'Yesterday';
    }
    return isEndDateToday ? `Last ${noOfDays} days` : `Custom ${noOfDays} days`;
  }

  public getLocalTimestamp(timezoneOffsetInMins = 0, timestampUTC: string): string {
    if (timestampUTC) {
      const timezoneOffsetInMilliSec = timezoneOffsetInMins * 60 * 1000;
      const localTime = new Date(timestampUTC).getTime() - timezoneOffsetInMilliSec;
      return new Date(localTime).toISOString();
    }
    return '';
  }
}

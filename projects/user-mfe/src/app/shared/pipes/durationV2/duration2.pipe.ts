/**
 * Pipe which converts duration into specified format using given unit.
 */

import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'duration2',
})
export class Duration2Pipe implements PipeTransform {
  public transform(value: any = 0, unit: any = 'seconds', format = 'humanize'): any {
    value = Math.abs(value);
    let hours: string | number = Math.floor(value / (60 * 60));
    let minutes: string | number = Math.floor((value - hours * 3600) / 60);
    let seconds: string | number = Math.floor(value - hours * 3600 - minutes * 60);

    if (format === 'HH:MM') {
      if (hours < 10) {
        hours = '0' + hours;
      }
      if (minutes < 10) {
        minutes = '0' + minutes;
      }
      return `${hours}:${minutes}`;
    } else if (format === 'HH:MM:SS') {
      if (hours < 10) {
        hours = '0' + hours;
      }
      if (minutes < 10) {
        minutes = '0' + minutes;
      }

      if (seconds < 10) {
        seconds = '0' + seconds;
      }
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (format === 'h:m') {
      return `${hours}h ${minutes}m`;
    } else if (format === 'h') {
      return hours;
    } else {
      return moment.duration(value, unit).humanize();
    }
  }
}

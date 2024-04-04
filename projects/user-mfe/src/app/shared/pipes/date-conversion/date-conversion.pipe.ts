import { Pipe, PipeTransform } from '@angular/core';

import * as momentTz from 'moment-timezone';
import * as moment from 'moment';

@Pipe({
  name: 'dateConversion',
})
export class DateConversionPipe implements PipeTransform {
  public transform(value: any, timeZone = 'Local', format = 'MM/DD/YYYY HH:mm', defaultValue: any): any {
    if (timeZone === 'Local') {
      if (defaultValue) {
        return momentTz.tz(defaultValue, 'UTC').format(format);
      } else if (value) {
        return moment.utc(value).local().format(format);
      }
      return '';
    }

    if (value) {
      return momentTz.tz(value, timeZone).format(format);
    }
    return '';
  }
}

import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { DataService } from '../data/data.service';
import { CustomNgxDatetimeAdapter } from './native-date-adapter';

@Injectable()
export class NgxMatDateAdap extends CustomNgxDatetimeAdapter {
  constructor(private dataService: DataService) {
    super('en-US', { useUtc: true });
  }

  public format(date: moment.Moment): string {
    const format = this.dataService._currentDateFormat.getValue();

    const result = date.format(format);
    return result;
  }
}

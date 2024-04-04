import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { MomentDateTimeAdapter } from 'ng-pick-datetime/date-time/adapter/moment-adapter/moment-date-time-adapter.class';
import { DataService } from '../data/data.service';

@Injectable()
export class OwlCustomDateAdapter extends MomentDateTimeAdapter {
  constructor(private dataService: DataService) {
    super('en-US', { useUtc: true });
  }

  public format(date: moment.Moment): string {
    const format = `${this.dataService._currentDateFormat.getValue()}`;
    const result = date.format(format);
    return result;
  }
}

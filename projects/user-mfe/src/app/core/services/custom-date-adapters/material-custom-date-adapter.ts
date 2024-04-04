import { Platform } from '@angular/cdk/platform';
import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';
import * as moment from 'moment';
import { DataService } from '../data/data.service';

@Injectable()
export class MaterialCustomDateAdapter extends NativeDateAdapter {
  constructor(private dataService: DataService, platform: Platform) {
    super('en-US', platform);
  }
  public format(date: Date): string {
    const format = this.dataService._currentDateFormat.getValue().split(' ')[0];
    const result = moment(date).format(format);
    return result;
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'durationConversion',
})
export class DurationConversionPipe implements PipeTransform {
  public transform(value: any = 0, unit: any = 'seconds', format = 'humanize', localLanguage = 'en'): any {
    value = Math.abs(value);
    let hours: string | number = Math.floor(value / (60 * 60));
    let minutes: string | number = Math.floor((value - hours * 3600) / 60);
    let minuteText: string;
    if (format === 'HH:MM') {
      let time: any;
      if (hours === 1) {
        time = 60;
      } else if (hours === 0 && minutes !== 0) {
        time = minutes;
      } else if (hours === 0 && minutes === 0) {
        time = '< 1';
      }
      if (localLanguage === 'en' || localLanguage === 'fr') {
        minuteText = time <= 1 || time === '< 1' ? 'minute' : 'minutes';
      } else if (localLanguage === 'es' || localLanguage === 'pt') {
        minuteText = time <= 1 || time === '< 1' ? 'minuto' : 'minutos';
      }
      return `${time} ${minuteText}`;
    } else if (format === 'h:m') {
      return `${hours}h ${minutes}m`;
    } else if (format === 'h') {
      return hours;
    } else {
      return moment.duration(value, unit).humanize();
    }
  }
}

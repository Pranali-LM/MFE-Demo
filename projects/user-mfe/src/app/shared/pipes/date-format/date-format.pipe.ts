import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
})
// TODO: Remove this pipe
export class DateFormatPipe implements PipeTransform {
  public transform(dateString: string, toISO = false): string {
    if (dateString) {
      if (toISO) {
        return new Date(dateString).toISOString();
      }
      const [datePart, timePart] = dateString.split('T');

      const [year, month, day] = datePart.split('-');
      const [hour, minute] = timePart.split(':');

      return `${month}/${day}/${year} ${hour}:${minute}`;
    }
  }
}

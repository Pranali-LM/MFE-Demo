import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
})
export class DurationPipe implements PipeTransform {
  public transform(value: number): string {
    const duration = Math.floor(value);
    if (duration >= 0) {
      if (duration > 59) {
        const hour = Math.floor(duration / 60);
        const min = duration % 60;
        if (min !== 0) {
          return `${hour} hr ${min} mins`;
        }
        return `${hour} hr`;
      }
      return duration + ' mins';
    }
  }
}

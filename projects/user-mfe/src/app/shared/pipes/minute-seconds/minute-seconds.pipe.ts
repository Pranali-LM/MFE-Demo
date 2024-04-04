import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'minuteSeconds',
})
export class MinuteSecondsPipe implements PipeTransform {
  public transform(seconds: number): string {
    const hours: number = Math.floor(seconds / 3600);
    const minutes: number = Math.floor(seconds / 60);
    const remainingMinutes = minutes - hours * 60;
    const remainingSeconds = seconds - minutes * 60;
    return (
      hours.toString().padStart(2, '0') +
      ':' +
      remainingMinutes.toString().padStart(2, '0') +
      ':' +
      remainingSeconds.toString().padStart(2, '0')
    );
  }
}

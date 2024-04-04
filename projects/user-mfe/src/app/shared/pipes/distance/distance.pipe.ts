import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'distance',
})
export class DistancePipe implements PipeTransform {
  public transform(value: number, distanceUnit: string): number {
    distanceUnit = distanceUnit.toLowerCase();
    if (value && value !== 0 && !isNaN(value)) {
      if (distanceUnit === 'miles' || distanceUnit === 'mi') {
        return value * 0.621371;
      } else if (distanceUnit === 'kilometers' || distanceUnit === 'km') {
        return value;
      }
    }
    return value;
  }
}

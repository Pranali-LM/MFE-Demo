import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'incidentRatio',
})
export class IncidentRatioPipe implements PipeTransform {
  transform(value: number, currentMetricUnit: string): unknown {
    currentMetricUnit = currentMetricUnit.toLowerCase();
    if (value && value !== 0 && !isNaN(value)) {
      if (currentMetricUnit === 'miles' || currentMetricUnit === 'mi') {
        return value;
      } else if (currentMetricUnit === 'kilometers' || currentMetricUnit === 'km') {
        return value * 0.621371;
      }
    }
    return value;
  }
}

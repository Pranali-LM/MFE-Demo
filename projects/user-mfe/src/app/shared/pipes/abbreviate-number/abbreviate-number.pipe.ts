import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'abbreviateNumber',
})
export class AbbreviateNumberPipe implements PipeTransform {
  public transform(value: any, localLanguage = 'en'): any {
    const decPlaces = Math.pow(10, 2); // Decimal places fixed to 2

    if (value < 1000) {
      return Math.round(value * decPlaces) / decPlaces;
    }
    if (value < 10000) {
      return Math.round(value);
    }
    const abbrev = ['K', 'M', 'B', 'T'];

    for (let i = abbrev.length - 1; i >= 0; i--) {
      // 1000 or 1000000 etc.,
      const size = Math.pow(10, (i + 1) * 3);
      // Do abbreviation only if number is bigger or equal to size
      if (value >= size) {
        // Round it to 2 decimal places eg.,12345.44 to 12.35
        value = Math.round((value * decPlaces) / size) / decPlaces;
        // Handle special case eg.,999.99K to 1M and any 999.32M to 1B
        if ((value === 1000 || Math.floor(value) === 999) && i < abbrev.length - 1) {
          value = 1;
          i++;
        }
        value += abbrev[i];
        break;
      }
    }
    switch (localLanguage) {
      case 'es': {
        var chars = { ',': '.', '.': ',' };
        if (typeof value === 'number') {
          value = value.toString();
        }
        value = value ? value.replace(/[,.]/g, (m) => chars[m]) : null;
        return value;
      }
      case 'pt': {
        var chars = { ',': '.', '.': ',' };
        if (typeof value === 'number') {
          value = value.toString();
        }
        value = value ? value.replace(/[,.]/g, (m) => chars[m]) : null;
        return value;
      }
      case 'fr': {
        var chars = { ',': ' ', '.': ',' };
        if (typeof value === 'number') {
          value = value.toString();
        }
        value = value ? value.replace(/[,.]/g, (m) => chars[m]) : null;
        return value;
      }
      default: {
        return value;
      }
    }
  }
}

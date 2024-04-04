import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'formatNumber',
})
export class FormatNumberPipe implements PipeTransform {
  transform(value: any, localLanguage = 'en'): any {
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

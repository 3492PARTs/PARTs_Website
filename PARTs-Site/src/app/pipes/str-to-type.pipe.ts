import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'strToType'
})
export class StrToTypePipe implements PipeTransform {

  transform(arr: any[]): any {

    for (const obj of arr) {
      for (const property in obj) {
        if (obj.hasOwnProperty(property)) {
          const numPatt = new RegExp('^[0-9]+(\.[0-9]+)?$');
          const datePatt = new RegExp('^[0-2][0-9]\/[0-9][0-9]\/[0-9]{4}$');
          if (numPatt.test(obj[property])) {
            obj[property] = parseFloat(obj[property]);
          } else if (datePatt.test(obj[property])) {
            const dt = obj[property].split(/\/|\-|\s/);
            obj[property] = new Date(dt[0] + '-' + dt[1] + '-' + dt[2]); // fixed format dd-mm-yyyy
          }
        }
      }
    }
    return arr;
  }

}

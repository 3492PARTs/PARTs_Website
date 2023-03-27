import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'datetimeToString'
})
export class DatetimeToStringPipe implements PipeTransform {

  //TODO Still needs to actually be done.
  transform(elem: any): any {
    if (elem instanceof Date) {
      const mm = elem.getMonth() + 1; // getMonth() is zero-based
      const dd = elem.getDate();

      return (mm > 9 ? '' : '0') + mm + '/' + (dd > 9 ? '' : '0') + dd + '/' + elem.getFullYear();
    }

    let d = new Date(elem);

    if (d instanceof Date) {
      const mm = d.getMonth() + 1; // getMonth() is zero-based
      const dd = d.getDate();
      const yyyy = d.getFullYear();

      return (mm > 9 ? '' : '0') + mm + '/' + (dd > 9 ? '' : '0') + dd + '/' + yyyy;
    }

    return elem;
  }

}

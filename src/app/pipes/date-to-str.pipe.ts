import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'dateToStr'
})
export class DateToStrPipe implements PipeTransform {

  transform(elem: any): any {
    if (Date.parse(elem) !== NaN) {
      const mm = elem.getMonth() + 1; // getMonth() is zero-based
      const dd = elem.getDate();
      return (mm > 9 ? '' : '0') + mm + '/' + (dd > 9 ? '' : '0') + dd + '/' + elem.getFullYear();
    }
    return elem;
  }

}

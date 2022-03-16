import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'dateToStr'
})
export class DateToStrPipe implements PipeTransform {

  transform(elem: any, time = true): any {
    if (!isNaN(Date.parse(elem))) {
      elem = elem.replace('Z', '');
      elem = new Date(elem);
      const mm = elem.getMonth() + 1; // getMonth() is zero-based
      const dd = elem.getDate();
      var hours = elem.getHours();
      var minutes = elem.getMinutes();
      var ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0' + minutes : minutes;
      var strTime = hours + ':' + minutes + ' ' + ampm;
      if (time)
        return (mm > 9 ? '' : '0') + mm + '/' + (dd > 9 ? '' : '0') + dd + '/' + elem.getFullYear() + ' ' + strTime;
      else
        return (mm > 9 ? '' : '0') + mm + '/' + (dd > 9 ? '' : '0') + dd + '/' + elem.getFullYear();
    }
    return elem;
  }

}

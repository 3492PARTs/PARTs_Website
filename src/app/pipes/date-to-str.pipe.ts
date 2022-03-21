import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'dateToStr'
})
export class DateToStrPipe implements PipeTransform {

  transform(elem: any, time = true): any {
    const regex1 = /1*[0-9]\/1*[0-9]\/[0-9][0-9][0-9][0-9] 1*[0-9]:[0-9]*[0-9] ((AM)|(PM))/g;
    const regex2 = /[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]T[0-9][0-9]:[0-9][0-9]:[0-9][0-9]Z/g;
    //console.log(elem + ' elem typ ' + regex1.test(elem) + ' ' + regex2.test(elem));
    if (regex1.test(elem) || regex2.test(elem)) {
      //console.log('hello');
      //elem = elem.replace('Z', '');
      //console.log(elem);
      elem = new Date(elem);
      //console.log(elem);
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
      return (mm > 9 ? '' : '0') + mm + '/' + (dd > 9 ? '' : '0') + dd + '/' + elem.getFullYear();
    }
    return elem;
  }

}
/*
3/18/2022 2:47 PM
2020-02-26T00:00:00Z
1*[0-9]\/1*[0-9]\/[0-9][0-9][0-9][0-9] 1*[0-9]:[0-9]*[0-0] ((AM)|(PM))
*/
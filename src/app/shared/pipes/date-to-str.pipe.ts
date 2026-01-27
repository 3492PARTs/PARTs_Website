import { Pipe, PipeTransform } from '@angular/core';
import { returnIfValidDate } from '@app/core/utils/utils.functions';
@Pipe({
  name: 'dateToStr', standalone: true
})
export class DateToStrPipe implements PipeTransform {

  transform(elem: any, time = true, month = false): any {
    let date = returnIfValidDate(elem);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    if (date != null) {
      const mm = date.getMonth() + 1; // getMonth() is zero-based
      const dd = date.getDate();
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      let minutesStr = minutes < 10 ? '0' + minutes : minutes;

      var strTime = hours + ':' + minutesStr + ' ' + ampm;
      var strDate = (mm > 9 ? '' : '0') + mm + '/' + (dd > 9 ? '' : '0') + dd + '/' + date.getFullYear()

      if (month)
        strDate = months[mm - 1] + ' ' + dd + ', ' + date.getFullYear()

      if (time)
        strDate += ' ' + strTime;

      return strDate;
    }

    return elem;
  }

}
/*
3/18/2022 2:47 PM
2020-02-26T00:00:00Z
1*[0-9]\/1*[0-9]\/[0-9][0-9][0-9][0-9] 1*[0-9]:[0-9]*[0-0] ((AM)|(PM))
*/
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'OrderBy', standalone: true })
export class OrderByPipe implements PipeTransform {
  transform(obj: any, OrderByProperty: string, reverseOrder: boolean): any {
    obj.sort((a: { [x: string]: number; }, b: { [x: string]: number; }) => {
      if (!reverseOrder) {
        if (a[OrderByProperty] < b[OrderByProperty]) { return -1; }
        if (a[OrderByProperty] > b[OrderByProperty]) { return 1; }
        return 0;
      } else {
        if (a[OrderByProperty] < b[OrderByProperty]) { return 1; }
        if (a[OrderByProperty] > b[OrderByProperty]) { return -1; }
        return 0;
      }
    });
    return obj;
  }
}

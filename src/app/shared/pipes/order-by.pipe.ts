import { Pipe, PipeTransform } from '@angular/core';
import { getPropertyValue, strNoE } from '@app/core/utils/utils.functions';

@Pipe({ name: 'OrderBy', standalone: true })
export class OrderByPipe implements PipeTransform {
  transform(obj: any, OrderByProperty: string, reverseOrder: boolean): any {
    obj.sort((a: { [x: string]: any; }, b: { [x: string]: any; }) => {
      const aValue = !strNoE(OrderByProperty) ? getPropertyValue(a, OrderByProperty) : a;
      const bValue = !strNoE(OrderByProperty) ? getPropertyValue(b, OrderByProperty) : b;
      if (!reverseOrder) {
        if (aValue < bValue) { return -1; }
        if (aValue > bValue) { return 1; }
        return 0;
      } else {
        if (aValue < bValue) { return 1; }
        if (aValue > bValue) { return -1; }
        return 0;
      }
    });
    return obj;
  }
}

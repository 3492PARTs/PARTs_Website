import { Pipe, PipeTransform } from '@angular/core';
import { Utils } from '@app/core/utils/utils';

@Pipe({ name: 'ObjectWildCardFilterPipe', standalone: true })
export class ObjectWildCardFilterPipe implements PipeTransform {
  transform(ObjectArray: any[], searchText: any): any[] {
    if (searchText === '') {
      return ObjectArray;
    }

    let os: any[] = [];
    ObjectArray.forEach(o => {
      if (JSON.stringify(o).toLowerCase().includes(searchText.toLowerCase())) os.push(o);
    });

    return os;
  }
}

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

@Pipe({ name: 'RemovedFilterPipe', standalone: true })
export class RemovedFilterPipe implements PipeTransform {
  transform(ObjectArray: any, Enabled: boolean = false, Property: string, Value: any = false): any {
    if (Property == null || !Enabled) { return ObjectArray; }

    return ObjectArray.filter((ObjectItem: { [x: string]: any; }) => {
      const ret: boolean = Utils.getPropertyValue(ObjectItem, Property) === Value;
      return ret;
    });
  }
}

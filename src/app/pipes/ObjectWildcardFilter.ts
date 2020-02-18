import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'ObjectWildCardFilterPipe', pure: false })
export class ObjectWildCardFilterPipe implements PipeTransform {
  transform(ObjectArray: any, searchText: any): any {
    if (searchText === '') {
      return ObjectArray;
    }

    return ObjectArray.filter(arrayItem => {
      if (arrayItem !== undefined) {
        var valuesOfOj = Object.values(arrayItem);
        for (var val in valuesOfOj) {
          valuesOfOj[val] = String(valuesOfOj[val]).toLowerCase();
        }
        return valuesOfOj.indexOf(searchText.toLowerCase()) > -1;
      }
    });
  }
}

@Pipe({ name: 'OrderBy', pure: false })
export class OrderBy implements PipeTransform {
  transform(obj: any, OrderByProperty: string, reverseOrder: boolean): any {
    // orderFields.forEach(function (currentField) {
    obj.sort(function(a, b) {
      if (!reverseOrder) {
        // console.log(a[OrderByProperty] + " " + b[OrderByProperty]);
        if (a[OrderByProperty] < b[OrderByProperty]) return -1;
        if (a[OrderByProperty] > b[OrderByProperty]) return 1;
        return 0;
      } else {
        if (a[OrderByProperty] < b[OrderByProperty]) return 1;
        if (a[OrderByProperty] > b[OrderByProperty]) return -1;
        return 0;
      }
      //  });
    });
    return obj;
  }
}

@Pipe({ name: 'RemovedFilterPipe', pure: false })
export class RemovedFilterPipe implements PipeTransform {
  transform(ObjectArray: any, Enabled: boolean = false, Property: string, Value: any = false): any {
    if (Property == null || !Enabled) return ObjectArray;

    return ObjectArray.filter(function(ObjectItem) {
      // let TextFound: boolean = false;
      let ret: boolean = ObjectItem[Property] == Value;
      console.log();
      return ret;
    });
  }
}

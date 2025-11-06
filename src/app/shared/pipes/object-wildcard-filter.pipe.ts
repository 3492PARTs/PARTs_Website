import { Pipe, PipeTransform } from '@angular/core';

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

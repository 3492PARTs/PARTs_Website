import { Pipe, PipeTransform } from '@angular/core';
import { Utils } from '@app/core/utils/utils';

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

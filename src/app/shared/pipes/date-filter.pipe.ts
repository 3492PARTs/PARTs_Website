import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFilter'
})
export class DateFilterPipe implements PipeTransform {

  transform(ObjectArray: any, Enabled: boolean = false, Property: string, Value: Date, operator: string): any {
    if (Property == null || !Enabled) { return ObjectArray; }

    return ObjectArray.filter((ObjectItem: { [x: string]: any; }) => {
      let ret: boolean = false;
      const dt = new Date(ObjectItem[Property]);
      if (operator === 'gte')
        ret = dt >= Value
      else if (operator === 'lte')
        ret = dt <= Value
      else if (operator === 'gt')
        ret = dt > Value
      else if (operator === 'lt')
        ret = dt < Value

      return ret;
    });
  }

}

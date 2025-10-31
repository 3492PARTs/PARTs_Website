/**
 * Utility class containing pure helper functions.
 * These functions are stateless and don't depend on Angular services or component state.
 */
export class Utils {
  /**
   * Check if a string is null, undefined, or empty
   */
  static strNoE(s: any): boolean {
    if (Number.isNaN(s)) return true;

    let type = typeof s;
    if (s !== null && !['undefined', 'string'].includes(type)) {
      s = s.toString();
    }

    return s === undefined || s === null || s.length === 0 || s.length === null || s.length === undefined || s.trim() === '';
  }

  /**
   * Deep clone an object using JSON parse/stringify
   */
  static cloneObject(o: any): any {
    return JSON.parse(JSON.stringify(o));
  }

  /**
   * Format a date string to MM/DD/YY HH:MM AM/PM format
   */
  static formatDateString(s: string | Date): string {
    let d = new Date(s);
    let day = d.getDate();
    let month = d.getMonth() + 1;
    let year = d.getFullYear().toString().substring(2);
    let hour = d.getHours();
    let min = d.getMinutes();

    // hours to am/pm
    let amPm = hour >= 12 ? 'PM' : 'AM';

    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;

    return `${month}/${day}/${year} ${hour}:${min < 10 ? '0' + min : min.toString()} ${amPm}`;
  }

  /**
   * Get a property value from an array of objects by matching another property
   */
  static propertyMap(arr: any[], queryProperty: string, queryValue: any, findProperty: string): any {
    for (let i = 0; i < arr.length; i++) {
      if (Object.prototype.hasOwnProperty.call(arr[i], queryProperty) && arr[i][queryProperty] === queryValue) {
        if (Object.prototype.hasOwnProperty.call(arr[i], findProperty)) {
          return arr[i][findProperty];
        }
      }
    }
    return undefined;
  }

  /**
   * Find the index of an object in an array by a property value
   */
  static arrayObjectIndexOf(arr: any[], property: string, searchTerm: any): number {
    for (let i = 0, len = arr.length; i < len; i++) {
      if (typeof arr[i] !== 'undefined' && arr[i] !== null && arr[i][property] === searchTerm) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Update an object in an array by matching a property value
   */
  static updateObjectInArray(arr: any[], property: string, obj: any): void {
    let i = Utils.arrayObjectIndexOf(arr, property, obj[property]);
    if (i !== -1) {
      arr[i] = obj;
    }
  }

  /**
   * Format a question answer for display
   */
  static formatQuestionAnswer(answer: any): string {
    if (Array.isArray(answer)) {
      let str = '';
      answer.forEach(opt => {
        if (!Utils.strNoE(opt.checked) && opt.checked !== 'false')
          if (opt.checked === 'true' || opt.checked === true)
            str += opt.option + ', ';
          else if (opt.checked !== false)
            str += opt.checked + ', ';
      });
      str = str.substring(0, str.length - 2);
      answer = str;
    }

    return !Utils.strNoE(answer) ? (Utils.isObject(answer) ? JSON.stringify(answer) : answer) : '';
  }

  /**
   * Decode a boolean to custom string values
   */
  static decodeBoolean(b: boolean, values: { true: string, false: string }): string {
    return b ? values.true : values.false;
  }

  /**
   * Decode a boolean to Sent/Not Sent
   */
  static decodeSentBoolean(b: boolean): string {
    return Utils.decodeBoolean(b, { true: 'Sent', false: 'Not Sent' });
  }

  /**
   * Decode a boolean to Yes/No
   */
  static decodeYesNoBoolean(b: boolean): string {
    return Utils.decodeBoolean(b, { true: 'Yes', false: 'No' });
  }

  /**
   * Decode a 'y'/'n' string to Yes/No
   */
  static decodeYesNo(s: string): string {
    return Utils.decodeBoolean(s === 'y', { true: 'Yes', false: 'No' });
  }

  /**
   * Check if a value is a plain object
   */
  static isObject(o: any): boolean {
    return o && typeof o === 'object' && o.constructor === Object;
  }

  /**
   * Convert an object to a formatted string
   */
  static objectToString(o: any): string {
    let s = '';
    if (Utils.isObject(o))
      if (Object.keys(o).length > 0)
        for (const [key, value] of Object.entries(o)) {
          if (value instanceof Array) {
            s += `${key}: `;
            value.forEach(element => {
              if (Utils.isObject(element))
                if (Object.keys(element).length > 0)
                  s += `${Utils.objectToString(element)}`;
                else
                  s += '';
              else
                s += `${element}, `;
            });
            s = `${s.substring(0, s.length - 2)}\n`;
          }
          else if (Utils.isObject(value)) {
            if (Object.keys(value as Object).length > 0)
              s += `${Utils.objectToString(value)}`;
            else
              s += '';
          }
          else s += `${key}: ${value}\n`;
        }
      else
        return '';
    else if (o instanceof Array) {
      o.forEach(element => {
        if (Utils.isObject(element))
          if (Object.keys(element).length > 0)
            s += `${Utils.objectToString(element)}`;
          else
            s += '';
        else
          s += `${element}, `;
      });
    }
    else
      return o;
    return s;
  }

  /**
   * Convert an object to FormData
   */
  static objectToFormData(o: any): FormData {
    const formData = new FormData()

    for (const [k, v] of Object.entries(o)) {
      formData.append(k, v as string | Blob);
    }
    return formData;
  }

  /**
   * Get a nested property value from an object using dot notation
   */
  static getPropertyValue(rec: any, property: string): any {
    if (!property) {
      throw new Error('NO DISPLAY PROPERTY PROVIDED FOR ONE OF THE TABLE COMPONENT COLUMNS');
    }

    try {
      // Split property path and traverse the object safely
      const properties = property.split('.');
      let result: any = rec;
      
      for (const prop of properties) {
        if (result == null) {
          return '';
        }
        result = result[prop];
      }
      
      return result ?? '';
    }
    catch (err) {
      console.error('Error accessing property:', property, err);
      return '';
    }
  }

  /**
   * Set a nested property value on an object using dot notation
   * Protected against prototype pollution attacks
   */
  static setPropertyValue(rec: any, property: string, value: any): void {
    if (!property) {
      throw new Error('NO DISPLAY PROPERTY PROVIDED FOR ONE OF THE TABLE COMPONENT COLUMNS');
    }

    // Guard against prototype pollution
    const dangerousProps = ['__proto__', 'constructor', 'prototype'];
    const properties = property.split('.');
    
    // Check if any part of the path is a dangerous property
    if (properties.some(prop => dangerousProps.includes(prop))) {
      console.error('Attempting to set dangerous property:', property);
      return;
    }

    try {
      // Split property path and traverse the object to set the value
      let current: any = rec;
      
      for (let i = 0; i < properties.length - 1; i++) {
        const prop = properties[i];
        // Additional check at each level
        if (dangerousProps.includes(prop)) {
          console.error('Dangerous property detected in path:', property);
          return;
        }
        
        if (!Object.prototype.hasOwnProperty.call(current, prop) || current[prop] == null) {
          current[prop] = {};
        }
        current = current[prop];
      }
      
      const finalProp = properties[properties.length - 1];
      // Final check before assignment
      if (!dangerousProps.includes(finalProp) && current != null && typeof current === 'object') {
        current[finalProp] = value;
      }
    }
    catch (err) {
      console.error('Error setting property:', property, err);
    }
  }
}

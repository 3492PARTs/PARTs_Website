import saveAs from 'file-saver';
import imageCompression from 'browser-image-compression';
import LoadImg from 'blueimp-load-image';
import { environment } from '../../../environments/environment';
import { Question, Response } from '../models/form.models';
import { TableColType } from '@app/shared/components/atoms/table/table.component';

// Import types needed for utility functions
export class Page {
  count = -1;
  previous: number | null = null;
  next: number | null = null;
}

export enum AppSize {
  _7XLG = 3000,
  _6XLG = 2650,
  _5XLG = 2350,
  _4XLG = 2000,
  _3XLG = 1400,
  _2XLG = 1200,
  XLG = 922,
  LG = 768,
  SM = 767,
  XS = 576,
}

/**
 * Utility class containing pure helper functions.
 * These functions are stateless and don't depend on Angular services or component state.
 */

/**
 * Utility functions - pure helper functions
 * These functions are stateless and don't depend on Angular services or component state.
 */
/**
 * Check if a string is null, undefined, or empty
 */
export function strNoE(s: any): boolean {
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
export function cloneObject(o: any): any {
  return JSON.parse(JSON.stringify(o));
}

/**
 * Format a date string to MM/DD/YY HH:MM AM/PM format
 */
export function formatDateString(s: string | Date): string {
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
export function propertyMap(arr: any[], queryProperty: string, queryValue: any, findProperty: string): any {
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
export function arrayObjectIndexOf(arr: any[], property: string, searchTerm: any): number {
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
export function updateObjectInArray(arr: any[], property: string, obj: any): void {
  let i = arrayObjectIndexOf(arr, property, obj[property]);
  if (i !== -1) {
    arr[i] = obj;
  }
}

/**
 * Format a question answer for display
 */
export function formatQuestionAnswer(answer: any): string {
  if (Array.isArray(answer)) {
    let str = '';
    answer.forEach(opt => {
      if (!strNoE(opt.checked) && opt.checked !== 'false')
        if (opt.checked === 'true' || opt.checked === true)
          str += opt.option + ', ';
        else if (opt.checked !== false)
          str += opt.checked + ', ';
    });
    str = str.substring(0, str.length - 2);
    answer = str;
  }

  return !strNoE(answer) ? (isObject(answer) ? JSON.stringify(answer) : answer) : '';
}

/**
 * Decode a boolean to custom string values
 */
export function decodeBoolean(b: boolean, values: { true: string, false: string }): string {
  return b ? values.true : values.false;
}

/**
 * Decode a boolean to Sent/Not Sent
 */
export function decodeSentBoolean(b: boolean): string {
  return decodeBoolean(b, { true: 'Sent', false: 'Not Sent' });
}

/**
 * Decode a boolean to Yes/No
 */
export function decodeYesNoBoolean(b: boolean): string {
  return decodeBoolean(b, { true: 'Yes', false: 'No' });
}

/**
 * Decode a 'y'/'n' string to Yes/No
 */
export function decodeYesNo(s: string): string {
  return decodeBoolean(s === 'y', { true: 'Yes', false: 'No' });
}

/**
 * Check if a value is a plain object
 */
export function isObject(o: any): boolean {
  return o && typeof o === 'object' && o.constructor === Object;
}

/**
 * Convert an object to a formatted string
 */
export function objectToString(o: any): string {
  let s = '';
  if (isObject(o))
    if (Object.keys(o).length > 0)
      for (const [key, value] of Object.entries(o)) {
        if (value instanceof Array) {
          s += `${key}: `;
          value.forEach(element => {
            if (isObject(element))
              if (Object.keys(element).length > 0)
                s += `${objectToString(element)}`;
              else
                s += '';
            else
              s += `${element}, `;
          });
          s = `${s.substring(0, s.length - 2)}\n`;
        }
        else if (isObject(value)) {
          if (Object.keys(value as Object).length > 0)
            s += `${objectToString(value)}`;
          else
            s += '';
        }
        else s += `${key}: ${value}\n`;
      }
    else
      return '';
  else if (o instanceof Array) {
    o.forEach(element => {
      if (isObject(element))
        if (Object.keys(element).length > 0)
          s += `${objectToString(element)}`;
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
export function objectToFormData(o: any): FormData {
  const formData = new FormData()

  for (const [k, v] of Object.entries(o)) {
    formData.append(k, v as string | Blob);
  }
  return formData;
}

/**
 * Get a nested property value from an object using dot notation
 */
export function getPropertyValue(rec: any, property: string): any {
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
export function setPropertyValue(rec: any, property: string, value: any): void {
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

/**
 * Download a file with a given filename
 */
export function downloadFileAs(filename: string, data: any, MimeType: string): void {
  const blob = new Blob([data], { type: MimeType });
  saveAs(blob, filename);
}

/**
 * Get the screen size based on window width
 */
export function getScreenSize(): AppSize {
  const width = window.innerWidth;

  if (width >= AppSize._7XLG) {
    return AppSize._7XLG;
  }
  else if (width >= AppSize._6XLG) {
    return AppSize._6XLG;
  }
  else if (width >= AppSize._5XLG) {
    return AppSize._5XLG;
  }
  else if (width >= AppSize._4XLG) {
    return AppSize._4XLG;
  }
  else if (width >= AppSize._3XLG) {
    return AppSize._3XLG;
  }
  else if (width >= AppSize._2XLG) {
    return AppSize._2XLG;
  }
  else if (width >= AppSize.XLG) {
    return AppSize.XLG;
  }
  else if (width >= AppSize.LG) {
    return AppSize.LG;
  }
  else if (width >= AppSize.SM) {
    return AppSize.SM;
  }
  else {
    return AppSize.XS;
  }
}

/**
 * Open a URL in a new window
 */
export function openURL(url: string): void {
  window.open(url, 'noopener');
}

/**
 * Scroll to a specific position or element
 */
export function scrollTo(y: number | string): void {
  const targetPosition = typeof y === 'number' 
    ? y 
    : (document.getElementById(y)?.getBoundingClientRect().top || 0) + window.scrollY - 200;
  
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });
}

/**
 * Check if a question condition is met
 */
export function isQuestionConditionMet(answer: string, question: Question, conditionalQuestion: Question): boolean {
  const condition = conditionalQuestion.conditional_on_questions.find(coq => coq.conditional_on === question.id);
  if (condition)
    switch (condition.question_condition_typ.question_condition_typ) {
      case 'equal':
        return (answer || '').toString().toLowerCase() === condition.condition_value.toLowerCase();
      case 'exist':
        return !strNoE(answer)
      case 'lt':
        return parseFloat(answer) < parseFloat(condition.condition_value);
      case 'lt-equal':
        return parseFloat(answer) <= parseFloat(condition.condition_value);
      case 'gt':
        return parseFloat(answer) > parseFloat(condition.condition_value);
      case 'gt-equal':
        return parseFloat(answer) >= parseFloat(condition.condition_value);
    }
  return false;
}

/**
 * Resize an image file to maximum size
 */
export function resizeImageToMaxSize(file: File): Promise<File> {
  const options = {
    maxSizeMB: 10485760,
    useWebWorker: true
  }

  return imageCompression(file, options);
}

/**
 * Open an image in fullscreen mode
 */
export function openFullscreen(event: MouseEvent): void {
  const img = event.target as HTMLImageElement;

  if (img) {
    if (img.requestFullscreen) {
      img.requestFullscreen();
    }
  }
}

/**
 * Update a table select list by property name
 */
export function updateTableSelectList(list: TableColType[], PropertyName: string, selectList: any[]): void {
  const l = list.find(l => l.PropertyName === PropertyName);
  if (l)
    l.SelectList = selectList;
}

/**
 * Extract page information from API response
 */
export function getPageFromResponse(Response: any): Page {
  let page = new Page();
  // Next page
  if (Response['next']) {
    page.next = parseInt(Response['next'].split('page=')[1], 10);
  } else {
    page.next = null;
  }

  // Previous page
  if (Response['previous']) {
    if (Response['previous'].includes('page=')) {
      page.previous = parseInt(Response['previous'].split('page=')[1], 10);
    } else {
      page.previous = 1;
    }
  } else {
    page.previous = null;
  }

  // Number of pages
  if (Response['count']) {
    page.count = Math.ceil(Response['count'] / 10);

    if (page.count === 1) {
      page.count = -1;
    }
  }
  else {
    page.count = -1;
  }
  return page;
}

/**
 * Keep an element in view by calculating offsets
 */
export function keepElementInView(elementId: string): { x: number, y: number } | undefined {
  const element = document.getElementById(elementId);

  if (!element) {
    console.error('Element not found');
    return;
  }

  const rect = element.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let xOffset = 0;
  let yOffset = 0;
  // Horizontal alignment
  if (rect.right > viewportWidth) {
    xOffset = rect.right - viewportWidth;
  } else if (rect.left < 0) {
    xOffset = rect.left;
  }

  // Vertical alignment
  if (rect.bottom > viewportHeight) {
    yOffset = rect.bottom - viewportHeight;
  } else if (rect.top < 0) {
    yOffset = rect.top;
  }

  return { x: xOffset, y: yOffset };
}

/**
 * Convert questions to CSV header
 */
export function questionsToCSVHeader(questions: Question[]): string {
  let header = '';
  questions.forEach(q => {
    header += `"${q.question}",`
  });
  header = header.substring(0, header.length - 1);
  return header;
}

/**
 * Convert questions to CSV body
 */
export function questionsToCSVBody(questions: Question[]): string {
  let body = '';
  questions.forEach(q => {
    body += `"${formatQuestionAnswer(q.answer)}",`
  });
  body = body.substring(0, body.length - 1);
  return body;
}

/**
 * Convert questions to CSV format
 */
export function questionsToCSV(questions: Question[]): string {
  let header = questionsToCSVHeader(questions);
  let body = questionsToCSVBody(questions);

  return `${header}\n${body}`;
}

/**
 * Convert responses to CSV format
 */
export function responsesToCSV(responses: Response[]): string {
  let csv = '';
  if (responses[0])
    csv += `${questionsToCSVHeader(responses[0].questionanswer_set)},Time\n`;
  responses.forEach(r => {
    csv += `${questionsToCSVBody(r.questionanswer_set)},${r.time}\n`;
  });
  return csv;
}

/**
 * Trigger a function after a timeout
 */
export function triggerChange(tmpFx: () => void, timeoutMs = 0): void {
  window.setTimeout(() => {
    tmpFx();
  }, timeoutMs);
}

/**
 * Log to console in development mode only
 */
export function devConsoleLog(location: string, x?: any): void {
  if (!environment.production) {
    if (x) console.log(location + '\n', x);
    else console.log(location);
  }
}

/**
 * Convert table data to CSV format
 * @param tableCols Array of table column definitions
 * @param tableData Array of data rows
 * @param onEmptyError Optional callback for empty dataset error
 * @returns CSV string
 */
export function tableToCSV(tableCols: any[], tableData: any[], onEmptyError?: (msg: string) => void): string {
  if (tableData.length <= 0) {
    if (onEmptyError) onEmptyError('Cannot export empty dataset.');
    return '';
  }

  let csv = '';
  tableCols.forEach(element => {
    csv += '"' + element['ColLabel'] + '",';
  });

  csv = csv.substring(0, csv.length - 1);
  csv += '\n';

  for (let i = 0; i < tableData.length; i++) {
    tableCols.forEach(element => {
      csv += '"' + getPropertyValue(tableData[i], element['PropertyName']).toString().replaceAll('"', '""') + '",';
    });
    csv = csv.substring(0, csv.length - 1);
    csv += '\n';
  }

  return csv;
}

/**
 * Preview an image from a URL using blueimp-load-image
 * @param link - URL of the image to preview
 * @param id - ID of the HTML element to append the image to
 */
export function previewImage(link: string, id: string): void {
  LoadImg(
    link,
    (img: any) => {
      if (img) {
        img.style.width = '100%';
        img.style.height = 'auto';
        document.getElementById(id)!.appendChild(img);
      }
    },
    {
      //maxWidth: 600,
      //maxHeight: 300,
      //minWidth: 100,
      //minHeight: 50,
      //canvas: true,
      orientation: true
    }
  );
}

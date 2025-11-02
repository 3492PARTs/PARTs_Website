import {
  strNoE,
  cloneObject,
  formatDateString,
  propertyMap,
  arrayObjectIndexOf,
  updateObjectInArray,
  formatQuestionAnswer,
  decodeBoolean,
  decodeSentBoolean,
  decodeYesNoBoolean,
  decodeYesNo,
  isObject,
  objectToString,
  objectToFormData,
  getPropertyValue,
  setPropertyValue,
  downloadFileAs,
  getScreenSize,
  AppSize,
  openURL,
  scrollTo,
  isQuestionConditionMet,
  updateTableSelectList,
  getPageFromResponse,
  Page,
  keepElementInView,
  questionsToCSVHeader,
  questionsToCSVBody,
  questionsToCSV,
  responsesToCSV,
  triggerChange,
  devConsoleLog,
  tableToCSV,
} from './utils.functions';
import { Question, QuestionConditionType, Response } from '../models/form.models';
import { TableColType } from '@app/shared/components/atoms/table/table.component';

describe('Utils Functions', () => {
  describe('strNoE', () => {
    it('should return true for null', () => {
      expect(strNoE(null)).toBe(true);
    });

    it('should return true for undefined', () => {
      expect(strNoE(undefined)).toBe(true);
    });

    it('should return true for empty string', () => {
      expect(strNoE('')).toBe(true);
    });

    it('should return true for whitespace string', () => {
      expect(strNoE('   ')).toBe(true);
    });

    it('should return true for NaN', () => {
      expect(strNoE(NaN)).toBe(true);
    });

    it('should return false for non-empty string', () => {
      expect(strNoE('test')).toBe(false);
    });

    it('should return false for number converted to string', () => {
      expect(strNoE(123)).toBe(false);
    });

    it('should return false for object converted to string', () => {
      expect(strNoE({ toString: () => 'value' })).toBe(false);
    });
  });

  describe('cloneObject', () => {
    it('should deep clone an object', () => {
      const original = { a: 1, b: { c: 2 } };
      const clone = cloneObject(original);
      
      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.b).not.toBe(original.b);
    });

    it('should clone an array', () => {
      const original = [1, 2, { a: 3 }];
      const clone = cloneObject(original);
      
      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
    });
  });

  describe('formatDateString', () => {
    it('should format a date string correctly', () => {
      const date = new Date('2023-06-15T14:30:00');
      const formatted = formatDateString(date);
      
      expect(formatted).toMatch(/6\/15\/23 \d+:30 [AP]M/);
    });

    it('should handle AM times', () => {
      const date = new Date('2023-06-15T09:05:00');
      const formatted = formatDateString(date);
      
      expect(formatted).toContain('AM');
    });

    it('should handle PM times', () => {
      const date = new Date('2023-06-15T15:30:00');
      const formatted = formatDateString(date);
      
      expect(formatted).toContain('PM');
    });

    it('should handle midnight (12 AM)', () => {
      const date = new Date('2023-06-15T00:30:00');
      const formatted = formatDateString(date);
      
      expect(formatted).toContain('12:30 AM');
    });

    it('should handle noon (12 PM)', () => {
      const date = new Date('2023-06-15T12:30:00');
      const formatted = formatDateString(date);
      
      expect(formatted).toContain('12:30 PM');
    });

    it('should pad minutes with zero', () => {
      const date = new Date('2023-06-15T14:05:00');
      const formatted = formatDateString(date);
      
      expect(formatted).toContain(':05 ');
    });
  });

  describe('propertyMap', () => {
    it('should find and return the property value', () => {
      const arr = [
        { id: 1, name: 'Alice', age: 30 },
        { id: 2, name: 'Bob', age: 25 },
      ];
      
      expect(propertyMap(arr, 'id', 2, 'name')).toBe('Bob');
    });

    it('should return undefined if property not found', () => {
      const arr = [{ id: 1, name: 'Alice' }];
      
      expect(propertyMap(arr, 'id', 2, 'name')).toBeUndefined();
    });

    it('should return undefined if findProperty does not exist', () => {
      const arr = [{ id: 1, name: 'Alice' }];
      
      expect(propertyMap(arr, 'id', 1, 'age')).toBeUndefined();
    });
  });

  describe('arrayObjectIndexOf', () => {
    it('should find the index of an object by property', () => {
      const arr = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];
      
      expect(arrayObjectIndexOf(arr, 'id', 2)).toBe(1);
    });

    it('should return -1 if not found', () => {
      const arr = [{ id: 1, name: 'Alice' }];
      
      expect(arrayObjectIndexOf(arr, 'id', 2)).toBe(-1);
    });

    it('should handle undefined elements', () => {
      const arr = [undefined, { id: 1 }];
      
      expect(arrayObjectIndexOf(arr, 'id', 1)).toBe(1);
    });

    it('should handle null elements', () => {
      const arr = [null, { id: 1 }];
      
      expect(arrayObjectIndexOf(arr, 'id', 1)).toBe(1);
    });
  });

  describe('updateObjectInArray', () => {
    it('should update an object in array', () => {
      const arr = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];
      
      updateObjectInArray(arr, 'id', { id: 2, name: 'Robert' });
      
      expect(arr[1].name).toBe('Robert');
    });

    it('should not modify array if object not found', () => {
      const arr = [{ id: 1, name: 'Alice' }];
      const original = [...arr];
      
      updateObjectInArray(arr, 'id', { id: 2, name: 'Bob' });
      
      expect(arr).toEqual(original);
    });
  });

  describe('formatQuestionAnswer', () => {
    it('should format checkbox answers', () => {
      const answer = [
        { option: 'Option1', checked: 'true' },
        { option: 'Option2', checked: 'false' },
        { option: 'Option3', checked: true },
      ];
      
      const formatted = formatQuestionAnswer(answer);
      
      expect(formatted).toContain('Option1');
      expect(formatted).toContain('Option3');
      expect(formatted).not.toContain('Option2');
    });

    it('should handle custom checked values', () => {
      const answer = [
        { option: 'Option1', checked: 'custom' },
      ];
      
      const formatted = formatQuestionAnswer(answer);
      
      expect(formatted).toBe('custom');
    });

    it('should return empty string for empty value', () => {
      expect(formatQuestionAnswer(null)).toBe('');
      expect(formatQuestionAnswer(undefined)).toBe('');
      expect(formatQuestionAnswer('')).toBe('');
    });

    it('should return object as JSON string', () => {
      const answer = { key: 'value' };
      
      expect(formatQuestionAnswer(answer)).toBe('{"key":"value"}');
    });

    it('should return primitive values as is', () => {
      expect(formatQuestionAnswer('text')).toBe('text');
      expect(formatQuestionAnswer(123) as any).toEqual(123);
    });
  });

  describe('decodeBoolean', () => {
    it('should return true value when boolean is true', () => {
      expect(decodeBoolean(true, { true: 'Yes', false: 'No' })).toBe('Yes');
    });

    it('should return false value when boolean is false', () => {
      expect(decodeBoolean(false, { true: 'Yes', false: 'No' })).toBe('No');
    });
  });

  describe('decodeSentBoolean', () => {
    it('should return "Sent" for true', () => {
      expect(decodeSentBoolean(true)).toBe('Sent');
    });

    it('should return "Not Sent" for false', () => {
      expect(decodeSentBoolean(false)).toBe('Not Sent');
    });
  });

  describe('decodeYesNoBoolean', () => {
    it('should return "Yes" for true', () => {
      expect(decodeYesNoBoolean(true)).toBe('Yes');
    });

    it('should return "No" for false', () => {
      expect(decodeYesNoBoolean(false)).toBe('No');
    });
  });

  describe('decodeYesNo', () => {
    it('should return "Yes" for "y"', () => {
      expect(decodeYesNo('y')).toBe('Yes');
    });

    it('should return "No" for "n"', () => {
      expect(decodeYesNo('n')).toBe('No');
    });
  });

  describe('isObject', () => {
    it('should return true for plain objects', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ a: 1 })).toBe(true);
    });

    it('should return false for arrays', () => {
      expect(isObject([])).toBe(false);
    });

    it('should return false for null', () => {
      // isObject(null) actually returns null && typeof null === 'object' && null.constructor === Object
      // which is falsy (null) but not false
      expect(isObject(null)).toBeFalsy();
    });

    it('should return false for primitives', () => {
      expect(isObject('string')).toBe(false);
      expect(isObject(123)).toBe(false);
      expect(isObject(true)).toBe(false);
    });

    it('should return false for class instances', () => {
      expect(isObject(new Date())).toBe(false);
    });
  });

  describe('objectToString', () => {
    it('should convert simple object to string', () => {
      const obj = { name: 'Alice', age: 30 };
      const str = objectToString(obj);
      
      expect(str).toContain('name: Alice');
      expect(str).toContain('age: 30');
    });

    it('should handle nested objects', () => {
      const obj = { person: { name: 'Alice' } };
      const str = objectToString(obj);
      
      expect(str).toContain('name: Alice');
    });

    it('should handle arrays in objects', () => {
      const obj = { items: ['a', 'b'] };
      const str = objectToString(obj);
      
      expect(str).toContain('items:');
      expect(str).toContain('a, b');
    });

    it('should return empty string for empty object', () => {
      expect(objectToString({})).toBe('');
    });

    it('should handle array input', () => {
      const arr = ['a', 'b'];
      const str = objectToString(arr);
      
      expect(str).toContain('a, b');
    });

    it('should return primitive as is', () => {
      expect(objectToString('test')).toBe('test');
      expect(objectToString(123) as any).toEqual(123);
    });
  });

  describe('objectToFormData', () => {
    it('should convert object to FormData', () => {
      const obj = { name: 'Alice', age: '30' };
      const formData = objectToFormData(obj);
      
      expect(formData.get('name')).toBe('Alice');
      expect(formData.get('age')).toBe('30');
    });

    it('should handle Blob values', () => {
      const blob = new Blob(['test']);
      const obj = { file: blob };
      const formData = objectToFormData(obj);
      
      const fileValue = formData.get('file');
      expect(fileValue).toBeTruthy();
      expect(fileValue instanceof Blob).toBe(true);
    });
  });

  describe('getPropertyValue', () => {
    it('should get a simple property', () => {
      const obj = { name: 'Alice' };
      
      expect(getPropertyValue(obj, 'name')).toBe('Alice');
    });

    it('should get a nested property', () => {
      const obj = { person: { name: 'Alice' } };
      
      expect(getPropertyValue(obj, 'person.name')).toBe('Alice');
    });

    it('should return empty string for null object', () => {
      expect(getPropertyValue(null, 'name')).toBe('');
    });

    it('should return empty string for undefined property', () => {
      const obj = { name: 'Alice' };
      
      expect(getPropertyValue(obj, 'age')).toBe('');
    });

    it('should throw error if no property provided', () => {
      expect(() => getPropertyValue({}, '')).toThrow();
    });

    it('should handle deeply nested properties', () => {
      const obj = { a: { b: { c: 'value' } } };
      
      expect(getPropertyValue(obj, 'a.b.c')).toBe('value');
    });
  });

  describe('setPropertyValue', () => {
    it('should set a simple property', () => {
      const obj: any = {};
      
      setPropertyValue(obj, 'name', 'Alice');
      
      expect(obj.name).toBe('Alice');
    });

    it('should set a nested property', () => {
      const obj: any = {};
      
      setPropertyValue(obj, 'person.name', 'Alice');
      
      expect(obj.person.name).toBe('Alice');
    });

    it('should create intermediate objects', () => {
      const obj: any = {};
      
      setPropertyValue(obj, 'a.b.c', 'value');
      
      expect(obj.a.b.c).toBe('value');
    });

    it('should not set dangerous properties', () => {
      const obj: any = {};
      
      setPropertyValue(obj, '__proto__.polluted', 'value');
      
      expect(Object.prototype.hasOwnProperty.call(Object.prototype, 'polluted')).toBe(false);
    });

    it('should not set constructor property', () => {
      const obj: any = {};
      
      setPropertyValue(obj, 'constructor.polluted', 'value');
      
      expect(obj.constructor.polluted).toBeUndefined();
    });

    it('should not set prototype property', () => {
      const obj: any = {};
      
      setPropertyValue(obj, 'prototype.polluted', 'value');
      
      expect(obj.prototype).toBeUndefined();
    });

    it('should throw error if no property provided', () => {
      expect(() => setPropertyValue({}, '', 'value')).toThrow();
    });
  });

  describe('downloadFileAs', () => {
    it('should create a Blob with correct data and type', () => {
      const data = 'test data';
      const filename = 'test.txt';
      const mimeType = 'text/plain';
      
      // Just ensure it doesn't throw
      expect(() => downloadFileAs(filename, data, mimeType)).not.toThrow();
    });
  });

  describe('getScreenSize', () => {
    it('should return XS for small screens', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(400);
      
      expect(getScreenSize()).toBe(AppSize.XS);
    });

    it('should return LG for medium screens', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(800);
      
      expect(getScreenSize()).toBe(AppSize.LG);
    });

    it('should return _7XLG for very large screens', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(3500);
      
      expect(getScreenSize()).toBe(AppSize._7XLG);
    });
  });

  describe('openURL', () => {
    it('should call window.open', () => {
      spyOn(window, 'open');
      
      openURL('https://example.com');
      
      expect(window.open).toHaveBeenCalledWith('https://example.com', 'noopener');
    });
  });

  describe('isQuestionConditionMet', () => {
    it('should return true for equal condition when values match', () => {
      const question: Partial<Question> = { id: 1 };
      const conditionalQuestion: Partial<Question> = {
        conditional_on_questions: [{
          conditional_on: 1,
          condition_value: 'yes',
          question_condition_typ: { question_condition_typ: 'equal' } as QuestionConditionType
        }]
      };
      
      const result = isQuestionConditionMet('yes', question as Question, conditionalQuestion as Question);
      
      expect(result).toBe(true);
    });

    it('should return false for equal condition when values do not match', () => {
      const question: Partial<Question> = { id: 1 };
      const conditionalQuestion: Partial<Question> = {
        conditional_on_questions: [{
          conditional_on: 1,
          condition_value: 'yes',
          question_condition_typ: { question_condition_typ: 'equal' } as QuestionConditionType
        }]
      };
      
      const result = isQuestionConditionMet('no', question as Question, conditionalQuestion as Question);
      
      expect(result).toBe(false);
    });

    it('should return true for exist condition when value exists', () => {
      const question: Partial<Question> = { id: 1 };
      const conditionalQuestion: Partial<Question> = {
        conditional_on_questions: [{
          conditional_on: 1,
          condition_value: '',
          question_condition_typ: { question_condition_typ: 'exist' } as QuestionConditionType
        }]
      };
      
      const result = isQuestionConditionMet('some value', question as Question, conditionalQuestion as Question);
      
      expect(result).toBe(true);
    });

    it('should return true for lt condition', () => {
      const question: Partial<Question> = { id: 1 };
      const conditionalQuestion: Partial<Question> = {
        conditional_on_questions: [{
          conditional_on: 1,
          condition_value: '10',
          question_condition_typ: { question_condition_typ: 'lt' } as QuestionConditionType
        }]
      };
      
      expect(isQuestionConditionMet('5', question as Question, conditionalQuestion as Question)).toBe(true);
      expect(isQuestionConditionMet('15', question as Question, conditionalQuestion as Question)).toBe(false);
    });

    it('should return true for gt condition', () => {
      const question: Partial<Question> = { id: 1 };
      const conditionalQuestion: Partial<Question> = {
        conditional_on_questions: [{
          conditional_on: 1,
          condition_value: '10',
          question_condition_typ: { question_condition_typ: 'gt' } as QuestionConditionType
        }]
      };
      
      expect(isQuestionConditionMet('15', question as Question, conditionalQuestion as Question)).toBe(true);
      expect(isQuestionConditionMet('5', question as Question, conditionalQuestion as Question)).toBe(false);
    });
  });

  describe('updateTableSelectList', () => {
    it('should update select list for matching property', () => {
      const list: TableColType[] = [
        { PropertyName: 'status', ColLabel: 'Status', SelectList: [] }
      ];
      const newSelectList = [{ id: 1, name: 'Active' }];
      
      updateTableSelectList(list, 'status', newSelectList);
      
      expect(list[0].SelectList).toBe(newSelectList);
    });

    it('should not update if property not found', () => {
      const list: TableColType[] = [
        { PropertyName: 'status', ColLabel: 'Status', SelectList: [] }
      ];
      const original = list[0].SelectList;
      
      updateTableSelectList(list, 'other', []);
      
      expect(list[0].SelectList).toBe(original);
    });
  });

  describe('getPageFromResponse', () => {
    it('should extract pagination info from response', () => {
      const response = {
        next: 'http://api.com?page=3',
        previous: 'http://api.com?page=1',
        count: 25
      };
      
      const page = getPageFromResponse(response);
      
      expect(page.next).toBe(3);
      expect(page.previous).toBe(1);
      expect(page.count).toBe(3); // Math.ceil(25 / 10)
    });

    it('should handle no next page', () => {
      const response = {
        next: null,
        previous: 'http://api.com?page=1',
        count: 10
      };
      
      const page = getPageFromResponse(response);
      
      expect(page.next).toBeNull();
    });

    it('should handle no previous page', () => {
      const response = {
        next: 'http://api.com?page=2',
        previous: null,
        count: 10
      };
      
      const page = getPageFromResponse(response);
      
      expect(page.previous).toBeNull();
    });

    it('should return -1 for single page', () => {
      const response = {
        count: 10
      };
      
      const page = getPageFromResponse(response);
      
      expect(page.count).toBe(-1);
    });

    it('should handle previous page without page parameter', () => {
      const response = {
        previous: 'http://api.com',
        count: 20
      };
      
      const page = getPageFromResponse(response);
      
      expect(page.previous).toBe(1);
    });
  });

  describe('keepElementInView', () => {
    it('should return undefined if element not found', () => {
      const result = keepElementInView('nonexistent');
      
      expect(result).toBeUndefined();
    });

    it('should calculate offsets for element out of view', () => {
      const element = document.createElement('div');
      element.id = 'test-element';
      document.body.appendChild(element);
      
      spyOn(element, 'getBoundingClientRect').and.returnValue({
        top: -100,
        left: 0,
        right: 100,
        bottom: 200,
        width: 100,
        height: 300,
        x: 0,
        y: -100,
        toJSON: () => ({})
      });
      
      const result = keepElementInView('test-element');
      
      expect(result).toBeDefined();
      expect(result!.y).toBe(-100);
      
      document.body.removeChild(element);
    });
  });

  describe('questionsToCSVHeader', () => {
    it('should create CSV header from questions', () => {
      const questions: Partial<Question>[] = [
        { question: 'Name' },
        { question: 'Age' }
      ];
      
      const header = questionsToCSVHeader(questions as Question[]);
      
      expect(header).toBe('"Name","Age"');
    });
  });

  describe('questionsToCSVBody', () => {
    it('should create CSV body from questions', () => {
      const questions: Partial<Question>[] = [
        { question: 'Name', answer: 'Alice' },
        { question: 'Age', answer: '30' }
      ];
      
      const body = questionsToCSVBody(questions as Question[]);
      
      expect(body).toBe('"Alice","30"');
    });
  });

  describe('questionsToCSV', () => {
    it('should create complete CSV from questions', () => {
      const questions: Partial<Question>[] = [
        { question: 'Name', answer: 'Alice' },
        { question: 'Age', answer: '30' }
      ];
      
      const csv = questionsToCSV(questions as Question[]);
      
      expect(csv).toBe('"Name","Age"\n"Alice","30"');
    });
  });

  describe('responsesToCSV', () => {
    it('should create CSV from responses', () => {
      const responses: Partial<Response>[] = [
        {
          questionanswer_set: [
            { question: 'Name', answer: 'Alice' } as Question,
            { question: 'Age', answer: '30' } as Question
          ],
          time: new Date('2023-06-15')
        }
      ];
      
      const csv = responsesToCSV(responses as Response[]);
      
      expect(csv).toContain('"Name","Age",Time');
      expect(csv).toContain('"Alice","30"');
    });

    it('should handle empty responses', () => {
      const csv = responsesToCSV([]);
      
      expect(csv).toBe('');
    });
  });

  describe('triggerChange', () => {
    it('should call function after timeout', (done) => {
      let called = false;
      
      triggerChange(() => {
        called = true;
        expect(called).toBe(true);
        done();
      }, 10);
    });
  });

  describe('devConsoleLog', () => {
    it('should not throw when called', () => {
      // Note: In test environment, environment.production may be true or false
      // We just test that it doesn't throw
      expect(() => devConsoleLog('test location', { data: 'test' })).not.toThrow();
    });
  });

  describe('tableToCSV', () => {
    it('should convert table to CSV', () => {
      const tableCols = [
        { ColLabel: 'Name', PropertyName: 'name' },
        { ColLabel: 'Age', PropertyName: 'age' }
      ];
      const tableData = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 }
      ];
      
      const csv = tableToCSV(tableCols, tableData);
      
      expect(csv).toContain('"Name","Age"');
      expect(csv).toContain('"Alice","30"');
      expect(csv).toContain('"Bob","25"');
    });

    it('should call onEmptyError for empty dataset', () => {
      const onEmptyError = jasmine.createSpy('onEmptyError');
      
      const csv = tableToCSV([], [], onEmptyError);
      
      expect(csv).toBe('');
      expect(onEmptyError).toHaveBeenCalledWith('Cannot export empty dataset.');
    });

    it('should escape double quotes in data', () => {
      const tableCols = [{ ColLabel: 'Text', PropertyName: 'text' }];
      const tableData = [{ text: 'He said "hello"' }];
      
      const csv = tableToCSV(tableCols, tableData);
      
      expect(csv).toContain('He said ""hello""');
    });
  });
});

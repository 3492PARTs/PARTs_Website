import { StrToTypePipe } from './str-to-type.pipe';

describe('StrToTypePipe', () => {
  let pipe: StrToTypePipe;

  beforeEach(() => {
    pipe = new StrToTypePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should convert string numbers to number type', () => {
    const testArray = [
      { value: '123' },
      { value: '456.78' }
    ];
    const result = pipe.transform(testArray);
    expect(typeof result[0].value).toBe('number');
    expect(result[0].value).toBe(123);
    expect(typeof result[1].value).toBe('number');
    expect(result[1].value).toBe(456.78);
  });

  it('should convert date strings to Date objects', () => {
    const testArray = [
      { date: '01/15/2024' },
      { date: '12/25/2024' }
    ];
    const result = pipe.transform(testArray);
    expect(result[0].date instanceof Date).toBe(true);
    expect(result[1].date instanceof Date).toBe(true);
  });

  it('should handle mixed types in array', () => {
    const testArray = [
      { value: '123', date: '01/15/2024', text: 'hello' }
    ];
    const result = pipe.transform(testArray);
    expect(typeof result[0].value).toBe('number');
    expect(result[0].date instanceof Date).toBe(true);
    expect(typeof result[0].text).toBe('string');
  });

  it('should handle integer numbers', () => {
    const testArray = [
      { count: '42' }
    ];
    const result = pipe.transform(testArray);
    expect(result[0].count).toBe(42);
  });

  it('should handle decimal numbers', () => {
    const testArray = [
      { price: '19.99' }
    ];
    const result = pipe.transform(testArray);
    expect(result[0].price).toBe(19.99);
  });

  it('should not convert non-matching strings', () => {
    const testArray = [
      { text: 'hello world' },
      { mixed: 'abc123' }
    ];
    const result = pipe.transform(testArray);
    expect(typeof result[0].text).toBe('string');
    expect(result[0].text).toBe('hello world');
    expect(typeof result[1].mixed).toBe('string');
  });

  it('should handle empty array', () => {
    const result = pipe.transform([]);
    expect(result.length).toBe(0);
  });

  it('should handle objects with no properties matching patterns', () => {
    const testArray = [
      { name: 'John', city: 'New York' }
    ];
    const result = pipe.transform(testArray);
    expect(result[0].name).toBe('John');
    expect(result[0].city).toBe('New York');
  });

  it('should handle zero values', () => {
    const testArray = [
      { value: '0' }
    ];
    const result = pipe.transform(testArray);
    expect(result[0].value).toBe(0);
  });

  it('should handle negative numbers', () => {
    const testArray = [
      { temp: '-5.5' }
    ];
    const result = pipe.transform(testArray);
    // Note: The regex in the pipe doesn't support negative numbers
    // This test documents the current behavior
    expect(typeof result[0].temp).toBe('string');
  });

  it('should handle leading zeros in numbers', () => {
    const testArray = [
      { code: '007' }
    ];
    const result = pipe.transform(testArray);
    expect(result[0].code).toBe(7);
  });

  it('should handle very large numbers', () => {
    const testArray = [
      { bigNum: '999999999999' }
    ];
    const result = pipe.transform(testArray);
    expect(typeof result[0].bigNum).toBe('number');
    expect(result[0].bigNum).toBe(999999999999);
  });

  it('should handle very small decimal numbers', () => {
    const testArray = [
      { small: '0.00001' }
    ];
    const result = pipe.transform(testArray);
    expect(result[0].small).toBe(0.00001);
  });

  it('should handle date format with single digit day', () => {
    const testArray = [
      { date: '01/05/2024' }
    ];
    const result = pipe.transform(testArray);
    expect(result[0].date instanceof Date).toBe(true);
  });

  it('should handle date format with single digit month', () => {
    const testArray = [
      { date: '05/01/2024' }
    ];
    const result = pipe.transform(testArray);
    expect(result[0].date instanceof Date).toBe(true);
  });

  it('should not convert partial date strings', () => {
    const testArray = [
      { date: '1/15/2024' }, // Missing leading zero in month
      { date: '01/5/2024' }  // Missing leading zero in day
    ];
    const result = pipe.transform(testArray);
    // These don't match the strict pattern, should remain strings
    expect(typeof result[0].date).toBe('string');
    expect(typeof result[1].date).toBe('string');
  });

  it('should handle objects with null values', () => {
    const testArray = [
      { value: null, name: 'test' }
    ];
    const result = pipe.transform(testArray);
    expect(result[0].value).toBe(null);
    expect(result[0].name).toBe('test');
  });

  it('should handle objects with undefined values', () => {
    const testArray = [
      { value: undefined, name: 'test' }
    ];
    const result = pipe.transform(testArray);
    expect(result[0].value).toBe(undefined);
    expect(result[0].name).toBe('test');
  });

  it('should handle nested objects', () => {
    const testArray = [
      { 
        id: '123',
        user: {
          age: '25',
          birthdate: '01/15/2000'
        }
      }
    ];
    const result = pipe.transform(testArray);
    // Pipe only processes top-level properties
    expect(result[0].id).toBe(123);
    expect(typeof result[0].user.age).toBe('string');
    expect(typeof result[0].user.birthdate).toBe('string');
  });

  it('should mutate the original array', () => {
    const testArray = [
      { value: '100' }
    ];
    const result = pipe.transform(testArray);
    expect(result).toBe(testArray);
    expect(testArray[0].value as any).toBe(100);
  });

  it('should handle multiple objects in array', () => {
    const testArray = [
      { id: '1', count: '10' },
      { id: '2', count: '20' },
      { id: '3', count: '30' }
    ];
    const result = pipe.transform(testArray);
    expect(result[0].id).toBe(1);
    expect(result[1].count).toBe(20);
    expect(result[2].id).toBe(3);
  });

  it('should handle strings with spaces before or after', () => {
    const testArray = [
      { value: ' 123 ' }
    ];
    const result = pipe.transform(testArray);
    // The regex doesn't trim, so this won't match
    expect(typeof result[0].value).toBe('string');
  });

  it('should handle scientific notation strings', () => {
    const testArray = [
      { value: 'e10' } // Starts with 'e', not a number
    ];
    const result = pipe.transform(testArray);
    // The regex doesn't support scientific notation
    expect(typeof result[0].value).toBe('string');
  });

  it('should handle hexadecimal strings', () => {
    const testArray = [
      { value: '0xFF' }
    ];
    const result = pipe.transform(testArray);
    // The regex only matches decimal numbers
    expect(typeof result[0].value).toBe('string');
  });

  it('should handle year 2000 dates', () => {
    const testArray = [
      { date: '01/01/2000' }
    ];
    const result = pipe.transform(testArray);
    expect(result[0].date instanceof Date).toBe(true);
  });

  it('should handle leap year dates', () => {
    const testArray = [
      { date: '02/29/2024' }
    ];
    const result = pipe.transform(testArray);
    expect(result[0].date instanceof Date).toBe(true);
  });

  it('should handle end of month dates', () => {
    const testArray = [
      { date: '12/31/2024' }
    ];
    const result = pipe.transform(testArray);
    expect(result[0].date instanceof Date).toBe(true);
  });

  it('should handle strings with letters', () => {
    const testArray = [
      { code: 'ABC123' } // Has letters, won't match number pattern
    ];
    const result = pipe.transform(testArray);
    expect(typeof result[0].code).toBe('string');
  });

  it('should handle single element array', () => {
    const testArray = [
      { value: '42' }
    ];
    const result = pipe.transform(testArray);
    expect(result.length).toBe(1);
    expect(result[0].value).toBe(42);
  });

  it('should handle object with many properties', () => {
    const testArray = [
      {
        num1: '1',
        num2: '2.5',
        str1: 'text',
        date1: '01/01/2024',
        str2: 'more text',
        num3: '100.50'
      }
    ];
    const result = pipe.transform(testArray);
    expect(result[0].num1).toBe(1);
    expect(result[0].num2).toBe(2.5);
    expect(result[0].str1).toBe('text');
    expect(result[0].date1 instanceof Date).toBe(true);
    expect(result[0].str2).toBe('more text');
    expect(result[0].num3).toBe(100.5);
  });
});

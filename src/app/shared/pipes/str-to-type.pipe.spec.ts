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
});

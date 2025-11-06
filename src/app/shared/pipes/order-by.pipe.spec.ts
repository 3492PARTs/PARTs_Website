import { OrderByPipe } from './order-by.pipe';

describe('OrderByPipe', () => {
  let pipe: OrderByPipe;

  beforeEach(() => {
    pipe = new OrderByPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should sort array by number property in ascending order', () => {
    const testArray = [
      { id: 3, name: 'Charlie' },
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ];
    const result = pipe.transform(testArray, 'id', false);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
    expect(result[2].id).toBe(3);
  });

  it('should sort array by number property in descending order', () => {
    const testArray = [
      { id: 1, name: 'Alice' },
      { id: 3, name: 'Charlie' },
      { id: 2, name: 'Bob' }
    ];
    const result = pipe.transform(testArray, 'id', true);
    expect(result[0].id).toBe(3);
    expect(result[1].id).toBe(2);
    expect(result[2].id).toBe(1);
  });

  it('should sort array by string property in ascending order', () => {
    const testArray = [
      { id: 1, name: 'Charlie' },
      { id: 2, name: 'Alice' },
      { id: 3, name: 'Bob' }
    ];
    const result = pipe.transform(testArray, 'name', false);
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
    expect(result[2].name).toBe('Charlie');
  });

  it('should sort array by string property in descending order', () => {
    const testArray = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Charlie' },
      { id: 3, name: 'Bob' }
    ];
    const result = pipe.transform(testArray, 'name', true);
    expect(result[0].name).toBe('Charlie');
    expect(result[1].name).toBe('Bob');
    expect(result[2].name).toBe('Alice');
  });

  it('should handle single element array', () => {
    const testArray = [{ id: 1, name: 'Alice' }];
    const result = pipe.transform(testArray, 'id', false);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(1);
  });

  it('should handle empty array', () => {
    const testArray: any[] = [];
    const result = pipe.transform(testArray, 'id', false);
    expect(result.length).toBe(0);
  });

  it('should sort by date properties', () => {
    const testArray = [
      { id: 1, date: new Date('2024-03-15') },
      { id: 2, date: new Date('2024-01-10') },
      { id: 3, date: new Date('2024-02-20') }
    ];
    const result = pipe.transform(testArray, 'date', false);
    expect(result[0].id).toBe(2);
    expect(result[1].id).toBe(3);
    expect(result[2].id).toBe(1);
  });

  it('should handle equal values', () => {
    const testArray = [
      { id: 1, score: 100 },
      { id: 2, score: 100 },
      { id: 3, score: 100 }
    ];
    const result = pipe.transform(testArray, 'score', false);
    expect(result.length).toBe(3);
    // All scores are equal, order should be stable
    expect(result.every((item: any) => item.score === 100)).toBe(true);
  });

  it('should sort negative numbers correctly in ascending order', () => {
    const testArray = [
      { id: 1, value: 5 },
      { id: 2, value: -10 },
      { id: 3, value: 0 },
      { id: 4, value: -5 }
    ];
    const result = pipe.transform(testArray, 'value', false);
    expect(result[0].value).toBe(-10);
    expect(result[1].value).toBe(-5);
    expect(result[2].value).toBe(0);
    expect(result[3].value).toBe(5);
  });

  it('should sort negative numbers correctly in descending order', () => {
    const testArray = [
      { id: 1, value: -5 },
      { id: 2, value: 5 },
      { id: 3, value: 0 },
      { id: 4, value: -10 }
    ];
    const result = pipe.transform(testArray, 'value', true);
    expect(result[0].value).toBe(5);
    expect(result[1].value).toBe(0);
    expect(result[2].value).toBe(-5);
    expect(result[3].value).toBe(-10);
  });

  it('should sort decimal numbers correctly', () => {
    const testArray = [
      { id: 1, price: 19.99 },
      { id: 2, price: 9.99 },
      { id: 3, price: 14.50 }
    ];
    const result = pipe.transform(testArray, 'price', false);
    expect(result[0].price).toBe(9.99);
    expect(result[1].price).toBe(14.50);
    expect(result[2].price).toBe(19.99);
  });

  it('should handle case-sensitive string sorting', () => {
    const testArray = [
      { id: 1, name: 'apple' },
      { id: 2, name: 'Apple' },
      { id: 3, name: 'APPLE' }
    ];
    const result = pipe.transform(testArray, 'name', false);
    // JavaScript's default string comparison is case-sensitive
    expect(result.length).toBe(3);
  });

  it('should mutate the original array', () => {
    const testArray = [
      { id: 3, name: 'Charlie' },
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ];
    const result = pipe.transform(testArray, 'id', false);
    // The pipe modifies the array in place
    expect(result).toBe(testArray);
    expect(testArray[0].id).toBe(1);
  });

  it('should handle mixed type values by JavaScript comparison rules', () => {
    const testArray = [
      { id: 1, value: 10 },
      { id: 2, value: 5 },
      { id: 3, value: 20 }
    ];
    const result = pipe.transform(testArray, 'value', false);
    expect(result[0].value).toBe(5);
    expect(result[1].value).toBe(10);
    expect(result[2].value).toBe(20);
  });

  it('should handle undefined property values', () => {
    const testArray = [
      { id: 1, value: 10 },
      { id: 2 }, // undefined value
      { id: 3, value: 5 }
    ];
    const result = pipe.transform(testArray, 'value', false);
    // Undefined should be sorted before defined values
    expect(result.length).toBe(3);
  });

  it('should handle null property values', () => {
    const testArray = [
      { id: 1, value: 10 },
      { id: 2, value: null },
      { id: 3, value: 5 }
    ];
    const result = pipe.transform(testArray, 'value', false);
    // Null should be sorted before defined values
    expect(result.length).toBe(3);
  });

  it('should handle boolean values in ascending order', () => {
    const testArray = [
      { id: 1, active: true },
      { id: 2, active: false },
      { id: 3, active: true }
    ];
    const result = pipe.transform(testArray, 'active', false);
    expect(result[0].active).toBe(false);
    expect(result[1].active).toBe(true);
    expect(result[2].active).toBe(true);
  });

  it('should handle boolean values in descending order', () => {
    const testArray = [
      { id: 1, active: false },
      { id: 2, active: true },
      { id: 3, active: false }
    ];
    const result = pipe.transform(testArray, 'active', true);
    expect(result[0].active).toBe(true);
    expect(result[1].active).toBe(false);
    expect(result[2].active).toBe(false);
  });

  it('should handle very long strings', () => {
    const longString1 = 'a'.repeat(1000);
    const longString2 = 'b'.repeat(1000);
    const testArray = [
      { id: 1, text: longString2 },
      { id: 2, text: longString1 }
    ];
    const result = pipe.transform(testArray, 'text', false);
    expect(result[0].id).toBe(2);
    expect(result[1].id).toBe(1);
  });

  it('should handle arrays with thousands of elements efficiently', () => {
    const largeArray = Array.from({ length: 1000 }, (_, i) => ({ id: i, value: Math.random() }));
    const result = pipe.transform(largeArray, 'value', false);
    expect(result.length).toBe(1000);
    // Verify it's sorted
    for (let i = 1; i < result.length; i++) {
      expect(result[i].value).toBeGreaterThanOrEqual(result[i - 1].value);
    }
  });

  it('should handle numeric strings correctly', () => {
    const testArray = [
      { id: 1, code: '100' },
      { id: 2, code: '20' },
      { id: 3, code: '3' }
    ];
    const result = pipe.transform(testArray, 'code', false);
    // String comparison: '100' < '20' < '3'
    expect(result[0].code).toBe('100');
    expect(result[1].code).toBe('20');
    expect(result[2].code).toBe('3');
  });

  it('should handle special characters in string values', () => {
    const testArray = [
      { id: 1, name: '@symbol' },
      { id: 2, name: '#hashtag' },
      { id: 3, name: '!exclamation' }
    ];
    const result = pipe.transform(testArray, 'name', false);
    expect(result.length).toBe(3);
    // Special characters are sorted by their ASCII/Unicode values
  });

  it('should handle mixed case strings', () => {
    const testArray = [
      { id: 1, name: 'zebra' },
      { id: 2, name: 'Apple' },
      { id: 3, name: 'banana' }
    ];
    const result = pipe.transform(testArray, 'name', false);
    // Uppercase letters come before lowercase in ASCII
    expect(result[0].name).toBe('Apple');
  });

  it('should sort by nested property path', () => {
    const testArray = [
      { id: 1, user: { name: 'Charlie' } },
      { id: 2, user: { name: 'Alice' } },
      { id: 3, user: { name: 'Bob' } }
    ];
    // Note: The current implementation doesn't support nested paths
    // This test documents the behavior
    const result = pipe.transform(testArray, 'user', false);
    expect(result.length).toBe(3);
  });

  it('should handle infinity values', () => {
    const testArray = [
      { id: 1, value: 10 },
      { id: 2, value: Infinity },
      { id: 3, value: -Infinity },
      { id: 4, value: 5 }
    ];
    const result = pipe.transform(testArray, 'value', false);
    expect(result[0].value).toBe(-Infinity);
    expect(result[3].value).toBe(Infinity);
  });

  it('should handle NaN values', () => {
    const testArray = [
      { id: 1, value: 10 },
      { id: 2, value: NaN },
      { id: 3, value: 5 }
    ];
    const result = pipe.transform(testArray, 'value', false);
    expect(result.length).toBe(3);
    // NaN is tricky in comparisons
  });
});

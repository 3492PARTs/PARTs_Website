import { ObjectWildCardFilterPipe } from './object-wildcard-filter.pipe';

describe('ObjectWildCardFilterPipe', () => {
  let pipe: ObjectWildCardFilterPipe;

  beforeEach(() => {
    pipe = new ObjectWildCardFilterPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return original array when searchText is empty string', () => {
    const testArray = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ];
    const result = pipe.transform(testArray, '');
    expect(result).toEqual(testArray);
  });

  it('should filter objects containing search text in any property', () => {
    const testArray = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      { id: 3, name: 'Bob Johnson', email: 'bob@test.com' }
    ];
    const result = pipe.transform(testArray, 'john');
    expect(result.length).toBe(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(3);
  });

  it('should be case insensitive', () => {
    const testArray = [
      { id: 1, name: 'UPPERCASE' },
      { id: 2, name: 'lowercase' },
      { id: 3, name: 'MixedCase' }
    ];
    const result = pipe.transform(testArray, 'case');
    expect(result.length).toBe(3);
  });

  it('should search across all object properties', () => {
    const testArray = [
      { id: 1, name: 'Alice', city: 'Boston', role: 'admin' },
      { id: 2, name: 'Bob', city: 'New York', role: 'user' },
      { id: 3, name: 'Charlie', city: 'Boston', role: 'user' }
    ];
    const result = pipe.transform(testArray, 'boston');
    expect(result.length).toBe(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(3);
  });

  it('should search in nested objects', () => {
    const testArray = [
      { id: 1, user: { name: 'John', address: { city: 'Seattle' } } },
      { id: 2, user: { name: 'Jane', address: { city: 'Portland' } } },
      { id: 3, user: { name: 'Bob', address: { city: 'Seattle' } } }
    ];
    const result = pipe.transform(testArray, 'seattle');
    expect(result.length).toBe(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(3);
  });

  it('should search in arrays within objects', () => {
    const testArray = [
      { id: 1, tags: ['angular', 'typescript', 'testing'] },
      { id: 2, tags: ['react', 'javascript'] },
      { id: 3, tags: ['vue', 'typescript'] }
    ];
    const result = pipe.transform(testArray, 'typescript');
    expect(result.length).toBe(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(3);
  });

  it('should return empty array when no matches found', () => {
    const testArray = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ];
    const result = pipe.transform(testArray, 'xyz123');
    expect(result.length).toBe(0);
  });

  it('should handle empty array', () => {
    const result = pipe.transform([], 'test');
    expect(result.length).toBe(0);
  });

  it('should search in number values', () => {
    const testArray = [
      { id: 1, count: 100 },
      { id: 2, count: 200 },
      { id: 3, count: 150 }
    ];
    const result = pipe.transform(testArray, '100');
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(1);
  });

  it('should search in boolean values', () => {
    const testArray = [
      { id: 1, active: true },
      { id: 2, active: false },
      { id: 3, active: true }
    ];
    const result = pipe.transform(testArray, 'true');
    expect(result.length).toBe(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(3);
  });

  it('should handle partial matches', () => {
    const testArray = [
      { id: 1, email: 'user@example.com' },
      { id: 2, email: 'admin@example.com' },
      { id: 3, email: 'user@test.com' }
    ];
    const result = pipe.transform(testArray, 'example');
    expect(result.length).toBe(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
  });

  it('should handle special characters in search text', () => {
    const testArray = [
      { id: 1, code: 'ABC-123' },
      { id: 2, code: 'DEF-456' },
      { id: 3, code: 'ABC-789' }
    ];
    const result = pipe.transform(testArray, 'abc-');
    expect(result.length).toBe(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(3);
  });

  it('should handle null values in objects', () => {
    const testArray = [
      { id: 1, name: 'John', notes: null },
      { id: 2, name: 'Jane', notes: 'important' }
    ];
    const result = pipe.transform(testArray, 'john');
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(1);
  });

  it('should handle undefined values in objects', () => {
    const testArray = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane', email: 'jane@example.com' }
    ];
    const result = pipe.transform(testArray, 'jane');
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(2);
  });
});

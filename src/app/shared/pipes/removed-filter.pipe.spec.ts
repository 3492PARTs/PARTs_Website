import { RemovedFilterPipe } from './removed-filter.pipe';

describe('RemovedFilterPipe', () => {
  let pipe: RemovedFilterPipe;

  beforeEach(() => {
    pipe = new RemovedFilterPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return original array when Enabled is false', () => {
    const testArray = [
      { id: 1, removed: true },
      { id: 2, removed: false },
      { id: 3, removed: true }
    ];
    const result = pipe.transform(testArray, false, 'removed', false);
    expect(result).toEqual(testArray);
  });

  it('should return original array when Property is null', () => {
    const testArray = [
      { id: 1, removed: true },
      { id: 2, removed: false }
    ];
    const result = pipe.transform(testArray, true, null as any, false);
    expect(result).toEqual(testArray);
  });

  it('should filter objects where property equals value', () => {
    const testArray = [
      { id: 1, removed: false },
      { id: 2, removed: true },
      { id: 3, removed: false }
    ];
    const result = pipe.transform(testArray, true, 'removed', false);
    expect(result.length).toBe(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(3);
  });

  it('should filter objects with true value', () => {
    const testArray = [
      { id: 1, active: true },
      { id: 2, active: false },
      { id: 3, active: true }
    ];
    const result = pipe.transform(testArray, true, 'active', true);
    expect(result.length).toBe(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(3);
  });

  it('should work with nested properties', () => {
    const testArray = [
      { id: 1, user: { status: 'active' } },
      { id: 2, user: { status: 'inactive' } },
      { id: 3, user: { status: 'active' } }
    ];
    const result = pipe.transform(testArray, true, 'user.status', 'active');
    expect(result.length).toBe(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(3);
  });

  it('should handle empty array', () => {
    const result = pipe.transform([], true, 'removed', false);
    expect(result.length).toBe(0);
  });

  it('should handle string values', () => {
    const testArray = [
      { id: 1, status: 'pending' },
      { id: 2, status: 'complete' },
      { id: 3, status: 'pending' }
    ];
    const result = pipe.transform(testArray, true, 'status', 'pending');
    expect(result.length).toBe(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(3);
  });

  it('should handle number values', () => {
    const testArray = [
      { id: 1, count: 0 },
      { id: 2, count: 5 },
      { id: 3, count: 0 }
    ];
    const result = pipe.transform(testArray, true, 'count', 0);
    expect(result.length).toBe(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(3);
  });

  it('should return empty array when no matches found', () => {
    const testArray = [
      { id: 1, status: 'active' },
      { id: 2, status: 'active' }
    ];
    const result = pipe.transform(testArray, true, 'status', 'inactive');
    expect(result.length).toBe(0);
  });

  it('should use default Enabled value of false', () => {
    const testArray = [
      { id: 1, removed: false },
      { id: 2, removed: true }
    ];
    const result = pipe.transform(testArray, undefined as any, 'removed', false);
    expect(result).toEqual(testArray);
  });

  it('should use default Value of false', () => {
    const testArray = [
      { id: 1, active: false },
      { id: 2, active: true },
      { id: 3, active: false }
    ];
    const result = pipe.transform(testArray, true, 'active');
    expect(result.length).toBe(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(3);
  });

  it('should filter by multiple levels of nested properties', () => {
    const testArray = [
      { id: 1, user: { profile: { verified: true } } },
      { id: 2, user: { profile: { verified: false } } },
      { id: 3, user: { profile: { verified: true } } }
    ];
    const result = pipe.transform(testArray, true, 'user.profile.verified', true);
    expect(result.length).toBe(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(3);
  });

  it('should handle property path with missing intermediate levels', () => {
    const testArray = [
      { id: 1, user: { name: 'John' } },
      { id: 2, user: { profile: { verified: true } } },
      { id: 3 }
    ];
    // When property path doesn't exist, getPropertyValue returns '' (empty string)
    const result = pipe.transform(testArray, true, 'user.profile.verified', '');
    expect(result.length).toBe(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(3);
  });

  it('should work with date values', () => {
    const date1 = new Date('2024-01-01');
    const date2 = new Date('2024-02-01');
    const testArray = [
      { id: 1, createdAt: date1 },
      { id: 2, createdAt: date2 },
      { id: 3, createdAt: date1 }
    ];
    const result = pipe.transform(testArray, true, 'createdAt', date1);
    expect(result.length).toBe(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(3);
  });

  it('should work with numeric zero value', () => {
    const testArray = [
      { id: 1, score: 0 },
      { id: 2, score: 100 },
      { id: 3, score: 0 }
    ];
    const result = pipe.transform(testArray, true, 'score', 0);
    expect(result.length).toBe(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(3);
  });

  it('should work with empty string value', () => {
    const testArray = [
      { id: 1, name: '' },
      { id: 2, name: 'John' },
      { id: 3, name: '' }
    ];
    const result = pipe.transform(testArray, true, 'name', '');
    expect(result.length).toBe(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(3);
  });

  it('should use strict equality comparison', () => {
    const testArray = [
      { id: 1, value: 0 },
      { id: 2, value: false },
      { id: 3, value: '' },
      { id: 4, value: null }
    ];
    // Should only match exact false values, not falsy values
    const result = pipe.transform(testArray, true, 'value', false);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(2);
  });

  it('should filter by object reference equality', () => {
    const obj1 = { name: 'test' };
    const obj2 = { name: 'test' };
    const testArray = [
      { id: 1, ref: obj1 },
      { id: 2, ref: obj2 },
      { id: 3, ref: obj1 }
    ];
    const result = pipe.transform(testArray, true, 'ref', obj1);
    expect(result.length).toBe(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(3);
  });

  it('should handle array property values', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [4, 5, 6];
    const testArray = [
      { id: 1, items: arr1 },
      { id: 2, items: arr2 },
      { id: 3, items: arr1 }
    ];
    const result = pipe.transform(testArray, true, 'items', arr1);
    expect(result.length).toBe(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(3);
  });

  it('should preserve original array when filtering', () => {
    const testArray = [
      { id: 1, active: true },
      { id: 2, active: false },
      { id: 3, active: true }
    ];
    const originalLength = testArray.length;
    const result = pipe.transform(testArray, true, 'active', true);
    
    expect(testArray.length).toBe(originalLength);
    expect(result.length).toBe(2);
  });

  it('should handle single item array', () => {
    const testArray = [
      { id: 1, active: true }
    ];
    const result = pipe.transform(testArray, true, 'active', true);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(1);
  });

  it('should handle case sensitive string comparison', () => {
    const testArray = [
      { id: 1, status: 'Active' },
      { id: 2, status: 'active' },
      { id: 3, status: 'ACTIVE' }
    ];
    const result = pipe.transform(testArray, true, 'status', 'active');
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(2);
  });
});

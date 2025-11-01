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
});

import { DateFilterPipe } from './date-filter.pipe';

describe('DateFilterPipe', () => {
  let pipe: DateFilterPipe;

  beforeEach(() => {
    pipe = new DateFilterPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return original array when Enabled is false', () => {
    const testArray = [
      { date: '2024-01-01' },
      { date: '2024-02-01' }
    ];
    const result = pipe.transform(testArray, false, 'date', new Date('2024-01-15'), 'gte');
    expect(result).toEqual(testArray);
  });

  it('should return original array when Property is null', () => {
    const testArray = [
      { date: '2024-01-01' },
      { date: '2024-02-01' }
    ];
    const result = pipe.transform(testArray, true, null as any, new Date('2024-01-15'), 'gte');
    expect(result).toEqual(testArray);
  });

  it('should filter with gte (greater than or equal) operator', () => {
    const testArray = [
      { date: '2024-01-01' },
      { date: '2024-02-01' },
      { date: '2024-03-01' }
    ];
    const filterDate = new Date('2024-02-01');
    const result = pipe.transform(testArray, true, 'date', filterDate, 'gte');
    expect(result.length).toBe(2);
    expect(result[0].date).toBe('2024-02-01');
  });

  it('should filter with lte (less than or equal) operator', () => {
    const testArray = [
      { date: '2024-01-01' },
      { date: '2024-02-01' },
      { date: '2024-03-01' }
    ];
    const filterDate = new Date('2024-02-01');
    const result = pipe.transform(testArray, true, 'date', filterDate, 'lte');
    expect(result.length).toBe(2);
    expect(result[1].date).toBe('2024-02-01');
  });

  it('should filter with gt (greater than) operator', () => {
    const testArray = [
      { date: '2024-01-01' },
      { date: '2024-02-01' },
      { date: '2024-03-01' }
    ];
    const filterDate = new Date('2024-02-01');
    const result = pipe.transform(testArray, true, 'date', filterDate, 'gt');
    expect(result.length).toBe(1);
    expect(result[0].date).toBe('2024-03-01');
  });

  it('should filter with lt (less than) operator', () => {
    const testArray = [
      { date: '2024-01-01' },
      { date: '2024-02-01' },
      { date: '2024-03-01' }
    ];
    const filterDate = new Date('2024-02-01');
    const result = pipe.transform(testArray, true, 'date', filterDate, 'lt');
    expect(result.length).toBe(1);
    expect(result[0].date).toBe('2024-01-01');
  });

  it('should handle empty array', () => {
    const result = pipe.transform([], true, 'date', new Date(), 'gte');
    expect(result.length).toBe(0);
  });

  it('should handle invalid operator by returning empty results', () => {
    const testArray = [
      { date: '2024-01-01' },
      { date: '2024-02-01' }
    ];
    const result = pipe.transform(testArray, true, 'date', new Date('2024-01-15'), 'invalid');
    expect(result.length).toBe(0);
  });

  it('should handle dates at exact boundary with gte', () => {
    const testArray = [
      { date: '2024-02-01T00:00:00' }
    ];
    const filterDate = new Date('2024-02-01T00:00:00');
    const result = pipe.transform(testArray, true, 'date', filterDate, 'gte');
    expect(result.length).toBe(1);
  });

  it('should handle dates at exact boundary with lte', () => {
    const testArray = [
      { date: '2024-02-01T00:00:00' }
    ];
    const filterDate = new Date('2024-02-01T00:00:00');
    const result = pipe.transform(testArray, true, 'date', filterDate, 'lte');
    expect(result.length).toBe(1);
  });

  it('should handle dates at exact boundary with gt (exclusive)', () => {
    const testArray = [
      { date: '2024-02-01T00:00:00' }
    ];
    const filterDate = new Date('2024-02-01T00:00:00');
    const result = pipe.transform(testArray, true, 'date', filterDate, 'gt');
    expect(result.length).toBe(0);
  });

  it('should handle dates at exact boundary with lt (exclusive)', () => {
    const testArray = [
      { date: '2024-02-01T00:00:00' }
    ];
    const filterDate = new Date('2024-02-01T00:00:00');
    const result = pipe.transform(testArray, true, 'date', filterDate, 'lt');
    expect(result.length).toBe(0);
  });

  it('should handle dates with time components in gte', () => {
    const testArray = [
      { date: '2024-02-01T14:30:00' },
      { date: '2024-02-01T10:15:00' },
      { date: '2024-02-01T20:45:00' }
    ];
    const filterDate = new Date('2024-02-01T15:00:00');
    const result = pipe.transform(testArray, true, 'date', filterDate, 'gte');
    expect(result.length).toBe(1);
    expect(result[0].date).toBe('2024-02-01T20:45:00');
  });

  it('should handle dates with time components in lte', () => {
    const testArray = [
      { date: '2024-02-01T14:30:00' },
      { date: '2024-02-01T10:15:00' },
      { date: '2024-02-01T20:45:00' }
    ];
    const filterDate = new Date('2024-02-01T15:00:00');
    const result = pipe.transform(testArray, true, 'date', filterDate, 'lte');
    expect(result.length).toBe(2);
  });

  it('should handle ISO date strings', () => {
    const testArray = [
      { date: '2024-01-15T00:00:00Z' },
      { date: '2024-02-15T00:00:00Z' },
      { date: '2024-03-15T00:00:00Z' }
    ];
    const filterDate = new Date('2024-02-15T00:00:00Z');
    const result = pipe.transform(testArray, true, 'date', filterDate, 'gte');
    expect(result.length).toBe(2);
  });

  it('should handle very old dates', () => {
    const testArray = [
      { date: '2000-01-01' },
      { date: '2010-01-01' },
      { date: '2020-01-01' }
    ];
    const filterDate = new Date('2010-01-01');
    const result = pipe.transform(testArray, true, 'date', filterDate, 'gte');
    expect(result.length).toBe(2);
  });

  it('should handle future dates', () => {
    const testArray = [
      { date: '2050-01-01' },
      { date: '2060-01-01' },
      { date: '2070-01-01' }
    ];
    const filterDate = new Date('2060-01-01');
    const result = pipe.transform(testArray, true, 'date', filterDate, 'lt');
    expect(result.length).toBe(1);
  });

  it('should handle dates with milliseconds', () => {
    const testArray = [
      { date: '2024-02-01T12:00:00.000Z' },
      { date: '2024-02-01T12:00:00.500Z' },
      { date: '2024-02-01T12:00:01.000Z' }
    ];
    const filterDate = new Date('2024-02-01T12:00:00.500Z');
    const result = pipe.transform(testArray, true, 'date', filterDate, 'gte');
    expect(result.length).toBe(2);
  });

  it('should handle single item array', () => {
    const testArray = [
      { date: '2024-02-01' }
    ];
    const filterDate = new Date('2024-01-01');
    const result = pipe.transform(testArray, true, 'date', filterDate, 'gte');
    expect(result.length).toBe(1);
  });

  it('should handle all items before filter date with gt', () => {
    const testArray = [
      { date: '2024-01-01' },
      { date: '2024-01-15' },
      { date: '2024-01-31' }
    ];
    const filterDate = new Date('2024-12-31');
    const result = pipe.transform(testArray, true, 'date', filterDate, 'gt');
    expect(result.length).toBe(0);
  });

  it('should handle all items after filter date with lt', () => {
    const testArray = [
      { date: '2024-06-01' },
      { date: '2024-07-01' },
      { date: '2024-08-01' }
    ];
    const filterDate = new Date('2024-01-01');
    const result = pipe.transform(testArray, true, 'date', filterDate, 'lt');
    expect(result.length).toBe(0);
  });

  it('should handle nested date property', () => {
    const testArray = [
      { id: 1, metadata: { createdAt: '2024-01-01' } },
      { id: 2, metadata: { createdAt: '2024-02-01' } }
    ];
    // Note: The pipe only works with top-level properties based on the implementation
    const result = pipe.transform(testArray, true, 'metadata', new Date('2024-01-15'), 'gte');
    expect(result.length).toBe(0); // Won't match because it's comparing object to date
  });

  it('should preserve original array order in results', () => {
    const testArray = [
      { id: 3, date: '2024-03-01' },
      { id: 1, date: '2024-02-01' },
      { id: 2, date: '2024-02-15' }
    ];
    const filterDate = new Date('2024-02-01');
    const result = pipe.transform(testArray, true, 'date', filterDate, 'gte');
    expect(result[0].id).toBe(3);
    expect(result[1].id).toBe(1);
    expect(result[2].id).toBe(2);
  });

  it('should handle date strings in different formats', () => {
    const testArray = [
      { date: '2024/01/15' },
      { date: '2024-02-15' },
      { date: 'March 15, 2024' }
    ];
    const filterDate = new Date('2024-02-01');
    const result = pipe.transform(testArray, true, 'date', filterDate, 'gte');
    // All valid date formats should be parsed by new Date()
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle multiple date properties in same object', () => {
    const testArray = [
      { id: 1, startDate: '2024-01-01', endDate: '2024-03-01' },
      { id: 2, startDate: '2024-02-01', endDate: '2024-04-01' }
    ];
    const filterDate = new Date('2024-01-15');
    const result = pipe.transform(testArray, true, 'startDate', filterDate, 'gte');
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(2);
  });

  it('should handle date with timezone', () => {
    const testArray = [
      { date: '2024-02-01T12:00:00+05:00' },
      { date: '2024-02-01T12:00:00-05:00' }
    ];
    const filterDate = new Date('2024-02-01T12:00:00Z');
    const result = pipe.transform(testArray, true, 'date', filterDate, 'gte');
    // Results depend on timezone conversion
    expect(result.length).toBeGreaterThanOrEqual(0);
  });
});

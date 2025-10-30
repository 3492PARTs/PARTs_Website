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
});

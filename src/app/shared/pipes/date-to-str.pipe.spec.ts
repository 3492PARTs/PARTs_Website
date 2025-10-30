import { DateToStrPipe } from './date-to-str.pipe';

describe('DateToStrPipe', () => {
  let pipe: DateToStrPipe;

  beforeEach(() => {
    pipe = new DateToStrPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform Date object to string with time', () => {
    const date = new Date('2024-03-18T14:47:00Z');
    const result = pipe.transform(date, true, false);
    expect(result).toContain('/');
    expect(result).toContain(':');
    expect(result).toMatch(/am|pm/);
  });

  it('should transform Date object to string without time', () => {
    const date = new Date('2024-03-18T14:47:00Z');
    const result = pipe.transform(date, false, false);
    expect(result).toContain('/');
    expect(result).not.toContain(':');
  });

  it('should transform Date object with month name', () => {
    const date = new Date('2024-03-18T14:47:00Z');
    const result = pipe.transform(date, false, true);
    expect(result).toMatch(/January|February|March|April|May|June|July|August|September|October|November|December/);
  });

  it('should transform string in format "MM/DD/YYYY HH:MM AM/PM"', () => {
    const dateStr = '3/18/2024 2:47 PM';
    const result = pipe.transform(dateStr);
    expect(result).toContain('/');
    expect(result).toContain('2024');
  });

  it('should transform ISO 8601 string', () => {
    const isoStr = '2024-03-18T14:47:00Z';
    const result = pipe.transform(isoStr);
    expect(result).toContain('/');
    expect(result).toContain('2024');
  });

  it('should return original value if not a date', () => {
    const notADate = 'not a date';
    const result = pipe.transform(notADate);
    expect(result).toBe(notADate);
  });

  it('should handle null', () => {
    const result = pipe.transform(null);
    expect(result).toBeNull();
  });

  it('should format with leading zeros for single digit months and days', () => {
    const date = new Date('2024-01-05T10:30:00Z');
    const result = pipe.transform(date, true, false);
    expect(result).toMatch(/01\/05\/2024/);
  });

  it('should handle midnight correctly', () => {
    // Create a date at midnight in local time (not UTC)
    const date = new Date('2024-03-18 00:00:00');
    const result = pipe.transform(date, true, false);
    expect(result).toContain('12:00 am');
  });

  it('should handle noon correctly', () => {
    // Create a date at noon in local time (not UTC)
    const date = new Date('2024-03-18 12:00:00');
    const result = pipe.transform(date, true, false);
    expect(result).toContain('12:00 pm');
  });
});

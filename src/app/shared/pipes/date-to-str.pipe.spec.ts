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

  it('should format all 12 months by name correctly', () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    months.forEach((monthName, index) => {
      const date = new Date(2024, index, 15);
      const result = pipe.transform(date, false, true);
      expect(result).toContain(monthName);
    });
  });

  it('should handle 1 AM correctly', () => {
    const date = new Date('2024-03-18 01:00:00');
    const result = pipe.transform(date, true, false);
    expect(result).toContain('1:00 am');
  });

  it('should handle 11 PM correctly', () => {
    const date = new Date('2024-03-18 23:00:00');
    const result = pipe.transform(date, true, false);
    expect(result).toContain('11:00 pm');
  });

  it('should handle minutes with leading zero', () => {
    const date = new Date('2024-03-18 14:05:00');
    const result = pipe.transform(date, true, false);
    expect(result).toContain(':05');
  });

  it('should handle double-digit minutes', () => {
    const date = new Date('2024-03-18 14:45:00');
    const result = pipe.transform(date, true, false);
    expect(result).toContain(':45');
  });

  it('should format December 31st correctly', () => {
    const date = new Date('2024-12-31T10:30:00');
    const result = pipe.transform(date, false, false);
    expect(result).toBe('12/31/2024');
  });

  it('should format January 1st correctly', () => {
    const date = new Date('2024-01-01T10:30:00');
    const result = pipe.transform(date, false, false);
    expect(result).toBe('01/01/2024');
  });

  it('should handle month name format with single digit day', () => {
    const date = new Date('2024-03-05T10:30:00');
    const result = pipe.transform(date, false, true);
    expect(result).toContain('March 5, 2024');
  });

  it('should handle month name format with double digit day', () => {
    const date = new Date('2024-03-25T10:30:00');
    const result = pipe.transform(date, false, true);
    expect(result).toContain('March 25, 2024');
  });

  it('should handle month name format with time', () => {
    const date = new Date('2024-03-18 14:30:00');
    const result = pipe.transform(date, true, true);
    expect(result).toContain('March');
    expect(result).toContain('2:30 pm');
  });

  it('should handle leap year date', () => {
    const date = new Date('2024-02-29T10:30:00');
    const result = pipe.transform(date, false, false);
    expect(result).toBe('02/29/2024');
  });

  it('should handle year 2000', () => {
    const date = new Date('2000-01-01T10:30:00');
    const result = pipe.transform(date, false, false);
    expect(result).toBe('01/01/2000');
  });

  it('should handle year 2099', () => {
    const date = new Date('2099-12-31T10:30:00');
    const result = pipe.transform(date, false, false);
    expect(result).toBe('12/31/2099');
  });

  it('should handle undefined', () => {
    const result = pipe.transform(undefined);
    expect(result).toBeUndefined();
  });

  it('should return empty string as is', () => {
    const result = pipe.transform('');
    expect(result).toBe('');
  });

  it('should handle numeric input (timestamp)', () => {
    const timestamp = new Date('2024-03-18T14:30:00').getTime();
    const result = pipe.transform(timestamp);
    // Numeric timestamp doesn't match regex patterns, returns as is
    expect(result).toBe(timestamp);
  });

  it('should handle invalid date string', () => {
    const invalid = 'not a valid date';
    const result = pipe.transform(invalid);
    expect(result).toBe(invalid);
  });

  it('should handle date string with different format', () => {
    const dateStr = '2024-03-18';
    const result = pipe.transform(dateStr);
    // This format doesn't match the regex patterns, returns as is
    expect(result).toBe(dateStr);
  });

  it('should handle ISO string without milliseconds', () => {
    const isoStr = '2024-03-18T14:30:00Z';
    const result = pipe.transform(isoStr);
    expect(result).toContain('/');
    expect(result).toContain('2024');
  });

  it('should handle ISO string with milliseconds', () => {
    const isoStr = '2024-03-18T14:30:00.123Z';
    const result = pipe.transform(isoStr);
    expect(result).toContain('/');
    expect(result).toContain('2024');
  });

  it('should handle date with seconds', () => {
    const date = new Date('2024-03-18 14:30:45');
    const result = pipe.transform(date, true, false);
    // Pipe doesn't display seconds, only hours and minutes
    expect(result).toContain('2:30 pm');
  });

  it('should default time parameter to true', () => {
    const date = new Date('2024-03-18 14:30:00');
    const result = pipe.transform(date);
    expect(result).toContain(':');
    expect(result).toMatch(/am|pm/);
  });

  it('should default month parameter to false', () => {
    const date = new Date('2024-03-18 14:30:00');
    const result = pipe.transform(date, true);
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}/);
  });

  it('should handle all hours of the day (0-23)', () => {
    for (let hour = 0; hour < 24; hour++) {
      const date = new Date(`2024-03-18 ${hour.toString().padStart(2, '0')}:30:00`);
      const result = pipe.transform(date, true, false);
      expect(result).toMatch(/\d{1,2}:\d{2} (am|pm)/);
    }
  });

  it('should handle all days of a month', () => {
    for (let day = 1; day <= 31; day++) {
      const date = new Date(2024, 0, day); // January has 31 days
      const result = pipe.transform(date, false, false);
      expect(result).toContain('2024');
    }
  });

  it('should preserve the date when formatting without time', () => {
    const originalDate = new Date('2024-03-18T14:30:00');
    const result = pipe.transform(originalDate, false, false);
    const [month, day, year] = result.split('/');
    expect(parseInt(month)).toBe(originalDate.getMonth() + 1);
    expect(parseInt(day)).toBe(originalDate.getDate());
    expect(parseInt(year)).toBe(originalDate.getFullYear());
  });
});

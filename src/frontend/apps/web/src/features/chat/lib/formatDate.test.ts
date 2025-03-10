import { describe, it, expect } from 'vitest';
import { formatDate } from './formatDate.util';

describe('formatDate', () => {
  it('should format a valid Date object correctly', () => {
    const date = new Date('2023-10-15T14:30:00Z');
    const result = formatDate(date);
    expect(result).toEqual({
      year: '2023',
      month: '10',
      day: '15',
      hour: '23',
      minute: '30',
    });
  });

  it('should format a valid ISO string correctly', () => {
    const result = formatDate('2023-10-15T14:30:00Z');
    expect(result).toEqual({
      year: '2023',
      month: '10',
      day: '15',
      hour: '23',
      minute: '30',
    });
  });

  it('should handle different time zones and dates correctly', () => {
    const result = formatDate('2023-01-01T09:05:00Z');
    expect(result).toEqual({
      year: '2023',
      month: '01',
      day: '01',
      hour: '18',
      minute: '05',
    });
  });

  it('should handle midnight correctly', () => {
    const result = formatDate('2023-10-15T00:00:00Z');
    expect(result).toEqual({
      year: '2023',
      month: '10',
      day: '15',
      hour: '09',
      minute: '00',
    });
  });

  it('should handle noon correctly', () => {
    const result = formatDate('2023-10-15T12:00:00Z');
    expect(result).toEqual({
      year: '2023',
      month: '10',
      day: '15',
      hour: '21',
      minute: '00',
    });
  });

  it('should handle invalid string input by returning invalid date components', () => {
    const result = formatDate('invalid-date-string');
    expect(result.year).toBeNaN();
    expect(result.month).toBeNaN();
    expect(result.day).toBeNaN();
    expect(result.hour).toBeNaN();
    expect(result.minute).toBeNaN();
  });

  it('should handle invalid Date object', () => {
    const invalidDate = new Date('invalid');
    const result = formatDate(invalidDate);
    expect(result.year).toBeNaN();
    expect(result.month).toBeNaN();
    expect(result.day).toBeNaN();
    expect(result.hour).toBeNaN();
    expect(result.minute).toBeNaN();
  });
});

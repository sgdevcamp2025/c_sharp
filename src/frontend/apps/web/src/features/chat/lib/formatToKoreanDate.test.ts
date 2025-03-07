import { describe, it, expect } from 'vitest';
import { formatToKoreanDate } from './formatToKoreanDate.util';

describe('formatToKoreanDate', () => {
  it('should format a valid Date object to Korean format', () => {
    const date = new Date('2023-10-15T14:30:00Z');
    const result = formatToKoreanDate(date);
    expect(result).toBe('2023년 10월 15일 23시 30분');
  });

  it('should format a valid ISO string to Korean format', () => {
    const result = formatToKoreanDate('2023-10-15T14:30:00Z');
    expect(result).toBe('2023년 10월 15일 23시 30분');
  });

  it('should handle different dates correctly', () => {
    const result = formatToKoreanDate('2023-01-01T09:05:00Z');
    expect(result).toBe('2023년 01월 01일 18시 05분');
  });

  it('should handle midnight correctly', () => {
    const result = formatToKoreanDate('2023-10-15T00:00:00Z');
    expect(result).toBe('2023년 10월 15일 09시 00분');
  });

  it('should handle noon correctly', () => {
    const result = formatToKoreanDate('2023-10-15T12:00:00Z');
    expect(result).toBe('2023년 10월 15일 21시 00분');
  });

  it('should handle invalid string input gracefully', () => {
    const result = formatToKoreanDate('invalid-date-string');
    expect(result).toBe('NaN년 NaN월 NaN일 NaN시 NaN분');
  });

  it('should handle invalid Date object gracefully', () => {
    const invalidDate = new Date('invalid');
    const result = formatToKoreanDate(invalidDate);
    expect(result).toBe('NaN년 NaN월 NaN일 NaN시 NaN분');
  });
});

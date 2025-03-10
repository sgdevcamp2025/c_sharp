import { describe, it, expect } from 'vitest';
import { formatChatTime } from './formatChatTime.util';

describe('formatChatTime', () => {
  it('should format time as HH:MM when hideUserInfo is true', () => {
    const input = '2023년 10월 15일 14시 30분';
    const result = formatChatTime(input, true);
    expect(result).toBe('14:30');
  });

  it('should add leading zero to minutes when hideUserInfo is true', () => {
    const input = '2023년 10월 15일 9시 5분';
    const result = formatChatTime(input, true);
    expect(result).toBe('9:05');
  });

  it('should format time as 오후 HH:MM for PM hours when hideUserInfo is false', () => {
    const input = '2023년 10월 15일 14시 30분';
    const result = formatChatTime(input, false);
    expect(result).toBe('오후 2:30');
  });

  it('should format time as 오전 HH:MM for AM hours when hideUserInfo is false', () => {
    const input = '2023년 10월 15일 9시 30분';
    const result = formatChatTime(input, false);
    expect(result).toBe('오전 9:30');
  });

  it('should handle midnight (0시) as 오전 12:MM when hideUserInfo is false', () => {
    const input = '2023년 10월 15일 0시 5분';
    const result = formatChatTime(input, false);
    expect(result).toBe('오전 12:05');
  });

  it('should handle noon (12시) as 오후 12:MM when hideUserInfo is false', () => {
    const input = '2023년 10월 15일 12시 45분';
    const result = formatChatTime(input, false);
    expect(result).toBe('오후 12:45');
  });

  it('should add leading zero to minutes when hideUserInfo is false', () => {
    const input = '2023년 10월 15일 13시 7분';
    const result = formatChatTime(input, false);
    expect(result).toBe('오후 1:07');
  });

  // 잘못된 입력 처리
  it('should return original string if format does not match', () => {
    const input = '잘못된 형식';
    const result = formatChatTime(input, true);
    expect(result).toBe('잘못된 형식');
  });

  it('should return original string if regex does not match when hideUserInfo is false', () => {
    const input = '2023-10-15 14:30';
    const result = formatChatTime(input, false);
    expect(result).toBe('2023-10-15 14:30');
  });
});

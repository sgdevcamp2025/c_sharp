import { formatFileSize } from './formatFileSize.util';

describe('formatFileSize function tests', () => {
  test('should format 0 bytes correctly', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  test('should format numbers in Bytes range correctly', () => {
    expect(formatFileSize(100)).toBe('100 Bytes');
    expect(formatFileSize(1023)).toBe('1023 Bytes');
  });

  test('should format numbers in KB range correctly', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(10240)).toBe('10 KB');
  });

  test('should format numbers in MB range correctly', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(2097152)).toBe('2 MB');
    expect(formatFileSize(1572864)).toBe('1.5 MB');
  });

  test('should format numbers in GB range correctly', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB');
    expect(formatFileSize(1610612736)).toBe('1.5 GB');
  });

  test('should correctly display up to 2 decimal places', () => {
    expect(formatFileSize(1126)).toBe('1.1 KB');
    expect(formatFileSize(1127)).toBe('1.1 KB');
    expect(formatFileSize(1177)).toBe('1.15 KB');
    expect(formatFileSize(1178)).toBe('1.15 KB');
  });

  test('should handle negative input', () => {
    expect(formatFileSize(-1024)).toBe('NaN undefined');
  });
});

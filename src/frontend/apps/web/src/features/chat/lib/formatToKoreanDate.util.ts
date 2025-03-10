import { formatDate } from './formatDate.util';

export const formatToKoreanDate = (date: Date | string): string => {
  const { year, month, day, hour, minute } = formatDate(date);
  return `${year}년 ${month}월 ${day}일 ${hour}시 ${minute}분`;
};

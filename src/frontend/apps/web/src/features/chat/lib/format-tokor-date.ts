export const formatToKoreanDate = (date: Date | string): string => {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };

  const formattedDate = new Intl.DateTimeFormat('ko-KR', options)
    .format(parsedDate)
    .replace(/\./g, '');

  const [year, month, day, time] = formattedDate.split(' ');
  const [hour, minute] = time.split(':');

  return `${year}년 ${month}월 ${day}일 ${hour}시 ${minute}분`;
};

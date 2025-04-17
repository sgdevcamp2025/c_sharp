export const formatDate = (date: Date | string) => {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(parsedDate.getTime())) {
    return {
      year: NaN,
      month: NaN,
      day: NaN,
      hour: NaN,
      minute: NaN,
    };
  }

  const formattedDate = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(parsedDate)
    .replace(/\./g, '');

  const [year, month, day, time] = formattedDate.split(' ');
  const [hour, minute] = time.split(':');

  return { year, month, day, hour, minute };
};

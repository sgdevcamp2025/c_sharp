export const formatChatTime = (
  dateStr: string,
  hideUserInfo: boolean,
): string => {
  const match = dateStr.match(
    /(\d+)년\s*(\d+)월\s*(\d+)일\s*(\d+)시\s*(\d+)분/,
  );
  if (!match) return dateStr;
  const [, , , , hourStr, minuteStr] = match;
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (hideUserInfo) {
    return `${hour}:${minute < 10 ? '0' + minute : minute}`;
  } else {
    let period = '';
    let hour12 = hour;
    if (hour >= 12) {
      period = '오후 ';
      hour12 = hour > 12 ? hour - 12 : hour;
    } else {
      if (hour === 0) {
        period = '오전 ';
        hour12 = 12;
      }
    }
    return `${period}${hour12}:${minute < 10 ? '0' + minute : minute}분`;
  }
};

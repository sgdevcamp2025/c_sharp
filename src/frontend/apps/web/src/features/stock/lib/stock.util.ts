import { Time, UTCTimestamp } from 'lightweight-charts';
import { StockChart, StockChartAPIResponse } from '../model';

/**
 * 주어진 날짜(`businessDate`)와 시간(`tradingTime`)을 UTC 타임스탬프로 변환합니다.
 *
 * @param {string} businessDate - `YYYYMMDD`
 * @param {string} tradingTime - `HHMM` of `HHMMSS`
 * @returns {UTCTimestamp | null}
 *
 * @remarks
 * - `businessDate`는 정확히 8자리 (`YYYYMMDD`)여야 합니다.
 * - `tradingTime`은 최소 4자리 (`HHMM`)여야 합니다.
 * - 유효하지 않은 값이 입력되면 `null`을 반환합니다.
 */

export const formatTimeForChart = (
  businessDate: string,
  tradingTime: string,
): Time | null => {
  if (
    !businessDate ||
    businessDate.length !== 8 ||
    !tradingTime ||
    tradingTime.length < 4
  ) {
    return null;
  }

  const year = Number(businessDate.slice(0, 4));
  const month = Number(businessDate.slice(4, 6));
  const day = Number(businessDate.slice(6, 8));
  const hour = Number(tradingTime.slice(0, 2));
  const minute = Number(tradingTime.slice(2, 4));

  const dateObj = new Date(Date.UTC(year, month - 1, day, hour, minute));

  return Math.floor(dateObj.getTime() / 1000) as UTCTimestamp;
};

/**
 * 주식 차트 API 응답 데이터를 변환하여 차트에서 사용할 수 있는 형식으로 반환합니다.
 * @param {StockChartAPIResponse[]} response
 * @returns {StockChart[]} - 변환된 주식 차트 데이터 배열 (유효하지 않은 항목은 제거됨)
 * @remarks
 * - 변환된 데이터 중 유효하지 않은 항목(`null`)은 자동으로 제거됩니다.
 */
export const formatStockChartInfo = (
  response: StockChartAPIResponse[],
): StockChart[] => {
  const formattedResponse = response.map((item: StockChartAPIResponse) => {
    const formattedTime = formatTimeForChart(
      item.businessDate,
      item.tradingTime,
    );

    if (!formattedTime) return null;

    return {
      time: formattedTime,
      open: parseFloat(item.openPrice),
      high: parseFloat(item.highPrice),
      low: parseFloat(item.lowPrice),
      close: parseFloat(item.currentPrice),
      tradingVolume: parseFloat(item.tradingVolume),
    };
  });
  return formattedResponse.filter((res) => res !== null);
};

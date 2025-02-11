import { Time, UTCTimestamp } from 'lightweight-charts';
import { CandleChart, DefaultChart, StockChartAPIResponse } from '../model';

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

const formatTimeForChart = (
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
 * 주식 차트 데이터를 특정 형식으로 변환하는 유틸 함수.
 * 
 * @template T 변환된 데이터의 타입
 * @param {StockChartAPIResponse[]} response - API에서 받은 원본 주식 데이터 배열
 * @param {(item: StockChartAPIResponse, time: Time) => T} formatFn - 각 항목을 변환하는 함수
 * @returns {T[]} 변환된 데이터 배열 (유효한 데이터만 포함)
 *
 * @description
 * - `response` 배열을 순회하면서 `formatTimeForChart`를 사용해 `time`을 변환
 * - 변환된 `time`이 `null`이면 해당 데이터를 제외
 * - `formatFn`을 적용하여 원하는 형식으로 변환한 후 `null` 값을 필터링하여 반환

 */
const formatChartData = <T>(
  response: StockChartAPIResponse[],
  formatFn: (item: StockChartAPIResponse, time: Time) => T,
): T[] => {
  return response
    .map((item) => {
      const formattedTime = formatTimeForChart(
        item.businessDate,
        item.tradingTime,
      );
      if (!formattedTime) return null;
      return formatFn(item, formattedTime);
    })
    .filter((item): item is T => item !== null);
};

export const formatCandleChart = (
  response: StockChartAPIResponse[],
): CandleChart[] =>
  formatChartData<CandleChart>(response, (item, time) => ({
    time,
    open: parseFloat(item.openPrice),
    high: parseFloat(item.highPrice),
    low: parseFloat(item.lowPrice),
    close: parseFloat(item.currentPrice),
  }));

export const formatLineChart = (
  response: StockChartAPIResponse[],
): DefaultChart[] =>
  formatChartData<DefaultChart>(response, (item, time) => ({
    time,
    value: parseFloat(item.currentPrice),
  }));

export const formatHistogramChart = (
  response: StockChartAPIResponse[],
): DefaultChart[] =>
  formatChartData<DefaultChart>(response, (item, time) => ({
    time,
    value: parseFloat(item.tradingVolume),
  }));

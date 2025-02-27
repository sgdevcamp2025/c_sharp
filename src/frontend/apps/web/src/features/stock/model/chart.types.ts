import { Time } from 'lightweight-charts';

export enum ChartType {
  Candlestick = 'candlestick',
  Line = 'line',
  Histogram = 'histogram',
}

export type CandleChart = {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type DefaultChart = {
  time: Time;
  value: number;
};

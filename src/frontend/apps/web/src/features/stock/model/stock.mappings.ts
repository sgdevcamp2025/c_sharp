import { STOCKS } from './stock.constants';

export const STOCK_SLUG_TO_CODE: Record<string, string> = Object.fromEntries(
  STOCKS.map(({ slug, code }) => [slug, code]),
);

export const STOCK_SLUG_TO_NAME: Record<string, string> = Object.fromEntries(
  STOCKS.map(({ slug, name }) => [slug, name]),
);

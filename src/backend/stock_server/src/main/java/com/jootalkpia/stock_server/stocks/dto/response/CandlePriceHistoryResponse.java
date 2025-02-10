package com.jootalkpia.stock_server.stocks.dto.response;

import com.jootalkpia.stock_server.stocks.domain.StockCode;
import com.jootalkpia.stock_server.stocks.dto.MinutePrice;

import java.util.List;

public record CandlePriceHistoryResponse(
        String code,
        String stockName,
        List<Output> output,
        boolean hasNext,
        String lastObjectId
) {

    public static CandlePriceHistoryResponse of(List<MinutePrice> minutePriceChart, String code, boolean hasNext, String lastObjectId) {
        return new CandlePriceHistoryResponse(
                code,
                StockCode.getNameByCode(code),
                minutePriceChart.stream()
                        .map(Output::of)
                        .toList(),
                hasNext,
                lastObjectId
        );
    }

    public record Output(
            String businessDate,
            String tradingTime,
            String currentPrice,
            String openPrice,
            String highPrice,
            String lowPrice,
            String tradingVolume,
            String totalTradeAmount
    ) {

        public static Output of(MinutePrice minutePrice) {
            return new Output(
                    minutePrice.getBusinessDate(),
                    minutePrice.getTradingTime(),
                    minutePrice.getCurrentPrice(),
                    minutePrice.getOpenPrice(),
                    minutePrice.getHighPrice(),
                    minutePrice.getLowPrice(),
                    minutePrice.getTradingVolume(),
                    minutePrice.getTotalTradeAmount()
            );
        }
    }
}

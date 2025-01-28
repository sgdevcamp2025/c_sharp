package com.jootalkpia.stock_server.stocks.dto.response;

import com.jootalkpia.stock_server.stocks.domain.StockCode;
import com.jootalkpia.stock_server.stocks.dto.MinutePrice;
import org.springframework.data.domain.Page;

import java.util.List;

public record CandlePriceHistoryResponse(
        String code,
        String stockName,
        List<Output> output,
        long totalCount
) {

    public static CandlePriceHistoryResponse of(Page<MinutePrice> minutePricePage, String code) {
        return new CandlePriceHistoryResponse(
                code,
                StockCode.getNameByCode(code),
                minutePricePage.getContent().stream()
                        .map(Output::of)
                        .toList(),
                minutePricePage.getTotalElements()
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

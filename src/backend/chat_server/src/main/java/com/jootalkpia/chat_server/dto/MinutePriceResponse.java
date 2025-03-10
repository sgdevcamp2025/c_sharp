package com.jootalkpia.chat_server.dto;

public record MinutePriceResponse(
        String code,
        String stockName,
        String businessDate,
        String tradingTime,
        String currentPrice,
        String openingPrice,
        String highPrice,
        String lowPrice,
        String tradingVolume,
        String totalTradeAmount
) {
}
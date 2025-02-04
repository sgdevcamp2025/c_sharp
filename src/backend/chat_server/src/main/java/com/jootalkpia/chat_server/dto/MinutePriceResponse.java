package com.jootalkpia.chat_server.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record MinutePriceResponse(
        @JsonProperty("code")
        String code,
        @JsonProperty("htsKorIsnm")
        String stockName,
        @JsonProperty("stckBsopDate")
        String businessDate,
        @JsonProperty("stckCntgHour")
        String tradingTime,
        @JsonProperty("stckPrpr")
        String currentPrice,
        @JsonProperty("stckOprc")
        String openPrice,
        @JsonProperty("stckHgpr")
        String highPrice,
        @JsonProperty("stckLwpr")
        String lowPrice,
        @JsonProperty("cntgVol")
        String tradingVolume,
        @JsonProperty("acmlTrPbmn")
        String totalTradeAmount
) {
}
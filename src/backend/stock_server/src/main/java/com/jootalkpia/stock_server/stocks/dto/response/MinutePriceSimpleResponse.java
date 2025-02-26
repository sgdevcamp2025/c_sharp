package com.jootalkpia.stock_server.stocks.dto.response;

import com.jootalkpia.stock_server.stocks.dto.MinutePrice;

import static com.jootalkpia.stock_server.stocks.advice.util.StockValidationUtils.validateMinutePriceOutput;

public record MinutePriceSimpleResponse(
        String code, //주식 코드
        String stockName, // 이름
        String businessDate, // 영업 일자
        String tradingTime, // 체결 시간
        String currentPrice, //현재가
        String openingPrice, // 시가2
        String highPrice, //최고가
        String lowPrice, //최저가
        String tradingVolume, //체결 거래량
        String totalTradeAmount // 누적 거래 대금
) {

    public static MinutePriceSimpleResponse from(MinutePriceDetailedResponse minutePriceDto, String code) {
        validateMinutePriceOutput(minutePriceDto);

        return new MinutePriceSimpleResponse(
                code,
                minutePriceDto.output1().htsKorIsnm(),
                minutePriceDto.output2().get(1).stckBsopDate(),
                minutePriceDto.output2().get(1).stckCntgHour(),
                minutePriceDto.output2().get(1).stckPrpr(),
                minutePriceDto.output2().get(1).stckOprc(),
                minutePriceDto.output2().get(1).stckHgpr(),
                minutePriceDto.output2().get(1).stckLwpr(),
                minutePriceDto.output2().get(1).cntgVol(),
                minutePriceDto.output2().get(1).acmlTrPbmn()
        );
    }

    public MinutePrice toDocument() {
        return MinutePrice.of(
                code,
                stockName,
                businessDate,
                tradingTime,
                currentPrice,
                openingPrice,
                highPrice,
                lowPrice,
                tradingVolume,
                totalTradeAmount
        );
    }
}

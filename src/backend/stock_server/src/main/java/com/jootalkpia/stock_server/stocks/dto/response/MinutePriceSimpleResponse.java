package com.jootalkpia.stock_server.stocks.dto.response;

public record MinutePriceSimpleResponse(
        String code,
        String htsKorIsnm,
        String stckBsopDate,
        String stckCntgHour,
        String stckPrpr,
        String stckOprc,
        String stckHgpr,
        String stckLwpr,
        String cntgVol,
        String acmlTrPbmn
) {

    public static MinutePriceSimpleResponse from(MinutePriceResponse minutePriceDto, String code) {
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
}

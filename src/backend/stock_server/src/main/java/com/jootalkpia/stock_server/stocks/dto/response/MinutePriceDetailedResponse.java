package com.jootalkpia.stock_server.stocks.dto.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.util.List;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record MinutePriceDetailedResponse(
        Output1 output1,
        List<Output2> output2,
        String rtCd,
        String msgCd,
        String msg1
) {
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public record Output1(
            String prdyVrss,
            String prdyVrssSign,
            String prdyCtrt,
            String stckPrdyClpr,
            String acmlVol,
            String acmlTrPbmn,
            String htsKorIsnm,
            String stckPrpr
    ) {}

    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public record Output2(
            String stckBsopDate,
            String stckCntgHour,
            String stckPrpr,
            String stckOprc,
            String stckHgpr,
            String stckLwpr,
            String cntgVol,
            String acmlTrPbmn
    ) {}
}

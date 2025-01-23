package com.jootalkpia.stock_server.stocks.dto.response;

import java.util.ArrayList;

public record MinutePriceResponse(
        Output1 output1,
        ArrayList<Output2> output2,
        String rtCd,
        String msgCd,
        String msg1
) {
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

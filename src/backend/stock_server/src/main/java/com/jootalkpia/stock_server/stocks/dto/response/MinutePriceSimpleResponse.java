package com.jootalkpia.stock_server.stocks.dto.response;

public record MinutePriceSimpleResponse(
        String code,
        String hts_kor_isnm,
        String stck_bsop_date,
        String stck_cntg_hour,
        String stck_prpr,
        String stck_oprc,
        String stck_hgpr,
        String stck_lwpr,
        String cntg_vol,
        String acml_tr_pbmn
) {

    public static MinutePriceSimpleResponse from(MinutePriceResponse minutePriceDto, String code) {
        return new MinutePriceSimpleResponse(
                code,
                minutePriceDto.output1().hts_kor_isnm(),
                minutePriceDto.output2().get(1).stck_bsop_date(),
                minutePriceDto.output2().get(1).stck_cntg_hour(),
                minutePriceDto.output2().get(1).stck_prpr(),
                minutePriceDto.output2().get(1).stck_oprc(),
                minutePriceDto.output2().get(1).stck_hgpr(),
                minutePriceDto.output2().get(1).stck_lwpr(),
                minutePriceDto.output2().get(1).cntg_vol(),
                minutePriceDto.output2().get(1).acml_tr_pbmn()
        );
    }
}

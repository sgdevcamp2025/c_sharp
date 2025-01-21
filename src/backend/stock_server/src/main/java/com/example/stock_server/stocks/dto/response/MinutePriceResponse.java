package com.example.stock_server.stocks.dto.response;

public record MinutePriceResponse(
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
}

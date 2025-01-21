package com.example.stock_server.stocks;

import java.util.ArrayList;

public record MinutePriceResponse(
        Output1 output1,
        ArrayList<Output2> output2,
        String rt_cd,
        String msg_cd,
        String msg1
) {
    public record Output1(
            String prdy_vrss,
            String prdy_vrss_sign,
            String prdy_ctrt,
            String stck_prdy_clpr,
            String acml_vol,
            String acml_tr_pbmn,
            String hts_kor_isnm,
            String stck_prpr
    ) {}

    public record Output2(
            String stck_bsop_date,
            String stck_cntg_hour,
            String stck_prpr,
            String stck_oprc,
            String stck_hgpr,
            String stck_lwpr,
            String cntg_vol,
            String acml_tr_pbmn
    ) {}
}
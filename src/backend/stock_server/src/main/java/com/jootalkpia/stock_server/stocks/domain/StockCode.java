package com.jootalkpia.stock_server.stocks.domain;

public enum StockCode {
    SAMSUNG_ELECTRONICS("005930"),
    KAKAO("035720"),
    SK_HYNIX("000660"),
    NAVER("035420"),
    HANWHA_AEROSPACE("012450");

    private final String code;

    StockCode(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}

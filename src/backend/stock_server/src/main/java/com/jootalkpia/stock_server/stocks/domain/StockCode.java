package com.jootalkpia.stock_server.stocks.domain;

import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

public enum StockCode {
    SAMSUNG_ELECTRONICS("005930", "삼성전자"),
    KAKAO("035720", "카카오"),
    SK_HYNIX("000660", "SK하이닉스"),
    NAVER("035420", "네이버"),
    HANWHA_AEROSPACE("012450", "한화에어로스페이스");

    private final String code;
    private final String name;

    private static final Map<String, String> CODE_TO_NAME_MAP = Arrays.stream(values())
            .collect(Collectors.toMap(
                    StockCode::getCode,
                    StockCode::getName
            ));

    StockCode(String code, String name) {
        this.code = code;
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public static String getNameByCode(String code) {
        return CODE_TO_NAME_MAP.get(code);
    }
}

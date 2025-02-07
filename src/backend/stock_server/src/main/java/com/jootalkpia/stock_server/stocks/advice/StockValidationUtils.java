package com.jootalkpia.stock_server.stocks.advice;

import com.jootalkpia.stock_server.stocks.dto.MinutePrice;

import java.util.List;
import java.util.NoSuchElementException;

public class StockValidationUtils {
    private StockValidationUtils() {
        // private 생성자로 인스턴스화 방지
    }

    public static void validateChartSize(List<MinutePrice> slicedMinutePriceChart) {
        if (slicedMinutePriceChart.isEmpty()) {
            throw new NoSuchElementException("조회된 분봉 데이터가 없습니다.");
        }
    }

    public static void validateObjectId(String cursorId) {
        if (!isValidObjectId(cursorId)) {
            throw new IllegalArgumentException("ObjectId는 24자리의 16진수 문자열이어야 합니다: " + cursorId);
        }
    }

    private static boolean isValidObjectId(String cursorId) {
        if (cursorId.length() != 24) {
            return false;
        }

        return cursorId.matches("[0-9a-fA-F]{24}");
    }
}

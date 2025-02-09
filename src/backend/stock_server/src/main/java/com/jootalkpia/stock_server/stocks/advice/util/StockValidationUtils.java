package com.jootalkpia.stock_server.stocks.advice.util;

import com.jootalkpia.stock_server.stocks.advice.exception.InvalidObjectIdFormatException;
import com.jootalkpia.stock_server.stocks.advice.exception.NoSuchMinutePriceException;
import com.jootalkpia.stock_server.stocks.dto.MinutePrice;

import java.util.List;
import java.util.NoSuchElementException;

public class StockValidationUtils {
    private StockValidationUtils() {
        // private 생성자로 인스턴스화 방지
    }

    public static void validateChartSize(List<MinutePrice> slicedMinutePriceChart) {
        if (slicedMinutePriceChart.isEmpty()) {
            throw new NoSuchMinutePriceException();
        }
    }

    public static void validateObjectId(String cursorId) {
        if (!isValidObjectId(cursorId)) {
            throw new InvalidObjectIdFormatException(cursorId);
        }
    }

    private static boolean isValidObjectId(String cursorId) {
        if (cursorId.length() != 24) {
            return false;
        }

        return cursorId.matches("[0-9a-fA-F]{24}");
    }
}

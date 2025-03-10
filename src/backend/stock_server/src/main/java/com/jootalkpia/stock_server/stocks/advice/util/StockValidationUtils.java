package com.jootalkpia.stock_server.stocks.advice.util;

import com.jootalkpia.stock_server.stocks.advice.exception.InvalidMinutePriceFromApiException;
import com.jootalkpia.stock_server.stocks.advice.exception.InvalidObjectIdFormatException;
import com.jootalkpia.stock_server.stocks.advice.exception.NoSuchMinutePriceException;
import com.jootalkpia.stock_server.stocks.dto.MinutePrice;
import com.jootalkpia.stock_server.stocks.dto.response.MinutePriceDetailedResponse;

import java.util.List;

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

    public static void validateMinutePriceOutput(MinutePriceDetailedResponse minutePriceDetailedResponse) {
        if (minutePriceDetailedResponse.output2().size() < 2) {
            throw new InvalidMinutePriceFromApiException();
        }
    }
}

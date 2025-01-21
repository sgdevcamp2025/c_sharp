package com.jootalkpia.stock_server.stocks.service;

import com.jootalkpia.stock_server.stocks.advice.StockCaller;
import com.jootalkpia.stock_server.stocks.dto.response.MinutePriceResponse;
import com.jootalkpia.stock_server.support.property.BaseProperties;
import com.jootalkpia.stock_server.support.property.MinutePriceProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class StockService {
    private final StockCaller stockCaller;
    private final BaseProperties baseProperties;
    private final MinutePriceProperties minutePriceProperties;

    public MinutePriceResponse getMinutePriceDto(String token, String code, String time) {
        return stockCaller.getMinutePrice(
                token,
                baseProperties.appKey(),
                baseProperties.appSecret(),
                minutePriceProperties.trId(),
                minutePriceProperties.custtype(),
                minutePriceProperties.etcClsCode(),
                minutePriceProperties.marketDivCode(),
                code,
                time,
                minutePriceProperties.pwDataIncuYn()
        );
    }
}

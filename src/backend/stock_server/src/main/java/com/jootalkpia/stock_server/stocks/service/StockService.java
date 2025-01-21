package com.jootalkpia.stock_server.stocks.service;

import com.jootalkpia.stock_server.stocks.advice.StockCaller;
import com.jootalkpia.stock_server.stocks.dto.request.TokenRequestBody;
import com.jootalkpia.stock_server.stocks.dto.response.MinutePriceResponse;
import com.jootalkpia.stock_server.support.property.BaseProperties;
import com.jootalkpia.stock_server.support.property.MinutePriceProperties;
import com.jootalkpia.stock_server.support.property.TokenProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class StockService {
    private static final String BEARER = "Bearer ";

    private String token;

    private final StockCaller stockCaller;
    private final BaseProperties baseProperties;
    private final MinutePriceProperties minutePriceProperties;
    private final TokenProperties tokenProperties;

    @Scheduled(cron = "0 0 0 * **")
    public void refreshToken() {
        token = BEARER + stockCaller.getToken(TokenRequestBody.from(baseProperties, tokenProperties)).accessToken();
    }

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

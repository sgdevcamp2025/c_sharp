package com.jootalkpia.stock_server.stocks.service;

import com.jootalkpia.stock_server.stocks.advice.StockCaller;
import com.jootalkpia.stock_server.stocks.dto.request.TokenRequestBody;
import com.jootalkpia.stock_server.stocks.dto.response.MinutePriceResponse;
import com.jootalkpia.stock_server.stocks.dto.response.MinutePriceSimpleResponse;
import com.jootalkpia.stock_server.stocks.dto.response.TokenResponse;
import com.jootalkpia.stock_server.support.property.BaseProperties;
import com.jootalkpia.stock_server.support.property.MinutePriceProperties;
import com.jootalkpia.stock_server.support.property.TokenProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@RequiredArgsConstructor
@Service
public class StockService {
    private static final String TOKEN_SEPARATOR = " ";

    private String token;

    //테스트용, 토큰 1일 발급 횟수 제한
    private String fakeToken = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0b2tlbiIsImF1ZCI6ImE5YzBlOTQ2LTdkYjMtNDBiNS1iYzRmLTViNGI2NzM3MzBlMyIsInByZHRfY2QiOiIiLCJpc3MiOiJ1bm9ndyIsImV4cCI6MTczNzYwNTY4MiwiaWF0IjoxNzM3NTE5MjgyLCJqdGkiOiJQU3B2NHhVejRpNkZzZzRhWENyTlY3VDJhN3JiZWdldmJKTDgifQ.8rnxngtudIEBBZLKiIM4Iq83fHnoxSnjpdxQRDOgvQ_1mPaNbRdo7PReDcJHiQsE34ltOU-g9Rvea9eElWwTcQ";

    private final StockCaller stockCaller;
    private final BaseProperties baseProperties;
    private final MinutePriceProperties minutePriceProperties;
    private final TokenProperties tokenProperties;

    @Scheduled(cron = "0 0 0 * **")
    private void refreshToken() {
        TokenResponse tokenResponse = stockCaller.getToken(TokenRequestBody.from(baseProperties, tokenProperties));
        token = tokenResponse.tokenType() + TOKEN_SEPARATOR + tokenResponse.accessToken();
    }

    private MinutePriceSimpleResponse getStockPrice(String code, String time) {
        MinutePriceResponse response = stockCaller.getMinutePrice(
                fakeToken,
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

        return MinutePriceSimpleResponse.from(response, code);
    }
}

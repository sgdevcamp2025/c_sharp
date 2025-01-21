package com.jootalkpia.stock_server.stocks.controller;

import com.jootalkpia.stock_server.stocks.dto.response.MinutePriceSimpleResponse;
import com.jootalkpia.stock_server.stocks.service.StockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RequiredArgsConstructor
@RestController
public class StockController {
    private final StockService stockService;

    @GetMapping("")
    public ResponseEntity<MinutePriceSimpleResponse> handleMinutePrice() {
        //자동화 과정 필수
        String token = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0b2tlbiIsImF1ZCI6IjQ5ZWUzMDhmLTMzMDUtNDM3Yi04OTQ3LWE4ZTRmZWNhNDk5ZCIsInByZHRfY2QiOiIiLCJpc3MiOiJ1bm9ndyIsImV4cCI6MTczNzQ1OTg5MSwiaWF0IjoxNzM3MzczNDkxLCJqdGkiOiJQU21sVzVod1pFVjFJNm1uMkoxMFZxbWVZSm1yTHdHTUF2bloifQ.qTzs1CcSIthQ6SgXgjzUxgL9v_S40pFDfPzF15iWNZ2BEPpehaRkBARv1UiUYukmNXFMtaMa23f-owSwuqUaOg";
        String code = "005930";
        String time = "100000";

        return ResponseEntity.ok(MinutePriceSimpleResponse.from(stockService.getMinutePriceDto(token, code, time), code));
    }
}

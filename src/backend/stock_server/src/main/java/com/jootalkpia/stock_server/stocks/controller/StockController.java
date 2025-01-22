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
    public ResponseEntity<String> handleMinutePrice() {
        return ResponseEntity.ok("hi");
    }
}

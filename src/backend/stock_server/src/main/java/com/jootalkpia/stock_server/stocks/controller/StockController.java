package com.jootalkpia.stock_server.stocks.controller;

import com.jootalkpia.stock_server.stocks.dto.response.CandlePriceHistoryResponse;
import com.jootalkpia.stock_server.stocks.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
public class StockController {
    private final StockService stockService;

    @GetMapping("/api/v1/stock/candlesticks/{stock_code}")
    public ResponseEntity<CandlePriceHistoryResponse> handleCandlePriceHistory(@PathVariable(name = "stock_code") String code,@RequestParam(required = false) String cursorId, @RequestParam(defaultValue = "120") int size) {
        return ResponseEntity.ok(stockService.getCandlePriceHistoryByCode(code, cursorId, size));
    }
}

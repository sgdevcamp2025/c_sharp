package com.jootalkpia.stock_server.stocks.controller;

import com.jootalkpia.stock_server.stocks.dto.response.CandlePriceHistoryResponse;
import com.jootalkpia.stock_server.stocks.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
public class StockController {
    private final StockService stockService;

    @GetMapping("/api/v1/stock/candlesticks/{stock_code}")
    public ResponseEntity<CandlePriceHistoryResponse> handleCandlePriceHistory(@PathVariable("stock_code") String code, @PageableDefault(size = 180) Pageable pageable) {
        return ResponseEntity.ok(stockService.getCandlePriceHistoryByCode(pageable, code));
    }
}

package com.example.stock_server.stocks.service;

import com.example.stock_server.stocks.advice.MinutePriceCaller;
import com.example.stock_server.stocks.dto.MinutePriceDto;
import com.example.stock_server.support.property.BaseProperties;
import com.example.stock_server.support.property.MinutePriceProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class MinutePriceService {
    private final MinutePriceCaller minutePriceCaller;
    private final BaseProperties baseProperties;
    private final MinutePriceProperties minutePriceProperties;

    public MinutePriceDto getMinutePriceDto(String token, String code, String time) {
        return minutePriceCaller.getMinutePrice(
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

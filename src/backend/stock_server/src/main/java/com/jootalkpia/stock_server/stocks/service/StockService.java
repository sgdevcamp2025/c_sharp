package com.jootalkpia.stock_server.stocks.service;

import com.jootalkpia.stock_server.stocks.advice.StockCaller;
import com.jootalkpia.stock_server.stocks.domain.Schedule;
import com.jootalkpia.stock_server.stocks.domain.StockCode;
import com.jootalkpia.stock_server.stocks.dto.MinutePrice;
import com.jootalkpia.stock_server.stocks.dto.request.TokenRequestBody;
import com.jootalkpia.stock_server.stocks.dto.response.CandlePriceHistoryResponse;
import com.jootalkpia.stock_server.stocks.dto.response.MinutePriceDetailedResponse;
import com.jootalkpia.stock_server.stocks.dto.response.MinutePriceSimpleResponse;
import com.jootalkpia.stock_server.stocks.dto.response.TokenResponse;
import com.jootalkpia.stock_server.stocks.repository.MinutePriceRepository;
import com.jootalkpia.stock_server.support.config.TaskSchedulerConfiguration;
import com.jootalkpia.stock_server.support.property.BaseProperties;
import com.jootalkpia.stock_server.support.property.MinutePriceProperties;
import com.jootalkpia.stock_server.support.property.TokenProperties;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.config.CronTask;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@RequiredArgsConstructor
@Service
public class StockService {
    private static final String TOKEN_SEPARATOR = " ";

    private String token;

    private final StockCaller stockCaller;
    private final BaseProperties baseProperties;
    private final MinutePriceProperties minutePriceProperties;
    private final TokenProperties tokenProperties;
    private final TaskSchedulerConfiguration taskSchedulerConfiguration;
    private final MinutePriceRepository minutePriceRepository;

    @PostConstruct
    public void initScheduledTasks() {
        ScheduledTaskRegistrar taskRegistrar = new ScheduledTaskRegistrar();
        taskSchedulerConfiguration.configureTasks(taskRegistrar);

        taskRegistrar.addCronTask(new CronTask(this::refreshToken, Schedule.MIDNIGHT.getTime()));
        registerMinutePriceSchedulers(taskRegistrar);

        taskRegistrar.afterPropertiesSet();
    }

    @PostConstruct
    private void refreshToken() {
        TokenResponse tokenResponse = stockCaller.getToken(TokenRequestBody.from(baseProperties, tokenProperties));
        token = tokenResponse.tokenType() + TOKEN_SEPARATOR + tokenResponse.accessToken();
    }

    private void registerMinutePriceSchedulers(ScheduledTaskRegistrar taskRegistrar) {
        for (StockCode stockCode : StockCode.values()) {
            createMinutePriceTask(stockCode, taskRegistrar);
        }
    }

    private void createMinutePriceTask(StockCode stockCode, ScheduledTaskRegistrar taskRegistrar) {
        for (Schedule schedule : Schedule.values()) {
            taskRegistrar.addCronTask(new CronTask(() ->
                    minutePriceRepository.save(getStockPrice(stockCode.getCode()).toDocument()), schedule.getTime()));
        }
    }

    private MinutePriceSimpleResponse getStockPrice(String code) {
        LocalDateTime now = LocalDateTime.now();
        String currentTime = now.format(DateTimeFormatter.ofPattern("HHmmss"));

        MinutePriceDetailedResponse response = stockCaller.getMinutePrice(
                token,
                baseProperties.appKey(),
                baseProperties.appSecret(),
                minutePriceProperties.trId(),
                minutePriceProperties.custtype(),
                minutePriceProperties.etcClsCode(),
                minutePriceProperties.marketDivCode(),
                code,
                currentTime,
                minutePriceProperties.pwDataIncuYn()
        );

        return MinutePriceSimpleResponse.from(response, code);
    }

    public CandlePriceHistoryResponse getCandlePriceHistoryByCode(Pageable pageable, String code) {
        Page<MinutePrice> minutePricePage = minutePriceRepository.findAllByCode(pageable, code);
        return CandlePriceHistoryResponse.of(minutePricePage, code);
    }
}

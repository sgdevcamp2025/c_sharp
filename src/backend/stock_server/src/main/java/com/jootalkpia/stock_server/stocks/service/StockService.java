package com.jootalkpia.stock_server.stocks.service;

import com.google.gson.Gson;
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
import org.bson.types.ObjectId;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.config.CronTask;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.NoSuchElementException;

@Slf4j
@RequiredArgsConstructor
@Service
public class StockService {
    private static final String TOKEN_SEPARATOR = " ";
    private static final int CURSOR_PAGE_NUMBER = 0;

    private String token;

    private final StockCaller stockCaller;
    private final BaseProperties baseProperties;
    private final MinutePriceProperties minutePriceProperties;
    private final TokenProperties tokenProperties;
    private final TaskSchedulerConfiguration taskSchedulerConfiguration;
    private final MinutePriceRepository minutePriceRepository;
    private final Gson gson = new Gson();
    private final KafkaTemplate<String, String> kafkaTemplate;

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
            taskRegistrar.addCronTask(new CronTask(() -> {
                MinutePriceSimpleResponse minutePriceSimpleResponse = getStockPrice(stockCode.getCode());
                String jsonMinutePrice = gson.toJson(minutePriceSimpleResponse);
                minutePriceRepository.save(minutePriceSimpleResponse.toDocument());
                kafkaTemplate.send("jootalkpia.stock.prd.minute", jsonMinutePrice).whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.info(result.toString());
                    } else {
                        log.error(ex.getMessage(), ex); //추후 예외처리
                    }
                });
            }, schedule.getTime()));
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

    private List<MinutePrice> findMinutePriceChart(String code, String cursorId, int size) {
        if (cursorId == null || cursorId.isEmpty()) {
            return findFirstPage(code, size);
        }
        return findNextPage(code, cursorId, size);
    }

    private List<MinutePrice> findFirstPage(String code, int size) {
        return minutePriceRepository.findByCodeOrderByMinutePriceIdAsc(
                code,
                PageRequest.of(CURSOR_PAGE_NUMBER, size + 1));
    }

    private List<MinutePrice> findNextPage(String code, String cursorId, int size) {
        ObjectId objectId = new ObjectId(cursorId);
        return minutePriceRepository.findByCodeAndMinutePriceIdGreaterThanOrderByMinutePriceIdAsc(
                code,
                objectId,
                PageRequest.of(CURSOR_PAGE_NUMBER, size + 1)
        );
    }

    private boolean checkHasNext(List<MinutePrice> minutePriceChart, int size) {
        return minutePriceChart.size() > size;
    }

    private List<MinutePrice> sliceBySize(List<MinutePrice> minutePriceChart, int size, boolean hasNext) {
        if (!hasNext) {
            return minutePriceChart;
        }
        return minutePriceChart.subList(0, size);
    }
}

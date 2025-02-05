package com.jootalkpia.stock_server.stocks.advice;

import com.jootalkpia.stock_server.stocks.dto.request.TokenRequestBody;
import com.jootalkpia.stock_server.stocks.dto.response.MinutePriceDetailedResponse;
import com.jootalkpia.stock_server.stocks.dto.response.TokenResponse;
import com.jootalkpia.stock_server.support.config.FeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "stockAPI",url = "${feign.base-url}", configuration = FeignConfig.class)
public interface StockCaller {
    @PostMapping(name = "getTokenAPI", value = "${feign.stock-token.path}")
    TokenResponse getToken(@RequestBody TokenRequestBody tokenRequestBody);

    @GetMapping(name = "MinutePriceAPI", value = "${feign.minute-price.path}")
    MinutePriceDetailedResponse getMinutePrice(@RequestHeader(name = "authorization") String token,
                                               @RequestHeader(name = "appkey") String appKey,
                                               @RequestHeader(name = "appsecret") String appSecret,
                                               @RequestHeader(name = "tr_id") String trId,
                                               @RequestHeader(name = "custtype") String custType,
                                               @RequestParam("FID_ETC_CLS_CODE") String etcClsCode,
                                               @RequestParam("FID_COND_MRKT_DIV_CODE") String marketDivCode,
                                               @RequestParam("FID_INPUT_ISCD") String itemCode,
                                               @RequestParam("FID_INPUT_HOUR_1") String inputHour,
                                               @RequestParam("FID_PW_DATA_INCU_YN") String pwDataIncuYn);
}

package com.jootalkpia.gateway_server.filter;

import com.jootalkpia.gateway_server.filter.GlobalFilter.Config;
import java.util.Objects;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.StopWatch;
import reactor.core.publisher.Mono;

@Component
@Slf4j
public class GlobalFilter extends AbstractGatewayFilterFactory<Config> {

    private final StopWatch stopWatch;

    public GlobalFilter() {
        super(Config.class);
        stopWatch = new StopWatch("API Gateway Global filter");
    }

    public static class Config {}

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            // Request, Response 객체 가져오기
            ServerHttpRequest request = exchange.getRequest();
            ServerHttpResponse response = exchange.getResponse();

            // PRE
            stopWatch.start();
            log.info("글로벌 필터 REQUEST >>>> IP : {}, URI : {}",
                    Objects.requireNonNull(request.getRemoteAddress()).getAddress(),
                    request.getURI());

            // POST
            return chain.filter(exchange).then(Mono.fromRunnable(() -> {
                stopWatch.stop();
                log.info("글로벌 필터 RESPONSE >>>> IP : {}, URI : {}, 응답코드 : {} -> 처리시간 : {} ms",
                        request.getRemoteAddress().getAddress(),
                        request.getURI(),
                        response.getStatusCode(),
                        stopWatch.lastTaskInfo());
            }));
        };
    }
}


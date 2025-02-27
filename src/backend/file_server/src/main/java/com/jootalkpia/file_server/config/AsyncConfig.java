package com.jootalkpia.file_server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "fileUploadExecutor")
    public Executor fileUploadExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("File-Upload-Executor-");
        executor.setKeepAliveSeconds(60);
        executor.setAllowCoreThreadTimeOut(true);
        executor.initialize();
        return executor;
    }

    // ✅ 병합 작업 전용 스레드 풀
    @Bean(name = "fileMergeExecutor")
    public Executor fileMergeExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);   // 병합 작업은 비교적 적은 스레드로 처리
        executor.setMaxPoolSize(10);   // 최대 10개의 병합 작업 처리
        executor.setQueueCapacity(50); // 병합 작업 대기열 설정
        executor.setThreadNamePrefix("File-Merge-Executor-");
        executor.setKeepAliveSeconds(30);
        executor.setAllowCoreThreadTimeOut(true);

        // ✅ 병합 작업 우선순위 높이기 (우선순위: 1이 가장 높음)
        executor.setThreadPriority(Thread.NORM_PRIORITY + 2);

        executor.initialize();
        return executor;
    }
}

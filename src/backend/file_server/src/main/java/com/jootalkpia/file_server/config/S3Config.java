package com.jootalkpia.file_server.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.http.async.SdkAsyncHttpClient;
import software.amazon.awssdk.http.nio.netty.NettyNioAsyncHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.core.retry.RetryPolicy;
import software.amazon.awssdk.core.retry.backoff.FullJitterBackoffStrategy;

import java.net.URI;
import java.time.Duration;

@Configuration
public class S3Config {

    @Value("${spring.cloud.aws.region.static}")
    private String region;

    @Value("${spring.cloud.aws.credentials.access-key}")
    private String accessKey;

    @Value("${spring.cloud.aws.credentials.secret-key}")
    private String secretKey;

    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucketName;

    /**
     * 비동기 S3AsyncClient 설정
     */
    @Bean
    public S3AsyncClient s3AsyncClient() {
        // NettyNioAsyncHttpClient 설정
        SdkAsyncHttpClient httpClient = NettyNioAsyncHttpClient.builder()
                .maxConcurrency(100) // 최대 동시 연결 수 제한
                .maxPendingConnectionAcquires(5000) // 최대 대기 연결 수 제한
                .connectionAcquisitionTimeout(Duration.ofSeconds(60)) // 연결 획득 대기 시간 연장
                .connectionTimeout(Duration.ofSeconds(30)) // 연결 타임아웃
                .readTimeout(Duration.ofSeconds(60)) // 데이터 읽기 타임아웃
                .writeTimeout(Duration.ofSeconds(60)) // 데이터 쓰기 타임아웃
                .build();

        // Retry 정책 설정 (Full Jitter Backoff)
        RetryPolicy retryPolicy = RetryPolicy.builder()
                .backoffStrategy(FullJitterBackoffStrategy.builder()
                        .baseDelay(Duration.ofMillis(500)) // 최소 지연 시간
                        .maxBackoffTime(Duration.ofSeconds(10)) // 최대 지연 시간
                        .build())
                .numRetries(3) // 최대 재시도 횟수
                .build();

        // S3AsyncClient 설정
        return S3AsyncClient.builder()
                .region(Region.of(region))
                .endpointOverride(URI.create("https://s3." + region + ".amazonaws.com")) // S3 엔드포인트
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                ))
                .httpClient(httpClient)
                .overrideConfiguration(c -> c.retryPolicy(retryPolicy)) // Retry 정책 설정
                .build();
    }

    /**
     * 동기 S3Client 설정
     */
    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.of(region))
                .endpointOverride(URI.create("https://s3." + region + ".amazonaws.com")) // S3 엔드포인트
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                ))
                .serviceConfiguration(S3Configuration.builder()
                        .checksumValidationEnabled(false) // Checksum 검증 비활성화 (선택)
                        .build()
                )
                .build();
    }
}


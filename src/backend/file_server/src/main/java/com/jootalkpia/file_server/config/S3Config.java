package com.jootalkpia.file_server.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.http.nio.netty.NettyNioAsyncHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3AsyncClient;

import java.net.URI;

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

    @Bean
    public S3AsyncClient s3AsyncClient() {
        return S3AsyncClient.builder()
                .region(Region.of(region))
                .endpointOverride(URI.create("https://s3." + region + ".amazonaws.com")) // S3 엔드포인트
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                ))
                .httpClientBuilder(NettyNioAsyncHttpClient.builder()) // 비동기 HTTP 클라이언트
                .build();
    }
}

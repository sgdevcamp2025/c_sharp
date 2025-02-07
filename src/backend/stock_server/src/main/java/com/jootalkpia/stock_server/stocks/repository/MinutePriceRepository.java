package com.jootalkpia.stock_server.stocks.repository;

import com.jootalkpia.stock_server.stocks.dto.MinutePrice;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MinutePriceRepository extends MongoRepository<MinutePrice, String> {
    List<MinutePrice> findByCodeOrderByMinutePriceIdAsc(
            String code,
            Pageable pageable
    );
}

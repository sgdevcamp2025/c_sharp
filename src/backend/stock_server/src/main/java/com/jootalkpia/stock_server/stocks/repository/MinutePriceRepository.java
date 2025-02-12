package com.jootalkpia.stock_server.stocks.repository;

import com.jootalkpia.stock_server.stocks.dto.MinutePrice;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MinutePriceRepository extends MongoRepository<MinutePrice, String> {
    List<MinutePrice> findByCodeOrderByMinutePriceIdAsc(
            String code,
            Pageable pageable
    );

    List<MinutePrice> findByCodeAndMinutePriceIdGreaterThanOrderByMinutePriceIdAsc(
            String code,
            ObjectId minutePriceId,
            Pageable pageable
    );
}

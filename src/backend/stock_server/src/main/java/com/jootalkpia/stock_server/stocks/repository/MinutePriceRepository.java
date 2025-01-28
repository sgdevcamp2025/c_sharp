package com.jootalkpia.stock_server.stocks.repository;

import com.jootalkpia.stock_server.stocks.dto.MinutePrice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MinutePriceRepository extends MongoRepository<MinutePrice, String> {
    Page<MinutePrice> findAllByCode(Pageable pageable, String code);
}

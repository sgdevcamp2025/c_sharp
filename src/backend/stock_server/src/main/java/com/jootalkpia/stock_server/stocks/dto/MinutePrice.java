package com.jootalkpia.stock_server.stocks.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Getter;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Getter
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Document(collection = "minute_price")
public class MinutePrice {
    @Id
    private ObjectId minutePriceId;

    @Indexed(background = true)
    private String code;

    @Field("stock_name")
    private String stockName;

    @Field("business_date")
    private String businessDate;

    @Field("trading_time")
    private String tradingTime;

    @Field("current_price")
    private String currentPrice;

    @Field("open_price")
    private String openPrice;

    @Field("high_price")
    private String highPrice;

    @Field("low_price")
    private String lowPrice;

    @Field("trading_volume")
    private String tradingVolume;

    @Field("total_trade_amount")
    private String totalTradeAmount;

    protected MinutePrice() {
    }

    private MinutePrice(
            String code,
            String htsKorIsnm,
            String stckBsopDate,
            String stckCntgHour,
            String stckPrpr,
            String stckOprc,
            String stckHgpr,
            String stckLwpr,
            String cntgVol,
            String acmlTrPbmn) {
        this.code = code;
        this.stockName = htsKorIsnm;
        this.businessDate = stckBsopDate;
        this.tradingTime = stckCntgHour;
        this.currentPrice = stckPrpr;
        this.openPrice = stckOprc;
        this.highPrice = stckHgpr;
        this.lowPrice = stckLwpr;
        this.tradingVolume = cntgVol;
        this.totalTradeAmount = acmlTrPbmn;
    }

    public static MinutePrice of(
            String code,
            String htsKorIsnm,
            String stckBsopDate,
            String stckCntgHour,
            String stckPrpr,
            String stckOprc,
            String stckHgpr,
            String stckLwpr,
            String cntgVol,
            String acmlTrPbmn) {
        return new MinutePrice(
                code,
                htsKorIsnm,
                stckBsopDate,
                stckCntgHour,
                stckPrpr,
                stckOprc,
                stckHgpr,
                stckLwpr,
                cntgVol,
                acmlTrPbmn
        );
    }
}

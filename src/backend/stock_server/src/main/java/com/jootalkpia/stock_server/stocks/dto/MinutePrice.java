package com.jootalkpia.stock_server.stocks.dto;

import lombok.Getter;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Document(collection = "minute_prices")
public class MinutePrice {
    @Id
    private ObjectId minutePriceId;

    @Indexed(background = true)
    private String code;

    private String stockName;

    private String businessDate;

    private String tradingTime;

    private String currentPrice;

    private String openPrice;

    private String highPrice;

    private String lowPrice;

    private String tradingVolume;

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

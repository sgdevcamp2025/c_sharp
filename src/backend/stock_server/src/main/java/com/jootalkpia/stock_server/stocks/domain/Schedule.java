package com.jootalkpia.stock_server.stocks.domain;

public enum Schedule {
    MORNING("0 33-59 23 * * MON-FRI"),
    TRADING_HOURS("0 * 10-14 * * MON-FRI"),
    CLOSING("0 0-31 16 * * MON-FRI"),
    MIDNIGHT("0 0 0 * * MON-FRI");

    private final String time;

    Schedule(String time) {
        this.time = time;
    }

    public String getTime() {
        return time;
    }
}

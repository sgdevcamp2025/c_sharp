package com.jootalkpia.stock_server.stocks.domain;

public enum Schedule {
    MORNING("0 1-59 9 * * MON-FRI"),
    TRADING_HOURS("0 * 10-14 * * MON-FRI"),
    CLOSING("0 0-31 15 * * MON-FRI"),
    MIDNIGHT("0 0 0 * * MON-FRI");

    private final String time;

    Schedule(String time) {
        this.time = time;
    }

    public String getTime() {
        return time;
    }
}

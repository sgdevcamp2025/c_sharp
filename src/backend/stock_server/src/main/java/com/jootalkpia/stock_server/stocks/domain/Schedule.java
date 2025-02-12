package com.jootalkpia.stock_server.stocks.domain;

public enum Schedule {
    MORNING("0 1-59 0 * * MON-FRI"),
    TRADING_HOURS("0 * 1-5 * * MON-FRI"),
    CLOSING("0 0-31 6 * * MON-FRI"),
    MIDNIGHT("0 0 15 * * SUN-THU");

    private final String time;

    Schedule(String time) {
        this.time = time;
    }

    public String getTime() {
        return time;
    }
}

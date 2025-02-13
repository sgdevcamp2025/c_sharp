package com.jootalkpia.chat_server.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateTimeUtil {

    public static String formatDateTime(LocalDateTime localDateTime) {
        DateTimeFormatter outputFormatter = DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 HH시 mm분");

        return localDateTime.format(outputFormatter);
    }

}

package com.jootalkpia.history_server.controller;

import com.jootalkpia.history_server.dto.ChatMessagePageResponse;
import com.jootalkpia.history_server.service.HistoryQueryService;
import com.jootalkpia.passport.anotation.CurrentUser;
import com.jootalkpia.passport.component.UserInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class HistoryController {

    private static final String DEFAULT_PAGE_SIZE = "30";
    private final HistoryQueryService historyQueryService;

    @GetMapping("/api/v1/history/{channelId}")
    public ChatMessagePageResponse getChatMessagesForward(
            @PathVariable Long channelId,
            //처음 요청시엔 서버 내에서 안읽은 메세지 값으로 설정하기 위해 false
            // 이때 message의 objectId가 아닌 threadId가 기준
            @RequestParam(required = false) Long cursorId,
            @RequestParam(defaultValue = DEFAULT_PAGE_SIZE) int size,
            @CurrentUser UserInfo userInfo) {
        System.out.println(cursorId);
        return historyQueryService.
                getChatMessagesForward(channelId, cursorId, size, userInfo.userId());
    }
}

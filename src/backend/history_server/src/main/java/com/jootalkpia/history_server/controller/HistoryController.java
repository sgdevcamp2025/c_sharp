package com.jootalkpia.history_server.controller;

import com.jootalkpia.history_server.dto.ChatMessageSaveRequest;
import com.jootalkpia.history_server.service.HistoryCommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class HistoryController {

    private final HistoryCommandService historyCommandService;

    @PostMapping("/api/v1/history")//test를 위한 임시 post요청 , kafka 연결 후 수정하기, requestBody도 제거할 것
    public ResponseEntity<String> saveChatMessage(@RequestBody ChatMessageSaveRequest request){
        historyCommandService.saveChatMessage(request.toEntity());
        return ResponseEntity.ok("ok");
    }
}

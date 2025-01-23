package com.jootalkpia.workspace_server.controller;


//import com.jootalkpia.aop.JootalkpiaAuthenticationContext;
import com.jootalkpia.workspace_server.dto.ChannelListDTO;
import com.jootalkpia.workspace_server.dto.SimpleChannel;
import com.jootalkpia.workspace_server.entity.Channels;
import com.jootalkpia.workspace_server.service.WorkSpaceService;
import com.jootalkpia.workspace_server.util.ValidationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequestMapping("/api/v1/workspace")
@RequiredArgsConstructor
public class WorkSpaceController {

    private final WorkSpaceService workSpaceService;
    private final Long userId = 1L;//JootalkpiaAuthenticationContext.getUserInfo().userId();

    @GetMapping("/{workspaceId}/channels")
    public ResponseEntity<ChannelListDTO> getChannels(@PathVariable Long workspaceId) {
        // 유효성 검증
        ValidationUtils.validateWorkSpaceId(workspaceId);
        log.info("Getting channels for workspace with id: {}", workspaceId);

        ChannelListDTO channelListDTO = workSpaceService.getChannels(userId, workspaceId);
        return ResponseEntity.ok().body(channelListDTO);
    }

    @PostMapping("/{workspaceId}/channels")
    public ResponseEntity<SimpleChannel> createChannel(@PathVariable Long workspaceId, @RequestParam String channelName) {
        // 유효성 검증
        ValidationUtils.validateWorkSpaceId(workspaceId);
        log.info("Creating channels for workspace with id: {}", workspaceId);

        SimpleChannel channel = workSpaceService.createChannel(workspaceId, channelName);
        return ResponseEntity.ok().body(channel);
    }
}

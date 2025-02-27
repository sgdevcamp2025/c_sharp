package com.jootalkpia.workspace_server.controller;


import com.jootalkpia.workspace_server.dto.ChannelListDTO;
import com.jootalkpia.workspace_server.dto.SimpleChannel;
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
import com.jootalkpia.passport.anotation.CurrentUser;
import com.jootalkpia.passport.component.UserInfo;

@RestController
@Slf4j
@RequestMapping("/api/v1/workspace")
@RequiredArgsConstructor
public class WorkSpaceController {

    private final WorkSpaceService workSpaceService;

    @GetMapping("/{workspaceId}/channels")
    public ResponseEntity<ChannelListDTO> getChannels(@PathVariable Long workspaceId, @CurrentUser UserInfo userInfo) {
        // 유효성 검증
        ValidationUtils.validateWorkSpaceId(workspaceId);
        log.info("Getting channels for workspace with id: {}", workspaceId);

        ChannelListDTO channelListDTO = workSpaceService.getChannels(userInfo.userId(), workspaceId);
        return ResponseEntity.ok().body(channelListDTO);
    }

    @PostMapping("/{workspaceId}/channels")
    public ResponseEntity<SimpleChannel> createChannel(@PathVariable Long workspaceId, @RequestParam String channelName, @CurrentUser UserInfo userInfo) {
        // 유효성 검증
        ValidationUtils.validateWorkSpaceId(workspaceId);
        log.info("Creating channels for workspace with id: {}", workspaceId);

        SimpleChannel channel = workSpaceService.createChannel(workspaceId, channelName, userInfo.userId());

        // 유저를 생성된 채널에 가입시킴
        workSpaceService.addMember(workspaceId, userInfo.userId(), channel.getChannelId());

        return ResponseEntity.ok().body(channel);
    }

    @PostMapping("/{workspaceId}/channels/{channelId}/members")
    public ResponseEntity<?> addMember(@PathVariable Long workspaceId, @PathVariable Long channelId, @CurrentUser UserInfo userInfo) {

        ValidationUtils.validateWorkSpaceId(workspaceId);
        ValidationUtils.validateChannelId(channelId);
        log.info("Adding member for workspace with id: {} {}", workspaceId, channelId);

        return ResponseEntity.ok(workSpaceService.addMember(workspaceId, userInfo.userId(), channelId));
    }
}

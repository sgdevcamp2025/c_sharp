package com.jootalkpia.workspace_server.controller;


import com.jootalkpia.workspace_server.dto.ChannelListDTO;
import com.jootalkpia.workspace_server.service.WorkSpaceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequestMapping("/api/v1/workspace")
@RequiredArgsConstructor
public class WorkSpaceController {

    private final WorkSpaceService workSpaceService;

    @GetMapping("/{workspaceId}/channels")
    public ChannelListDTO getChannels(@PathVariable Long workspaceId) {
        // 유효성 검증

        ChannelListDTO channelListDTO = workSpaceService.getChannels(workspaceId);

    }


}

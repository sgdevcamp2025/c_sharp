package com.jootalkpia.workspace_server.service;


import com.jootalkpia.workspace_server.dto.ChannelListDTO;
import com.jootalkpia.workspace_server.dto.SimpleChannel;
import com.jootalkpia.workspace_server.entity.Channels;
import com.jootalkpia.workspace_server.entity.WorkSpace;
import com.jootalkpia.workspace_server.exception.common.CustomException;
import com.jootalkpia.workspace_server.exception.common.ErrorCode;
import com.jootalkpia.workspace_server.repository.ChannelRepository;
import com.jootalkpia.workspace_server.repository.UserChannelRepository;
import com.jootalkpia.workspace_server.repository.WorkSpaceRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class WorkSpaceService {

    private final ChannelRepository channelRepository;
    private final UserChannelRepository userChannelRepository;
    private final WorkSpaceRepository workSpaceRepository;

    public ChannelListDTO getChannels(Long userId, Long workspaceId) {
        // workspaceId로 모든 채널 조회
        List<Channels> channelList = channelRepository.findByWorkSpaceWorkspaceId(workspaceId);
        if (channelList.isEmpty()) {
            throw new CustomException(ErrorCode.DATABASE_ERROR.getCode(), ErrorCode.DATABASE_ERROR.getMsg());
        }

        // 가입된 채널과 가입되지 않은 채널을 분류
        List<SimpleChannel> joinedChannels = new ArrayList<>();
        List<SimpleChannel> unjoinedChannels = new ArrayList<>();

        for (Channels channels : channelList) {
            SimpleChannel simpleChannel = new SimpleChannel(channels.getChannelId(), channels.getName(), channels.getCreatedAt());

            if (isJoinedChannel(userId, channels)) {
                joinedChannels.add(simpleChannel);
            } else {
                unjoinedChannels.add(simpleChannel);
            }
        }

        ChannelListDTO channelListDTO = new ChannelListDTO();
        channelListDTO.setJoinedChannels(joinedChannels);
        channelListDTO.setUnjoinedChannels(unjoinedChannels);

        return channelListDTO;
    }

    private boolean isJoinedChannel(Long userId, Channels channels) {
        return userChannelRepository.findByUsersUserIdAndChannelsChannelId(userId, channels.getChannelId()).isPresent();
    }

    public SimpleChannel createChannel(Long workspaceId, String channelName) {
        // WorkSpace 객체 조회
        WorkSpace workSpace = workSpaceRepository.findById(workspaceId)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_NOT_FOUND.getCode(), ErrorCode.WORKSPACE_NOT_FOUND.getMsg()));

        Channels channel = Channels.builder()
                .workSpace(workSpace)
                .name(channelName)
                .build();

        channelRepository.save(channel);

        return new SimpleChannel(channel.getChannelId(), channel.getName(), channel.getCreatedAt());
    }
}

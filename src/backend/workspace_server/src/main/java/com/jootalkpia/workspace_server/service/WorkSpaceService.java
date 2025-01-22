package com.jootalkpia.workspace_server.service;


import com.jootalkpia.workspace_server.dto.ChannelListDTO;
import com.jootalkpia.workspace_server.dto.SimpleChannel;
import com.jootalkpia.workspace_server.entity.Channels;
import com.jootalkpia.workspace_server.repository.ChannelRepository;
import com.jootalkpia.workspace_server.repository.UserChannelRepository;
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

    public ChannelListDTO getChannels(Long userId, Long workspaceId) {
        // workspaceId로 모든 채널 조회
        List<Channels> channelList = channelRepository.findByWorkSpaceWorkspaceId(workspaceId);

        // 가입된 채널과 가입되지 않은 채널을 분류
        List<SimpleChannel> joinedChannels = new ArrayList<>();
        List<SimpleChannel> unjoinedChannels = new ArrayList<>();

        for (Channels channels : channelList) {
            SimpleChannel simpleChannel = new SimpleChannel();
            simpleChannel.setChannelId(channels.getChannelId());
            simpleChannel.setChannelName(channels.getName());
            simpleChannel.setCreatedAt(channels.getCreatedAt());

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
}

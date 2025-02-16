package com.jootalkpia.workspace_server.service;

import com.jootalkpia.workspace_server.dto.ChannelListDTO;
import com.jootalkpia.workspace_server.dto.SimpleChannel;
import com.jootalkpia.workspace_server.entity.Channels;
import com.jootalkpia.workspace_server.entity.UserChannel;
import com.jootalkpia.workspace_server.entity.Users;
import com.jootalkpia.workspace_server.entity.WorkSpace;
import com.jootalkpia.workspace_server.exception.common.CustomException;
import com.jootalkpia.workspace_server.exception.common.ErrorCode;
import com.jootalkpia.workspace_server.repository.ChannelRepository;
import com.jootalkpia.workspace_server.repository.UserChannelRepository;
import com.jootalkpia.workspace_server.repository.UserRepository;
import com.jootalkpia.workspace_server.repository.WorkSpaceRepository;
import java.util.ArrayList;
import java.util.List;

import com.jootalkpia.workspace_server.util.RedisKeys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class WorkSpaceService {

    private final ChannelRepository channelRepository;
    private final UserChannelRepository userChannelRepository;
    private final WorkSpaceRepository workSpaceRepository;
    private final UserRepository userRepository;
    private final RedisTemplate<String, String> redisTemplate;

    public ChannelListDTO getChannels(Long userId, Long workspaceId) {
        // workspaceId로 모든 채널 조회
        List<Channels> channelList = fetchAllChannels(workspaceId);

        // 채널 분류
        List<SimpleChannel> joinedChannels = classifyChannels(userId, channelList, true);
        List<SimpleChannel> unjoinedChannels = classifyChannels(userId, channelList, false);

        return createChannelListDTO(joinedChannels, unjoinedChannels);
    }

    private List<Channels> fetchAllChannels(Long workspaceId) {
        List<Channels> channelList = channelRepository.findByWorkSpaceWorkspaceId(workspaceId);
        if (channelList.isEmpty()) {
            throw new CustomException(ErrorCode.DATABASE_ERROR.getCode(), ErrorCode.DATABASE_ERROR.getMsg());
        }
        return channelList;
    }

    private List<SimpleChannel> classifyChannels(Long userId, List<Channels> channelList, boolean isJoined) {
        List<SimpleChannel> classifiedChannels = new ArrayList<>();
        for (Channels channel : channelList) {
            boolean joined = isUserInChannel(userId, channel.getChannelId());
            if (joined == isJoined) {
                classifiedChannels.add(new SimpleChannel(channel.getChannelId(), channel.getName(), channel.getCreatedAt()));
            }
        }
        return classifiedChannels;
    }

    private boolean isUserInChannel(Long userId, Long channelId) {
        return userChannelRepository.findByUsersUserIdAndChannelsChannelId(userId, channelId).isPresent();
    }

    private ChannelListDTO createChannelListDTO(List<SimpleChannel> joinedChannels, List<SimpleChannel> unjoinedChannels) {
        ChannelListDTO channelListDTO = new ChannelListDTO();
        channelListDTO.setJoinedChannels(joinedChannels);
        channelListDTO.setUnjoinedChannels(unjoinedChannels);
        return channelListDTO;
    }

    public SimpleChannel createChannel(Long workspaceId, String channelName) {
        // WorkSpace 객체 조회
        WorkSpace workSpace = fetchWorkSpace(workspaceId);

        // 채널명 unique한지 확인
        if (isChannelNameDuplicate(workspaceId, channelName)) {
            throw new CustomException(ErrorCode.DUPLICATE_CHANNEL_NAME.getCode(), ErrorCode.DUPLICATE_CHANNEL_NAME.getMsg());
        }
        Channels channel = Channels.builder()
                .workSpace(workSpace)
                .name(channelName)
                .build();

        channelRepository.save(channel);

        return new SimpleChannel(channel.getChannelId(), channel.getName(), channel.getCreatedAt());
    }

    private boolean isChannelNameDuplicate(Long workspaceId, String channelName) {
        List<Channels> channelList = fetchAllChannels(workspaceId);
        for (Channels channel : channelList) {
            if (channel.getName().equals(channelName)) {
                return true;
            }
        }
        return false;
    }

    private WorkSpace fetchWorkSpace(Long workspaceId) {
        return workSpaceRepository.findById(workspaceId)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_NOT_FOUND.getCode(), ErrorCode.WORKSPACE_NOT_FOUND.getMsg()));
    }

    public String addMember(Long workspaceId, Long userId, Long channelId) {
        WorkSpace workSpace = fetchWorkSpace(workspaceId);

        // 워크스페이스에 채널 있는지
        IsChannelInWorkSpace(workspaceId, channelId);

        // 채널에 유저 있는지
        if (isUserInChannel(userId, channelId)) {
            throw new CustomException(ErrorCode.DUPLICATE_USER_IN_CHANNEL.getCode(), ErrorCode.DUPLICATE_USER_IN_CHANNEL.getMsg());
        }

        Channels channel = fetchChannel(channelId);
        Users user = fetchUser(userId);

        UserChannel userChannel = UserChannel.builder()
                .users(user)
                .channels(channel)
                .mute(false)
                .build();
        userChannelRepository.save(userChannel);

        addMemberToRedis(channelId, userId);

        return "success";
    }

    private void addMemberToRedis(Long channelId, Long userId) {
        redisTemplate.opsForSet().add(
                RedisKeys.channelSubscriber(String.valueOf(channelId)),
                String.valueOf(userId)
        );
    }

    private void IsChannelInWorkSpace(Long workspaceId, Long channelId) {
        List<Channels> channelList = fetchAllChannels(workspaceId);
        for (Channels channel : channelList) {
            if (channel.getChannelId().equals(channelId)) { return ; }
        }
        throw new CustomException(ErrorCode.CHANNEL_NOT_FOUND.getCode(), ErrorCode.CHANNEL_NOT_FOUND.getMsg());
    }

    private Users fetchUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND.getCode(), ErrorCode.USER_NOT_FOUND.getMsg()));
    }

    private Channels fetchChannel(Long channelId) {
        return channelRepository.findById(channelId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHANNEL_NOT_FOUND.getCode(), ErrorCode.CHANNEL_NOT_FOUND.getMsg()));
    }
}

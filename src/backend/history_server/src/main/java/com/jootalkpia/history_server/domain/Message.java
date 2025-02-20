package com.jootalkpia.history_server.domain;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import org.springframework.data.mongodb.core.mapping.Field;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Message {
    @Field("type")
    private String type;

    @Field("text")
    private String text;

    @Field("image_id")
    private Long imageId;

    @Field("image_url")
    private String imageUrl;

    @Field("video_id")
    private Long videoId;

    @Field("video_thumbnail_id")
    private Long videoThumbnailId;

    @Field("thumbnail_url")
    private String thumbnailUrl;

    @Field("video_url")
    private String videoUrl;
}

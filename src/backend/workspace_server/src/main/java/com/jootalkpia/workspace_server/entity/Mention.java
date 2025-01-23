package com.jootalkpia.workspace_server.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "mention")
@Getter
public class Mention extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mention_id", nullable = false)
    private Long mentionId;

    @ManyToOne
    @JoinColumn(name = "user_channel_id", nullable = false)
    private UserChannel userChannel;

    @Column(name = "message_id", nullable = false)
    private Long messageId;

    @Column(name = "is_unread", nullable = false)
    private Boolean isUnread;

}

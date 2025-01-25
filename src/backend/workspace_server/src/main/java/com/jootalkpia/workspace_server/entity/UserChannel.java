package com.jootalkpia.workspace_server.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "user_channel")
@Getter
@RequiredArgsConstructor
public class UserChannel extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_channel_id", nullable = false)
    private Long userChannelId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users users;

    @ManyToOne
    @JoinColumn(name = "channel_id", nullable = false)
    private Channels channels;

    @OneToMany(mappedBy = "userChannel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Mention> mentions = new ArrayList<>();

    @Column(name = "mute", nullable = false)
    private Boolean mute;

    @Builder
    public UserChannel(Users users, Channels channels, Boolean mute) {
        this.users = users;
        this.channels = channels;
        this.mute = mute;
    }
}

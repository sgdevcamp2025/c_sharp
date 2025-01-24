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
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "channels")
@Getter
@NoArgsConstructor
public class Channels extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "channel_id", nullable = false)
    private Long channelId;

    @ManyToOne
    @JoinColumn(name = "workspace_id", nullable = false)
    private WorkSpace workSpace;

    @OneToMany(mappedBy = "channels", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserChannel> userChannel = new ArrayList<>();

    @Column(name = "name", length = 100, nullable = false, unique = true)
    private String name;

    @Builder
    public Channels(WorkSpace workSpace, String name) {
        this.workSpace = workSpace;
        this.name = name;
    }
}

package com.jootalkpia.workspace_server.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "work_space")
@Getter
public class WorkSpace extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "workspace_id", nullable = false)
    private Long workspaceId;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "stock_name", length = 100, nullable = false)
    private String stockName;

    @OneToMany(mappedBy = "workSpace", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Channels> channels = new ArrayList<>();

}

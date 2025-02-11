package com.jootalkpia.signaling_server.repository;

import org.kurento.client.KurentoClient;
import org.kurento.client.MediaPipeline;
import org.springframework.stereotype.Repository;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class MediaPipelineRepository {
    private final KurentoClient kurentoClient;
    private final ConcurrentHashMap<String, MediaPipeline> pipelineMap = new ConcurrentHashMap<>();

    public MediaPipelineRepository(KurentoClient kurentoClient) {
        this.kurentoClient = kurentoClient;
    }

    public MediaPipeline createPipeline(String huddleId) {
        MediaPipeline pipeline = kurentoClient.createMediaPipeline();
        pipelineMap.put(huddleId, pipeline);
        return pipeline;
    }

    public MediaPipeline getPipeline(String huddleId) {
        return pipelineMap.get(huddleId);
    }

    public void removePipeline(String huddleId) {
        MediaPipeline pipeline = pipelineMap.remove(huddleId);
        if (pipeline != null) {
            pipeline.release();
        }
    }
}


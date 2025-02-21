'use client';

import { useEffect, useRef, useState } from 'react';
import * as StompJs from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const STOMP_SERVER_URL = 'http//13.125.13.209:8090/ws';
const RTC_CONFIGURATION = {
  iceServers: [
    { urls: 'stun:13.125.13.209:3478' },
    {
      urls: 'turn:13.125.13.209:3478?transport=udp',
      username: 'kurentouser',
      credential: 'kurentopassword',
    },
  ],
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  iceCandidatePoolSize: 0,
};

export default function page() {
  //유저id 입력, 채널 id입력을 위한 변수
  const [userId, setUserId] = useState('');
  const [channelId, setChannelId] = useState('');

  //방참가 여부
  const [isInCall, setIsInCall] = useState(false);

  //stomp연결
  const stompClient = useRef<StompJs.Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  //참여자 목록
  const participants = useRef<{ [key: string]: any }>({});

  //다른참가자 미디어 스트림 목록
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  //내 미디어 스트림
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  //웹소켓(sockjs+stomp) 연결
  useEffect(() => {
    if (stompClient.current) {
      stompClient.current.deactivate();
    }

    stompClient.current = new StompJs.Client({
      webSocketFactory: () => new SockJS(STOMP_SERVER_URL),
      debug: (msg: string) => console.log('[DEBUG]', msg),
      onConnect: () => {
        console.log('✅ WebSocket Connected');
        setIsConnected(true);
      },
      onStompError: (frame) => {
        console.error(
          '❌ WebSocket error:',
          frame.headers['message'],
          frame.body,
        );
      },
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.current.activate();

    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
        stompClient.current = null;
      }
    };
  }, []);

  return (
    <div>
      <h2>Kurento WebRTC Group Call (SockJS + STOMP + STUN/TURN)</h2>
      <div>
        <input
          type="text"
          placeholder="유저아이디"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <input
          type="text"
          placeholder="채널"
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
        />
        {/* 방에 참가가 되면, 나오는 버튼 */}
        {!isInCall ? (
          <button onClick={joinRoom}>Join Room</button>
        ) : (
          <button onClick={leaveRoom}>Leave Room</button>
        )}
      </div>
      {/* 내 화면 */}
      <div>
        <video
          ref={localVideoRef}
          autoPlay
          muted
        />
      </div>
      {/* 다른 참가자들 화면 */}
      <div id="remoteVideos">
        {Object.keys(videoRefs.current).map((peerId) => (
          <video
            key={peerId}
            ref={(ref) => {
              if (ref) {
                videoRefs.current[peerId] = ref;
              }
            }}
            autoPlay
          />
        ))}
      </div>
    </div>
  );
}

//방참가 (방 생성)
const joinRoom = () => {};

//방 나가기
const leaveRoom = (e) => {};

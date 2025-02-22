'use client';

import { useEffect, useRef, useState } from 'react';
import * as StompJs from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const STOMP_SERVER_URL = 'http://13.125.13.209:8090/ws';
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
const STOMP_PATH = {
  PUB_URL: '/app/signal',
  SUB_URL: '/topic/huddle',
};

export default function page() {
  //유저id 입력, 채널 id입력을 위한 변수
  const [userId, setUserId] = useState<number | ''>('');
  const [channelId, setChannelId] = useState<number | ''>('');
  const [isSetupConfirmed, setIsSetupConfirmed] = useState(false);

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
    if (!isSetupConfirmed) return;

    console.log('STOMP_SERVER_URL:', STOMP_SERVER_URL);
    stompClient.current = new StompJs.Client({
      connectHeaders: {
        sessionId: userId.toString(),
      },
      webSocketFactory: () => new SockJS(`${STOMP_SERVER_URL}`),
      // debug: (msg: string) => console.log('[DEBUG]', msg),
      onConnect: () => {
        console.log('✅ WebSocket Connected');
        setIsConnected(true);
        console.log('start sub');
        stompClient.current?.subscribe(
          `${STOMP_PATH.SUB_URL}/${channelId}`,
          handleSignal,
        );
      },
      onStompError: (frame) => {
        console.error(
          '❌ WebSocket error:',
          frame.headers['message'],
          frame.body,
        );
      },
      reconnectDelay: 0,
    });

    stompClient.current.activate();

    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
        stompClient.current = null;
        setIsConnected(false);
      }
    };
  }, [isSetupConfirmed]);

  //구독 리스트 (기존참가자 목록, 새로운 참가자 정보)
  const handleSignal = (msg: StompJs.Message) => {
    const data = JSON.parse(msg.body);
    console.log('서버에서 온 메시지 : ', data);

    switch (data.id) {
      case 'existingParticipants':
        handleExistingParticipants(data);
        break;
      case 'newParticipantArrived':
        handleNewParticipant(data);
        break;
    }
  };

  //방참가 pub(방 생성)-완료되면 참가자 리스트 sub
  const joinRoom = () => {
    if (!!!userId || !!!channelId) {
      alert('userId와 channelId를 입력해주세요');
      return;
    }
    if (!isConnected) {
      console.log('WEBSOCKET 연결 끊김');
      return;
    }

    console.log('방 참가 요청 시작 !');

    const message = JSON.stringify({ id: 'joinHuddle', channelId, userId });
    console.log('보내는 메시지:', message);

    stompClient.current?.publish({
      destination: `${STOMP_PATH.PUB_URL}`,
      body: message,
    });
  };

  //방참가 완료 & 기존 참가자 목록ID 저장
  const handleExistingParticipants = (data: any) => {
    const list = data.data;
    console.log('방입장 성공');
    setIsInCall(true);

    list.forEach((participantId: number) => {
      participants.current[participantId] = { id: participantId };
    });
    console.log('기존참가자 등록 완료!');
    console.log('참가자 목록-existing:', participants.current);
  };

  //새로운 참가자 알림
  const handleNewParticipant = (data: any) => {
    const newPeerId = data.name;
    if (newPeerId === userId) return; //내 id무시

    console.log(`새로운 참가자 입장 : ${newPeerId}`);
    participants.current[newPeerId] = { id: newPeerId };
    console.log('참가자 등록 완료!');
    console.log('참가자 목록-new:', participants.current);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h2 className="font-bold">
        Kurento WebRTC Group Call (SockJS + STOMP + STUN/TURN)
      </h2>
      <div className="flex gap-3">
        <label>유저아이디</label>
        <input
          id="userId"
          className="border p-2"
          type="number"
          placeholder="userId"
          value={userId}
          onChange={(e) =>
            setUserId(e.target.value ? Number(e.target.value) : '')
          }
        />
        <label>채널아이디</label>
        <input
          className="border p-2"
          type="number"
          placeholder="channelId"
          value={channelId}
          onChange={(e) =>
            setChannelId(e.target.value ? Number(e.target.value) : '')
          }
        />
        {/* 방에 참가가 되면, 나오는 버튼 */}
        {!isSetupConfirmed ? (
          <button
            className="bg-red-500 text-white p-2"
            onClick={() => {
              if (!!!userId || !!!channelId) {
                alert('userId와 channelId를 입력해주세요');
                return;
              }
              setIsSetupConfirmed(true);
            }}
          >
            1. 정보 입력 완료
          </button>
        ) : !isInCall ? (
          <button
            className="bg-orange-500 text-white p-2"
            onClick={joinRoom}
          >
            2. 방 입장
          </button>
        ) : (
          <button
            className="bg-yellow-500 text-white p-2"
            onClick={leaveRoom}
          >
            3. 방 퇴장
          </button>
        )}
      </div>
      {/* 카메라 영역 */}
      <div className="flex gap-2">
        {/* 내 화면 */}
        <div className="border-2 p-2 border-red-400 w-44 h-44 mb-2">
          <label>내 화면</label>
          <video
            ref={localVideoRef}
            autoPlay
            muted
          />
        </div>
        {/* 다른 참가자들 화면 */}
        <div
          id="remoteVideos"
          className="border-2 p-2 border-blue-400 w-44 h-44 mb-2"
        >
          <label>남 화면</label>
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
    </div>
  );
}

//방 나가기
const leaveRoom = (e) => {};

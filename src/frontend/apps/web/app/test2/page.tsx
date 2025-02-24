'use client';

import { useEffect, useRef, useState } from 'react';
import * as StompJs from '@stomp/stompjs';
import SockJS from 'sockjs-client';
// import kurentoUtils from 'kurento-utils';

const STOMP_SERVER_URL = 'http://localhost:8090/ws';
const RTC_CONFIGURATION = {
  iceServers: [
    {
      urls: 'turn:13.125.13.209:3478?transport=udp',
      username: 'kurentouser',
      credential: 'kurentopassword',
    },
  ],
  iceTransportPolicy: 'relay',
  iceCandidatePoolSize: 0,
} as RTCConfiguration;
const STOMP_PATH = {
  PUB_URL: '/app/signal', // 메시지 발행 경로
  SUB_URL: '/topic/huddle', // 브로드캐스트 경로
  PRIVATE_SUB_URL: '/queue/private', // 개인 메시지 구독 경로
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

  // 웹소켓(sockjs+stomp) 연결
  // 웹소켓(sockjs+stomp) 연결
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
      onConnect: () => {
        console.log('✅ WebSocket Connected');
        setIsConnected(true);
        console.log('start sub');

        // 🔥 브로드캐스트 메시지 구독
        stompClient.current?.subscribe(
          `${STOMP_PATH.SUB_URL}/${channelId}`,
          handleSignal,
        );

        // 🔥 개인 메시지 구독 (경로 수정)
        stompClient.current?.subscribe(
          `${STOMP_PATH.PRIVATE_SUB_URL}/${userId}`,
          handlePrivateMessage,
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

  // 🔥 개인 메시지 핸들러
  // 🔥 개인 메시지 핸들러
  const handlePrivateMessage = (msg: StompJs.Message) => {
    const data = JSON.parse(msg.body);
    console.log('📨 개인 메시지 수신:', data);

    switch (data.id) {
      case 'existingParticipants': // ✅ 기존 참가자 목록 처리 추가
        handleExistingParticipants(data);
        break;
      case 'iceCandidate':
        handleIceResponse(data);
        break;
      case 'receiveVideoAnswer':
        handleVideoResponse(data);
        break;
      default:
        console.warn('알 수 없는 개인 메시지:', data);
    }
  };

  // 🔥 브로드캐스트 메시지 핸들러 (기존 참가자 목록, 새로운 참가자 정보)
  const handleSignal = (msg: StompJs.Message) => {
    const data = JSON.parse(msg.body);
    console.log('🔥 서버에서 온 브로드캐스트 메시지:', data);

    switch (data.id) {
      case 'newParticipantArrived':
        handleNewParticipant(data);
        break;
      case 'receiveVideoAnswer':
        handleVideoResponse(data);
        break;
      case 'iceCandidate':
        handleIceResponse(data);
        break;
      default:
        console.warn('알 수 없는 Signal 메시지:', data);
    }
  };

  //방참가 pub(방 생성)-완료되면 참가자 리스트 sub
  // MediaStream 먼저 설정
  // MediaStream 재사용 및 초기화 방지
  const getUserMedia = async () => {
    try {
      // 이미 연결된 트랙이 있는지 확인
      if (localVideoRef.current?.srcObject) {
        console.log('⚠️ 이미 MediaStream이 연결되어 있음, 재사용');
        return localVideoRef.current.srcObject;
      }

      // MediaStream 새로 가져오기
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localVideoRef.current.srcObject = stream;

      // ✅ MediaStream 활성화 완료 후 SDP Offer 생성
      await new Promise((resolve, reject) => {
        localVideoRef.current.onloadedmetadata = () => {
          console.log('✅ Local Video Stream 메타데이터 로딩 완료');
          localVideoRef.current
            .play()
            .then(() => {
              console.log('✅ Local Video Stream 활성화 완료');
              resolve(stream);
            })
            .catch((error) => {
              console.error('❌ Local Video Stream 재생 실패:', error);
              reject(error);
            });
        };
      });

      return stream;
    } catch (error) {
      console.error('❌ Media Device Error:', error);
      return null;
    }
  };

  // 방참가 완료 & 기존 참가자 목록ID 저장
  // 🔥 PeerConnection 생성 및 저장 부분 수정
  const handleExistingParticipants = async (data: any) => {
    const list = data.data;
    console.log('📋 기존 참가자 목록:', list);

    if (!list || list.length === 0) {
      console.warn('⚠️ 기존 참가자 목록이 비어 있음');
      return;
    }

    console.log('방입장 성공');
    setIsInCall(true);

    // ✅ 내 정보 등록
    const localRtcPeer = await createWebRtcPeerNative(
      'sendonly',
      localVideoRef.current,
      (offerSdp: any) => {
        if (!offerSdp) {
          console.error('❌ SDP가 null임!');
          return;
        }
        const message = JSON.stringify({
          id: 'receiveVideoFrom',
          sdpOffer: offerSdp,
          sender: userId,
        });
        console.log('📡 보내는 SDP 메시지:', message);

        stompClient.current?.publish({
          destination: `${STOMP_PATH.PUB_URL}`,
          body: message,
        });
      },
    );

    // ✅ Promise가 아닌 RTCPeerConnection 인스턴스 저장
    participants.current[userId] = { rtcPeer: localRtcPeer };
    console.log('✅ 내 정보 로컬에 등록완료:', participants.current);

    // 기존 참가자에게 Offer 전송
    list.forEach((participantId: number) => {
      handleNewParticipant(participantId);
    });
    console.log('참가자 목록-existing:', participants.current);
  };

  // 새로운 참가자 알림
  const handleNewParticipant = async (participantId: number) => {
    const newPeerId = String(participantId);
    if (newPeerId === String(userId)) return; // 내 ID는 무시

    console.log(`🆕 새로운 참가자 입장: ${newPeerId}`);

    // 새로운 비디오 태그 생성 및 등록
    videoRefs.current[newPeerId] = document.createElement('video');
    videoRefs.current[newPeerId].autoplay = true;
    videoRefs.current[newPeerId].playsInline = true;
    videoRefs.current[newPeerId].className =
      'w-44 h-44 border-2 border-blue-400 mb-2';
    document
      .getElementById('remoteVideos')
      ?.appendChild(videoRefs.current[newPeerId]);

    try {
      // 🔥 여기서 await 추가
      const remoteRtcPeer = await createWebRtcPeerNative(
        'recvonly',
        videoRefs.current[newPeerId],
        (offerSdp: any) => {
          const message = JSON.stringify({
            id: 'receiveVideoFrom',
            sdpOffer: offerSdp,
            sender: participantId,
          });
          console.log('📡 새로운 참가자에게 보내는 SDP 메시지:', message);

          stompClient.current?.publish({
            destination: `${STOMP_PATH.PUB_URL}`,
            body: message,
          });
        },
        participantId,
      );

      // ✅ 여기서 Promise가 아닌 인스턴스로 저장
      participants.current[newPeerId] = { rtcPeer: remoteRtcPeer };
      console.log(`✅ ${newPeerId} 정보 로컬에 등록완료`);
    } catch (error) {
      console.error('❌ 새로운 참가자 처리 중 오류:', error);
    }
  };

  // 방 참가 (SDP Offer 생성 및 전송 포함)
  const joinRoom = async () => {
    if (!!!userId || !!!channelId) {
      alert('userId와 channelId를 입력해주세요');
      return;
    }
    if (!isConnected) {
      console.log('❌ WEBSOCKET 연결 끊김');
      return;
    }

    console.log('방 참가 요청 시작 !');
    const message = JSON.stringify({ id: 'joinHuddle', channelId, userId });
    console.log('보내는 메시지:', message);

    stompClient.current?.publish({
      destination: `${STOMP_PATH.PUB_URL}`,
      body: message,
    });

    // MediaStream 설정 후 WebRtcPeer 생성
    const stream = await getUserMedia();
    if (stream) {
      const localRtcPeer = createWebRtcPeerNative(
        'sendonly',
        localVideoRef.current,
        (offerSdp: any) => {
          if (!offerSdp) {
            console.log('❌ SDP가 null임!');
            return;
          }
          const message = JSON.stringify({
            id: 'receiveVideoFrom',
            sdpOffer: offerSdp,
            sender: userId,
          });
          console.log('보내는 메시지:', message);

          stompClient.current?.publish({
            destination: `${STOMP_PATH.PUB_URL}`,
            body: message,
          });
        },
      );

      participants.current[userId] = { rtcPeer: localRtcPeer };
      console.log('✅ 내 정보 로컬에 등록완료');
    }
  };

  //webRtc Peer생성 및 iceCandidate전송
  const createWebRtcPeerNative = async (
    mode: 'sendonly' | 'recvonly',
    videoElement: HTMLVideoElement | null,
    callback: (offerSdp: any) => void,
    participantId?: number,
  ) => {
    const peerConnection = new RTCPeerConnection(RTC_CONFIGURATION);
    console.log('✅ 새 PeerConnection 생성 완료:', participantId);

    peerConnection.ontrack = (event) => {
      console.log('📸 Remote Track Received:', event);
      if (videoElement) {
        videoElement.srcObject = event.streams[0];
      }
    };

    const stream = localVideoRef.current?.srcObject as MediaStream;
    if (mode === 'sendonly' && stream && stream.getTracks().length > 0) {
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });
      console.log('✅ Local Video Stream 트랙 추가 완료');
    } else if (mode === 'recvonly') {
      peerConnection.addTransceiver('video', { direction: 'recvonly' });
      peerConnection.addTransceiver('audio', { direction: 'recvonly' });
      console.log('✅ Transceiver 설정 완료 (recvonly 모드)');
    }

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const message = JSON.stringify({
          id: 'onIceCandidate',
          candidate: event.candidate,
          sender: userId,
          receiver: participantId,
        });
        stompClient.current?.publish({
          destination: `${STOMP_PATH.PUB_URL}`,
          body: message,
        });
      }
    };

    try {
      const offerOptions =
        mode === 'recvonly'
          ? { offerToReceiveAudio: true, offerToReceiveVideo: true }
          : { offerToReceiveAudio: false, offerToReceiveVideo: false };

      const offer = await peerConnection.createOffer(offerOptions);
      await peerConnection.setLocalDescription(offer);
      console.log('✅ SDP Offer 생성 성공:', offer.sdp);

      callback(offer.sdp);
    } catch (error) {
      console.error('❌ Native SDP Offer 생성 실패:', error);
    }

    // 🔥 여기서 RTC PeerConnection을 완전히 생성한 후 저장
    const key = participantId ? String(participantId) : 'undefined';

    // 🔥 Promise가 아닌 인스턴스로 저장하기 위해 then() 내부에서 저장
    return new Promise<RTCPeerConnection>((resolve) => {
      // 🔥 Promise가 아닌 결과만 저장
      resolve(peerConnection);
    }).then((resolvedPeer) => {
      participants.current[key] = { rtcPeer: resolvedPeer };
      console.log(
        '✅ RTC PeerConnection participants에 저장 완료:',
        participants.current,
      );
      return resolvedPeer;
    });
  };

  //sdp answer 처리
  // SDP Answer 처리
  const handleVideoResponse = (data: any) => {
    const { senderId, sdpAnswer } = data;
    const senderKey = String(senderId);
    console.log(`${senderId}의 SDP Answer 받음`);
    console.log('💡 participants 상태 확인:', participants.current);

    const peerConnection = participants.current[senderKey]?.rtcPeer;

    // 🔥 이제 Promise가 아닌 인스턴스로 저장되므로, 기존 코드 유지 가능
    if (peerConnection instanceof RTCPeerConnection) {
      const remoteDesc = new RTCSessionDescription({
        type: 'answer',
        sdp: sdpAnswer,
      });

      peerConnection
        .setRemoteDescription(remoteDesc)
        .then(() => {
          console.log('✅ SDP Answer 적용 완료');
          console.log('✅ signalingState:', peerConnection.signalingState);

          // 🔥 signalingState가 stable인지 확인
          if (peerConnection.signalingState === 'stable') {
            const queuedCandidates = iceCandidateQueue.current[senderKey] || [];
            console.log(
              '🧊 저장된 ICE Candidate 개수:',
              queuedCandidates.length,
            );

            queuedCandidates.forEach((candidate) => {
              console.log('🚀 ICE Candidate 적용:', candidate);
              peerConnection.addIceCandidate(candidate);
            });

            // 적용 후 큐 초기화
            delete iceCandidateQueue.current[senderKey];
          }
        })
        .catch((error) => {
          console.error('❌ SDP Answer 적용 실패:', error);
        });
    } else {
      console.error(
        '❌ rtcPeer가 RTCPeerConnection 인스턴스가 아님:',
        peerConnection,
      );
    }
  };

  //ice answer 처리
  // ICE Candidate 큐 추가
  const iceCandidateQueue = useRef<{ [key: string]: RTCIceCandidate[] }>({});

  // 🔥 ICE Candidate 처리
  // 🔥 ICE Candidate 처리
  const handleIceResponse = (data: any) => {
    const { senderId, candidate } = data;
    console.log(`${senderId}의 ICE Candidate 받음`, candidate);

    const peerConnection = participants.current[senderId]?.rtcPeer;

    if (peerConnection) {
      console.log('✅ signalingState:', peerConnection.signalingState);

      // 🔥 signalingState가 stable이면 즉시 추가
      if (peerConnection.signalingState === 'stable') {
        console.log('✅ SDP Answer 완료됨. ICE Candidate 추가.');
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        console.log('⏳ SDP Answer 대기 중. ICE Candidate 큐에 저장.');
        if (!iceCandidateQueue.current[senderId]) {
          iceCandidateQueue.current[senderId] = [];
        }
        iceCandidateQueue.current[senderId].push(
          new RTCIceCandidate(candidate),
        );
      }
    } else {
      console.error(
        `❌ senderId(${senderId})에 해당하는 rtcPeer가 없음. ICE Candidate 저장`,
      );
      if (!iceCandidateQueue.current[senderId]) {
        iceCandidateQueue.current[senderId] = [];
      }
      iceCandidateQueue.current[senderId].push(new RTCIceCandidate(candidate));
    }
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

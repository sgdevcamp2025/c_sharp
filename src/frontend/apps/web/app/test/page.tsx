'use client';

import { useEffect, useRef, useState } from 'react';
import * as StompJs from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const STOMP_SERVER_URL = process.env.NEXT_PUBLIC_STOMP_SERVER;
const RTC_CONFIGURATION = {
  iceServers: [
    { urls: process.env.NEXT_PUBLIC_STUN_SERVER },
    {
      urls: process.env.NEXT_PUBLIC_TRUN_SERVER,
      username: process.env.NEXT_PUBLIC_TURN_USERNAME,
      credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL,
    },
  ],
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  iceCandidatePoolSize: 0,
} as RTCConfiguration;
const STOMP_PATH = {
  PUB_URL: process.env.NEXT_PUBLIC_PUB_URL,
  SUB_URL: process.env.NEXT_PUBLIC_SUB_URL,
  PRIVATE_SUB_URL: process.env.NEXT_PUBLIC_PRIVATE_SUB_URL,
};

export default function page() {
  //유저id 입력, 채널 id입력을 위한 변수
  const [userId, setUserId] = useState<number>(0);
  const [channelId, setChannelId] = useState<number>(0);
  const [isSetupConfirmed, setIsSetupConfirmed] = useState(false);

  //방참가 여부
  const [isInCall, setIsInCall] = useState(false);

  //stomp연결
  const stompClient = useRef<StompJs.Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  //참여자 목록
  const participants = useRef<{ [key: string]: any }>({});

  //내 미디어 스트림
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  //다른참가자 미디어 스트림 목록
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const localStream = useRef<any>(null);
  const iceCandidateQueue = useRef<{ [key: string]: RTCIceCandidate[] }>({});

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

  //구독 리스트 (기존참가자 목록, 새로운 참가자 정보)
  const handleSignal = (msg: StompJs.Message) => {
    const data = JSON.parse(msg.body);
    console.log('broad서버에서 온 메시지 : ', data);
  };

  const handlePrivateMessage = (msg: StompJs.Message) => {
    const data = JSON.parse(msg.body);
    console.log('서버에서 온 private메시지 : ', data);
    switch (data.id) {
      case 'newParticipantArrived':
        console.log('🟢 newParticipantArrived 이벤트 감지됨!');
        handleNewParticipant(data.name);
        break;
      case 'existingParticipants':
        handleExistingParticipants(data);
        break;
      case 'receiveVideoAnswer':
        handleVideoResponse(data);
        break;
      case 'iceCandidate':
        handleIceResponse(data);
        break;
    }
  };

  //방참가 pub(방 생성)-완료되면 참가자 리스트 sub
  const joinRoom = async () => {
    if (!!!userId || !!!channelId) {
      alert('userId와 channelId를 입력해주세요');
      return;
    }
    if (!isConnected) {
      console.log('WEBSOCKET 연결 끊김');
      return;
    }

    if (!localStream.current || localStream.current.active === false)
      localStream.current = await getLocalStream();
    if (localStream.current) {
      await activateLocalStream(localStream.current);
    }

    console.log('📡 방 참가 요청 시작!');
    console.log(
      '보내는메시지:',
      JSON.stringify({ id: 'joinHuddle', channelId, userId }),
    );
    stompClient.current?.publish({
      destination: `/app/signal`,
      body: JSON.stringify({ id: 'joinHuddle', channelId, userId }),
    });
  };
  //스트림이 활성되었지는지 offer생성 전에 확인
  const waitForMetadata = (videoElement: HTMLVideoElement) => {
    return new Promise<void>((resolve) => {
      videoElement.onloadedmetadata = () => {
        console.log('✅ Local Video Stream 메타데이터 로딩 완료');
        resolve();
      };
    });
  };
  const activateLocalStream = async (stream: MediaStream) => {
    if (!localVideoRef.current) return;

    localVideoRef.current.srcObject = stream;

    // ✅ 메타데이터 로딩을 기다림
    // await waitForMetadata(localVideoRef.current);

    // ✅ 재생 시도
    try {
      await localVideoRef.current.play();
      console.log('✅ Local Video Stream 활성화 완료');
    } catch (error) {
      console.error('❌ Local Video Stream 재생 실패:', error);
    }
  };

  useEffect(() => {
    if (localVideoRef.current && localStream.current) {
      console.log('🔄 Video 태그에 스트림 다시 할당');
      localVideoRef.current.srcObject = localStream.current;
    }
  }, [isInCall]);

  //미디어 스트림 생성
  const getLocalStream = async () => {
    try {
      console.log('🎥 새로운 LocalStream 요청 시작');

      // ✅ 기존 스트림이 있다면 모든 트랙을 정지시켜서 중복을 방지
      if (localStream.current && localStream.current.activate) {
        // console.log('🛑 기존 LocalStream 정지');
        // localStream.current.getTracks().forEach((track) => track.stop());
        console.log('기존 로컬스토리지 재사용');
        return localStream.current;
      }

      // ✅ 기존 스트림이 있더라도 항상 새로 가져오기
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStream.current = stream;
      return stream;
    } catch (error) {
      console.error('❌ 비디오 스트림 가져오기 실패:', error);
      return null;
    }
  };
  //방참가 완료 & 기존 참가자 목록ID 저장
  const handleExistingParticipants = async (data: any) => {
    const list = data.data;
    console.log('방입장 성공');
    setIsInCall(true);

    //내 sdp(peer)생성 후 offer전송 (생성이 완료되면 iceCandidate도 전송 : createWebRtcPeer())
    const localRtcPeer = await createWebRtcPeer(
      'sendonly',
      localVideoRef.current,
      (offerSdp: any) => {
        if (!offerSdp) {
          console.log('SDP가 null임!!!!!');
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

    //내 정보도 리스트에 저장
    participants.current[userId] = { rtcPeer: localRtcPeer };
    console.log('내 정보 로컬에 등록완료');

    //기존 참가자들 offer
    list.forEach((participantId: number) =>
      handleNewParticipant(participantId),
    );
    console.log('참가자 목록-existing:', participants.current);
  };

  //webRtc Peer생성 및 iceCandidate전송
  const createWebRtcPeer = (
    mode: 'sendonly' | 'recvonly',
    videoElement: HTMLVideoElement | null,
    callback: (offerSdp: string) => void,
    participantId?: number,
  ) => {
    console.log('create peer!');
    // ✅ 기존 PeerConnection이 있으면 재사용하지 않고 새로 생성
    const peerConnection = new RTCPeerConnection(RTC_CONFIGURATION);
    console.log('✅ 새 PeerConnection 생성 완료:', participantId);

    // ✅ 상대방 비디오 트랙 설정 (recvonly 모드일 경우)
    peerConnection.ontrack = (event) => {
      console.log('📸 Remote Track Received:', event);
      if (videoElement) {
        videoElement.srcObject = event.streams[0];
      }
    };

    // ✅ sendonly 모드일 때 Local Video Stream 설정
    if (mode === 'sendonly' && localStream.current) {
      localStream.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream.current!);
      });
      console.log('✅ Local Video Stream 트랙 추가 완료');
    } else {
      // ✅ recvonly 모드일 때 addTransceiver 사용
      peerConnection.addTransceiver('video', { direction: 'recvonly' });
      peerConnection.addTransceiver('audio', { direction: 'recvonly' });
      console.log('✅ Transceiver 설정 완료 (recvonly 모드)');
    }

    // ✅ ICE Candidate 저장 및 전송
    // peerConnection.onicecandidate = (event) => {
    //   if (event.candidate) {
    //     console.log('iceCandidate', event.candidate);
    //     if (
    //       !participants.current[participantId]?.rtcPeer.remoteDescription ||
    //       peerConnection.remoteDescription.type !== 'answer'
    //     ) {
    //       console.log(
    //         `⏳ ICE Candidate 대기 중 (Answer 없음): ${participantId}`,
    //       );
    //       if (!iceCandidateQueue.current[participantId]) {
    //         iceCandidateQueue.current[participantId] = [];
    //       }
    //       iceCandidateQueue.current[participantId].push(event.candidate);
    //     } else {
    //       console.log(
    //         `🚀 ICE Candidate 즉시 전송: ${mode === 'sendonly' ? userId : participantId}`,
    //       );
    //       stompClient.current?.publish({
    //         destination: `${STOMP_PATH.PUB_URL}`,
    //         body: JSON.stringify({
    //           id: 'onIceCandidate',
    //           candidate: event.candidate,
    //           sender: mode === 'sendonly' ? userId : participantId,
    //         }),
    //       });
    //     }
    //   }
    // };
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('iceCandidate 생성:', event.candidate);

        // ✅ **무조건 큐에 저장하고, handleVideoResponse에서 꺼내도록 함**
        if (!iceCandidateQueue.current[participantId]) {
          iceCandidateQueue.current[participantId] = [];
        }
        iceCandidateQueue.current[participantId].push(event.candidate);
        console.log(
          `⏳ ICE Candidate 저장 (Answer 기다리는 중): ${participantId}`,
        );
      }
    };

    // ✅ SDP Offer 생성
    peerConnection
      .createOffer()
      .then((offer) => {
        peerConnection.setLocalDescription(offer);
        console.log('✅ SDP Offer 생성 성공:', offer.sdp);
        callback(offer.sdp);
      })
      .catch((error) => {
        console.error('❌ SDP Offer 생성 실패:', error);
      });

    // ✅ 생성된 PeerConnection 객체 저장
    // participants.current[participantId] = { rtcPeer: peerConnection };

    return peerConnection;
  };

  //새로운 참가자 알림
  const handleNewParticipant = (participantId) => {
    console.log('new data : ', participantId);
    const newPeerId = participantId;
    if (newPeerId === userId) return; //내 id무시

    console.log(`새로운 참가자 입장 : ${newPeerId}`);

    const remoteVideo = createRemoteVideoElement(newPeerId);
    console.log('new peer 생성 시작');
    const remoteRtcPeer = createWebRtcPeer(
      'recvonly',
      remoteVideo,
      (offerSdp: any) => {
        if (!offerSdp) {
          console.log(`${participantId}:SDP가 null임!!!!!`);
          return;
        }
        const message = JSON.stringify({
          id: 'receiveVideoFrom',
          sdpOffer: offerSdp,
          sender: newPeerId,
        });
        console.log('보내는 메시지:', message);

        stompClient.current?.publish({
          destination: `${STOMP_PATH.PUB_URL}`,
          body: message,
        });
      },
      newPeerId,
    );

    participants.current[newPeerId] = { rtcPeer: remoteRtcPeer };
    console.log(`${participantId}정보 로컬에 등록완료`);
  };

  //상대방 비디오 생성
  const createRemoteVideoElement = (newPeerId: number) => {
    if (!videoRefs.current[newPeerId]) {
      const remoteVideo = document.createElement('video');
      remoteVideo.autoplay = true;
      videoRefs.current[newPeerId] = remoteVideo;
    }
    return videoRefs.current[newPeerId];
  };

  //sdp answer 처리
  const handleVideoResponse = (data: any) => {
    const { senderId, sdpAnswer } = data;
    console.log(`${senderId}의 sdp answer 받음`);

    const peerConnection = participants.current[senderId]?.rtcPeer;
    if (!peerConnection) {
      console.error(`❌ PeerConnection 없음: ${senderId}`);
      return;
    }

    peerConnection
      .setRemoteDescription(
        new RTCSessionDescription({
          type: 'answer',
          sdp: sdpAnswer,
        }),
      )
      .then(() => {
        console.log('✅ SDP Answer 적용 완료');

        // ✅ **여기서만 ICE Candidate 전송**
        const queuedCandidates = iceCandidateQueue.current[senderId] || [];
        console.log(`🧊 저장된 ICE Candidate 개수: ${queuedCandidates.length}`);

        queuedCandidates.forEach((candidate) => {});
        queuedCandidates.forEach((candidate) => {
          peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          console.log(`🚀 ICE Candidate 전송됨 → ${senderId}`, candidate);
          stompClient.current?.publish({
            destination: `${STOMP_PATH.PUB_URL}`,
            body: JSON.stringify({
              id: 'onIceCandidate',
              candidate: candidate,
              sender: senderId,
            }),
          });
        });

        // ✅ 적용 후 큐 초기화
        delete iceCandidateQueue.current[senderId];
      })
      .catch((error) => {
        console.error('❌ SDP Answer 적용 실패:', error);
      });
  };

  //ice answer 처리
  const handleIceResponse = (data: any) => {
    const { senderId, candidate } = data;
    console.log(`${senderId}의 ice answer 받음`);

    const peerConnection = participants.current[senderId]?.rtcPeer;

    if (!peerConnection) {
      console.warn(`⚠️ PeerConnection 없음, ICE Candidate 저장: ${senderId}`);
      if (!iceCandidateQueue.current[senderId]) {
        iceCandidateQueue.current[senderId] = [];
      }
      iceCandidateQueue.current[senderId].push(candidate);
      return;
    }

    // SDP Answer가 설정된 후 ICE Candidate 적용
    if (
      peerConnection.remoteDescription &&
      peerConnection.remoteDescription.type === 'answer'
    ) {
      console.log(`✅ ICE Candidate 즉시 적용: ${senderId}`);
      peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } else {
      console.log(`⏳ ICE Candidate 대기 (SDP Answer 미설정): ${senderId}`);
      if (!iceCandidateQueue.current[senderId]) {
        iceCandidateQueue.current[senderId] = [];
      }
      iceCandidateQueue.current[senderId].push(candidate);
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
          onChange={(e) => setUserId(Number(e.target.value))}
        />
        <label>채널아이디</label>
        <input
          className="border p-2"
          type="number"
          placeholder="channelId"
          value={channelId}
          onChange={(e) => setChannelId(Number(e.target.value))}
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

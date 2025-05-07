export const STOMP_SERVER_URL = process.env.NEXT_PUBLIC_STOMP_SERVER;

export const RTC_CONFIGURATION = {
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

export const STOMP_PATH = {
  PUB_URL: process.env.NEXT_PUBLIC_PUB_URL,
  SUB_URL: process.env.NEXT_PUBLIC_SUB_URL,
  PRIVATE_SUB_URL: process.env.NEXT_PUBLIC_PRIVATE_SUB_URL,
};

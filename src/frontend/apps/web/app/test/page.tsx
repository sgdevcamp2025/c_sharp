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
  return <div>page</div>;
}

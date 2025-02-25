'use client';

export default function page() {
  const constraints = {
    audio: true,
    video: { width: 1280, height: 720 },
  };

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((mediaStream) => {
      const video = document.querySelector('video');
      video.srcObject = mediaStream;
      video.onloadedmetadata = () => {
        video.play();
      };
    })
    .catch((err) => {
      // always check for errors at the end.
      console.error(`${err.name}: ${err.message}`);
    });

  return (
    <>
      <video className="border border-red-50"></video>
    </>
  );
}

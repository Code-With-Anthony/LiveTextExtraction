import React, { useState, useRef } from 'react';

const CameraCapture = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef(null);

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Camera not supported on this device.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }, // You can change 'user' to 'environment' for rear camera
      });
      videoRef.current.srcObject = stream;
      setIsCameraOn(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      if (error.name === 'NotAllowedError') {
        alert('Camera access is denied. Please allow camera permissions in Settings > Safari.');
      } else if (error.name === 'NotFoundError') {
        alert('No camera available on this device.');
      } else if (error.name === 'OverconstrainedError') {
        alert('Camera constraints are not supported.');
      } else {
        alert('Unexpected error occurred while accessing the camera.');
      }
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current.srcObject;
    const tracks = stream?.getTracks();
    tracks?.forEach((track) => track.stop());
    videoRef.current.srcObject = null;
    setIsCameraOn(false);
  };

  return (
    <div>
      
      <h2>Camera Capture</h2>
      <button onClick={isCameraOn ? stopCamera : startCamera}>
        {isCameraOn ? 'Stop Camera' : 'Start Camera'}
      </button>
      <div>
        <video
          ref={videoRef}
          width="400"
          height="300"
          autoPlay
          playsInline // This is required for iOS
          style={{ border: '1px solid black' }}
        />
      </div>
    </div>
  );
};

export default CameraCapture;

import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";

const TextExtraction = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [detectedNumber, setDetectedNumber] = useState("");
  const [isZoomed, setIsZoomed] = useState(false);

  const pattern = /^\d{3}-\d{3}-\d{3}$/;

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    return imageSrc;
  };

  const processImage = async (imageSrc) => {
    Tesseract.recognize(imageSrc, "eng").then(({ data: { text } }) => {
      const matches = text.match(pattern);
      if (matches) {
        const detectedText = matches[0];
        setDetectedNumber(detectedText);
        drawBoundingBox(); // Create the bounding box.
        handleZoom(true);
      } else {
        setDetectedNumber("");
        handleZoom(false);
      }
    });
  };

  const drawBoundingBox = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = webcamRef.current.video.videoWidth;
    const height = webcamRef.current.video.videoHeight;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(100, 100, width - 200, height - 200); // Adjust based on detected coordinates.
  };

  const handleZoom = (zoomIn) => {
    if (zoomIn && !isZoomed) {
      webcamRef.current.video.style.transform = "scale(1.5)";
      setIsZoomed(true);
    } else if (!zoomIn && isZoomed) {
      webcamRef.current.video.style.transform = "scale(1)";
      setIsZoomed(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const imageSrc = captureImage();
      if (imageSrc) {
        processImage(imageSrc);
      }
    }, 1000); // Capture and process every second.

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Camera Scanner App</h1>
      <div style={{ position: "relative", width: "100%", height: "400px" }}>
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          style={{
            width: "100%",
            height: "100%",
            transformOrigin: "center",
            transition: "transform 0.3s ease",
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        />
      </div>
      <div>
        <h2>Detected Number: {detectedNumber || "None"}</h2>
      </div>
    </div>
  );
};

export default TextExtraction;

// not able to detect number but detects the text perfectly

import { useRef, useState, useEffect } from "react";
import Tesseract from "tesseract.js";

const LiveAllBoundingBoxesHP = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("eng");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        processFrames();
      } catch (error) {
        console.error("Error accessing camera:", error);
        alert("Unable to access the camera");
      }
    };
    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const processFrames = () => {
    const processFrame = async () => {
      if (
        isProcessing ||
        !canvasRef.current ||
        !videoRef.current ||
        !overlayCanvasRef.current
      )
        return;

      setIsProcessing(true);

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      // Draw current frame on canvas
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/png");

      try {
        const { data } = await Tesseract.recognize(dataUrl, language);

        if (data.text.trim()) {
          setText(data.text);
          drawBoundingBoxes(data.words);
        } else {
          clearBoundingBoxes();
          setText(""); // Clear text when none detected
        }
      } catch (error) {
        console.error("Error recognizing text:", error);
      } finally {
        setIsProcessing(false);
      }
    };

    const loop = () => {
      processFrame();
      setTimeout(() => {
        requestAnimationFrame(loop);
      }, 500); // Process every 500ms
    };

    loop();
  };

  const drawBoundingBoxes = (words) => {
    const overlayCanvas = overlayCanvasRef.current;
    const overlayContext = overlayCanvas.getContext("2d");
    overlayCanvas.width = videoRef.current.videoWidth;
    overlayCanvas.height = videoRef.current.videoHeight;

    overlayContext.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    words.forEach((word) => {
      if (word.confidence > 70) {
        const { x0, y0, x1, y1 } = word.bbox;

        overlayContext.strokeStyle = "red";
        overlayContext.lineWidth = 2;
        overlayContext.strokeRect(x0, y0, x1 - x0, y1 - y0);

        overlayContext.font = "16px Arial";
        overlayContext.fillStyle = "blue";
        overlayContext.fillText(word.text, x0, y0 - 5);
      }
    });
  };

  const clearBoundingBoxes = () => {
    const overlayCanvas = overlayCanvasRef.current;
    const overlayContext = overlayCanvas.getContext("2d");
    overlayContext.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Live Text Scanner with Automatic Detection</h1>
      <div>
        <label>
          Select Language:{" "}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="eng">English</option>
            <option value="spa">Spanish</option>
            <option value="fra">French</option>
            <option value="deu">German</option>
          </select>
        </label>
      </div>
      <div style={{ position: "relative", display: "inline-block" }}>
        <video
          ref={videoRef}
          autoPlay
          style={{
            width: "100%",
            maxHeight: "400px",
            border: "1px solid black",
          }}
        ></video>
        <canvas
          ref={overlayCanvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
          }}
        ></canvas>
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      <h3>Recognized Text:</h3>
      <p>{text || "No text detected."}</p>
    </div>
  );
};

export default LiveAllBoundingBoxesHP;

//higher precision

// Level - 1

import { useRef, useState, useEffect } from "react";
import Tesseract from "tesseract.js";

const LiveTextScanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [text, setText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [language, setLanguage] = useState("eng");

  useEffect(() => {
    // Access the camera when the component mounts
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        alert("Unable to access the camera");
      }
    };
    startCamera();

    // Cleanup: Stop the video stream when the component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    // Process frames every 2 seconds
    const interval = setInterval(() => {
      if (!isScanning) captureFrame();
    }, 2000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [isScanning]);

  const captureFrame = async () => {
    if (!canvasRef.current || !videoRef.current) return;

    // Draw the current frame from the video on the canvas
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    // Preprocessing: Convert to grayscale
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const grayScaleData = convertToGrayscale(imageData);
    context.putImageData(grayScaleData, 0, 0);

    // Extract the image as a data URL and run OCR
    const dataUrl = canvas.toDataURL("image/png");
    setIsScanning(true);
    setText("Scanning...");

    try {
      const { data } = await Tesseract.recognize(dataUrl, language, {
        logger: (info) => console.log(info), // Logs OCR progress
      });
      setText(data.text);
    } catch (error) {
      console.error("Error recognizing text:", error);
      setText("Failed to recognize text.");
    } finally {
      setIsScanning(false);
    }
  };

  const convertToGrayscale = (imageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3; // Average RGB values
      data[i] = avg; // Red
      data[i + 1] = avg; // Green
      data[i + 2] = avg; // Blue
    }
    return imageData;
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Live Text Scanner</h1>
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
      <video
        ref={videoRef}
        autoPlay
        style={{
          width: "100%",
          maxHeight: "400px",
          border: "1px solid black",
          marginTop: "10px",
        }}
      ></video>
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      <h3>Recognized Text:</h3>
      <p>{text || "No text recognized yet."}</p>
    </div>
  );
};

export default LiveTextScanner;

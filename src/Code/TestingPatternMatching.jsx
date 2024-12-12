// Working with optimisation
// import { useRef, useState, useEffect } from "react";
// import Tesseract from "tesseract.js";

// export default function TestingPatternMatching() {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const overlayCanvasRef = useRef(null);

//   const [text, setText] = useState("");
//   const [isCameraActive, setIsCameraActive] = useState(true);
//   const [isTextDetected, setIsTextDetected] = useState(false);
//   const [processedImage, setProcessedImage] = useState(""); // State to store processed image data URL
//   const [zoomLevel, setZoomLevel] = useState(1); // New: State for the zoom level
//   const [isZoomSupported, setIsZoomSupported] = useState(false);
//   const [zoomRange, setZoomRange] = useState({ min: 0, max: 0 });
//   let isProcessing = false;

//   useEffect(() => {
//     const checkZoomSupport = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { facingMode: "environment" },
//         });

//         const videoTrack = stream.getVideoTracks()[0];
//         const capabilities = videoTrack.getCapabilities();

//         if (capabilities.zoom) {
//           setIsZoomSupported(true);
//           setZoomRange({
//             min: capabilities.zoom.min,
//             max: capabilities.zoom.max,
//           });
//         } else {
//           setIsZoomSupported(false);
//         }

//         // Stop the track to prevent the camera from staying on
//         videoTrack.stop();
//       } catch (error) {
//         console.error("Error checking zoom support:", error);
//         setIsZoomSupported(false);
//       }
//     };

//     checkZoomSupport();
//   }, []);

//   useEffect(() => {
//     const startCamera = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { facingMode: "environment" },
//         });

//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//           videoRef.current.onloadedmetadata = () => {
//             videoRef.current
//               .play()
//               .catch((error) => console.error("Play error:", error));
//           };
//         }
//       } catch (error) {
//         console.error("Error accessing the camera:", error);
//       }
//     };

//     if (isCameraActive) {
//       startCamera();
//       const intervalId = setInterval(processFrames, 2000); // Process frames at intervals of 2 seconds
//       return () => {
//         clearInterval(intervalId);
//         if (videoRef.current?.srcObject) {
//           videoRef.current.srcObject
//             .getTracks()
//             .forEach((track) => track.stop());
//         }
//       };
//     }
//   }, [isCameraActive]);

//   useEffect(() => {
//     if (videoRef.current) {
//       applyZoom(zoomLevel);
//     }
//   }, [zoomLevel]);

//   const processFrames = async () => {
//     if (
//       isTextDetected ||
//       isProcessing ||
//       !videoRef.current ||
//       !canvasRef.current
//     )
//       return;

//     const video = videoRef.current;
//     const canvas = canvasRef.current;

//     if (
//       !video ||
//       !canvas ||
//       video.videoWidth === 0 ||
//       video.videoHeight === 0
//     ) {
//       console.log("Video feed is getting ready....");
//       return;
//     }

//     isProcessing = true;

//     try {
//       // Prepare the canvas
//       prepareCanvas(video, canvas);

//       // Get blob from canvas
//       const blob = await canvasToBlob(canvas);

//       // Update the processed image state with the blob's data URL
//       const dataURL = URL.createObjectURL(blob);
//       setProcessedImage(dataURL);

//       // Perform OCR
//       const ocrResult = await performOCR(blob);

//       // Analyze OCR Results
//       handleOCRResult(ocrResult);
//     } catch (error) {
//       console.error("Error in frame processing:", error);
//     } finally {
//       isProcessing = false;
//     }
//   };

//   const prepareCanvas = (video, canvas) => {
//     canvas.width = video.videoWidth / 2;
//     canvas.height = video.videoHeight / 2;

//     const context = canvas.getContext("2d");
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);

//     return context;
//   };

//   const canvasToBlob = (canvas) =>
//     new Promise((resolve) => canvas.toBlob(resolve, "image/png"));

//   const performOCR = async (blob) => {
//     try {
//       return await Tesseract.recognize(blob, "eng");
//     } catch (error) {
//       console.error("Error during OCR:", error);
//       throw error;
//     }
//   };

//   const handleOCRResult = (ocrResult) => {
//     const targetPattern = /\b\d{3}-\d{3}-\d{3}\b/;

//     const matchedWord = ocrResult.data.words.find(
//       (word) => targetPattern.test(word.text) && word.confidence > 80
//     );

//     if (matchedWord) {
//       console.log("Matched Pattern:", matchedWord.text);
//       drawBoundingBoxes([matchedWord]);
//       setText(matchedWord.text);
//       stopCamera();
//       setIsTextDetected(true);
//     } else {
//       clearBoundingBoxes();
//       setText("");
//     }
//   };

//   const drawBoundingBoxes = (words) => {
//     const overlayCanvas = overlayCanvasRef.current;
//     const overlayContext = overlayCanvas.getContext("2d");
//     overlayCanvas.width = videoRef.current.videoWidth;
//     overlayCanvas.height = videoRef.current.videoHeight;

//     overlayContext.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

//     words.forEach((word) => {
//       const { x0, y0, x1, y1 } = word.bbox;

//       overlayContext.strokeStyle = "yellow";
//       overlayContext.lineWidth = 12;
//       overlayContext.strokeRect(x0, y0, x1 - x0, y1 - y0);

//       overlayContext.font = "16px Arial";
//       overlayContext.fillStyle = "blue";
//       overlayContext.fillText(word.text, x0, y0 - 5);
//     });
//   };

//   const clearBoundingBoxes = () => {
//     const overlayCanvas = overlayCanvasRef.current;
//     const overlayContext = overlayCanvas.getContext("2d");
//     overlayContext.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
//   };

//   const applyZoom = (zoomLevel) => {
//     const videoTrack = videoRef.current?.srcObject?.getVideoTracks()[0];

//     if (!videoTrack) {
//       console.log("Video track not available");
//       return;
//     }

//     const capabilities = videoTrack.getCapabilities();
//     if (capabilities.zoom) {
//       videoTrack.applyConstraints({
//         advanced: [{ zoom: zoomLevel }],
//       });
//     } else {
//       console.log("Zoom not supported");
//     }
//   };

//   const handleZoomChange = (event) => {
//     const newZoom = Number(event.target.value);
//     setZoomLevel(newZoom);
//   };

//   const stopCamera = () => {
//     clearBoundingBoxes();
//     const stream = videoRef.current.srcObject;
//     const tracks = stream.getTracks();
//     tracks.forEach((track) => track.stop());
//     setIsCameraActive(false);
//   };

//   const step = (zoomRange.max - zoomRange.min) / 10;

//   return (
//     <div style={{ position: "relative" }}>
//       {isCameraActive && (
//         <>
//           <video ref={videoRef} style={{ width: "100%", height: "auto" }} />
//           <canvas
//             ref={overlayCanvasRef}
//             style={{ position: "absolute", top: 0, left: 0 }}
//           />
//           <canvas ref={canvasRef} style={{ display: "none" }} />
//         </>
//       )}
//       <div style={{ marginTop: "10px", fontSize: "18px", fontWeight: "bold" }}>
//         Detected Text: {text || "No text detected"}
//       </div>

//       <div style={{ marginTop: "20px" }}>
//         <label htmlFor="zoomRange" style={{ fontWeight: "bold" }}>
//           Zoom: {zoomLevel}
//         </label>
//         <input
//           id="zoomRange"
//           type="range"
//           min={zoomRange.min}
//           max={zoomRange.max}
//           step={step}
//           value={zoomLevel}
//           onChange={handleZoomChange}
//           style={{ width: "100%" }}
//         />
//       </div>

//       <div style={{ marginTop: "10px" }}>
//         <h3>Processed Image:</h3>
//         {processedImage && (
//           <img
//             src={processedImage}
//             alt="Processed frame"
//             style={{ maxWidth: "100%", height: "auto" }}
//           />
//         )}
//       </div>
//       <div>
//         <strong>Does Device support Zoom : </strong>{" "}
//         {isZoomSupported ? "Yes" : "No"}
//       </div>
//       {isZoomSupported && (
//         <div>
//           <strong>Zoom Range:</strong> Min: {zoomRange.min}, Max:{" "}
//           {zoomRange.max}
//         </div>
//       )}
//     </div>
//   );
// }


// testing more 7 optimisations
// import { useRef, useState, useEffect } from "react";
// import Tesseract from "tesseract.js";
// import levenshtein from "fast-levenshtein"; // Install using: npm install fast-levenshtein

// export default function TestingPatternMatching() {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const overlayCanvasRef = useRef(null);

//   const [text, setText] = useState("");
//   const [processedImage, setProcessedImage] = useState("");
//   const [detectedTextLog, setDetectedTextLog] = useState([]);
//   const [zoomLevel, setZoomLevel] = useState(1);
//   const [isZoomSupported, setIsZoomSupported] = useState(false);
//   const [zoomRange, setZoomRange] = useState({ min: 0, max: 0 });

//   let isProcessing = false;
//   let debouncedTimer = null;

//   useEffect(() => {
//     checkZoomSupport();
//     startCamera();
//     const intervalId = setInterval(() => processFrames(), 2000);
//     return () => cleanup(intervalId);
//   }, []);

//   useEffect(() => {
//     if (videoRef.current) {
//       applyZoom(zoomLevel);
//     }
//   }, [zoomLevel]);

//   const checkZoomSupport = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: "environment" },
//       });
//       const videoTrack = stream.getVideoTracks()[0];
//       const capabilities = videoTrack.getCapabilities();
//       if (capabilities.zoom) {
//         setIsZoomSupported(true);
//         setZoomRange({
//           min: capabilities.zoom.min,
//           max: capabilities.zoom.max,
//         });
//       }
//       videoTrack.stop();
//     } catch (error) {
//       console.error("Error checking zoom support:", error);
//       setIsZoomSupported(false);
//     }
//   };

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: "environment" },
//       });
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current
//           .play()
//           .catch((error) => console.error("Error playing the video:", error));
//       }
//     } catch (error) {
//       console.error("Error accessing the camera:", error);
//     }
//   };

//   const cleanup = (intervalId) => {
//     clearInterval(intervalId);
//     if (videoRef.current?.srcObject) {
//       videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
//     }
//   };

//   const processFrames = async () => {
//     if (isProcessing || !videoRef.current || !canvasRef.current) return;

//     isProcessing = true;

//     try {
//       prepareCanvas(videoRef.current, canvasRef.current);
//       const blob = await canvasToBlob(canvasRef.current);
//       const dataURL = URL.createObjectURL(blob);
//       setProcessedImage(dataURL);

//       if (debouncedTimer) clearTimeout(debouncedTimer);
//       debouncedTimer = setTimeout(() => processOCR(blob), 500);
//     } catch (error) {
//       console.error("Error processing frames:", error);
//     } finally {
//       isProcessing = false;
//     }
//   };

//   const processOCR = async (blob) => {
//     try {
//       const { data } = await Tesseract.recognize(blob, "eng");
//       URL.revokeObjectURL(blob);
//       const matchedWord = filterResults(data.words);

//       const detectedLogs = data.words.map(({ text, confidence }) => ({
//         text,
//         confidence,
//       }));
//       setDetectedTextLog(detectedLogs);

//       if (matchedWord) {
//         setText(matchedWord.text);
//         drawBoundingBoxes([matchedWord]);
//         stopCamera();
//       } else {
//         clearBoundingBoxes();
//       }
//     } catch (error) {
//       console.error("Error during OCR:", error);
//     }
//   };

//   const prepareCanvas = (video, canvas) => {
//     canvas.width = video.videoWidth / 2;
//     canvas.height = video.videoHeight / 2;
//     const context = canvas.getContext("2d");
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);
//     return context;
//   };

//   const canvasToBlob = (canvas) =>
//     new Promise((resolve) => canvas.toBlob(resolve, "image/png"));

//   const filterResults = (words) => {
//     const targetPattern = "123-456-789";
//     const minConfidence = 80;
//     let highestConfidenceMatch = null;

//     words.forEach((word) => {
//       const distance = levenshtein.get(word.text, targetPattern);
//       if (distance <= 2 && word.confidence > minConfidence) {
//         if (
//           !highestConfidenceMatch ||
//           word.confidence > highestConfidenceMatch.confidence
//         ) {
//           highestConfidenceMatch = word;
//         }
//       }
//     });

//     return highestConfidenceMatch;
//   };

//   const drawBoundingBoxes = (words) => {
//     const overlayCanvas = overlayCanvasRef.current;
//     const context = overlayCanvas.getContext("2d");
//     overlayCanvas.width = videoRef.current.videoWidth;
//     overlayCanvas.height = videoRef.current.videoHeight;

//     context.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
//     words.forEach(({ bbox, text }) => {
//       const { x0, y0, x1, y1 } = bbox;
//       context.strokeStyle = "yellow";
//       context.lineWidth = 12;
//       context.strokeRect(x0, y0, x1 - x0, y1 - y0);
//       context.font = "16px Arial";
//       context.fillStyle = "blue";
//       context.fillText(text, x0, y0 - 5);
//     });
//   };

//   const clearBoundingBoxes = () => {
//     const context = overlayCanvasRef.current.getContext("2d");
//     context.clearRect(
//       0,
//       0,
//       overlayCanvasRef.current.width,
//       overlayCanvasRef.current.height
//     );
//   };

//   const applyZoom = (zoomLevel) => {
//     const videoTrack = videoRef.current?.srcObject?.getVideoTracks()[0];
//     if (videoTrack) {
//       videoTrack.applyConstraints({ advanced: [{ zoom: zoomLevel }] });
//     }
//   };

//   const handleZoomChange = (event) => setZoomLevel(Number(event.target.value));

//   const stopCamera = () => {
//     clearBoundingBoxes();
//     const stream = videoRef.current.srcObject;
//     if (stream) stream.getTracks().forEach((track) => track.stop());
//   };

//   const step = (zoomRange.max - zoomRange.min) / 10;

//   return (
//     <div style={{ position: "relative" }}>
//       <video ref={videoRef} style={{ width: "100%" }} />
//       <canvas
//         ref={overlayCanvasRef}
//         style={{ position: "absolute", top: 0, left: 0 }}
//       />
//       <canvas ref={canvasRef} style={{ display: "none" }} />
//       <div>Detected Text: {text || "No text detected"}</div>

//       {processedImage && <img src={processedImage} alt="Processed frame" />}

//       {isZoomSupported && (
//         <input
//           type="range"
//           min={zoomRange.min}
//           max={zoomRange.max}
//           step={step}
//           value={zoomLevel}
//           onChange={handleZoomChange}
//         />
//       )}

//       <ul style={{ maxHeight: "200px", overflowY: "auto" }}>
//         {detectedTextLog.map((log, index) => (
//           <li key={index}>
//             Text: <strong>{log.text}</strong> | Confidence:{" "}
//             <strong>{log.confidence}%</strong>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }


//(contains errors in some cases and edges)
// import { useRef, useState, useEffect } from "react";
// import Tesseract from "tesseract.js";
// import levenshtein from "fast-levenshtein";

// export default function TestingPatternMatching() {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const overlayCanvasRef = useRef(null);

//   const [text, setText] = useState("");
//   const [processedImage, setProcessedImage] = useState("");
//   const [detectedTextLog, setDetectedTextLog] = useState([]);
//   const [zoomLevel, setZoomLevel] = useState(1);
//   const [isZoomSupported, setIsZoomSupported] = useState(false);
//   const [zoomRange, setZoomRange] = useState({ min: 0, max: 0 });

//   let isProcessing = false;
//   let debouncedTimer = null;

//   useEffect(() => {
//     checkZoomSupport();
//     startCamera();
//     const intervalId = setInterval(() => processFrames(), 2000);
//     return () => cleanup(intervalId);
//   }, []);

//   useEffect(() => {
//     if (videoRef.current) {
//       applyZoom(zoomLevel);
//     }
//   }, [zoomLevel]);

//   const checkZoomSupport = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: "environment" },
//       });
//       const videoTrack = stream.getVideoTracks()[0];
//       const capabilities = videoTrack.getCapabilities();
//       if (capabilities.zoom) {
//         setIsZoomSupported(true);
//         setZoomRange({
//           min: capabilities.zoom.min,
//           max: capabilities.zoom.max,
//         });
//       }
//       videoTrack.stop();
//     } catch (error) {
//       console.error("Error checking zoom support:", error);
//       setIsZoomSupported(false);
//     }
//   };

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: { exact: "environment" } },
//       });
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current
//           .play()
//           .catch((error) => console.error("Error playing the video:", error));
//       }
//       else{
//         alert("faillllle")
//       }
//     } catch (error) {
//       console.error("Error accessing the camera:", error);
//     }
//   };

//   const cleanup = (intervalId) => {
//     clearInterval(intervalId);
//     if (videoRef.current?.srcObject) {
//       videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
//     }
//   };

//   const processFrames = async () => {
//     if (isProcessing || !videoRef.current || !canvasRef.current) return;

//     isProcessing = true;

//     try {
//       prepareCanvas(videoRef.current, canvasRef.current);
//       const blob = await canvasToBlob(canvasRef.current);
//       const dataURL = URL.createObjectURL(blob);
//       setProcessedImage(dataURL);

//       if (debouncedTimer) clearTimeout(debouncedTimer);
//       debouncedTimer = setTimeout(() => processOCR(blob), 500);
//     } catch (error) {
//       console.error("Error processing frames:", error);
//     } finally {
//       isProcessing = false;
//     }
//   };

//   const processOCR = async (blob) => {
//     try {
//       const { data } = await Tesseract.recognize(blob, "eng");
//       URL.revokeObjectURL(blob);
//       const matchedWord = filterResults(data.words);

//       const detectedLogs = data.words.map(({ text, confidence }) => ({
//         text,
//         confidence,
//       }));
//       setDetectedTextLog(detectedLogs);

//       if (matchedWord) {
//         setText(matchedWord.text);
//         drawBoundingBoxes([matchedWord]);
//         clearInterval(intervalId);
//         stopCamera();
//       } else {
//         clearBoundingBoxes();
//       }
//     } catch (error) {
//       console.error("Error during OCR:", error);
//     }
//   };

//   const prepareCanvas = (video, canvas) => {
//     canvas.width = video.videoWidth / 2;
//     canvas.height = video.videoHeight / 2;
//     const context = canvas.getContext("2d");
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);
//     return context;
//   };

//   const canvasToBlob = (canvas) =>
//     new Promise((resolve) => canvas.toBlob(resolve, "image/png"));

//   const filterResults = (words) => {
//     console.log("wrods: ", words)
//     const targetPattern = "100-085-050";
//     const minConfidence = 85;
//     let highestConfidenceMatch = null;

//     words.forEach((word) => {
//       if (targetPattern.test(word.text) && word.confidence > minConfidence) {
//         highestConfidenceMatch = word;
//       } else {
//         const distance = levenshtein.get(word.text, '000-000-000');
//         if (distance <= 2 && word.confidence > minConfidence) {
//           if (
//             !highestConfidenceMatch ||
//             word.confidence > highestConfidenceMatch.confidence
//           ) {
//             highestConfidenceMatch = word;
//           }
//         }
//       }
//     });

//     return highestConfidenceMatch;
//   };

//   const drawBoundingBoxes = (words) => {
//     const overlayCanvas = overlayCanvasRef.current;
//     const context = overlayCanvas.getContext("2d");
//     overlayCanvas.width = videoRef.current.videoWidth;
//     overlayCanvas.height = videoRef.current.videoHeight;

//     context.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
//     words.forEach(({ bbox, text }) => {
//       const { x0, y0, x1, y1 } = bbox;
//       context.strokeStyle = "yellow";
//       context.lineWidth = 4;
//       context.strokeRect(x0, y0, x1 - x0, y1 - y0);
//       context.font = "16px Arial";
//       context.fillStyle = "blue";
//       context.fillText(text, x0, y0 - 5);
//     });
//   };

//   const clearBoundingBoxes = () => {
//     const context = overlayCanvasRef.current.getContext("2d");
//     context.clearRect(
//       0,
//       0,
//       overlayCanvasRef.current.width,
//       overlayCanvasRef.current.height
//     );
//   };

//   const applyZoom = (zoomLevel) => {
//     const videoTrack = videoRef.current?.srcObject?.getVideoTracks()[0];
//     if (videoTrack) {
//       videoTrack.applyConstraints({ advanced: [{ zoom: zoomLevel }] });
//     }
//   };

//   const handleZoomChange = (event) => setZoomLevel(Number(event.target.value));

//   const stopCamera = () => {
//     clearBoundingBoxes();
//     const stream = videoRef.current.srcObject;
//     if (stream) stream.getTracks().forEach((track) => track.stop());
//   };

//   const step = (zoomRange.max - zoomRange.min) / 10;

//   return (
//     <div style={{ position: "relative" }}>
//       <video ref={videoRef} style={{ width: "100%" }} />
//       <canvas
//         ref={overlayCanvasRef}
//         style={{ position: "absolute", top: 0, left: 0 }}
//       />
//       <canvas ref={canvasRef} style={{ display: "none" }} />
//       <div>Detected Text: {text || "No text detected"}</div>

//       {processedImage && <img src={processedImage} alt="Processed frame" />}

//       {isZoomSupported && (
//         <input
//           type="range"
//           min={zoomRange.min}
//           max={zoomRange.max}
//           step={step}
//           value={zoomLevel}
//           onChange={handleZoomChange}
//         />
//       )}

//       <ul style={{ maxHeight: "200px", overflowY: "auto" }}>
//         {detectedTextLog.map((log, index) => (
//           <li key={index}>
//             Text: <strong>{log.text}</strong> | Confidence:{" "}
//             <strong>{log.confidence}%</strong>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }


//removing the errors and making it run
import React, { useEffect, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';
import levenshtein from 'fast-levenshtein';
import { data } from '@tensorflow/tfjs';

const TestingPatternMatching = () => {
  const [text, setText] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const intervalId = useRef(null);
  const isProcessing = useRef(false);
  const debouncedTimer = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const targetPattern = /\d{3}-\d{3}-\d{3}/; // Example pattern for a number like '123-456-789'
  const minConfidence = 0.8; // Minimum OCR confidence threshold

  useEffect(() => {
    checkCameraPermissionAndStart();
    return () => stopCamera();
  }, []);

  const checkCameraPermissionAndStart = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' });
      if (result.state === 'granted') {
        // If permission is already granted, start the camera
        console.log('Camera permission granted');
        startCamera();
      } else if (result.state === 'prompt') {
        // If permission needs to be prompted, log it (browser will prompt)
        console.log('Requesting camera access');
        startCamera();
      } else {
        // If permission is denied, inform the user to enable it from settings
        alert('Camera permission is required. Please enable it in Safari > Settings > Camera.');
      }
    } catch (error) {
      console.error('Error checking camera permissions:', error);
    }
  };

  const startCamera = async () => {
    try {
      // Stop existing video tracks
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
  
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
      } catch (error) {
        alert("error occured: ",error)
      }

  
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
  
        // Wait for metadata to load before playing
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = resolve;
        });
  
        try {
          await videoRef.current.play();
        } catch (error) {
          console.warn("Autoplay blocked. User interaction required.");
        }

        // Call processFrames at regular intervals (e.g., every 500ms)
        intervalId.current = setInterval(() => processFrames(), 500);
      }
    } catch (error) {
      console.error("Error accessing the camera:", error);
    }
  };
  

  const stopCamera = () => {
    if (intervalId.current) clearInterval(intervalId.current);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  const processFrames = () => {
    if (!videoRef.current || !canvasRef.current || isProcessing.current) return;
    isProcessing.current = true;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const video = videoRef.current;
    
    canvas.width = video.videoWidth / 2;
    canvas.height = video.videoHeight / 2;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (debouncedTimer.current) clearTimeout(debouncedTimer.current);
      debouncedTimer.current = setTimeout(() => processOCR(blob), 500);
    });
  };

  const processOCR = (blob) => {
    if (!blob) return;
    const dataURL = URL.createObjectURL(blob);
    
    Tesseract.recognize(dataURL, 'eng')
      .then(({ data: { words } }) => {
        console.log("data: ", data)
        const matchedWord = words.find(word => targetPattern.test(word.text) && word.confidence > minConfidence);
        
        if (matchedWord) {
          console.log("we came here: ", matchedWord)
          setText(matchedWord.text);
          drawBoundingBoxes([matchedWord]);
          clearInterval(intervalId.current); // Stop further frame processing
          stopCamera(); // Stop the camera
        } else {
          const closestWord = words.reduce((closest, word) => {
            const distance = levenshtein.get(word.text, '000-000-000');
            if (!closest || distance < closest.distance) {
              return { word, distance };
            }
            return closest;
          }, null);

          if (closestWord && closestWord.distance < 3) {
            setText(closestWord.word.text);
            drawBoundingBoxes([closestWord.word]);
            clearInterval(intervalId.current); // Stop further frame processing
            stopCamera(); // Stop the camera
          }
        }
      })
      .catch((error) => {
        console.error('Error processing OCR:', error);
      })
      .finally(() => {
        URL.revokeObjectURL(dataURL); // Release the object URL to prevent memory leaks
        isProcessing.current = false;
      });
  };

  const drawBoundingBoxes = (words) => {
    const overlayCanvas = overlayCanvasRef.current;
    const video = videoRef.current;
    
    if (!overlayCanvas || !video) return;
    
    overlayCanvas.width = video.videoWidth / 2;
    overlayCanvas.height = video.videoHeight / 2;
    const context = overlayCanvas.getContext('2d');
    context.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    
    context.strokeStyle = 'red';
    context.lineWidth = 2;
    words.forEach((word) => {
      const { x0, y0, x1, y1 } = word.bbox;
      context.strokeRect(x0 / 2, y0 / 2, (x1 - x0) / 2, (y1 - y0) / 2);
    });
  };

  const handleZoomChange = (e) => {
    setZoomLevel(e.target.value);
    const videoTrack = videoRef.current?.srcObject?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.applyConstraints({ advanced: [{ zoom: zoomLevel }] })
        .catch((error) => console.error('Zoom failed:', error));
    }
  };

  return (
    <div>
      <h1>Pattern Matching OCR</h1>
      <video ref={videoRef} autoPlay playsInline></video>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      <canvas ref={overlayCanvasRef} style={{ position: 'absolute', top: 0, left: 0 }}></canvas>
      
      <div>
        <label>Zoom Level: </label>
        <input 
          type="range" 
          min="1" 
          max="3" 
          step="0.1" 
          value={zoomLevel} 
          onChange={handleZoomChange} 
        />
      </div>
      <p>Matched Text: {text}</p>
    </div>
  );
};

export default TestingPatternMatching;

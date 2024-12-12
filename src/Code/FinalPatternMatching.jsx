//text is getting detected, bounding box is also getting created, less time taken
// import { useRef, useState, useEffect } from "react";
// import Tesseract from "tesseract.js";

// export default function LivePatternMatching() {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const overlayCanvasRef = useRef(null);

//   const [text, setText] = useState("");
//   const [isCameraActive, setIsCameraActive] = useState(true);
//   const [isTextDetected, setIsTextDetected] = useState(false);
//   let isProcessing = false;

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
//       const intervalId = setInterval(processFrames, 500); // Process frames at intervals
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

//   const processFrames = async () => {
//     if (isTextDetected || isProcessing) return;

//     if (!videoRef.current || !canvasRef.current) return;

//     const canvas = canvasRef.current;
//     const video = videoRef.current;

//     if (video.videoWidth === 0 || video.videoHeight === 0) {
//       console.warn("Video feed not ready.");
//       return;
//     } else {
//       console.log("videofeed ready: ");
//     }

//     //we are dividing by 2 to reduce the resolution by 50% for better ocr processing
//     canvas.width = video.videoWidth / 2;
//     canvas.height = video.videoHeight / 2;

//     const context = canvas.getContext("2d");
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);

//     const blob = await new Promise((resolve) =>
//       canvas.toBlob(resolve, "image/png")
//     );

//     try {
//       const { data } = await Tesseract.recognize(blob, "eng");
//       const targetPattern = /\b\d{3}-\d{3}-\d{3}\b/;
//       const matchedWord = data.words.find(
//         (word) => targetPattern.test(word.text) && word.confidence > 80
//       );

//       if (matchedWord) {
//         console.log("Matched Pattern:", matchedWord.text);
//         drawBoundingBoxes([matchedWord]);
//         setText(matchedWord.text);
//         zoomCamera();
//         stopCamera();
//         setIsTextDetected(true);
//       } else {
//         clearBoundingBoxes();
//         setText("");
//       }
//     } catch (error) {
//       console.error("Error in Tesseract recognition:", error);
//       setTimeout(processFrames, 1000);
//     }

//     isProcessing = false;
//   };

//   const drawBoundingBoxes = (words) => {
//     const overlayCanvas = overlayCanvasRef.current;
//     const overlayContext = overlayCanvas.getContext("2d");
//     overlayCanvas.width = videoRef.current.videoWidth;
//     overlayCanvas.height = videoRef.current.videoHeight;

//     overlayContext.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

//     words.forEach((word) => {
//       const { x0, y0, x1, y1 } = word.bbox;

//       // Draw bounding box
//       overlayContext.strokeStyle = "yellow"; // Yellow color for matched pattern
//       overlayContext.lineWidth = 12; // Width of the rectangle
//       overlayContext.strokeRect(x0, y0, x1 - x0, y1 - y0);

//       // Draw text label
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

//   const zoomCamera = () => {
//     const videoTrack = videoRef.current.srcObject.getVideoTracks()[0];
//     const capabilities = videoTrack.getCapabilities();
//     if (capabilities.zoom) {
//       const settings = videoTrack.getSettings();
//       const maxZoom = capabilities.zoom.max;
//       const newZoom = Math.min(settings.zoom + 2, maxZoom); // Increase zoom by 2x or cap at max
//       videoTrack.applyConstraints({
//         advanced: [{ zoom: newZoom, focus: "continuous" }],
//       });
//     } else {
//       console.log("Zoom not supported");
//     }
//   };

//   const stopCamera = () => {
//     const stream = videoRef.current.srcObject;
//     const tracks = stream.getTracks();
//     tracks.forEach((track) => track.stop()); // Stop all tracks
//     setIsCameraActive(false); // Deactivate camera
//   };

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
//     </div>
//   );
// }

//great and fast working, function and logic are separated to keep it light weight
// import { useRef, useState, useEffect } from "react";
// import Tesseract from "tesseract.js";

// export default function FinalPatternMatching() {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const overlayCanvasRef = useRef(null);

//   const [text, setText] = useState("");
//   const [isCameraActive, setIsCameraActive] = useState(true);
//   const [isTextDetected, setIsTextDetected] = useState(false);
//   let isProcessing = false;
//   //   let lastProcessed = Date.now();

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
//       const intervalId = setInterval(processFrames, 2000); // Process frames at intervals of 2 second
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

//   const processFrames = async () => {
//     // const now = Date.now();
//     // if (now - lastProcessed < 1000 || isProcessing) return; // 1-second throttle
//     // lastProcessed = now;

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

//     // Reduce processing frequency
//     isProcessing = true;

//     try {
//       // Step 1: Prepare the canvas
//       const context = prepareCanvas(video, canvas);

//       // Step 2: Get OCR Results
//       const blob = await canvasToBlob(canvas);
//       const ocrResult = await performOCR(blob);

//       // Step 3: Analyze OCR Results
//       handleOCRResult(ocrResult);
//     } catch (error) {
//       console.error("Error in frame processing:", error);
//     } finally {
//       isProcessing = false;
//     }
//   };

//   // Helper: Prepare canvas with reduced resolution
//   const prepareCanvas = (video, canvas) => {
//     canvas.width = video.videoWidth / 2;
//     canvas.height = video.videoHeight / 2;

//     const context = canvas.getContext("2d");
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);

//     return context;
//   };

//   // Helper: Convert canvas to blob
//   const canvasToBlob = (canvas) =>
//     new Promise((resolve) => canvas.toBlob(resolve, "image/png"));

//   // Helper: Perform OCR
//   const performOCR = async (blob) => {
//     try {
//       return await Tesseract.recognize(blob, "eng");
//     } catch (error) {
//       console.error("Error during OCR:", error);
//       throw error;
//     }
//   };

//   // Helper: Analyze OCR results and update UI
//   const handleOCRResult = (ocrResult) => {
//     const targetPattern = /\b\d{3}-\d{3}-\d{3}\b/;
//     const matchedWord = ocrResult.data.words.find(
//       (word) => targetPattern.test(word.text) && word.confidence > 80
//     );

//     if (matchedWord) {
//       console.log("Matched Pattern:", matchedWord.text);
//       drawBoundingBoxes([matchedWord]);
//       setText(matchedWord.text);
//       zoomCamera();
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

//       // Draw bounding box
//       overlayContext.strokeStyle = "yellow"; // Yellow color for matched pattern
//       overlayContext.lineWidth = 12; // Width of the rectangle
//       overlayContext.strokeRect(x0, y0, x1 - x0, y1 - y0);

//       // Draw text label
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

//   const zoomCamera = () => {
//     const videoTrack = videoRef.current.srcObject.getVideoTracks()[0];
//     const capabilities = videoTrack.getCapabilities();
//     if (capabilities.zoom) {
//       const settings = videoTrack.getSettings();
//       const maxZoom = capabilities.zoom.max;
//       const newZoom = Math.min(settings.zoom + 2, maxZoom); // Increase zoom by 2x or cap at max
//       videoTrack.applyConstraints({
//         advanced: [{ zoom: newZoom, focus: "continuous" }],
//       });
//     } else {
//       console.log("Zoom not supported");
//     }
//   };

//   const stopCamera = () => {
//     clearBoundingBoxes();
//     const stream = videoRef.current.srcObject;
//     const tracks = stream.getTracks();
//     tracks.forEach((track) => track.stop()); // Stop all tracks
//     setIsCameraActive(false); // Deactivate camera
//   };

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
//     </div>
//   );
// }

// prints the processed image and extracts text both ( ---------------- show this -----------------)
// import { useRef, useState, useEffect } from "react";
// import Tesseract from "tesseract.js";

// export default function FinalPatternMatching() {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const overlayCanvasRef = useRef(null);

//   const [text, setText] = useState("");
//   const [isCameraActive, setIsCameraActive] = useState(true);
//   const [isTextDetected, setIsTextDetected] = useState(false);
//   const [processedImage, setProcessedImage] = useState(""); // State to store processed image data URL
//   let isProcessing = false;

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
//       const intervalId = setInterval(processFrames, 2000); // Process frames at intervals of 2 second
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
//       zoomCamera();
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

//   const zoomCamera = () => {
//     const videoTrack = videoRef.current.srcObject.getVideoTracks()[0];
//     const capabilities = videoTrack.getCapabilities();
//     if (capabilities.zoom) {
//       const settings = videoTrack.getSettings();
//       const maxZoom = capabilities.zoom.max;
//       const newZoom = Math.min(settings.zoom + 2, maxZoom);
//       videoTrack.applyConstraints({
//         advanced: [{ zoom: newZoom, focus: "continuous" }],
//       });
//     } else {
//       console.log("Zoom not supported");
//     }
//   };

//   const stopCamera = () => {
//     clearBoundingBoxes();
//     const stream = videoRef.current.srcObject;
//     const tracks = stream.getTracks();
//     tracks.forEach((track) => track.stop());
//     setIsCameraActive(false);
//   };

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
//     </div>
//   );
// }

//new logic to select the devices and use the camera
// import { useRef, useState, useEffect } from "react";
// import Tesseract from "tesseract.js";

// export default function FinalPatternMatching() {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const overlayCanvasRef = useRef(null);

//   const [text, setText] = useState("");
//   const [isCameraActive, setIsCameraActive] = useState(true);
//   const [isTextDetected, setIsTextDetected] = useState(false);
//   const [processedImage, setProcessedImage] = useState("");
//   const [devices, setDevices] = useState([]);
//   const [selectedDeviceId, setSelectedDeviceId] = useState("");
//   let isProcessing = false;

//   useEffect(() => {
//     const fetchDevices = async () => {
//       try {
//         const deviceInfos = await navigator.mediaDevices.enumerateDevices();
//         console.log("device infos: ", deviceInfos);
//         const videoDevices = deviceInfos.filter(
//           (device) => device.kind === "videoinput"
//         );
//         setDevices(videoDevices);

//         if (videoDevices.length > 0) {
//           setSelectedDeviceId(videoDevices[0].deviceId); // Default to the first camera
//         }
//       } catch (error) {
//         console.error("Error fetching devices:", error);
//       }
//     };

//     fetchDevices();
//   }, []);

//   useEffect(() => {
//     const startCamera = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: {
//             deviceId: selectedDeviceId
//               ? { exact: selectedDeviceId }
//               : undefined,
//           },
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

//     if (isCameraActive && selectedDeviceId) {
//       startCamera();
//       const intervalId = setInterval(processFrames, 2000);
//       return () => {
//         clearInterval(intervalId);
//         if (videoRef.current?.srcObject) {
//           videoRef.current.srcObject
//             .getTracks()
//             .forEach((track) => track.stop());
//         }
//       };
//     }
//   }, [selectedDeviceId, isCameraActive]);

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
//       const context = prepareCanvas(video, canvas);
//       const blob = await canvasToBlob(canvas);
//       const dataURL = URL.createObjectURL(blob);
//       setProcessedImage(dataURL);
//       const ocrResult = await performOCR(blob);
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
//       zoomCamera();
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

//   const zoomCamera = () => {
//     const videoTrack = videoRef.current.srcObject.getVideoTracks()[0];
//     const capabilities = videoTrack.getCapabilities();
//     if (capabilities.zoom) {
//       const settings = videoTrack.getSettings();
//       const maxZoom = capabilities.zoom.max;
//       const newZoom = Math.min(settings.zoom + 2, maxZoom);
//       videoTrack.applyConstraints({
//         advanced: [{ zoom: newZoom, focus: "continuous" }],
//       });
//     } else {
//       console.log("Zoom not supported");
//     }
//   };

//   const stopCamera = () => {
//     clearBoundingBoxes();
//     const stream = videoRef.current.srcObject;
//     const tracks = stream.getTracks();
//     tracks.forEach((track) => track.stop());
//     setIsCameraActive(false);
//   };

//   return (
//     <div style={{ position: "relative" }}>
//       <div style={{ marginBottom: "10px" }}>
//         <label htmlFor="camera-select">Select Camera: </label>
//         <select
//           id="camera-select"
//           value={selectedDeviceId}
//           onChange={(e) => setSelectedDeviceId(e.target.value)}
//         >
//           {devices.map((device) => (
//             <option key={device.deviceId} value={device.deviceId}>
//               {device.label || `Camera ${device.deviceId}`}
//             </option>
//           ))}
//         </select>
//       </div>
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
//     </div>
//   );
// }

//testing - 1 (i can show this working best in mobile) successfull (stopping sending all frames, detecting frames if it contain text or not if yes then send to tesseract else skip)
// import { useRef, useState, useEffect } from "react";
// import Tesseract from "tesseract.js";

// export default function FinalPatternMatching() {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const overlayCanvasRef = useRef(null);

//   const [text, setText] = useState("");
//   const [isCameraActive, setIsCameraActive] = useState(true);
//   const [isTextDetected, setIsTextDetected] = useState(false);
//   const [processedImage, setProcessedImage] = useState(""); // State to store processed image data URL
//   let isProcessing = false;

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
//       const intervalId = setInterval(processFrames, 2000); // Process frames at intervals of 2 second
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

//       // // Get the image data from canvas
//       // const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

//       // // Applying a simple filter to determine if the frame is worth processing
//       // if (!isFrameWorthProcessing(imageData)) {
//       //   console.log("Skipping frame : Not worth for processing");
//       //   return;
//       // }

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

//   // Algorithm to check whether the frame is worth sending to tesseract or not
//   // const isFrameWorthProcessing = (imageData) => {
//   //   const { data, width, height } = imageData;

//   //   // Compute the brightness variance to determine contrast
//   //   let sum = 0;
//   //   let sumSq = 0;
//   //   const pixelCount = width * height;

//   //   for (let i = 0; i < data.length; i += 4) {
//   //     const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3; // Grayscale
//   //     sum += brightness;
//   //     sumSq += brightness * brightness;
//   //   }

//   //   const mean = sum / pixelCount;
//   //   const variance = sumSq / pixelCount - mean * mean;

//   //   console.log("mean: ", mean);
//   //   console.log("variance: ", variance);

//   //   // If variance is too low, the frame is too uniform (likely no text)
//   //   if (variance < 50 && mean < 100) return false;

//   //   return true;
//   // };

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
//       return await Tesseract.recognize(blob, "eng", {
//         logger: (m) => console.log(m),
//       });
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
//       zoomCamera();
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

//   const zoomCamera = () => {
//     const videoTrack = videoRef.current.srcObject.getVideoTracks()[0];
//     const capabilities = videoTrack.getCapabilities();
//     if (capabilities.zoom) {
//       const settings = videoTrack.getSettings();
//       const maxZoom = capabilities.zoom.max;
//       const newZoom = Math.min(settings.zoom + 2, maxZoom);
//       videoTrack.applyConstraints({
//         advanced: [{ zoom: newZoom, focus: "continuous" }],
//       });
//     } else {
//       console.log("Zoom not supported");
//     }
//   };

//   const stopCamera = () => {
//     clearBoundingBoxes();
//     const stream = videoRef.current.srcObject;
//     const tracks = stream.getTracks();
//     tracks.forEach((track) => track.stop());
//     setIsCameraActive(false);
//   };

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
//     </div>
//   );
// }

// testing - 2 (mobile testing with zoom)
import { useRef, useState, useEffect } from "react";
import Tesseract from "tesseract.js";

export default function FinalPatternMatching() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);

  const [text, setText] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isTextDetected, setIsTextDetected] = useState(false);
  const [processedImage, setProcessedImage] = useState(""); // State to store processed image data URL
  const [zoomLevel, setZoomLevel] = useState(1); // New: State for the zoom level
  const [isZoomSupported, setIsZoomSupported] = useState(false);
  const [zoomRange, setZoomRange] = useState({ min: 0, max: 0 });
  let isProcessing = false;

  useEffect(() => {
    const checkZoomSupport = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        const videoTrack = stream.getVideoTracks()[0];
        const capabilities = videoTrack.getCapabilities();

        if (capabilities.zoom) {
          setIsZoomSupported(true);
          setZoomRange({
            min: capabilities.zoom.min,
            max: capabilities.zoom.max,
          });
        } else {
          setIsZoomSupported(false);
        }

        // Stop the track to prevent the camera from staying on
        videoTrack.stop();
      } catch (error) {
        console.error("Error checking zoom support:", error);
        setIsZoomSupported(false);
      }
    };

    checkZoomSupport();
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current
              .play()
              .catch((error) => console.error("Play error:", error));
          };
        }
      } catch (error) {
        console.error("Error accessing the camera:", error);
      }
    };

    if (isCameraActive) {
      startCamera();
      const intervalId = setInterval(processFrames, 2000); // Process frames at intervals of 2 seconds
      return () => {
        clearInterval(intervalId);
        if (videoRef.current?.srcObject) {
          videoRef.current.srcObject
            .getTracks()
            .forEach((track) => track.stop());
        }
      };
    }
  }, [isCameraActive]);

  useEffect(() => {
    if (videoRef.current) {
      applyZoom(zoomLevel);
    }
  }, [zoomLevel]);

  const processFrames = async () => {
    if (
      isTextDetected ||
      isProcessing ||
      !videoRef.current ||
      !canvasRef.current
    )
      return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (
      !video ||
      !canvas ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      console.log("Video feed is getting ready....");
      return;
    }

    isProcessing = true;

    try {
      // Prepare the canvas
      prepareCanvas(video, canvas);

      // Get blob from canvas
      const blob = await canvasToBlob(canvas);

      // Update the processed image state with the blob's data URL
      const dataURL = URL.createObjectURL(blob);
      setProcessedImage(dataURL);

      // Perform OCR
      const ocrResult = await performOCR(blob);

      // Analyze OCR Results
      handleOCRResult(ocrResult);
    } catch (error) {
      console.error("Error in frame processing:", error);
    } finally {
      isProcessing = false;
    }
  };

  const prepareCanvas = (video, canvas) => {
    canvas.width = video.videoWidth / 2;
    canvas.height = video.videoHeight / 2;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return context;
  };

  const canvasToBlob = (canvas) =>
    new Promise((resolve) => canvas.toBlob(resolve, "image/png"));

  const performOCR = async (blob) => {
    try {
      return await Tesseract.recognize(blob, "eng");
    } catch (error) {
      console.error("Error during OCR:", error);
      throw error;
    }
  };

  const handleOCRResult = (ocrResult) => {
    const targetPattern = /\b\d{3}-\d{3}-\d{3}\b/;

    const matchedWord = ocrResult.data.words.find(
      (word) => targetPattern.test(word.text) && word.confidence > 80
    );

    if (matchedWord) {
      console.log("Matched Pattern:", matchedWord.text);
      drawBoundingBoxes([matchedWord]);
      setText(matchedWord.text);
      stopCamera();
      setIsTextDetected(true);
    } else {
      clearBoundingBoxes();
      setText("");
    }
  };

  const drawBoundingBoxes = (words) => {
    const overlayCanvas = overlayCanvasRef.current;
    const overlayContext = overlayCanvas.getContext("2d");
    overlayCanvas.width = videoRef.current.videoWidth;
    overlayCanvas.height = videoRef.current.videoHeight;

    overlayContext.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    words.forEach((word) => {
      const { x0, y0, x1, y1 } = word.bbox;

      overlayContext.strokeStyle = "yellow";
      overlayContext.lineWidth = 12;
      overlayContext.strokeRect(x0, y0, x1 - x0, y1 - y0);

      overlayContext.font = "16px Arial";
      overlayContext.fillStyle = "blue";
      overlayContext.fillText(word.text, x0, y0 - 5);
    });
  };

  const clearBoundingBoxes = () => {
    const overlayCanvas = overlayCanvasRef.current;
    const overlayContext = overlayCanvas.getContext("2d");
    overlayContext.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  };

  const applyZoom = (zoomLevel) => {
    const videoTrack = videoRef.current?.srcObject?.getVideoTracks()[0];

    if (!videoTrack) {
      console.log("Video track not available");
      return;
    }

    const capabilities = videoTrack.getCapabilities();
    if (capabilities.zoom) {
      videoTrack.applyConstraints({
        advanced: [{ zoom: zoomLevel }],
      });
    } else {
      console.log("Zoom not supported");
    }
  };

  const handleZoomChange = (event) => {
    const newZoom = Number(event.target.value);
    setZoomLevel(newZoom);
  };

  const stopCamera = () => {
    clearBoundingBoxes();
    const stream = videoRef.current.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    setIsCameraActive(false);
  };

  const step = (zoomRange.max - zoomRange.min) / 10;

  return (
    <div style={{ position: "relative" }}>
      {isCameraActive && (
        <>
          <video ref={videoRef} style={{ width: "100%", height: "auto" }} />
          <canvas
            ref={overlayCanvasRef}
            style={{ position: "absolute", top: 0, left: 0 }}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </>
      )}
      <div style={{ marginTop: "10px", fontSize: "18px", fontWeight: "bold" }}>
        Detected Text: {text || "No text detected"}
      </div>

      <div style={{ marginTop: "20px" }}>
        <label htmlFor="zoomRange" style={{ fontWeight: "bold" }}>
          Zoom: {zoomLevel}
        </label>
        <input
          id="zoomRange"
          type="range"
          min={zoomRange.min}
          max={zoomRange.max}
          step={step}
          value={zoomLevel}
          onChange={handleZoomChange}
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginTop: "10px" }}>
        <h3>Processed Image:</h3>
        {processedImage && (
          <img
            src={processedImage}
            alt="Processed frame"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        )}
      </div>
      <div>
        <strong>Does Device support Zoom : </strong>{" "}
        {isZoomSupported ? "Yes" : "No"}
      </div>
      {isZoomSupported && (
        <div>
          <strong>Zoom Range:</strong> Min: {zoomRange.min}, Max:{" "}
          {zoomRange.max}
        </div>
      )}
    </div>
  );
}

// main working with 100%

// import { useRef, useState, useEffect } from "react";
// import Tesseract from "tesseract.js";

// export default function LivePatterMatching() {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const overlayCanvasRef = useRef(null);

//   const [text, setText] = useState("");
//   let isProcessing = false;

//   useEffect(() => {
//     const startCamera = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { facingMode: "environment" },
//         });
//         videoRef.current.srcObject = stream;
//         videoRef.current.play();
//       } catch (error) {
//         console.error("Error accessing the camera:", error);
//       }
//     };

//     startCamera();
//     const intervalId = setInterval(processFrames, 500); // Process frames at 500ms intervals
//     return () => clearInterval(intervalId);
//   }, []);

//   const processFrames = async () => {
//     if (
//       isProcessing ||
//       !videoRef.current ||
//       !canvasRef.current ||
//       !overlayCanvasRef.current
//     )
//       return;
//     isProcessing = true;

//     const canvas = canvasRef.current;
//     const context = canvas.getContext("2d");
//     const video = videoRef.current;

//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);

//     const dataUrl = canvas.toDataURL("image/png");

//     try {
//       const { data } = await Tesseract.recognize(dataUrl, "eng");
//       const words = data.words;

//       // Define the target pattern to detect
//       const targetPattern = /\b\d{3}-\d{3}-\d{3}\b/; // Matches "100-085-050" pattern
//       const matchedWord = words.find((word) => targetPattern.test(word.text));

//       if (matchedWord) {
//         console.log("Matched Pattern:", matchedWord.text);
//         drawBoundingBoxes([matchedWord]); // Draw bounding box for the matched word
//         setText(matchedWord.text); // Update detected text
//       } else {
//         clearBoundingBoxes();
//         setText(""); // Clear text if no match
//       }
//     } catch (error) {
//       console.error("Error in Tesseract recognition:", error);
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
//       overlayContext.lineWidth = 12; //width of the rectange
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

//   return (
//     <div style={{ position: "relative" }}>
//       <video ref={videoRef} style={{ width: "100%", height: "auto" }} />
//       <canvas
//         ref={overlayCanvasRef}
//         style={{ position: "absolute", top: 0, left: 0 }}
//       />
//       <canvas ref={canvasRef} style={{ display: "none" }} />
//       <div style={{ marginTop: "10px", fontSize: "18px", fontWeight: "bold" }}>
//         Detected Text: {text || "No text detected"}
//       </div>
//     </div>
//   );
// }

// Auto Zoom and Close - Level 1

// import { useRef, useState, useEffect } from "react";
// import Tesseract from "tesseract.js";

// export default function LivePatternMatching() {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const overlayCanvasRef = useRef(null);

//   const [text, setText] = useState("");
//   const [isCameraActive, setIsCameraActive] = useState(true);
//   let isProcessing = false;

//   useEffect(() => {
//     const startCamera = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { facingMode: "environment" },
//         });
//         videoRef.current.srcObject = stream;
//         videoRef.current.play();
//       } catch (error) {
//         console.error("Error accessing the camera:", error);
//       }
//     };

//     if (isCameraActive) {
//       startCamera();
//       const intervalId = setInterval(processFrames, 500); // Process frames at 500ms intervals
//       return () => clearInterval(intervalId);
//     }
//   }, [isCameraActive]);

//   const processFrames = async () => {
//     if (
//       isProcessing ||
//       !videoRef.current ||
//       !canvasRef.current ||
//       !overlayCanvasRef.current
//     )
//       return;

//     isProcessing = true;

//     const canvas = canvasRef.current;
//     const context = canvas.getContext("2d");
//     const video = videoRef.current;

//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);

//     const dataUrl = canvas.toDataURL("image/png");

//     try {
//       const { data } = await Tesseract.recognize(dataUrl, "eng");
//       const words = data.words;

//       // Define the target pattern to detect
//       const targetPattern = /\b\d{3}-\d{3}-\d{3}\b/; // Matches "100-085-050" pattern
//       const matchedWord = words.find((word) => targetPattern.test(word.text));

//       if (matchedWord) {
//         console.log("Matched Pattern:", matchedWord.text);
//         drawBoundingBoxes([matchedWord]); // Draw bounding box for the matched word
//         setText(matchedWord.text); // Update detected text
//         zoomCamera(); // Zoom camera when pattern detected
//         stopCamera(); // Stop camera after detection
//       } else {
//         clearBoundingBoxes();
//         setText(""); // Clear text if no match
//       }
//     } catch (error) {
//       console.error("Error in Tesseract recognition:", error);
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
//       videoTrack.applyConstraints({ advanced: [{ zoom: newZoom }] });
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

// Auto Zoom and Close (with good user experience) - Level 2 (limitation: takes more time to load)
// import { useRef, useState, useEffect } from "react";
// import Tesseract from "tesseract.js";

// export default function LivePatternMatching() {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const overlayCanvasRef = useRef(null);

//   const [text, setText] = useState("");
//   const [isCameraActive, setIsCameraActive] = useState(true);
//   const [isZooming, setIsZooming] = useState(false);
//   const [zoomScale, setZoomScale] = useState(1);
//   let isProcessing = false;

//   useEffect(() => {
//     const startCamera = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { facingMode: "environment" },
//         });
//         videoRef.current.srcObject = stream;
//         videoRef.current.play();
//       } catch (error) {
//         console.error("Error accessing the camera:", error);
//       }
//     };

//     if (isCameraActive) {
//       startCamera();
//       const intervalId = setInterval(processFrames, 500); // Process frames at 500ms intervals
//       return () => clearInterval(intervalId);
//     }
//   }, [isCameraActive]);

//   const processFrames = async () => {
//     if (
//       isProcessing ||
//       !videoRef.current ||
//       !canvasRef.current ||
//       !overlayCanvasRef.current
//     )
//       return;

//     isProcessing = true;

//     const canvas = canvasRef.current;
//     const context = canvas.getContext("2d");
//     const video = videoRef.current;

//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);

//     const dataUrl = canvas.toDataURL("image/png");

//     try {
//       const { data } = await Tesseract.recognize(dataUrl, "eng");
//       const words = data?.words;

//       // Define the target pattern to detect
//       const targetPattern = /\b\d{3}-\d{3}-\d{3}\b/; // Matches "100-085-050" pattern
//       const matchedWord = words?.find((word) => targetPattern.test(word.text));

//       if (matchedWord) {
//         console.log("Matched Pattern:", matchedWord.text);
//         drawBoundingBoxes([matchedWord]); // Draw bounding box for the matched word
//         setText(matchedWord.text); // Update detected text
//         smoothZoomEffect(matchedWord); // Simulate zoom on detection
//         delayCameraStop(); // Delay stopping the camera
//       } else {
//         clearBoundingBoxes();
//         setText(""); // Clear text if no match
//       }
//     } catch (error) {
//       console.error("Error in Tesseract recognition:", error);
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

//   const smoothZoomEffect = (matchedWord) => {
//     const { x0, y0, x1, y1 } = matchedWord.bbox;
//     const centerX = (x0 + x1) / 2;
//     const centerY = (y0 + y1) / 2;

//     setIsZooming(true);
//     const scaleFactor = 2; // Adjust the zoom level
//     const duration = 2000; // Duration of zoom animation in ms
//     const steps = 20; // Number of steps for the smooth transition
//     const stepTime = duration / steps;

//     let currentScale = 1;
//     let currentStep = 0;

//     const zoomInterval = setInterval(() => {
//       if (currentStep >= steps) {
//         clearInterval(zoomInterval);
//         setIsZooming(false);
//       } else {
//         currentScale += (scaleFactor - 1) / steps;
//         setZoomScale(currentScale);
//         videoRef.current.style.transformOrigin = `${centerX}px ${centerY}px`;
//         videoRef.current.style.transform = `scale(${currentScale})`;
//         currentStep++;
//       }
//     }, stepTime);
//   };

//   const delayCameraStop = () => {
//     setTimeout(() => {
//       stopCamera();
//     }, 3000); // Delay stopping the camera by 3 seconds
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
//           <video
//             ref={videoRef}
//             style={{
//               width: "100%",
//               height: "auto",
//               transform: `scale(${zoomScale})`,
//               transition: isZooming ? "transform 2s ease" : "none",
//             }}
//           />
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

//optimization part-1 (working)
// import { useRef, useState, useEffect } from "react";

// export default function LivePatternMatching() {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const overlayCanvasRef = useRef(null);
//   const workerRef = useRef(null);

//   const [text, setText] = useState("");
//   const [isCameraActive, setIsCameraActive] = useState(true);
//   const [processingTime, setProcessingTime] = useState(0);

//   useEffect(() => {
//     const startCamera = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { facingMode: "environment" },
//         });

//         const video = videoRef.current;
//         video.srcObject = stream;

//         await new Promise((resolve) => (video.onloadedmetadata = resolve));
//         video.play();
//       } catch (error) {
//         console.error("Error accessing the camera:", error);
//       }
//     };

//     const initWorker = () => {
//       workerRef.current = new Worker(
//         new URL("./ocrWorker.js", import.meta.url),
//         { type: "module" }
//       );
//       workerRef.current.onmessage = ({ data }) => {
//         const { text, words, processingTime } = data;
//         setText(text);
//         setProcessingTime(processingTime);

//         if (words.length > 0) {
//           drawBoundingBoxes(words);
//         } else {
//           clearBoundingBoxes();
//         }
//       };
//     };

//     if (isCameraActive) {
//       startCamera();
//       initWorker();

//       const intervalId = setInterval(processFrames, 500);
//       return () => {
//         clearInterval(intervalId);
//         if (workerRef.current) workerRef.current.terminate();
//       };
//     }
//   }, [isCameraActive]);

//   const processFrames = () => {
//     const video = videoRef.current;
//     if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
//       console.warn("Video not ready for processing.");
//       return;
//     }

//     const canvas = canvasRef.current;
//     const context = canvas.getContext("2d");
//     canvas.width = video.videoWidth / 2; // Downscale for performance
//     canvas.height = video.videoHeight / 2;

//     context.drawImage(video, 0, 0, canvas.width, canvas.height);
//     const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

//     workerRef.current.postMessage({ imageData });
//   };

//   const drawBoundingBoxes = (words) => {
//     const overlayCanvas = overlayCanvasRef.current;
//     const overlayContext = overlayCanvas.getContext("2d");
//     overlayCanvas.width = videoRef.current.videoWidth / 2;
//     overlayCanvas.height = videoRef.current.videoHeight / 2;

//     overlayContext.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

//     words.forEach((word) => {
//       const { x0, y0, x1, y1 } = word.bbox;
//       overlayContext.strokeStyle = "yellow";
//       overlayContext.lineWidth = 2;
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
//       <div style={{ marginTop: "5px", fontSize: "14px" }}>
//         Processing Time: {processingTime.toFixed(2)} ms
//       </div>
//     </div>
//   );
// }

//optimization part-2
// import { useRef, useState, useEffect } from "react";

// export default function LivePatternMatching() {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const overlayCanvasRef = useRef(null);
//   const workerRef = useRef(null);

//   const [text, setText] = useState("");
//   const [isCameraActive, setIsCameraActive] = useState(true);
//   const [processingTime, setProcessingTime] = useState(0);
//   const [preProcessedImages, setPreProcessedImages] = useState([]);

//   useEffect(() => {
//     const startCamera = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { facingMode: "environment" },
//         });

//         const video = videoRef.current;
//         video.srcObject = stream;

//         await new Promise((resolve) => (video.onloadedmetadata = resolve));
//         video.play();
//       } catch (error) {
//         console.error("Error accessing the camera:", error);
//       }
//     };

//     const initWorker = () => {
//       workerRef.current = new Worker(
//         new URL("./ocrWorker.js", import.meta.url),
//         { type: "module" }
//       );
//       workerRef.current.onmessage = ({ data }) => {
//         const { text, words, processingTime } = data;
//         setText(text);
//         setProcessingTime(processingTime);

//         if (words.length > 0) {
//           drawBoundingBoxes(words);
//           if (text) {
//             console.log("Detected Text:", text);
//             stopCamera();
//           }
//         } else {
//           clearBoundingBoxes();
//         }
//       };
//     };

//     if (isCameraActive) {
//       startCamera();
//       initWorker();

//       const intervalId = setInterval(processFrames, 500);
//       return () => {
//         clearInterval(intervalId);
//         if (workerRef.current) workerRef.current.terminate();
//       };
//     }
//   }, [isCameraActive]);

//   const stopCamera = () => {
//     const video = videoRef.current;
//     if (video && video.srcObject) {
//       const tracks = video.srcObject.getTracks();
//       tracks.forEach((track) => track.stop());
//       video.srcObject = null;
//     }
//     setIsCameraActive(false);
//   };

//   const processFrames = () => {
//     const video = videoRef.current;
//     if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
//       console.warn("Video not ready for processing.");
//       return;
//     }

//     const canvas = canvasRef.current;
//     const context = canvas.getContext("2d");
//     canvas.width = video.videoWidth / 2; // Downscale for performance
//     canvas.height = video.videoHeight / 2;

//     context.drawImage(video, 0, 0, canvas.width, canvas.height);
//     const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

//     // Store the pre-processed frame for visual inspection
//     const preProcessedImage = canvas.toDataURL("image/png");
//     setPreProcessedImages((prevImages) => [...prevImages, preProcessedImage]);

//     workerRef.current.postMessage({ imageData });
//   };

//   const drawBoundingBoxes = (words) => {
//     const overlayCanvas = overlayCanvasRef.current;
//     const overlayContext = overlayCanvas.getContext("2d");
//     overlayCanvas.width = videoRef.current.videoWidth / 2;
//     overlayCanvas.height = videoRef.current.videoHeight / 2;

//     overlayContext.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

//     words.forEach((word) => {
//       const { x0, y0, x1, y1 } = word.bbox;
//       overlayContext.strokeStyle = "yellow";
//       overlayContext.lineWidth = 2;
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
//       <div style={{ marginTop: "5px", fontSize: "14px" }}>
//         Processing Time: {processingTime.toFixed(2)} ms
//       </div>
//       <div style={{ marginTop: "20px" }}>
//         <h3>Pre-Processed Images:</h3>
//         <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
//           {preProcessedImages.map((src, index) => (
//             <img
//               key={index}
//               src={src}
//               alt={`Pre-Processed Frame ${index + 1}`}
//               style={{
//                 width: "150px",
//                 height: "auto",
//                 border: "1px solid #ccc",
//               }}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// final code
import { useRef, useState, useEffect } from "react";
import Tesseract from "tesseract.js";

export default function LivePatternMatching() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);

  const [text, setText] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(true);
  let isProcessing = false;

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
      const intervalId = setInterval(processFrames, 500); // Process frames at intervals
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

  // const processFrames = async () => {
  //   if (
  //     isProcessing ||
  //     !videoRef.current ||
  //     !canvasRef.current ||
  //     !overlayCanvasRef.current
  //   )
  //     return;

  //   isProcessing = true;

  //   const canvas = canvasRef.current;
  //   const context = canvas.getContext("2d");
  //   const video = videoRef.current;

  //   canvas.width = video.videoWidth;
  //   canvas.height = video.videoHeight;
  //   context.drawImage(video, 0, 0, canvas.width, canvas.height);

  //   const dataUrl = canvas.toDataURL("image/png");

  //   try {
  //     const { data } = await Tesseract.recognize(dataUrl, "eng");
  //     const words = data.words;

  //     // Define the target pattern to detect
  //     const targetPattern = /\b\d{3}-\d{3}-\d{3}\b/; // Matches "100-085-050" pattern
  //     const matchedWord = words.find((word) => targetPattern.test(word.text));

  //     if (matchedWord) {
  //       console.log("Matched Pattern:", matchedWord.text);
  //       drawBoundingBoxes([matchedWord]); // Draw bounding box for the matched word
  //       setText(matchedWord.text); // Update detected text
  //       zoomCamera(); // Zoom camera when pattern detected
  //       stopCamera(); // Stop camera after detection
  //     } else {
  //       clearBoundingBoxes();
  //       setText(""); // Clear text if no match
  //     }
  //   } catch (error) {
  //     console.error("Error in Tesseract recognition:", error);
  //   }

  //   isProcessing = false;
  // };

  const processFrames = async () => {
    if (isProcessing || !videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error("Video feed not ready.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );

    try {
      const { data } = await Tesseract.recognize(blob, "eng");
      const targetPattern = /\b\d{3}-\d{3}-\d{3}\b/;
      const matchedWord = data.words.find((word) =>
        targetPattern.test(word.text)
      );

      if (matchedWord) {
        console.log("Matched Pattern:", matchedWord.text);
        drawBoundingBoxes([matchedWord]);
        setText(matchedWord.text);
        zoomCamera();
        stopCamera();
      } else {
        clearBoundingBoxes();
        setText("");
      }
    } catch (error) {
      console.error("Error in Tesseract recognition:", error);
    }

    isProcessing = false;
  };

  const drawBoundingBoxes = (words) => {
    const overlayCanvas = overlayCanvasRef.current;
    const overlayContext = overlayCanvas.getContext("2d");
    overlayCanvas.width = videoRef.current.videoWidth;
    overlayCanvas.height = videoRef.current.videoHeight;

    overlayContext.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    words.forEach((word) => {
      const { x0, y0, x1, y1 } = word.bbox;

      // Draw bounding box
      overlayContext.strokeStyle = "yellow"; // Yellow color for matched pattern
      overlayContext.lineWidth = 12; // Width of the rectangle
      overlayContext.strokeRect(x0, y0, x1 - x0, y1 - y0);

      // Draw text label
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

  const zoomCamera = () => {
    const videoTrack = videoRef.current.srcObject.getVideoTracks()[0];
    const capabilities = videoTrack.getCapabilities();
    if (capabilities.zoom) {
      const settings = videoTrack.getSettings();
      const maxZoom = capabilities.zoom.max;
      const newZoom = Math.min(settings.zoom + 2, maxZoom); // Increase zoom by 2x or cap at max
      videoTrack.applyConstraints({ advanced: [{ zoom: newZoom }] });
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop()); // Stop all tracks
    setIsCameraActive(false); // Deactivate camera
  };

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
    </div>
  );
}

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
//       overlayContext.lineWidth = 12;
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

import { useRef, useState, useEffect } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import Tesseract from "tesseract.js";

export default function EnhancedTextScanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const [text, setText] = useState("");
  const [model, setModel] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await cocoSsd.load();
      setModel(loadedModel);
    };

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        videoRef.current.srcObject = stream;
        setTimeout(() => videoRef.current.play(), 100);
      } catch (error) {
        console.error("Error accessing the camera:", error);
      }
    };

    loadModel();
    startCamera();
    const intervalId = setInterval(processFrames, 500);
    return () => clearInterval(intervalId);
  }, []);

  const processFrames = async () => {
    if (
      !videoRef.current ||
      !canvasRef.current ||
      !overlayCanvasRef.current ||
      !model
    )
      return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const predictions = await model.detect(canvas);
    console.log("Predictions:", predictions);

    const textRegions = predictions.filter(
      (prediction) => prediction.class === "text" && prediction.score > 0.3
    );

    if (textRegions.length > 0) {
      drawBoundingBoxes(textRegions);

      // Extract text from detected regions
      textRegions.forEach((region) => {
        extractTextFromRegion(region, canvas);
      });
    } else {
      clearBoundingBoxes();
    }
  };

  const extractTextFromRegion = async (region, canvas) => {
    const overlayContext = overlayCanvasRef.current.getContext("2d");
    overlayContext.clearRect(0, 0, canvas.width, canvas.height);

    const { bbox } = region;
    const [x, y, width, height] = bbox;

    // Crop the region for OCR
    const croppedCanvas = document.createElement("canvas");
    const croppedContext = croppedCanvas.getContext("2d");
    croppedCanvas.width = width;
    croppedCanvas.height = height;
    croppedContext.drawImage(canvas, x, y, width, height, 0, 0, width, height);

    const dataUrl = croppedCanvas.toDataURL("image/png");

    try {
      const { data } = await Tesseract.recognize(dataUrl, "eng");
      setText((prevText) => `${prevText}\n${data.text}`);
      console.log("Detected Text:", data.text);
    } catch (error) {
      console.error("Error in Tesseract recognition:", error);
    }
  };

  const drawBoundingBoxes = (regions) => {
    const overlayCanvas = overlayCanvasRef.current;
    const overlayContext = overlayCanvas.getContext("2d");
    overlayCanvas.width = videoRef.current.videoWidth;
    overlayCanvas.height = videoRef.current.videoHeight;

    overlayContext.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    regions.forEach((region) => {
      const { bbox } = region;
      const [x, y, width, height] = bbox;

      overlayContext.strokeStyle = "yellow";
      overlayContext.lineWidth = 2;
      overlayContext.strokeRect(x, y, width, height);

      overlayContext.font = "16px Arial";
      overlayContext.fillStyle = "blue";
      overlayContext.fillText("Text", x, y - 5);
    });
  };

  const clearBoundingBoxes = () => {
    const overlayCanvas = overlayCanvasRef.current;
    const overlayContext = overlayCanvas.getContext("2d");
    overlayContext.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  };

  return (
    <div style={{ position: "relative" }}>
      {console.log(text)}
      <video ref={videoRef} style={{ width: "100%", height: "auto" }} />
      <canvas
        ref={overlayCanvasRef}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div style={{ marginTop: "10px", fontSize: "18px", fontWeight: "bold" }}>
        Detected Text:
        <pre>{text || "No text detected"}</pre>
      </div>
    </div>
  );
}

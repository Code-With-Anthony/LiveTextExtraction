import { useState } from "react";
import Camera from "./Camera";
import ProcessedImageDisplay from "./ProcessedImageDisplay";
import DetectedText from "./DetectedText";

export default function FinalPatternMatching() {
  const [text, setText] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isTextDetected, setIsTextDetected] = useState(false);
  const [processedImage, setProcessedImage] = useState("");

  return (
    <div style={{ position: "relative" }}>
      {isCameraActive && (
        <Camera
          setText={setText}
          setIsTextDetected={setIsTextDetected}
          setProcessedImage={setProcessedImage}
          setIsCameraActive={setIsCameraActive}
          isTextDetected={isTextDetected}
        />
      )}
      <DetectedText text={text} />
      <ProcessedImageDisplay processedImage={processedImage} />
    </div>
  );
}

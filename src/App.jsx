import "./App.css";
import LiveTextScanner from "./Code/LiveTextScanner.jsx";
// import dataImage from "./assets/labelData.jpg";
import LiveAllBoundingBoxesHP from "./Code/LiveAllBoundingBoxHP.jsx";
import LivePatterMatching from "./Code/LivePatternMatching.jsx";
import "./index.css";
import FinalPatternMatching from "./Code/FinalPatternMatching.jsx";
import TestingPatternMatching from "./Code/TestingPatternMatching.jsx";
import CameraComponent from "./Custom/CameraComponent.jsx";

const App = () => {
  return (
    <div className="App">
      {/* <h1>Live Text Scanning Application</h1> */}
      {/* <img
        src={dataImage}
        alt="Data Image"
        style={{ height: "500px", width: "500px" }}
      /> */}

      {/* detects the text continously, prints it  */}
      {/* <LiveTextScanner /> */}

      {/* detects the text, creates the bounding boxes continuously frame by frame, but also scans other things as well */}
      {/* <LiveAllBoundingBoxesHP /> */}

      {/* detects the text, scans all the text, creates the bounding boxes only when the pattern is matched of 9 digit number */}
      {/* <LivePatterMatching /> */}

      {/* Image Upload and Scan */}
      {/* <div className="app-container">
        <div className="box">
          <ImageUploader
            setExtractedText={setExtractedText}
            setMetaInfo={setMetaInfo}
            setImage={setImage}
          />
        </div>

        <div className="box">
          <TextDisplay
            extractedText={extractedText}
            metaInfo={metaInfo}
            image={image}
          />
        </div>
      </div> */}

      {/* Final Pattern Matching */}
      {/* <FinalPatternMatching /> */}

      {/* Final Testing with optimizations */}
      <TestingPatternMatching />

      {/* <CameraComponent/> */}
    </div>
  );
};

export default App;

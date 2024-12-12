import Tesseract from "tesseract.js";

self.onmessage = async ({ data }) => {
  const { imageData } = data;

  const startTime = performance.now();

  try {
    const {
      data: { text, words },
    } = await Tesseract.recognize(imageData, "eng", {
      logger: (info) => console.log(info), // Optional: Logs progress (can be removed)
    });

    const endTime = performance.now();

    // Transform words data into bounding box format
    const processedWords = words.map((word) => ({
      text: word.text,
      bbox: {
        x0: word.bbox.x0,
        y0: word.bbox.y0,
        x1: word.bbox.x1,
        y1: word.bbox.y1,
      },
    }));

    // Send back results to main thread
    self.postMessage({
      text,
      words: processedWords,
      processingTime: endTime - startTime,
    });
  } catch (error) {
    console.error("Error in OCR worker:", error);
    self.postMessage({ text: "", words: [], processingTime: 0 });
  }
};

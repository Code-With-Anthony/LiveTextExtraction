export const drawRect = (detection, ctx) => {
  detection.forEach((prediction) => {
    // Getting prediction results
    const [x, y, width, height] = prediction["bbox"];
    const text = prediction["class"];

    // Setting Styling
    const color = "green";
    ctx.strokeStyle = color;
    ctx.font = "48px Arial";
    ctx.fillStyle = color;

    // Drawing Bounding Boxes and Text
    ctx.beginPath();
    ctx.fillText(text, x, y);
    ctx.rect(x, y, width, height);
    ctx.stroke();
  });
};

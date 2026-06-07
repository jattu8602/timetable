import { createCanvas } from "@napi-rs/canvas";
import * as fs from "fs";

async function main() {
  console.log("Creating canvas...");
  const canvas = createCanvas(400, 400);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "blue";
  ctx.fillRect(0, 0, 400, 400);
  ctx.fillStyle = "white";
  ctx.font = "24px sans-serif";
  ctx.fillText("Hello from Canvas!", 50, 200);

  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync("./public/canvas-test.png", buffer);
  console.log("Canvas written to ./public/canvas-test.png");
}

main().catch(console.error);

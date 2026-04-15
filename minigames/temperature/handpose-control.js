/**
 * handpose-control.js  –  ML5 v1 HandPose → temperature slider for MG2
 * 
 * HOW IT WORKS:
 * - Loads ml5.handPose model in preload()
 * - Starts webcam in setup() and begins continuous detection
 * - Tracks wrist keypoint Y position
 * - Hand HIGH in frame  → slider moves toward 4 (Hot)
 * - Hand LOW  in frame  → slider moves toward 0 (Cold)
 * - Smooth lerp so slider doesn't jitter
 * - Small webcam preview drawn in bottom-right corner of the p5 canvas
 */

// ── state ──
let handPoseModel = null;
let hands = [];
let webcamVideo = null;
let handSliderTarget = 2;   // smoothed target (0–4)
let handActive = false;
let handposeEnabled = false;
let handPreviewCanvas = null;
let handPreviewCtx = null;

// Webcam preview size
//const CAM_W = 40;
//const CAM_H = height;

// ── called from p5 preload() ──
function preloadHandpose() {
  // ml5 v1: load model in preload, flipped for mirror
  handPoseModel = ml5.handPose({ flipped: true });
  console.log("[Handpose] model loading in preload...");
}

// ── called from p5 setup() ──
function initHandpose() {
  // Create p5 video capture (flipped to match model)
  webcamVideo = createCapture(VIDEO, { flipped: true });
  webcamVideo.size(640, 480);
  webcamVideo.hide();  // we draw it ourselves on canvas
  // Create a small canvas inside the strip-cam div for preview
  const camDiv = document.getElementById("strip-cam");
  if (camDiv) {
    handPreviewCanvas = document.createElement("canvas");
    handPreviewCanvas.width = camDiv.clientWidth;
    handPreviewCanvas.height = camDiv.clientHeight;
    handPreviewCanvas.style.width = "100%";
    handPreviewCanvas.style.height = "100%";
    handPreviewCanvas.style.display = "block";
    camDiv.appendChild(handPreviewCanvas);
    handPreviewCtx = handPreviewCanvas.getContext("2d");
  }

  // Start continuous detection — ml5 v1 API
  handPoseModel.detectStart(webcamVideo, gotHands);
  handposeEnabled = true;
  console.log("[Handpose] detectStart called, webcam active");
}

// ── ml5 callback: fires every time hands are detected ──
function gotHands(results) {
  hands = results;
}

// ── called every p5 draw() ──
function updateHandpose() {
  if (!handposeEnabled) return;

  const slider = document.getElementById("hueSlider");
  if (!slider) return;

  if (hands.length > 0) {
    handActive = true;
    const hand = hands[0];

    // Use wrist keypoint (index 0) Y position
    // In 640x480 video: y=0 is top (hand up), y=480 is bottom (hand down)
    const wristY = hand.keypoints[0].y;

    // Map: hand high (small Y ~60) → 4 (hot), hand low (big Y ~420) → 0 (cold)
    const rawTarget = map(wristY, 100, 380, 4, 0);
    const clamped = constrain(rawTarget, 0, 4);

    // Smooth lerp toward target
    handSliderTarget = lerp(handSliderTarget, clamped, 0.15);

    // Snap to nearest 0.25 step (matches slider step="0.25")
    const snapped = Math.round(handSliderTarget * 4) / 4;
    slider.value = snapped;

    // Dispatch input event so any listeners react
    slider.dispatchEvent(new Event("input", { bubbles: true }));
  } else {
    handActive = false;
  }
}

// ── draw webcam preview + keypoints in bottom-right corner ──
/*
function drawHandPreview() {
  if (!handposeEnabled || !webcamVideo) return;

  const px = width - CAM_W - 4;  // flush to right edge


  
  push();

  // Background box
  fill(0, 0, 0, 160);
  noStroke();
  rect(px - 2, 0, CAM_W + 4, height, 4);

  // Draw webcam feed — tall thin strip
  image(webcamVideo, px, 0, CAM_W, height);

  // Draw keypoints
  if (hands.length > 0) {
    const hand = hands[0];
    const scaleX = CAM_W / 640;
    const scaleY = height / 480;

    fill(0, 100, 100);
    noStroke();
    for (const kp of hand.keypoints) {
      ellipse(px + kp.x * scaleX, kp.y * scaleY, 4, 4);
    }

    // Wrist highlight
    const wrist = hand.keypoints[0];
    fill(120, 100, 100);
    ellipse(px + wrist.x * scaleX, wrist.y * scaleY, 8, 8);
  }

  // Status label
  fill(0, 0, 100);
  noStroke();
  textSize(10);
  textAlign(LEFT, TOP);
  text(handActive ? "✋" : "—", px + 4, 6);

  pop();
}
function drawHandPreview() {
  if (!handposeEnabled || !webcamVideo) return;

  const px = width - CAM_W - 4;

  // Source crop: take a vertical strip from the center of the 640x480 feed
  // We want a strip that maps to 70px wide at canvas height
  // The aspect ratio we need: CAM_W / height
  // Source height = full 480, source width = 480 * (CAM_W / height)
  const srcH = 480;
  const srcW = srcH * (CAM_W / height);  // keeps aspect ratio natural
  const srcX = (640 - srcW) / 2;         // center crop horizontally
  const srcY = 0;

  push();

  // Background box
  fill(0, 0, 0, 160);
  noStroke();
  rect(px - 2, 0, CAM_W + 4, height, 4);

  // Draw cropped webcam feed — natural proportions
  image(webcamVideo, px, 0, CAM_W, height, srcX, srcY, srcW, srcH);

  // Draw keypoints (only those inside the crop)
  if (hands.length > 0) {
    const hand = hands[0];
    const scaleX = CAM_W / srcW;
    const scaleY = height / srcH;

    fill(0, 100, 100);
    noStroke();
    for (const kp of hand.keypoints) {
      const kx = (kp.x - srcX) * scaleX;
      const ky = kp.y * scaleY;
      // Only draw if inside the crop strip
      if (kx >= 0 && kx <= CAM_W) {
        ellipse(px + kx, ky, 4, 4);
      }
    }

    // Wrist highlight
    const wrist = hand.keypoints[0];
    const wx = (wrist.x - srcX) * scaleX;
    const wy = wrist.y * scaleY;
    if (wx >= 0 && wx <= CAM_W) {
      fill(120, 100, 100);
      ellipse(px + wx, wy, 8, 8);
    }
  }

  // Status
  fill(0, 0, 100);
  noStroke();
  textSize(10);
  textAlign(LEFT, TOP);
  text(handActive ? "hand" : "no hand", px + 4, 6);

  pop();
}
*/
/*function drawHandPreview() {
  if (!handposeEnabled || !webcamVideo) return;

  // Get the strip-cam div's position relative to the canvas
  const camDiv = document.getElementById("strip-cam");
  if (!camDiv) return;

  const camRect = camDiv.getBoundingClientRect();
  const canvasEl = document.querySelector("canvas");
  if (!canvasEl) return;
  const canvasRect = canvasEl.getBoundingClientRect();

  // Position in canvas coordinates
  const dx = camRect.left - canvasRect.left;
  const dy = camRect.top - canvasRect.top;
  const dw = camRect.width;
  const dh = camRect.height;

  // Source crop: center strip from 640x480 feed, natural aspect
  const srcH = 480;
  const srcW = srcH * (dw / dh);
  const srcX = (640 - srcW) / 2;
  const srcY = 0;

  push();

  // Draw cropped webcam feed with natural proportions
 // image(webcamVideo, dx, dy, dw, dh, srcX, srcY, srcW, srcH);

  // Draw keypoints
  if (hands.length > 0) {
    const hand = hands[0];
    const sx = dw / srcW;
    const sy = dh / srcH;

    fill(0, 100, 100);
    noStroke();
    for (const kp of hand.keypoints) {
      const kx = (kp.x - srcX) * sx;
      const ky = kp.y * sy;
      if (kx >= 0 && kx <= dw) {
        ellipse(dx + kx, dy + ky, 4, 4);
      }
    }

    // Wrist highlight
    const wrist = hand.keypoints[0];
    const wx = (wrist.x - srcX) * sx;
    const wy = wrist.y * sy;
    if (wx >= 0 && wx <= dw) {
      fill(120, 100, 100);
      ellipse(dx + wx, dy + wy, 8, 8);
    }
  }

  pop();
}*/
function drawHandPreview() {
  if (!handposeEnabled || !webcamVideo || !handPreviewCtx) return;

  const cvs = handPreviewCanvas;
  const ctx = handPreviewCtx;
  const dw = cvs.width;
  const dh = cvs.height;

  // Source crop: vertical center strip from 640x480
  const srcH = 480;
  const srcW = srcH * (dw / dh);
  const srcX = (640 - srcW) / 2;
  const srcY = 0;

  // Draw webcam feed cropped
  ctx.clearRect(0, 0, dw, dh);
  ctx.drawImage(webcamVideo.elt, srcX, srcY, srcW, srcH, 0, 0, dw, dh);

  // Draw keypoints
  if (hands.length > 0) {
    const hand = hands[0];
    const sx = dw / srcW;
    const sy = dh / srcH;

    ctx.fillStyle = "#00ccff";
    for (const kp of hand.keypoints) {
      const kx = (kp.x - srcX) * sx;
      const ky = kp.y * sy;
      if (kx >= 0 && kx <= dw) {
        ctx.beginPath();
        ctx.arc(kx, ky, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Wrist highlight
    const wrist = hand.keypoints[0];
    const wx = (wrist.x - srcX) * sx;
    const wy = wrist.y * sy;
    if (wx >= 0 && wx <= dw) {
      ctx.fillStyle = "#00ff88";
      ctx.beginPath();
      ctx.arc(wx, wy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
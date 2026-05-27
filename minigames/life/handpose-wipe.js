
// ── state ──
let wipeHandPose = null;
let wipeHands = [];
let wipeVideo = null;
let wipeEnabled = false;
let wipePreviewCanvas = null;
let wipePreviewCtx = null;
let lastWristX = null;
let wipeSmudgeInterval = null;

// ── called by world.js when audio40 triggers ──
/*
function initWipeHandpose() {
  if (wipeEnabled) return; // already started
  
  // Show the strip
  const strip = document.getElementById("wipe-strip");
  if (strip) strip.style.display = "flex";
  
  // Create video capture
  wipeVideo = createCapture(VIDEO, { flipped: true });
  wipeVideo.size(640, 480);
  wipeVideo.hide();
  
  // Create preview canvas inside the strip
  const camDiv = document.getElementById("wipe-cam");
  if (camDiv) {
    wipePreviewCanvas = document.createElement("canvas");
    wipePreviewCanvas.width = camDiv.clientWidth;
    wipePreviewCanvas.height = camDiv.clientHeight;
    wipePreviewCanvas.style.width = "100%";
    wipePreviewCanvas.style.height = "100%";
    wipePreviewCanvas.style.display = "block";
    camDiv.appendChild(wipePreviewCanvas);
    wipePreviewCtx = wipePreviewCanvas.getContext("2d");
  }*/
/*
// Start detection
wipeHandPose.detectStart(wipeVideo, (results) => {
  wipeHands = results;
});*/

/*
  // Load model NOW, then start detection
console.log("[Wipe] loading model on demand...");
wipeHandPose = ml5.handPose({ flipped: true }, () => {
  console.log("[Wipe] model ready, starting detection");
  wipeHandPose.detectStart(wipeVideo, (results) => {
    wipeHands = results;
  });
});
 
wipeEnabled = true;
 
// Start regenerating smudges every 2000ms
wipeSmudgeInterval = setInterval(() => {
  if (typeof addSmudgeRandom === "function") {
    addSmudgeRandom();
  }
}, 2000);
 
console.log("[Wipe] handpose started, smudge regen active");
}*/
function initWipeHandpose() {
  console.log("[Wipe] initWipeHandpose called, wipeEnabled:", wipeEnabled);

  if (wipeEnabled) return;

  const strip = document.getElementById("wipe-strip");
  if (strip) strip.style.display = "flex";

  // Dynamically load ml5 only now
  const script = document.createElement("script");
  //script.src = "https://unpkg.com/ml5@1/dist/ml5.js";
  //allagh
  script.src = "/libs/ml5.js";
  script.onload = () => {
    console.log("[Wipe] ml5 loaded dynamically");

    wipeVideo = createCapture(VIDEO, { flipped: true });
    wipeVideo.size(640, 480);
    wipeVideo.hide();
    const stripEl = document.getElementById("wipe-strip");
    if (stripEl && wipeVideo.elt) {
      stripEl.appendChild(wipeVideo.elt);
    }

    const camDiv = document.getElementById("wipe-cam");
    if (camDiv) {
      wipePreviewCanvas = document.createElement("canvas");
      wipePreviewCanvas.width = camDiv.clientWidth;
      wipePreviewCanvas.height = camDiv.clientHeight;
      wipePreviewCanvas.style.width = "100%";
      wipePreviewCanvas.style.height = "100%";
      wipePreviewCanvas.style.display = "block";
      camDiv.appendChild(wipePreviewCanvas);
      wipePreviewCtx = wipePreviewCanvas.getContext("2d");
    }

    //wipeHandPose = ml5.handPose({ flipped: true }, () => {
      wipeHandPose = ml5.handPose({
  flipped: true,
  modelType: "full",
  detectorModelUrl: "/models/detector-full/model.json",
  landmarkModelUrl: "/models/landmark-full/model.json"
}, () => {
      console.log("[Wipe] model ready, starting detection");
      wipeHandPose.detectStart(wipeVideo, (results) => {
        wipeHands = results;
      });
    });

    wipeSmudgeInterval = setInterval(() => {
      if (typeof addSmudgeRandom === "function") {
        addSmudgeRandom();
      }
    }, 2000);
  };
  document.head.appendChild(script);

  wipeEnabled = true;
}


// ── call every frame from draw() ──
function updateWipeHandpose() {
  if (!wipeEnabled) return;

  if (wipeHands.length > 0) {
    const wrist = wipeHands[0].keypoints[0];
    const currentX = wrist.x;

    if (lastWristX !== null) {
      const dx = currentX - lastWristX;

      // Detect significant horizontal movement (left or right)
      if (Math.abs(dx) > 30) {
        // Wipe detected — remove 1-2 smudges
        if (typeof removeSmudges === "function") {
          removeSmudges(Math.random() < 0.5 ? 1 : 2);
        }
        lastWristX = currentX; // reset after wipe
      }
    } else {
      lastWristX = currentX;
    }

    // Smooth tracking — update baseline slowly to avoid drift
    lastWristX = lerp(lastWristX, currentX, 0.3);
  }

  // Draw camera preview
  if (wipePreviewCtx && wipeVideo) {
    const cvs = wipePreviewCanvas;
    const ctx = wipePreviewCtx;
    const dw = cvs.width;
    const dh = cvs.height;

    // Crop center horizontal strip from 640x480
    const srcW = 640;
    const srcH = srcW * (dh / dw);
    const srcX = 0;
    const srcY = (480 - srcH) / 2;

    ctx.clearRect(0, 0, dw, dh);
    ctx.save();
ctx.translate(dw, 0);
ctx.scale(-1, 1);
    ctx.drawImage(wipeVideo.elt, srcX, srcY, srcW, srcH, 0, 0, dw, dh);
    ctx.restore();

    // Draw keypoints in the strip preview
    if (wipeHands.length > 0) {
      const hand = wipeHands[0];
      const sx = dw / srcW;
      const sy = dh / srcH;

      ctx.fillStyle = "#00ccff";
      for (const kp of hand.keypoints) {
        const kx = kp.x * sx;
        const ky = (kp.y - srcY) * sy;
        ctx.beginPath();
        ctx.arc(kx, ky, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Wrist highlight
      const wrist = hand.keypoints[0];
      ctx.fillStyle = "#00ff88";
      ctx.beginPath();
      ctx.arc(wrist.x * sx, (wrist.y - srcY) * sy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

}
function stopWipeHandpose() {
  if (!wipeEnabled) return;

  wipeEnabled = false;

  if (wipeSmudgeInterval) {
    clearInterval(wipeSmudgeInterval);
    wipeSmudgeInterval = null;
  }

  if (wipeHandPose) {
    wipeHandPose.detectStop();
  }

  if (wipeVideo) {
    // Stop all media tracks
    const stream = wipeVideo.elt?.srcObject;
    if (stream) {
        stream.getTracks().forEach(t => t.stop());
    }
    wipeVideo.elt?.remove();  // remove from DOM
    wipeVideo.remove();
    wipeVideo = null;
  }

  const strip = document.getElementById("wipe-strip");
  if (strip) strip.style.display = "none";

  // Clean up preview canvas so it doesn't interfere with querySelector("canvas")
  if (wipePreviewCanvas) {
    wipePreviewCanvas.remove();
    wipePreviewCanvas = null;
    wipePreviewCtx = null;
  }

  wipeHands = [];
  lastWristX = null;

  console.log("[Wipe] stopped and hidden");
}
// --- CLEAN JS ONLY VERSION ---
// Updates:
// 1. Trees draw once (no jitter)
// 2. Mouse drag spacing enforced
// 3. Flowers system (two types) added but not yet integrated into buttons
// 4. No HTML/CSS here

let currentPlant = "tree";
let plants = [];
let minTreeDistance = 40;
let sizeSlider, detailSlider, heightSlider;
let branch_width_reducer = 0.6;

// These sliders must exist in HTML as: 
// id="sizeSlider", id="detailSlider", id="heightSlider"

function setup() {
  createCanvas(1112, 834);
  colorMode(HSB, 255);

  sizeSlider = document.getElementById("sizeSlider");
  detailSlider = document.getElementById("detailSlider");
  heightSlider = document.getElementById("heightSlider");

  // Buttons exist in HTML
  document.getElementById("treeBtn").onclick = () => (currentPlant = "tree");
  document.getElementById("flowerBtn").onclick = () => (currentPlant = "daisy");
  document.getElementById("altFlowerBtn").onclick = () => (currentPlant = "curveFlower");
  document.getElementById("resetBtn").onclick = () => (plants = []);
}

function mouseDragged() {
  if (mouseY < 0 || mouseY > height) return;

  // --- prevent trees from stacking too close ---
  if (plants.length > 0) {
    let last = plants[plants.length - 1];
    if (dist(mouseX, mouseY, last.x, last.y) < minTreeDistance) return;
  }

  plants.push({
    type: currentPlant,
    x: mouseX,
    y: mouseY,
    size: parseInt(sizeSlider.value),
    detail: parseInt(detailSlider.value),
    height: parseInt(heightSlider.value),
    color: { r: random(0, 20), g: 200, b: 60 },
    petalsColor: color(random(0,255),random(100,255),random(100,255)),
    insideColor: color(random(0,255),random(100,255),random(100,255))
  });
}

function draw() {
  background(150, 100, 255);
  noStroke();
  fill(50, 160, 100);
  rect(0, height / 2, width, height);

  for (let p of plants) {
    if (p.type === "tree") drawFractalTree(p);
    if (p.type === "daisy") drawOneDaisyPlaced(p);
    if (p.type === "curveFlower") drawCurveFlowerPlaced(p);
  }
}

// ------------------- FRACTAL TREE -------------------
function drawFractalTree(p) {
  tree(
    { x: p.x, y: p.y },
    p.height,
    p.color,
    p.size * 0.15,
    0,
    p.detail
  );
}

function tree(start, branch_length, branch_color, branch_width, angle, max_branch) {
  if (max_branch === 0) return;

  push();
  translate(start.x, start.y);
  stroke(branch_color.r, branch_color.g, branch_color.b);
  strokeWeight(branch_width);
  rotate(angle);
  line(0, 0, 0, -branch_length);
  pop();

  let endX = branch_length * sin(angle) + start.x;
  let endY = -branch_length * cos(angle) + start.y;

  let angle_change1 = random(-PI / 4, 0);
  let angle_change2 = random(0, PI / 4);

  tree(
    { x: endX, y: endY },
    random(branch_length * 0.3, branch_length * 0.9),
    { r: branch_color.r + 5, g: branch_color.g + 10, b: branch_color.b + 10 },
    branch_width * branch_width_reducer,
    angle + angle_change1,
    max_branch - 1
  );

  tree(
    { x: endX, y: endY },
    random(branch_length * 0.3, branch_length * 0.9),
    { r: branch_color.r + 10, g: branch_color.g + 10, b: branch_color.b + 10 },
    branch_width * branch_width_reducer,
    angle + angle_change2,
    max_branch - 1
  );
}

// ------------------- FLOWER TYPE 1: DAISY -------------------
function drawOneDaisyPlaced(p) {
  let cx = p.x;
  let cy = p.y;
  let r = p.size;
  let innerR = r * 0.2;
  let numPetals = p.detail;

  noStroke();
  fill(75, 155, 75);
  rect(cx - 2, cy, 4, height - cy);

  fill(p.petalsColor);
  let angleStart = random(TWO_PI);
  let angleSize = TWO_PI / numPetals;

  for (let i = 0; i < numPetals; i++) {
    let angle1 = angleStart + angleSize * (i + random(.1, .4));
    let angle2 = angleStart + angleSize * (i + random(.6, .9));
    let thisR = r * random(.9, 1.1);
    arc(cx, cy, thisR * 2, thisR * 2, angle1, angle2);
  }

  fill(p.insideColor);
  ellipse(cx, cy, innerR * 2, innerR * 2);
}

// ------------------- FLOWER TYPE 2: CURVE FLOWERS -------------------

let curvePalette = ["#00ffaa", "#ff006f", "#ff9d00", "#ffa3fd", "#f2f794", "#d9c0fa"];

function drawCurveFlowerPlaced(p) {
  push();
  translate(p.x, p.y);
  scale(p.size / 80); // size slider affects flower scale
  drawCurveFlower();
  pop();
}

// full algorithm but self-contained
function drawCurveFlower() {
  let bd = height / 20;
  let t = random(0, PI);
  let s = random(0, PI);
  let n = 30;
  let nBg = 10;
  let baseSW = 3;
  let dSF = 0.01;

  backgroundElement(nBg, bd);

  let pts = [];
  let ellipseList = [];

  for (let i = 0; i < n; i++) {
    pts.push({
      l: createVector(0, 0),
      pl: createVector(),
      t: random(0.005),
      s: random(0.02),
      len: round(random(40, 80)),
      strk: round(random(50, 100))
    });
  }

  for (let p of pts) {
    let sf = 1;
    for (let i = 0; i < p.len; i++) {
      p.l.x += random(-0.2, 0.2) + cos(t);
      p.l.y -= 0.8 + sin(t);
      stroke(p.strk, 0, p.strk);
      strokeWeight(baseSW / sf);
      if (i > 0) line(p.pl.x, p.pl.y, p.l.x, p.l.y);
      if (p.len - i === 1) ellipseList.push(p.l.copy());
      p.pl = p.l.copy();
      t += p.t;
      s += p.s;
      sf += dSF;
    }
  }

  for (let e of ellipseList) drawCurvePetals(e.x, e.y);
}

function backgroundElement(n, bd) {
  for (let k = 0; k < n; k++) {
    let num = ceil(random(5));
    let bLst = [];
    let bx = random(-50, 50);
    let by = random(-50, 50);
    bLst.push(createVector(bx, by));
    for (let i = 0; i < num; i++) bLst.push(createVector(bx + random(-bd, bd), by + random(-bd, bd)));
    let col = curvePalette[floor(random(curvePalette.length))];
    fill(col + "33");
    stroke(col + "66");
    drawBezierOpen(bLst);
  }
}

function drawCurvePetals(x, y) {
  push();
  translate(x, y);
  let col = curvePalette[floor(random(curvePalette.length))];
  noStroke();
  fill(col + "44");
  for (let i = 0; i < 15; i++) {
    push();
    rotate(random(PI));
    ellipse(random(-5, 5), random(-5, 5), random(5, 20), random(5, 20));
    pop();
  }
  pop();
}

function drawBezierOpen(l) {
  let s = l.length;
  if (s < 3) return;
  if (s === 3) {
    bezier(l[0].x, l[0].y, l[1].x, l[1].y, l[1].x, l[1].y, l[2].x, l[2].y);
    return;
  }
  bezier(l[0].x, l[0].y, l[1].)
  }
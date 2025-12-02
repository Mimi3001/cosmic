let horizonLine;
let treeMin;
let treeMax;
let mmgMin;
let mmgMax;
let mbgMin;
let mbgMax;
let sunSize;
let sky1, sky2, lake1, lake2;// gradient colors (HSB p5 color objects)
let hueSlider;
let treeCol, mmgCol, mbgCol;// generated colors for elements
let hueRanges = [// RANGES FOR EACH SLIDER STEP 0–4
  {min:140, max:290},                   // step 0 cold
  {min: 90, max:210},                   // step 1 cool
  {min: 60, max:170},                   // step 2 neutral
  {min: 20, max:110},                   // step 3 warm
  {min1:0, max1:70, min2:330, max2:360} // step 4 hot
];


function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100,255);

  // step slider
  hueSlider = createSlider(0, 4, 2, 1);
  hueSlider.position(10, 10);
  hueSlider.style('width', '200px');

  determineValues();// generate initial geometry values
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(100);

  let step = hueSlider.value();
  generateColorsForStep(step);

  // draw scene using generated colors
  sky(0, 0, width, horizonLine, sky1, sky2);//diavathimisi
  lake(0, horizonLine, width, height - horizonLine, lake1, lake2);//diavathimisi

  noStroke();
  sun();
  clouds();
  mountainsBG();
  mountainsMG();
  trees();

  push();//xreiaxontai?
  
  translate(0, horizonLine * 2);
  scale(1, -1);
 
  mountainsMgReflection();
  treesReflection();
  pop();//xreiazontia?

  frameRate(0.6);
}

function determineValues() {
  horizonLine = random(250, 350);

  treeMin = random(horizonLine, horizonLine - 20);
  treeMax = random(treeMin - 20, treeMin - 50);

  mmgMin = random(treeMax - 5, treeMax - 50);
  mmgMax = random(mmgMin, mmgMin - 50);

  mbgMin = random(mmgMin, mmgMax - 50);
  mbgMax = random(mbgMin, mbgMin - 50);

  sunSize = random(30, 50);
}

function generateColorsForStep(step) {
  let range = hueRanges[step];// H ranges constrained to the step's hueRanges

  // Helper to get a hue respecting dual-range (step 4) or normal range
  function pickHueWithinRange(r) {
    if (r.min1 !== undefined) {
      // choose which interval randomly, but you can change picking logic as needed
      if (random() < 0.5) {
        return random(r.min1, r.max1);
      } else {
        // handle wrap-around last part (330..360)
        return random(r.min2, r.max2);
      }
    } else {
      return random(r.min, r.max);
    }
  }

  // Helper to build p5 HSB color with hue wrapped 0..360
  function hsbColor(h, s, b, a) {
    h = wrapHue(h);
    return color(h, s, b,a );
  }

  // Background mountain (mbg)
  let h_mbg = pickHueWithinRange(range);
  let s_mbg = random(20, 50);
  let b_mbg = random(70, 90);
  mbgCol = hsbColor(h_mbg, s_mbg, b_mbg);

  // Mid mountain (mmg)
  let h_mmg = pickHueWithinRange(range);
  let s_mmg = random(50, 70);
  let b_mmg = random(40, 70);
  mmgCol = hsbColor(h_mmg, s_mmg, b_mmg);

  // Trees
  let h_tree = pickHueWithinRange(range);
  let s_tree = random(80, 100);
  let b_tree = random(20, 50);
  treeCol = hsbColor(h_tree, s_tree, b_tree);//volevei
  //allo pisw
   let h_tre = pickHueWithinRange(range);
  let s_tre = random(80, 90);
  let b_tre = random(30, 50);
  //if (abs(b_tre - b_tree) < 6) {// if they are too close
  //  b_tre = wrapHue(b_tre + 10);}
   if (abs(b_tre - b_tree) < 6 
       //&& (b_mmg - b_tre) > 6 
      ) {// if they are too close
    b_tre = wrapHue(b_tre + 10);
  //   b_mmg = wrapHue(b_mmg + 20);// push one a bit
  }
  treCol = hsbColor(h_tre, s_tre, b_tre,220);//volevei

  // Sky gradient: two different hues; brghter
  let h_sky1 = pickHueWithinRange(range);
  let h_sky2 = pickHueWithinRange(range);
 
  if (abs(h_sky1 - h_sky2) < 6) {// if they are too close
    h_sky2 = wrapHue(h_sky1 + 20);// push one a bit
  }
  sky1 = hsbColor(h_sky1, random(50, 90), random(85, 100));
  sky2 = hsbColor(h_sky2, random(20, 60), random(70, 95));

  // Lake gradient: two hues that may be near sky or different; darker 
  let h_lake1 = pickHueWithinRange(range);//same with sky
  let h_lake2 = pickHueWithinRange(range);//same with sky
  if (abs(h_lake1 - h_lake2) < 6) {// if they are too close
    h_lake2 = wrapHue(h_lake1 + 25);// push one a bit
  }
  lake1 = hsbColor(h_lake1, random(40, 80), random(50, 80));
  lake2 = hsbColor(h_lake2, random(30, 70), random(30, 60));
}


// Helpers for hue wrapping / distance (kept small/simple)
function wrapHue(h) {
  let r = h % 360;
  if (r < 0) r += 360;
  return r;
}

function trees() {
  fill(treCol)
  beginShape(); //perlin noise method
    let xoff = random(0, 10);
    vertex(-100, horizonLine); //start point
    for (let x = 0; x < width; x+= random(2, 5)) {
      let y = map(noise(xoff) * height, 0, height, treeMin, treeMax + 10);
      vertex(x, y);
      xoff += 0.1;
    }
    vertex(width + 100, horizonLine); //end point
  endShape(CLOSE);
  
  fill(treeCol);
  beginShape();
    vertex(-100, horizonLine); //trees start point
    for(let x = 0; x < width; x += random(5, 20)) {
      vertex(x, random(treeMax, treeMin));
      vertex(x + 10, random(treeMin, horizonLine - 10));
    }
    vertex(width + 100, horizonLine); //trees end point
  endShape(CLOSE);

}

function treesReflection() {
  let c = color(treeCol);
  let ctre = color(treCol);

c.setAlpha(160);
  ctre.setAlpha(145);
fill(ctre);
  beginShape(); //perlin noise method
    let xoff = random(0, 10);
    vertex(-100, horizonLine); //start point
    for (let x = 0; x < width; x+= random(2, 5)) {
      let y = map(noise(xoff) * height, 0, height, treeMin, treeMax + 10);
      vertex(x, y);
      xoff += 0.1;
    }
    vertex(width + 100, horizonLine); //end point
  endShape(CLOSE);
  
  fill(c);

  beginShape();
    vertex(-100, horizonLine); //trees start point
    for(let x = 0; x < width; x += random(5, 20)) {
      vertex(x, random(treeMax, treeMin));
      vertex(x + 10, random(treeMin, horizonLine - 10));
    }
    vertex(width + 100, horizonLine); //trees end point
  endShape(CLOSE);
}

function mountainsMG() {
  fill(mmgCol);

  beginShape(); //perlin noise method
    let xoff = random(0, 10);
    vertex(-100, horizonLine); //start point
    for (let x = 0; x < width; x+= random(1, 10)) {
      let y = map(noise(xoff) * height, 0, height, mmgMax, mmgMin + 50);
      vertex(x, y);
      xoff += 0.1;
    }
    vertex(width + 100, horizonLine); //end point
  endShape(CLOSE);
}


function mountainsMgReflection() {
  let m = color(mmgCol);
  // setAlpha expects 0..255 alpha, keep some transparency for reflection
m.setAlpha(140);
fill(m);
  beginShape(); //perlin noise method
    let xoff = random(0, 10);
    vertex(-100, horizonLine); //start point
   for (let x = 0; x < width; x+= random(1, 10)) {
      let y = map(noise(xoff) * height, 0, height, mmgMax, mmgMin + 50);
      vertex(x, y);
      xoff += 0.1;
    }
    vertex(width + 100, horizonLine); //end point
  endShape(CLOSE);
  
  
}

function mountainsBG() {
  fill(mbgCol);

  beginShape(); //perlin noise method
    let xoff = random(0, 10);
    vertex(-100, horizonLine); //start point
    for (let x = 0; x < width; x+= random(5, 15)) {
      let y = map(noise(xoff) * height, 0, height, mbgMax, mbgMin + 50);
      vertex(x, y);
      xoff += 0.1;
    }
    vertex(width + 100, horizonLine); //end point
  endShape(CLOSE);
}

function sun() {
  // keep random position every draw, as in your code (you said sun and clouds random as they do now)
  let sunX = random(width*0.1, width*0.9);
  let sunY = random(mbgMin, height* 0.1);

  // draw sun (keep alpha glows — you said that's fine)
  fill(0, 0, 100);
  ellipse(sunX, sunY, sunSize);
  fill(0, 0, 100, 100);
  ellipse(sunX, sunY, sunSize * 2);
  fill(0, 0, 100, 50); ellipse(sunX, sunY, sunSize * 2);
  fill(0, 0, 100, 0.1);
  
  ellipse(sunX, sunY, sunSize * 3);
  fill(0, 0, 100, 0.05);
  ellipse(sunX, sunY, sunSize * 4);
}

function sky(x, y, w, h, c1, c2) {
  noFill();
  for (let i = y; i <= y + h; i++) {
    let inter = map(i, y, y + h, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(x, i, x + w, i);
  }
}

function lake(x, y, w, h, c1, c2) {
  noFill();
  for (let i = y; i <= y + h; i++) {
    let inter = map(i, y, y + h, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(x, i, x + w, i);
  }
}

function clouds() {
  noStroke();
  // clouds random every draw as in your code
  fill(0, 0, 100, 0.2);
  ellipse(random(0, width), random(0, mbgMin), random(100, 200), random(20, 25));
  ellipse(random(0, width), random(0, mbgMin), random(50, 80), random(20, 25));
}

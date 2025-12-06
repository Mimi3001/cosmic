let horizonLine;
let treeMin;
let treeMax;
let mmgMin;
let mmgMax;
let mbgMin;
let mbgMax;
let sunSize;
let sky1, sky2, lake1, lake2;// gradient colors (HSB p5 color objects)

let treeCol, mmgCol, mbgCol;// generated colors for elements
let hueRanges = [// RANGES FOR EACH SLIDER STEP 0–4
  { min: 140, max: 290 },                   // step 0 cold
  { min: 90, max: 210 },                   // step 1 cool
  { min: 40, max: 180 },                   // step 2 neutral
  { min: 10, max: 110 },                   // step 3 warm
  { min1: 0, max1: 70, min2: 330, max2: 360 } // step 4 hot
];
let cloudLayer;
let lastGenTime = 0;

function setup() {
  createCanvas(800, 500);
  colorMode(HSB, 360, 100, 100, 255);
cloudLayer = createGraphics(width, height);
 frameRate(0.5);
  

  determineValues();// generate initial geometry values
  
}

function draw() {
  background(100);


  generateColorsForStep(step);

  sky(0, 0, width, horizonLine, sky1, sky2);//diavathimisi
  

  noStroke();
  sun();
  clouds(); 
makeClouds(cloudLayer);   // NEW clouds each time

   image(cloudLayer, 0, 0);
  mountainsBG();
  mountainsMG();
  trees();

  push();//xreiaxontai?

  translate(0, horizonLine * 2);
  scale(1, -1);
  
  pop();//xreiazontia?

 
}

function determineValues() {
  horizonLine =  350;

  treeMin = random(horizonLine, horizonLine - 20);
  treeMax = random(treeMin - 20, treeMin - 50);

  mmgMin = random(treeMax - 5, treeMax - 50);
  mmgMax = random(mmgMin, mmgMin - 50);

  mbgMin = random(mmgMin, mmgMax - 50);
  mbgMax = random(mbgMin, mbgMin - 50);

  sunSize = random(30, 50);
}

function generateColorsForStep(step) {
  let range = hueRanges[step];// h ranges constrained to the step's hueRanges

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
    return color(h, s, b, a);
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
  treCol = hsbColor(h_tre, s_tre, b_tre, 220);//volevei

  // Sky gradient: two different hues; brighter
  let h_sky1 = pickHueWithinRange(range);
  let h_sky2 = pickHueWithinRange(range);

  if (abs(h_sky1 - h_sky2) < 6) {// if they are too close
    h_sky2 = wrapHue(h_sky1 + 20);// push one a bit
  }
  sky1 = hsbColor(h_sky1, random(40, 70), random(75, 90));
  sky2 = hsbColor(h_sky2, random(10, 50), random(80, 100));

  // Lake gradient: two hues that may be near sky or different; darker 
 
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
  for (let x = 0; x < width; x += random(2, 5)) {
    let y = map(noise(xoff) * height, 0, height, treeMin, treeMax + 10);
    vertex(x, y);
    xoff += 0.1;
  }
  vertex(width + 100, horizonLine); //end point
  endShape(CLOSE);

  fill(treeCol);
  beginShape();
  vertex(-100, horizonLine); //trees start point
  for (let x = 0; x < width; x += random(5, 20)) {
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
  for (let x = 0; x < width; x += random(1, 10)) {
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
  for (let x = 0; x < width; x += random(5, 15)) {
    let y = map(noise(xoff) * height, 0, height, mbgMax, mbgMin + 50);
    vertex(x, y);
    xoff += 0.1;
  }
  vertex(width + 100, horizonLine); //end point
  endShape(CLOSE);
}

function sun() {
  // keep random position every draw, as in your code (you said sun and clouds random as they do now)
  let sunX = random(width * 0.1, width * 0.9);
  let sunY = random(mbgMin, height * 0.1);

  // draw sun
  fill(0, 0, 100);
  ellipse(sunX, sunY, sunSize);
  fill(0, 0, 100, 90);
  ellipse(sunX, sunY, sunSize * 1.8);
  fill(0, 0, 100, 70);
  ellipse(sunX, sunY, sunSize * 2.3);
  fill(0, 0, 100, 30);
  ellipse(sunX, sunY, sunSize * 3);
  fill(0, 0, 100, 20);
  ellipse(sunX, sunY, sunSize * 4.2);
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




function makeClouds(pg) {
  pg.pixelDensity(1);
 noiseSeed(frameCount);
  pg.loadPixels();

  for (let x = 0; x < pg.width; x++) {
    for (let y = 0; y < pg.height * 0.5; y += floor(random(0, 3))) {

      let index = (x + y * pg.width) * 4;
      let cvalue = noise(x / 300, y / 55);

      if (cvalue < random(0.2,0.4)) {//diafores piknotites
        let setC = map(cvalue, 0.33, 0, 245, 255);

        // Proper RGB placement
        pg.pixels[index]     = setC;
        pg.pixels[index + 1] = setC;
        pg.pixels[index + 2] = setC;
        pg.pixels[index + 3] = 110;
      }
    }
  }

  pg.updatePixels();
}

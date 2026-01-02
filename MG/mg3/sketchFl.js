let currentPlant = "tree";
let plants = [];
let sizeSlider, detailSlider, heightSlider;
let step = 2; // default until message arrives
//let paletteLocked = false;
let regenerate = true;   // generate once on load
let landscape;

let horizonLine;
let treeMin;
let treeMax;
let mmgMin;
let mmgMax;
let mbgMin;
let mbgMax;
let sunSize;
let sky1, sky2, lake1, lake2;// gradient colors (HSB p5 color objects)
let treeCol, treCol, mmgCol, mbgCol;// generated colors for elements
let hueRanges = [// RANGES FOR EACH SLIDER STEP 0–4
    { min: 140, max: 290 },                   // step 0 cold
    { min: 90, max: 210 },                   // step 1 cool
    { min: 40, max: 180 },                   // step 2 neutral
    { min: 10, max: 110 },                   // step 3 warm
    { min1: 0, max1: 70, min2: 330, max2: 360 } // step 4 hot
];

//plirofories apo to game 2 kai prompt kai ui - ola se ena mplok ----------ENA ANA ARXEIO 
window.addEventListener("message", (event) => {
    if (event.data?.type === "pref_from_parent") {
        console.log("Received preference from parent:", event.data.value);
        step = Number(event.data.value);   // NOW call your background generator // 0–4
        regenerate = true; // paletteLocked = false; 
    }

    //gia ui 
    if (event.data?.type === "ui_theme") {
        const vars = event.data.vars;
        for (const key in vars) {
            document.documentElement.style.setProperty(key, vars[key]);
        }
    }

    //epitelous ena reset pou kanei kai neo generate tin eikona
    if (event.data?.type === "reset_game") {
        plants = [];
        regenerate = true;
    }

    //gia to prompt
    if (event.data?.type === "set_prompt") {
        const el = document.getElementById("mg-prompt");
        if (el) el.textContent = event.data.text || "";
    }

});

function setup() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    createCanvas(w, h);
    colorMode(HSB, 360, 100, 100, 255);
    frameRate(5);

    // pixelDensity(1);

    sizeSlider = document.getElementById("sizeSlider");
    detailSlider = document.getElementById("detailSlider");
    heightSlider = document.getElementById("heightSlider");

    // RESET button
    /*
    const resetBtn = document.createElement("button");
    resetBtn.innerText = "Reset";
    resetBtn.onclick = () => (plants = []);
    document.body.children[0].appendChild(resetBtn);*/

    document.getElementById("treeBtn").onclick = () => (currentPlant = "tree");
    document.getElementById("flowerBtn").onclick = () => (currentPlant = "flower");
    document.getElementById("randomizeColorsBtn").onclick = randomizeColors;
}
function windowResized() {//resize support
    resizeCanvas(window.innerWidth, window.innerHeight);
    regenerate = true;
}
function depthScale(y) {
    let t = map(y, mmgMin, horizonLine, 0.4, 1.2);
    return constrain(t, 0.4, 1.2);
}

function mousePressed() {
    if (mouseY < mbgMin) return;
    let baseHeight = parseInt(heightSlider.value);// Smaller near mountains, larger near bottom.

    let depth = map(mouseY, mmgMin, height, 0.2, 1.6); // scale 0.4 ↔ 1.2 from mmgMin to canvas height
    depth = constrain(depth, 0.2, 2.2);
    let scaledHeight = baseHeight * depth;

    let branches = generateTree(
        { x: mouseX, y: mouseY },
        scaledHeight,
        {///xrwma dentroy
            r: random(0, 20),
            g: 200,
            b: 60
        },

        /* parseInt(heightSlider.value),
         { r: random(0, 20), g: 200, b: 60 },*/
        parseInt(sizeSlider.value) * 0.1,
        0,
        parseInt(detailSlider.value)
    );

    plants.push({
        type: currentPlant,
        branches: branches
    });
}
function draw() {
    if (regenerate) {
        landscape = createGraphics(width, height);
        generateLandscape(landscape, step);
        regenerate = false;
    }
    background(180, 20, 100, 255);
    noStroke();
    image(landscape, 0, 0);// draw static image

    for (let p of plants) {
        if (p.type === "tree") {
            for (let b of p.branches) {
                stroke(b.color.r, b.color.g, b.color.b);
                strokeWeight(b.width);
                line(b.x1, b.y1, b.x2, b.y2);

            }

        }
        if (p.type === "flower") {
            drawFlower(p.x, p.y);
        }

    }
}
function determineValues() {
    horizonLine = 350;

    treeMin = horizonLine - random(0, 20);
    treeMax = treeMin - random(20, 55);

    mmgMin = treeMax - random(5, 60);
    mmgMax = mmgMin - random(0, 20);

    mbgMin = mmgMin - random(0, 70);
    mbgMax = mbgMin - random(10, 80);

    sunSize = random(30, 50);
}
function generateColorsForStep(step) {
    let range = hueRanges[step];

    function pickHueWithinRange(r) {
        if (r.min1 !== undefined) {
            return random() < 0.5 ? random(r.min1, r.max1) : random(r.min2, r.max2);
        }
        return random(r.min, r.max);
    }

    function hsbColor(h, s, b, a) {
        h = wrapHue(h);
        return color(h, s, b, a);
    }

    // Background mountain
    mbgCol = hsbColor(
        pickHueWithinRange(range),
        random(20, 50),
        random(70, 90)
    );
    mmgCol = hsbColor(
        pickHueWithinRange(range),
        random(50, 70),
        random(40, 70)
    );

    // Trees
    let hTree1 = pickHueWithinRange(range);
    let hTree2 = pickHueWithinRange(range);
    let b1 = random(20, 50);
    let b2 = random(30, 50);

    if (abs(b1 - b2) < 6) b2 += 10;

    treeCol = hsbColor(hTree1, random(80, 100), b1);
    treCol = hsbColor(hTree2, random(80, 90), b2, 220);

    // Sky
    let h1 = pickHueWithinRange(range);
    let h2 = pickHueWithinRange(range);
    if (abs(h1 - h2) < 6) h2 += 20;

    sky1 = hsbColor(h1, random(40, 70), random(75, 90));
    sky2 = hsbColor(h2, random(10, 50), random(80, 100));
}
function generateLandscape(pg, step) {

    // FIX random seed so noise, shapes, clouds, sun are always
    //randomSeed(step * 99999);
    // noiseSeed(step * 77777);
    randomSeed(step * 10000 + millis());
    noiseSeed(step * 20000 + millis());

    pg.colorMode(HSB, 360, 100, 100, 255);

    determineValues();           // generates geometry
    generateColorsForStep(step); // generatespalette

    //pg.noStroke();
    sky(pg, 0, 0, width, horizonLine, sky1, sky2);
    sun(pg);
    makeClouds(pg);  // now because noiseSeed is fixed
    mountainsBG(pg);
    mountainsMG(pg);
    etrees(pg);
}
function sky(pg, x, y, w, h, c1, c2) {
    pg.noStroke();
    pg.noFill();
    for (let i = y; i <= y + h; i++) {
        let inter = map(i, y, y + h, 0, 1);
        pg.stroke(lerpColor(c1, c2, inter));
        pg.line(x, i, x + w, i);
        pg.noStroke();
    }
}
function sun(pg) {
    let sunX = random(10, width);
    let sunY = random(40, mbgMin);
    pg.fill(0, 0, 100);
    pg.ellipse(sunX, sunY, sunSize);
    pg.fill(0, 0, 100, 90);
    pg.ellipse(sunX, sunY, sunSize * 1.8);
    pg.fill(0, 0, 100, 70);
    pg.ellipse(sunX, sunY, sunSize * 2.3);
    pg.fill(0, 0, 100, 30);
    pg.ellipse(sunX, sunY, sunSize * 3);
}
function makeClouds(pg) {
    // pg.pixelDensity(1);
    pg.loadPixels();

    for (let x = 0; x < pg.width; x++) {
        for (let y = 0; y < pg.height * 0.3; y++) {

            let index = (x + y * pg.width) * 4;
            let cvalue = noise(x / 170, y / 10);

            if (cvalue < 0.35) {
                let setC = map(cvalue, 0.33, 0, 200, 255);
                pg.pixels[index + 0] = setC;
                pg.pixels[index + 1] = setC;
                pg.pixels[index + 2] = setC;
                pg.pixels[index + 3] = 110;
            }
        }
    }

    pg.updatePixels();
}
function mountainsBG(pg) {

    pg.fill(mbgCol);
    pg.beginShape();
    let xoff = random(0, 10);

    pg.vertex(-100, horizonLine);
    for (let x = 0; x < width; x += random(5, 15)) {
        let y = map(noise(xoff) * height, 0, height, mbgMax, mbgMin + 50);
        pg.vertex(x, y);
        xoff += 0.1;
    }
    pg.vertex(width + 100, horizonLine);
    pg.endShape(pg.CLOSE);
}
function mountainsMG(pg) {

    pg.fill(mmgCol);
    pg.beginShape();
    let xoff = random(0, 10);

    pg.vertex(-100, horizonLine);
    for (let x = 0; x < width; x += random(1, 10)) {
        let y = map(noise(xoff) * height, 0, height, mmgMax, mmgMin + 50);
        pg.vertex(x, y);
        xoff += 0.1;
    }
    pg.vertex(width + 100, horizonLine);
    pg.endShape(pg.CLOSE);
}
function etrees(pg) {
    // Back tree layer

    pg.fill(treCol);
    pg.beginShape();
    let xoff1 = random(0, 10);
    pg.vertex(-100, horizonLine);
    for (let x = 0; x < width; x += random(2, 5)) {
        let y = map(noise(xoff1) * height, 0, height, treeMin, treeMax + 10);
        pg.vertex(x, y);
        xoff1 += 0.1;
    }
    pg.vertex(width + 100, horizonLine);
    pg.endShape(pg.CLOSE);

    // Front tree layer
    pg.fill(treeCol);
    pg.beginShape();
    pg.vertex(-100, horizonLine);
    for (let x = 0; x < width; x += random(5, 20)) {
        pg.vertex(x, random(treeMax, treeMin));
        pg.vertex(x + 10, random(treeMin, horizonLine - 10));
    }
    pg.vertex(width + 100, horizonLine);
    pg.endShape(pg.CLOSE);
}
function wrapHue(h) {
    let r = h % 360;
    return r < 0 ? r + 360 : r;
}
function generateTree(start, length, color, width, angle, depth) {
    let segments = [];
    buildTree(start, length, color, width, angle, depth, segments);
    return segments;
}
function buildTree(start, branch_length, branch_color, branch_width, angle, max_branch, segments) {
    if (max_branch === 0) return;

    let endX = branch_length * sin(angle) + start.x;
    let endY = -branch_length * cos(angle) + start.y;

    // store this branch segment
    segments.push({
        x1: start.x, y1: start.y,
        x2: endX, y2: endY,
        color: branch_color,
        width: branch_width
    });

    let angle_change1 = random(-PI / 4, 0);
    let angle_change2 = random(0, PI / 4);

    buildTree(
        { x: endX, y: endY },
        random(branch_length * 0.3, branch_length * 0.9),
        { r: branch_color.r + 5, g: branch_color.g + 10, b: branch_color.b + 10 },
        branch_width * 0.6,
        angle + angle_change1,
        max_branch - 1,
        segments
    );

    buildTree(
        { x: endX, y: endY },
        random(branch_length * 0.3, branch_length * 0.9),
        { r: branch_color.r + 10, g: branch_color.g + 10, b: branch_color.b + 10 },
        branch_width * 0.6,
        angle + angle_change2,
        max_branch - 1,
        segments
    );
}
function drawFlower(x, y) {
    push();
    stroke(40, 100, 50);
    line(x, y, x, y + 10);

    noStroke();
    fill(330, 80, 100);
    for (let a = 0; a < TWO_PI; a += PI / 3) {
        ellipse(x + 8 * cos(a), y + 8 * sin(a), 10, 10);
    }

    fill(55, 100, 100);
    ellipse(x, y, 8, 8);
    pop();

}

function randomizeColors() {
    for (let p of plants) {
        p.color = { r: random(0, 20), g: random(200, 255), b: random(40, 100) };
    }
}

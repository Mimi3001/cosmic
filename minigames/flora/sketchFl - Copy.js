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
const params = new URLSearchParams(window.location.search);
const planetIndex = Number(params.get("planetIndex")) || 4;
const mg1Height = Number(params.get("mg1Height")) || 0;
const waterValue = Number(params.get("mg1Water")) || 0;

//let waterValue = 0;
let hasWater = false;
let waterShape = null; // stores polygon + bounds


function sunSizeFromPlanet(index) {
    return map(index, 1, 7, 80, 20);
}

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

    if (event.data?.type === "minigame1_water") {
        waterValue = Number(event.data.value) || 0;
        console.log("[WATER] Received waterValue from parent:", waterValue);
        regenerate = true; // force landscape rebuild
    }

});

function setup() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    createCanvas(w, h);
    colorMode(HSB, 360, 100, 100, 255);
    frameRate(5);

    const tools = document.querySelector(".flora-tools");
    const toggle = document.querySelector(".flora-tools-toggle");

    toggle.onclick = () => {
        tools.classList.toggle("open");
    };
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
    //document.getElementById("buchBtn").onclick = () => (currentPlant = "bush");
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
/*
function generateBamboo(start, height, thickness, detail) {
    let segments = [];

    let segmentCount = int(map(detail, 5, 12, 6, 14));
    let segmentLength = height / segmentCount;

    let dir = createVector(random(-0.1, 0.1), -1).normalize();

    let pos = createVector(start.x, start.y);

    for (let i = 0; i < segmentCount; i++) {
        let next = p5.Vector.add(
            pos,
            p5.Vector.mult(dir, segmentLength * random(0.8, 1.1))
        );

        segments.push({
            x1: pos.x,
            y1: pos.y,
            x2: next.x,
            y2: next.y,
            w: thickness,
            leaves: random() < 0.7,
            color: random(["#77af5b", "#76a855", "#c4e878"])
        });

        // slight bend
        dir.rotate(random(-0.1, 0.1));
        pos = next;
    }

    return segments;
}*/
//helper
function generateBamboo(x, y, height, thickness, detail) {
    let segments = [];
    let segCount = int(map(detail, 4, 12, 5, 10));
    let segLength = height / segCount;

    let px = x;
    let py = y;

    for (let i = 0; i < segCount; i++) {
        let nx = px + random(-3, 3);   // subtle curve
        let ny = py - segLength;

        let leaves = [];
        if (i > 1 && random() < 0.6) {
            let leafCount = int(random(2, 4));
            for (let l = 0; l < leafCount; l++) {
                leaves.push({
                    angle: random(-PI / 2, PI / 2),
                    length: random(18, 30)
                });
            }
        }

        segments.push({
            x1: px,
            y1: py,
            x2: nx,
            y2: ny,
            w: thickness,
            leaves: leaves
        });

        px = nx;
        py = ny;
    }

    return {
        type: "bamboo",
        segments: segments,
        color: color(
            random(80, 120),   // hue (green range)
            random(40, 70),    // saturation
            random(40, 80)     // brightness
        )
    };
}
function mousePressed() {
    if (mouseY < mbgMin) return;
    let baseHeight = parseInt(heightSlider.value);// Smaller near mountains, larger near bottom.

    let depth = map(mouseY, mmgMin, height, 0.2, 1.6); // scale 0.4 ↔ 1.2 from mmgMin to canvas height
    depth = constrain(depth, 0.2, 2.2);
    let scaledHeight = baseHeight * depth;

    let thickness = parseInt(sizeSlider.value) * 0.08;
    let detail = parseInt(detailSlider.value);
    /*let plantColor = {
        r: random(0, 20),
        g: random(180, 255),
        b: random(40, 120)
    };*/

    if (isPointInWater(mouseX, mouseY)) {
        plants.push(
            generateBamboo(
                mouseX,
                mouseY,
                scaledHeight,
                thickness,
                detail
            )
        );
        return;

        /*
                let bamboo = generateBamboo(
                    { x: mouseX, y: mouseY },
                    scaledHeight,
                    thickness,
                    detail
                );
        
                plants.push({
                    type: "bamboo",
                    segments: bamboo
                });
        
                return;*/
    }

    //if (currentPlant === "tree") {
    let branches = generateTree(
        { x: mouseX, y: mouseY },
        scaledHeight,
        /* plantColor,
         parseInt(sizeSlider.value) * 0.1,
         0,
         parseInt(detailSlider.value)*/
        { r: random(0, 20), g: 200, b: 60 },
        thickness,
        0,
        detail
    );

    /*plants.push({
        type: "tree",
        branches,
        // color: plantColor
    });*/
    /*if (currentPlant === "tree" && isPointInWater(mouseX, mouseY)) {

        let height = map(sizeSlider.value(), 10, 100, 60, 160);
        let thickness = map(detailSlider.value(), 1, 10, 2, 6);
*/
    plants.push({
        type: "tree",
        branches
    });




    /*metaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
        if (currentPlant === "flower") {
            plants.push({
                type: "flower",
                x: mouseX,
                y: mouseY,
                color: plantColor
            });
        }*/

    /*
        let branches = generateTree(
            { x: mouseX, y: mouseY },
            scaledHeight,
            {///xrwma dentroy
                r: random(0, 20),
                g: 200,
                b: 60
            },
    */
    /* parseInt(heightSlider.value),
     { r: random(0, 20), g: 200, b: 60 },*/
    /* parseInt(sizeSlider.value) * 0.1,
     0,
     parseInt(detailSlider.value)
 );

 plants.push({
     type: currentPlant,
     branches: branches
 });*/
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
        if (p.type === "bamboo") {

            for (let s of p.segments) {
                //stalk
                 stroke(p.color);
                //stroke(p.col[0], p.col[1], p.col[2]);
                strokeWeight(s.w);
                line(s.x1, s.y1, s.x2, s.y2);
                // node ring
                strokeWeight(s.w + 1);
                line(
                    s.x1 - s.w,
                    s.y1,
                    s.x1 + s.w,
                    s.y1
                );
                // leaves
                //stroke(p.col[0], p.col[1], p.col[2]);
                 stroke(p.color);
                strokeWeight(1);

                for (let leaf of s.leaves) {
                    line(
                        s.x2,
                        s.y2,
                        s.x2 + cos(leaf.angle) * leaf.length,
                        s.y2 + sin(leaf.angle) * leaf.length
                    );
                    /* if (s.leaves) {
                         noStroke();
                         fill(s.color);
                         push();
                         translate(s.x2, s.y2);
                         // rotate(random(-PI / 3, PI / 3)); //giannis pinei giannis kernaei
                         ellipse(10, 0, 20, 6);
                         ellipse(-10, 0, 20, 6);
                         pop();
                     }
                }
            }

            if (p.type === "flower") {
                drawFlower(p.x, p.y, p.color);
            }
            /*if (p.type === "bush") {
                drawBush(p.x, p.y, p.size, p.detail);
            }
    
            if (p.type === "seaweed") {
                drawSeaweed(p.x, p.y, p.size, p.detail);
            }*/
                }
            }
        }
    }
}
function determineValues() {
    const heightNorm = constrain(mg1Height / 0.1, 0, 1); // to 0.1 tou slider ginetai 1 
    console.log("[MG2] mg1Height:", mg1Height, "multiplier:", heightNorm);
    horizonLine = height * 0.42;

    treeMin = horizonLine - random(0, 20);
    treeMax = treeMin - random(20, 55);

    mmgMin = treeMax - random(5, 60);
    //mmgMax = mmgMin - random(0, 20);
    mmgMax = mmgMin - random(0, 20 + heightNorm * 120);

    mbgMin = mmgMin - random(0, 70);
    //mbgMax = mbgMin - random(10, 80);
    mbgMax = mbgMin - random(10, 30 + heightNorm * 160);

    sunSize = sunSizeFromPlanet(planetIndex);
    console.log("sunSize set from planetIndex", planetIndex, "sunSize:", sunSize);

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

    pg.noStroke();
    pg.fill(mmgCol);
    pg.rect(0, horizonLine, width, height - horizonLine);
    if (waterValue > 0) {
        console.log("[WATER] waterValue > 0 → generating water");
        generateWater(pg);
        cutLakeHole(pg, waterShape);
        drawWaterGradient(pg);

    } else {
        console.log("[WATER] waterValue = 0 → skipping water");
    }
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
/*
function generateWater(pg) {
    hasWater = true;
 
    //let waterTop = random(mmgMin + 40, height * 0.75);
    let maxWaterTop = horizonLine - 2; // hard ceiling
    let minWaterTop = horizonLine -4; // always below horizon
 
    let waterTop = random(minWaterTop, min(height * 0.75, maxWaterTop + 120));
 
    let waterBottom = height;
    let waterWidth = random(width * 0.3, width * 0.7);
    let waterX = random(width * 0.1, width * 0.9 - waterWidth);
 
    let points = [];
    let xoff = random(0, 100);
 
    for (let x = waterX; x <= waterX + waterWidth; x += 20) {
        let y = map(noise(xoff), 0, 1, waterTop - 40, waterTop + 40);
        y = max(y, horizonLine + 10);
        points.push({ x, y });
        xoff += 0.1;
    }
 
    // close shape at bottom
    points.push({ x: waterX + waterWidth, y: waterBottom });
    points.push({ x: waterX, y: waterBottom });
 
    waterShape = {
        points,
        top: waterTop,
        left: waterX,
        right: waterX + waterWidth
    };
 
    drawWater(pg, waterShape);
}*/
function generateWater(pg) {
    hasWater = true;

    // --- placement ---
    let centerY = random(horizonLine + 80, height * 0.75);
    let centerX = random(width * 0.3, width * 0.7);
    let baseRadius = random(width * 0.6, width * 0.32);//diastasti

    // safety clamp so it never crosses horizon----------------------------------
    centerY = max(centerY, horizonLine + baseRadius - 60);

    let points = [];
    let noiseOffset = random(1000);
    let steps = 40; // low-poly but organic

    for (let i = 0; i < steps; i++) {
        let angle = map(i, 0, steps, 0, TWO_PI);

        let nx = cos(angle) + 1.5;
        let ny = sin(angle) + 1.5;

        let n = noise(
            nx * 0.8 + noiseOffset,
            ny * 0.8 + noiseOffset
        );

        let radius = baseRadius * map(n, 0, 1, 0.6, 1.3);

        let x = centerX + cos(angle) * radius;
        let y = centerY + sin(angle) * radius;


        y = max(y, horizonLine - 10);

        points.push({ x, y });
    }

    waterShape = {
        points,
        centerX,
        centerY,
        radius: baseRadius
    };

    drawWater(pg, waterShape);
    let minY = height;
    let maxY = 0;

    for (let p of points) {
        minY = min(minY, p.y);
        maxY = max(maxY, p.y);
    }

    waterShape = {
        points,
        minY,
        maxY
    };

}
/*
function drawWaterGradient(pg) {
    let top = horizonLine - 10;
    let bottom = height;
 
    for (let y = top; y <= bottom; y++) {
        let inter = map(y, top, bottom, 0, 1);
        pg.stroke(lerpColor(sky2, sky1, inter));
        pg.line(0, y, width, y);
    }
}
function maskGroundExceptLake(pg) {
    pg.push();
 
    // solid ground color (same as your ground)
    pg.fill(mmgCol);
    pg.noStroke();
 
    // draw full ground rectangle
    pg.rect(0, horizonLine, width, height - horizonLine);
 
    // cut lake hole
    pg.erase();
    pg.beginShape();
    for (let p of waterShape.points) {
        pg.vertex(p.x, p.y);
    }
    pg.endShape(pg.CLOSE);
    pg.noErase();
 
    pg.pop();
}
 
 
function drawWater(pg, shape) {
    pg.push();
    pg.noStroke();
 
    // mirror sky gradient
    let topCol = sky2;
    let bottomCol = sky1;
 
 
    let gradientTop = max(shape.top, horizonLine + 10);
    //for (let y = shape.top; y <= height; y++) {
    for (let y = gradientTop; y <= height; y++) {
 
        let inter = map(y, shape.top, height, 0, 1);
        pg.stroke(lerpColor(topCol, bottomCol, inter));
        pg.line(shape.left, y, shape.right, y);
    }
 
    pg.noStroke();
    pg.fill(0, 0, 100, 40); // subtle sheen
 
    pg.beginShape();
    for (let p of shape.points) {
        pg.vertex(p.x, p.y);
    }
    pg.endShape(pg.CLOSE);
 
    pg.pop();
}
function drawWater(pg, shape) {
    pg.push();
    
    pg.noStroke();
 
    // --- mirrored sky gradient ---
    let gradTop = horizonLine + 5;
    let gradBottom = height;
 
    for (let y = gradTop; y <= gradBottom; y++) {
        let inter = map(y, gradTop, gradBottom, 0, 1);
        pg.stroke(lerpColor(sky2, sky1, inter));
        pg.line(0, y, width, y);
    }
 
    // --- mask gradient inside shape ---
    pg.erase();
    pg.beginShape();
    for (let p of shape.points) {
        pg.vertex(p.x, p.y);
    }
    pg.endShape(pg.CLOSE);
    pg.noErase();
 
    // subtle surface sheen
    pg.fill(0, 0, 100, 30);
    pg.beginShape();
    for (let p of shape.points) {
        pg.vertex(p.x, p.y);
    }
    pg.endShape(pg.CLOSE);
 
    pg.pop();
}
function drawWater(pg, shape) {
    pg.push();
 
    // --- 1. draw the lake shape as a mask ---
    pg.fill(255);
    pg.noStroke();
    pg.beginShape();
    for (let p of shape.points) {
        pg.vertex(p.x, p.y);
    }
    pg.endShape(pg.CLOSE);
 
    // --- 2. erase everything outside the shape ---
    pg.erase(255, 0);
 
    let gradTop = horizonLine + 10;
    let gradBottom = height;
 
    for (let y = gradTop; y <= gradBottom; y++) {
        let inter = map(y, gradTop, gradBottom, 0, 1);
        pg.stroke(lerpColor(sky2, sky1, inter));
        pg.line(0, y, width, y);
    }
 
 
    pg.noErase();
 
    // --- 3. subtle water sheen ---
    pg.noStroke();
    pg.fill(0, 0, 100, 25);
    pg.beginShape();
    for (let p of shape.points) {
        pg.vertex(p.x, p.y);
    }
    pg.endShape(pg.CLOSE);
 
    pg.pop();
}*/
function drawWater(pg, shape) {
    pg.push();
    pg.noStroke();

    let gradTop = horizonLine - 10;
    let gradBottom = height;

    for (let y = shape.minY; y <= shape.maxY; y++) {

        let inter = map(y, gradTop, gradBottom, 0, 1);
        let col = lerpColor(sky2, sky1, inter);

        pg.stroke(col);

        for (let x = 0; x <= width; x += 2) {
            if (pointInPolygon(x, y, shape.points)) {
                pg.point(x, y);
            }
        }
    }

    pg.pop();
}

function pointInPolygon(x, y, poly) {
    let inside = false;

    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        let xi = poly[i].x, yi = poly[i].y;
        let xj = poly[j].x, yj = poly[j].y;

        let intersect =
            ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

        if (intersect) inside = !inside;
    }
    return inside;
}
//geometry helper 
function isPointInWater(x, y) {
    if (!waterShape || !waterShape.points) return false;
    return pointInPolygon(x, y, waterShape.points);
}

function cutLakeHole(pg, shape) {
    pg.push();
    pg.erase();
    pg.noStroke();
    pg.beginShape();
    for (let p of shape.points) {
        pg.vertex(p.x, p.y);
    }
    pg.endShape(pg.CLOSE);
    pg.noErase();
    pg.pop();
}

function drawWaterGradient(pg) {
    pg.push();
    pg.noStroke();

    let top = horizonLine - 10;
    let bottom = height;

    for (let y = top; y <= bottom; y++) {
        let inter = map(y, top, bottom, 0, 1);
        pg.stroke(lerpColor(sky2, sky1, inter));
        pg.line(0, y, width, y);
    }

    pg.pop();
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


function drawFlower(x, y, col) {
    push();
    stroke(40, 100, 50);
    line(x, y, x, y + 10);

    noStroke();
    fill(col.r, col.g, col.b);
    for (let a = 0; a < TWO_PI; a += PI / 3) {
        ellipse(x + 8 * cos(a), y + 8 * sin(a), 10, 10);
    }

    fill(55, 100, 100);
    ellipse(x, y, 8, 8);
    pop();

}

function randomizeColors() {
    for (let p of plants) {
        //  p.color = { r: random(0, 20), g: random(200, 255), b: random(40, 100) };

        // new random base color
        let newCol = {
            r: random(0, 30),
            g: random(170, 255),
            b: random(40, 140)
        };

        p.color = newCol;

        // recolor tree branches
        if (p.type === "tree") {
            for (let b of p.branches) {
                b.color = {
                    r: newCol.r + random(-5, 5),
                    g: newCol.g + random(-10, 10),
                    b: newCol.b + random(-10, 10)
                };
            }
        }
    }
}
// This listens for the parent asking for the slider value
window.addEventListener("message", (event) => {

    if (event.data?.type === "request_slider_value") {
        //const sliderValue = document.getElementById("hueSlider").value;
        const sliderValue = hueSlider.value();
        // Send value back to parent
        window.parent.postMessage(
            { type: "minigame2_result", value: sliderValue },
            "*"
        );
    }

    if (event.data?.type === "set_prompt") {
        const el = document.getElementById("mg-prompt");
        if (el) el.textContent = event.data.text || "";
    }
});
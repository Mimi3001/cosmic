let worldData = null;
let plants = [];
let animals = [];

let currentAnimal = 0; // 0 cat, 1 dog, 2 bunny
let landscapeSeed = 0;
let regenerate = true;

let horizonLine;
let treeMin;
let treeMax;
let mmgMin;
let mmgMax;
let mbgMin;
let mbgMax;
let sunSize;

let sky1, sky2, lake1, lake2;
let treeCol, treCol, mmgCol, mbgCol;

let hasWater = false;
let waterShape = null;

let hueRanges = [
    { min: 140, max: 290 },
    { min: 90, max: 210 },
    { min: 40, max: 180 },
    { min: 10, max: 110 },
    { min1: 0, max1: 70, min2: 330, max2: 360 }
];
let bgReady = false;
function drawPlantsFromMG3(pg, worldData) {
    if (!worldData?.plants) return;

    for (let p of worldData.plants) {
        if (p.type === "tree") {
            drawTreeFromData(pg, p);
        }
        if (p.type === "flower") {
            drawFlowerFromData(pg, p);
        }
    }
}
function drawTreeFromData(pg, p) {
    pg.push();
    pg.translate(p.x, p.y);

    /* pg.scale(p.size);
     pg.fill(p.color);
     pg.rect(-5, 0, 10, -40);*/
    if (p.type === "tree") {
        pg.fill(p.trunkColor || 80, 60, 40);
        pg.rect(-p.size * 0.1, 0, p.size * 0.2, -p.size);

        pg.fill(p.leafColor || 120, 60, 60);
        pg.ellipse(0, -p.size, p.size, p.size);
    }

    if (p.type === "flower") {
        pg.fill(p.color || 300, 80, 80);
        pg.ellipse(0, 0, p.size, p.size);
    }

    pg.pop();
}

function sunSizeFromPlanet(index) {
    return map(index, 1, 7, 80, 20);
}

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    colorMode(HSB, 360, 100, 100, 255);
    noStroke();
    pg = createGraphics(windowWidth, windowHeight);

    // Tools toggle
    const tools = document.querySelector(".flora-tools");
    const toggle = document.querySelector(".flora-tools-toggle");
    toggle.onclick = () => tools.classList.toggle("open");

    // Animal buttons
    document.getElementById("aBtn").onclick = () => currentAnimal = 0;
    document.getElementById("bBtn").onclick = () => currentAnimal = 1;
    document.getElementById("cBtn").onclick = () => currentAnimal = 2;

    //document.getElementById("randomizeBtn").onclick = randomizeAnimals;
    const randomizeBtn = document.getElementById("randomizeBtn");
    if (randomizeBtn) {
        randomizeBtn.onclick = randomizeAnimals;
    }
}
function windowResized() {
    resizeCanvas(window.innerWidth, window.innerHeight);
    //regenerate = true; // redraw but SAME seed
    if (!worldData) return;
    pg = createGraphics(width, height);// recreate buffer
    generateLandscapeFromMG3(worldData.landscape);// redraw SAME landscape

}
function draw() {
    //background(180, 20, 100, 255);
    if (!worldData) return;
    /*
        if (regenerate) {
            randomSeed(landscapeSeed);
            noiseSeed(landscapeSeed);
            generateLandscapeFromMG3(worldData.landscape);
            regenerate = false;
        }*/
    //  lock values from MG3 world
    /*step = worldData.landscape.step;
    planetIndex = worldData.landscape.planetIndex;
    mg1Height = worldData.landscape.mg1Height;
    waterValue = worldData.landscape.mg1Water;*/

    //generateLandscape(pg, step);
    if (!bgReady) {
        generateLandscapeFromMG3(worldData.landscape);
        bgReady = true;
    }

    //drawPlantsFromMG3(plants);
    image(pg, 0, 0);
    drawPlantsFromMG3(pg, worldData);//simantiko
    drawAnimals();
}
/*
function drawPlantsFromMG3() {
  if (!worldData || !worldData.plants) return;

  for (let p of worldData.plants) {
   // p.draw();
   drawPlantFromData(p);
  }
}
*/

function generateLandscapeFromMG3(data) {
    step = data.step;
    planetIndex = data.planetIndex;
    mg1Height = data.mg1Height;
    waterValue = data.mg1Water;
    console.log("[MG4 DRAW] 1 waterValue =", waterValue);
    pg.clear();
    pg.colorMode(HSB, 360, 100, 100, 255);
    pg.background(180, 20, 100);

    generateLandscape(pg, step); // reuse your function
}
function mousePressed() {
    if (!worldData) return;

    animals.push({
        x: mouseX,
        y: mouseY,
        type: currentAnimal,
        colSeed: random(10000)
    });
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
    // randomSeed(landscapeSeed);
    noiseSeed(landscapeSeed);//auto pagwni to fonto gia panta

    // randomSeed(step * 10000 + millis());
    // noiseSeed(step * 20000 + millis());

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
    //KLENO PROSORINA
    if (waterValue > 0) {
        console.log("[WATER] waterValue > 0 → generating water");
        generateWater(pg);
        cutLakeHole(pg, waterShape);
        drawWaterGradient(pg);
        //KLEINO PROSOTINA
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
function drawLandscape() {
    background(180, 20, 100);

    step = worldData.landscape.step;
    planetIndex = worldData.landscape.planetIndex;
    mg1Height = worldData.landscape.mg1Height;
    //waterValue = worldData.landscape.mg1Water;

    generateLandscape(this, step);
    generateLandscape(pg, step);

    if (storedMG3World) {
        drawFloraFromMG3(pg, storedMG3World);
    }

}
/*
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
}*/
/*
function generateLotus(x, y, detailNorm, sizeNorm) {


    let hasFlower = random() < 0.6; // 60% flower, 40% leaf-only

    let flowers = [];
    if (hasFlower) {
        let count = floor(lerp(1, 4, detailNorm));
        for (let i = 0; i < count; i++) {
            flowers.push({
                x: random(-16, 15),
                y: random(-15, 14),
                //  s: random(0.45, 0.6)//megethos
                s: sizeNorm * random(0.8, 1.0)
            });
        }
    }
    let leaves = [];
    let leafCount = floor(lerp(1, 3, detailNorm));
    for (let i = 0; i < leafCount; i++) {
        leaves.push({
            a: random(TWO_PI),
            r: sizeNorm * random(12, 18)
        });
    }

    return {
        type: "lotus",
        x, y,
        flowers,
        leaves,
        hasFlower,
        col: random([
            color(random(0, 60), 15, 97),
            color(random(190, 360), random(5, 25), 97),
        ]),
        leafCol: color(random(100, 120), random(35, 50), random(25, 45))
    };
}

function generateFlower(x, y, detailNorm, sizeNorm) {

    let count = floor(lerp(1, 6, detailNorm));

    let flowers = [];
    // flowers.push({ x: 0, y: 0, s: 1 });//dinei panta 1 

    for (let i = 0; i < count; i++) {//pio polla
        flowers.push({
            x: random(-14, 10),
            y: random(-10, 15),
            // s: random(0.45, 0.6)//megethos
            s: sizeNorm * random(0.8, 1.0)
        });
    }
    return {
        type: "flower",
        x, y,
        flowers,

        col: random([
            color(random(0, 60), 45, 90),
            color(random(260, 360), 30, 90),
        ])
    };
}
function generateBamboo(x, y, height, thickness) {

    let internodeCount = int(map(height, 30, 160, 3, 7));
    internodeCount = constrain(internodeCount, 3, 7);

    let internodeH = height / internodeCount;
    let lean = random(-0.12, 0.12);

    let col = color(
        random(80, 120),
        random(40, 70),
        random(40, 80)
    );

    // texture lines .de douleuei . einai san skia katw
    let textureLines = [];
    let texCount = int(thickness * 1.2);
    for (let i = 0; i < texCount; i++) {
        textureLines.push({
            x: random(-thickness / 2, thickness / 2),
            alpha: random(20, 40)
        });
    }

    // leaves only near top
    let leaves = [];
    let leafCount = int(random(2, 8));//posa fulla
    for (let i = 0; i < leafCount; i++) {
        leaves.push({
            angle: (i % 2 === 0 ? -1 : 1) * random(0.1, 2.9),//kateuthinsi!!! 
            len: height * random(0.25, 0.4),
            w: height * 0.055   //paxos fullwn
        });
    }

    return {
        type: "bamboo",
        x, y,
        h: height,
        w: thickness,
        internodes: internodeCount,
        internodeH,
        lean,
        color: col,
        textureLines,
        leaves
    };

}
function drawPlantFromData(p) {
  push();
  translate(p.x, p.y);

  randomSeed(p.seed);
  noiseSeed(p.seed);

  if (p.type === "tree") {
    generateTree(p.size, p.height, p.detail);
  } else if (p.type === "flower") {
    generateFlower(p.size, p.detail);
  }

  pop();
}


function drawPlants() {
    for (let p of plants) {
        if (p.type === "tree") {
            for (let b of p.branches) {
                stroke(b.color.r, b.color.g, b.color.b);
                strokeWeight(b.width);
                line(b.x1, b.y1, b.x2, b.y2);
            }
        }
        function drawFloraFromMG3(pg, floraData) {
            pg.push();

            floraData.trees.forEach(t =>
                drawTree(t.x, t.y, t.size, t.height, t.detail, t.col)
            );

            floraData.flowers.forEach(f =>
                drawFlower(f.x, f.y, f.size, f.detail, f.col)
            );

            floraData.bamboo.forEach(b =>
                drawBamboo(b.x, b.y, b.size, b.height, b.col)
            );

            floraData.lotus.forEach(l =>
                drawLotus(l.x, l.y, l.size, l.col)
            );

            pg.pop();
        }

    }
}
*/
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
function drawPlantsFromMG3(pg, worldData) {
    if (!worldData?.plants) return;

    for (let p of worldData.plants) {
        if (p.type === "tree") {
            drawTreeFromData(pg, p);
        }
        if (p.type === "flower") {
            drawFlowerFromData(pg, p);
        }
    }
}
function drawTreeFromData(pg, p) {
    pg.push();
    pg.translate(p.x, p.y);
    pg.scale(p.size);
    pg.fill(p.color);
    pg.rect(-5, 0, 10, -40);
    pg.pop();
}

function drawAnimals() {
    for (let a of animals) {
        randomSeed(a.colSeed);
        drawAnimal(a.x, a.y, a.type);
    }
}
function drawAnimal(x, y, type) {

    if (type === 0) { // curled cat
        fill(200, 180, 220);
        ellipse(x, y, 18, 14);
        ellipse(x + 6, y - 6, 10, 10); // head
        fill(150);
        triangle(x + 3, y - 10, x + 5, y - 14, x + 7, y - 10); // ear
        triangle(x + 9, y - 10, x + 7, y - 14, x + 11, y - 10);
    } else if (type === 1) { // floppy dog
        fill(220, 200, 170);
        ellipse(x, y, 20, 12); // body
        ellipse(x - 6, y - 4, 10, 10); // head
        fill(160);
        ellipse(x - 9, y - 4, 4, 4); // ear
    } else if (type === 2) { // tiny bunny
        fill(230, 230, 230);
        ellipse(x, y, 16, 12); // body
        ellipse(x + 4, y - 6, 8, 8); // head
        fill(200);
        rect(x + 3, y - 12, 2, 6, 2); // ear 1
        rect(x + 6, y - 12, 2, 6, 2); // ear 2
    }
}
function randomizeAnimals() {
    for (let a of animals) {
        a.seed = random(10000);
    }
}
/*
document.getElementById("randomizeBtn").onclick = () => {
    for (let a of animals) {
        a.colSeed = random(10000);
    }
};*/

//mia fora
window.addEventListener("message", (event) => {
    if (event.data?.type === "init_world") {
        worldData = event.data.payload;
        console.log("[MG4] received mg3 world:", worldData);
        console.log("[MG4 CHECK] mg1Water =", worldData.landscape.mg1Water);
        /*landscapeSeed = worldData.landscape.seed;
        plants = worldData.plants;
        regenerate = true;*/
        pg = createGraphics(width, height);
        generateLandscapeFromMG3(worldData.landscape);
    }

    if (event.data?.type === "reset_game") {
        animals = [];
        regenerate = false;//na  meinei idio fonto
    }

    if (event.data?.type === "set_prompt") {
        const el = document.getElementById("mg-prompt");
        if (el) el.textContent = event.data.text || "";
    }
});

let currentPlant = "tree";
let plants = [];
let sizeSlider, detailSlider, heightSlider;
let step = 2; // default until message arrives

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
function mousePressed() {
    if (mouseY < mbgMin) return;
    let baseHeight = parseInt(heightSlider.value);// Smaller near mountains, larger near bottom.
    let depth = map(mouseY, mmgMin, height, 0.2, 1.6); // scale 0.4 ↔ 1.2 from mmgMin to canvas height
    depth = constrain(depth, 0.2, 2.2);
    let scaledHeight = baseHeight * depth;
    
    let thickness = parseInt(sizeSlider.value) * 0.08;
    let detail = parseInt(detailSlider.value);
    let detailRaw = parseInt(detailSlider.value);
    let detailNorm = map(detailRaw, 3, 12, 0, 1);// 3 to 12 apo to html na ta antistoixisei
    detailNorm = constrain(detailNorm, 0, 1); //min to max
    let sizeNorm = map(sizeSlider.value, 20, 80, 0.5, 1.0);//apo times tou html
    sizeNorm = constrain(sizeNorm, 0.5, 1.0);//na ta tautisei se auto to euros klimakas
    let flowerScale = sizeNorm * depth;
    if (isPointInWater(mouseX, mouseY)) {
        if (currentPlant === "tree") {
            plants.push( //TREE button + WATER = BAMBOO
                generateBamboo(
                    mouseX,
                    mouseY,
                    scaledHeight,
                    thickness,
                    detail,
                )
            );
            // return;
        }
        else if (currentPlant === "flower") {
            // FLOWER button + WATER = LOTUS
            plants.push(
                generateLotus(
                    mouseX,
                    mouseY,
                    detailNorm,
                    flowerScale
                )
            );
        }
        return;
    }
    if (currentPlant === "tree") {//sto edafos = kanonika
        let branches = generateTree(
            { x: mouseX, y: mouseY },
            scaledHeight,
            { r: random(0, 20), g: 200, b: 60 },
            thickness,
            0,
            detail
        );

        plants.push({
            type: "tree",
            branches
        });
    }

    else if (currentPlant === "flower") {
        plants.push(
            generateFlower(
                mouseX,
                mouseY,
                detailNorm,
                flowerScale
            )
        );
    }
}
function draw() { // draw dinei sxima generate dinei dedomena
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
            push();
            translate(p.x, p.y);
            rotate(p.lean);

            rectMode(CENTER);
            noStroke();
            fill(p.color);

            let yCursor = 0;

            for (let i = 0; i < p.internodes; i++) {
                rect(0, -yCursor - p.internodeH / 2, p.w, p.internodeH);// internode body
                rect(0, -yCursor, p.w + 2, 2); // node ring

                /*
                rect(0, -p.h, p.w, p.h); // stalk
                rect(p.w / 2, -p.h, p.w + 2, 2);// nodes
                rect(p.w / 2, 0, p.w + 2, 2);*/

                // texture lines
                for (let t of p.textureLines) {
                    stroke(hue(p.color), saturation(p.color), brightness(p.color), t.alpha);
                    line(t.x, yCursor, t.x, -yCursor - p.internodeH);
                }
                yCursor += p.internodeH;
                //stroke(hue(p.color), saturation(p.color), brightness(p.color), t.a);
                //line(t.x, 0, t.x, -t.h);
            }

            // leaves
            noStroke();
            for (let l of p.leaves) {
                push();
                translate(p.w / 2, -p.h + 10);
                rotate(l.angle);
                fill(p.color);
                beginShape();
                vertex(0, 0);
                quadraticVertex(
                    l.len * 0.6,
                    l.w,
                    l.len,
                    0
                );
                quadraticVertex(
                    l.len * 0.6,
                    -l.w,
                    0,
                    0
                );
                /*
                curveVertex(l.len * 0.5, 6);
                vertex(l.len, 0);
                curveVertex(l.len * 0.5, -6);*/
                endShape(CLOSE);
                pop();
            }
            pop();
        }
        else if (p.type === "lotus") {
            push();
            translate(p.x, p.y);
           // scale(1);   // 🔹 1/4 size
            scale(p.scale);//apply once
            // leaves
            noStroke();

            fill(p.leafCol);
            for (let l of p.leaves) {
                arc(
                    cos(l.a) * l.r,
                    sin(l.a) * l.r,
                    l.r * 2,
                    l.r * 2,
                    l.a - PI * 0.9,
                    l.a + PI * 0.9
                );
            }

            // flowers
            for (let f of p.flowers) {
                push();
                translate(f.x, f.y);
                scale(f.s);
                fill(p.col);
                if (p.hasFlower) {
                    push();

                    // outer petals (lighter)
                    fill(hue(p.col), saturation(p.col) * 0.7, brightness(p.col));
                    for (let i = 0; i < 8; i++) {
                        rotate(TWO_PI / 8);
                        ellipse(0, -8, 5, 14);
                    }

                    // inner petals (more saturated)
                    fill(hue(p.col), saturation(p.col), brightness(p.col) * 0.95);
                    for (let i = 0; i < 6; i++) {
                        rotate(TWO_PI / 6);
                        ellipse(0, -5, 4, 10);
                    }
                    // center
                    fill(45, 60, 90);
                    ellipse(0, 0, 4);
                    pop();
                }
                pop();
            }

            pop();
        }
    
        else if (p.type === "flower") {
            push();
            translate(p.x, p.y);
           // scale(0.5);   // 🔹 1/4 size

            for (let f of p.flowers) {
                push();
                translate(f.x, f.y);
                scale(f.s);
                fill(p.col);
                noStroke();

                for (let j = 0; j < 5; j++) {
                    rotate(TWO_PI / 5);
                    ellipse(0, -6, 4, 8);
                }

                fill(50, 50, 90);
                ellipse(0, 0, 3);
                pop();
            }
            pop();
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
    //KLENO PROSORINA
    //if (waterValue > 0) {
    console.log("[WATER] waterValue > 0 → generating water");
    generateWater(pg);
    cutLakeHole(pg, waterShape);
    drawWaterGradient(pg);
    //KLEINO PROSOTINA
    // } else {
    //    console.log("[WATER] waterValue = 0 → skipping water");
    //  }
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
            r: sizeNorm*random(12, 18)
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
        if (p.type === "tree") {
            // new random base color
            let newCol = {
                r: random(0, 30),
                g: random(170, 255),
                b: random(40, 140)
            };

            p.color = newCol;

            // recolor tree branches
            //if (p.type === "tree") {
            for (let b of p.branches) {
                b.color = {
                    r: newCol.r + random(-5, 5),
                    g: newCol.g + random(-10, 10),
                    b: newCol.b + random(-10, 10)
                };
            }
        }
        else if (p.type === "bamboo") {
            p.color = color(
                random(80, 120),   // hue
                random(40, 70),    // saturation
                random(40, 80)     // brightness
            );
        }
        else if (p.type === "lotus") {
            p.col = random([//ta anthi
                color(random(0, 60), 15, 97),
                color(random(190, 360), random(5, 25), 97)
            ]);
            p.leafCol = color(random(100, 120), random(35, 50), random(25, 45));//ta fulla
        }
        else if (p.type === "flower") {
            p.col = random([
                color(random(0, 60), 45, 90),
                color(random(260, 360), 30, 90)
            ]);
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
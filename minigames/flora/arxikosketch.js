let currentPlant = "tree";
let plants = [];
let sizeSlider, detailSlider, heightSlider;

function setup() {
    createCanvas(800, 500);
    colorMode(HSB, 255);

    sizeSlider = document.getElementById("sizeSlider");
    detailSlider = document.getElementById("detailSlider");

    // TREE HEIGHT SLIDER
    const heightControl = document.createElement("label");
    heightControl.innerHTML = ` Tree Height: <input type="range" id="heightSlider" min="50" max="300" value="150" />`;
    document.body.insertBefore(heightControl, document.body.children[2]);
    heightSlider = document.getElementById("heightSlider");


    // RESET button
    const resetBtn = document.createElement("button");
    resetBtn.innerText = "Reset";
    resetBtn.onclick = () => (plants = []);
    document.body.children[0].appendChild(resetBtn);

    document.getElementById("treeBtn").onclick = () => (currentPlant = "tree");
    document.getElementById("flowerBtn").onclick = () => (currentPlant = "flower");
    document.getElementById("randomizeColorsBtn").onclick = randomizeColors;
}

function mouseDragged() {
    if (mouseY < 0 || mouseY > height) return;
    plants.push({
        type: currentPlant,
        x: mouseX,
        y: mouseY,
        size: parseInt(sizeSlider.value),
        detail: parseInt(detailSlider.value),
        height: parseInt(heightSlider.value),
        color: { r: random(0, 20), g: 200, b: 60 }
        //leafColor: color(random(50, 150), random(100, 200), random(50, 150)),
        //petalColor: color(random(150, 255), random(100, 200), random(150, 255))
    });
}

function draw() {
    background(250, 100, 255);
    noStroke();

    fill(50, 160, 100);
    rect(0, height / 2, width, height);

    for (let p of plants) {
        if (p.type === "tree") drawTree(p);
       // else drawFlower(p);
    }
}

let branch_width_reducer = 0.6;


function drawFractalTree(p) {
    tree(
        { x: p.x, y: p.y },
        p.height,
        p.color,
        p.size * 0.1,
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
/*
function drawTree(p) {
    stroke(80, 40, 20);
    strokeWeight(p.size * 0.1);
    line(p.x, p.y, p.x, p.y - p.size);

    noStroke();
    fill(p.leafColor);
    for (let i = 0; i < p.detail; i++) {
        let angle = (TWO_PI / p.detail) * i;
        let xOff = cos(angle) * p.size * 0.5;
        let yOff = sin(angle) * p.size * 0.5;
        circle(p.x + xOff, p.y - p.size + yOff, p.size * 0.4);
    }
}*/
/*
function drawFlower(p) {
    noStroke();
    fill(p.petalColor);
    for (let i = 0; i < p.detail; i++) {
        let angle = (TWO_PI / p.detail) * i;
        let xOff = cos(angle) * p.size * 0.4;
        let yOff = sin(angle) * p.size * 0.4;
        ellipse(p.x + xOff, p.y + yOff, p.size * 0.4, p.size * 0.7);
    }
    fill(255, 200, 0);
    circle(p.x, p.y, p.size * 0.3);
}*/

function randomizeColors() {
    for (let p of plants) {
        p.color = { r: random(0, 20), g: random(200, 255), b: random(40, 100) };
        //p.leafColor = color(random(50, 150), random(100, 200), random(50, 150));
        //p.petalColor = color(random(150, 255), random(100, 200), random(150, 255));
    }
}
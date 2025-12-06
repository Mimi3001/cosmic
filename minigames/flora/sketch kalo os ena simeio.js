let currentPlant = "tree";
let plants = [];
let sizeSlider, detailSlider, heightSlider;

function setup() {
    createCanvas(1112, 834);
    colorMode(HSB, 255);
    frameRate(5);


    sizeSlider = document.getElementById("sizeSlider");
    detailSlider = document.getElementById("detailSlider");
    heightSlider = document.getElementById("heightSlider");

    // TREE HEIGHT SLIDER
    /*const heightControl = document.createElement("label");
    heightControl.innerHTML = ` Tree Height: <input type="range" id="heightSlider" min="50" max="300" value="150" />`;
    document.body.insertBefore(heightControl, document.body.children[2]);
    heightSlider = document.getElementById("heightSlider");*/

    // RESET button
    const resetBtn = document.createElement("button");
    resetBtn.innerText = "Reset";
    resetBtn.onclick = () => (plants = []);
    document.body.children[0].appendChild(resetBtn);

    document.getElementById("treeBtn").onclick = () => (currentPlant = "tree");
    document.getElementById("flowerBtn").onclick = () => (currentPlant = "flower");
    document.getElementById("randomizeColorsBtn").onclick = randomizeColors;
}

function mousePressed() {
    if (mouseY < 0 || mouseY > height) return;
    plants.push({
        type: currentPlant,
        x: mouseX,
        y: mouseY,
        size: parseInt(sizeSlider.value),
        detail: parseInt(detailSlider.value),
        height: parseInt(heightSlider.value),
        color: { r: random(0, 20), g: 200, b: 60 }
    });
}

function draw() {
    background(100, 40, 180);
    noStroke();


    for (let p of plants) {
        if (p.type === "tree") drawFractalTree(p);
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

function randomizeColors() {
    for (let p of plants) {
        p.color = { r: random(0, 20), g: random(200, 255), b: random(40, 100) };
    }
}

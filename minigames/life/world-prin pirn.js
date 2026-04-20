let currentMode = "flora";
let currentPlant = "flower";

let plants = [];
let sizeSlider, detailSlider, heightSlider;
let step = 2; // default until message arrives

let animals = [];
let currentAnimalClass = "reptile/ave/fish";
let animalSize = 30;
let animalHue = 200;

let civil = [];
//let civilEntities = [];//?
let currentCivilType = "human";
let smudges = [];
let civilDetail = 3;
let pollutionLayers = 0;


let regenerate = true;   // generate once on load
let landscape;
let worldRestored = false;


let cloudLayer;
let horizonRatio = 0.42;  // 42% 
let horizonLine;
let prevW, prevH;//

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
let planetIndex = Number(params.get("planetIndex")) || 4;
let mg1Height = Number(params.get("mg1Height")) || 0;
////const waterValue = Number(params.get("mg1Water")) || 0;



let waterValue = Number(params.get("mg1Water")) || 0;
//let waterValue = 0;
////let mg1Water = 0;
let hasWater = false;
let waterShape = null; // stores polygon + bounds
let seed = 0;
let landscapeSeed = Math.floor(Math.random() * 1e9);


let depth = 1;
let scaledHeight = 50;
/* axristo pleon
const speciesToType = {
    bee: 18,
    frog: 4,
    fish: 5,
    sheep: 6,
    cow: 7,
    fox: 8,
    chicken: 9,
    ladybug: 10,
    turtle: 11,
    tortoise: 12,
    lizard: 13,
    bat: 14,
    shrimp: 15,
    hippo: 16,
    duck: 17,
    human: 1,
    house: 2,
    production: 3
};*/
// probability of grassBlade vs grassField per planet (0 = all field, 1 = all blade)
const grassBladeWeight = {
    1: 0.8,  // Hamarik — mostly blade
    2: 0.3,  // Tahay — mostly field
    3: 0.3,  // Chura — mostly field
    4: 0.7,  // Santamasa — mostly blade  
    5: 0.8,  // Ahra — mostly blade
    6: 0.3,  // Lete — mostly field
    7: 0.8   // Veles — mostly blade
};
const animalPools = {
    // 1 = Hamarik — small animals, types 1-18 + universal
    1: {
        sizeMultiplier: 0.5,
        pale: false,
        dark: false,
        sky: [[14, 3], [18, 3], [39, 3], [17, 2], [23, 1], [26, 2], [28, 2]],
        water: [[5, 5], [11, 2], [15, 2], [4, 2], [17, 1], [16, 3], [22, 1], [21, 1], [23, 1], [29, 23]],
        land: [[6, 5], [7, 3], [8, 1], [9, 4], [13, 3], [12, 1], [10, 3], [28, 1], [38, 3], [40, 4], [21, 1]]
    },
    // 2 = Tahay — hot desert, 1-18 + exclusives + universal
    2: {
        sizeMultiplier: 1.0,
        pale: false,
        dark: false,
        sky: [[14, 2], [18, 4], [39, 2], [17, 2]],
        water: [[5, 5], [11, 2], [15, 2], [4, 3], [39, 4], [21, 1], [26, 2]],
        land: [[6, 2], [7, 1], [8, 2], [9, 2], [13, 5], [12, 3], [10, 1], [24, 1], [25, 5], [30, 3],//iguana
        [31, 5], [32, 5], [33, 3], [34, 4], [35, 5], [36, 4], [37, 4], [38, 4], [40, 4]] // camel,jerboa,horse,snake,scorpion,meerkat,fennec
    },
    // 3 = Chura — all 40 animals
    3: {
        sizeMultiplier: 1.0,
        pale: false,
        dark: false,
        sky: [[14, 3], [18, 4], [17, 2], [23, 3], [24, 2], [26, 4], [28, 3], [39, 4]],
        water: [[5, 5], [11, 2], [15, 2], [4, 4], [16, 3], [22, 4], [26, 2], [29, 4], [39, 3], [20, 1], [21, 1]],
        land: [[6, 3], [7, 2], [8, 1], [9, 4], [13, 3], [12, 1], [10, 2],
        [19, 2], [20, 2], [21, 2], [23, 2], [24, 1], [25, 4], [27, 3], [28, 2], [29, 1], [30, 3],
        [31, 2], [32, 2], [33, 4], [34, 3], [35, 4], [36, 3], [37, 2], [38, 4], [39, 1], [40, 4]]
    },
    // 4 = Santamasa — 1-18 + universal, bigger
    4: {
        sizeMultiplier: 1.5,
        pale: false,
        dark: false,
        sky: [[14, 3], [18, 3], [39, 4], [17, 3], [24, 1], [28, 2]],
        water: [[5, 4], [11, 2], [15, 2], [4, 2], [16, 2], [20, 1], [21, 2], [23, 1], [24, 2], [29, 2], [30, 1]],
        land: [[6, 4], [7, 4], [8, 2], [9, 4], [13, 3], [12, 2], [10, 2], [29, 1], [30, 3], [33, 2], [34, 1], [38, 2], [39, 2], [40, 4], [20, 2], [21, 1], [19, 1]]
    },
    // 5 = Ahra — cold/pale, polar exclusives + all 1-18 pale
    5: {
        sizeMultiplier: 1.0,
        pale: true,///////////////////////////////////////////////
        dark: false,
        sky: [[14, 4], [18, 1], [17, 3], [26, 3]],
        water: [[5, 3], [11, 2], [15, 3], [4, 1], [21, 4], [22, 3], [19, 1], [20, 1]],  // seal common
        land: [[6, 4], [7, 2], [8, 2], [9, 2], [13, 1], [12, 2],
        [19, 3], [20, 4], [21, 3], [27, 1], [33, 2], [8, 2]] // polar bear, penguin common
    },
    // 6 = Lete — all 40 animals
    6: {
        sizeMultiplier: 1.0,
        pale: false,
        dark: true,
        sky: [[14, 3], [18, 3], [17, 3], [23, 2], [24, 4], [26, 4], [39, 4], [28, 2]],
        water: [[5, 4], [11, 2], [15, 2], [4, 2], [16, 2], [22, 4], [39, 2], [29, 2], [20, 1], [21, 2]],
        land: [[6, 3], [7, 2], [8, 2], [9, 3], [13, 3], [12, 1], [10, 2],
        [19, 2], [20, 2], [21, 2], [25, 3], [27, 3], [30, 3],
        [31, 2], [32, 2], [33, 3], [34, 3], [35, 2], [36, 3], [37, 3], [38, 2], [40, 4]]
    },
    // 7 = Veles — tropical, aquatic, bigger, more birds/fish/insects
    7: {
        sizeMultiplier: 1.3,
        pale: false,
        dark: true,
        sky: [[14, 2], [18, 3], [17, 2], [23, 4], [24, 4], [26, 3], [39, 4], [28, 4]], // parrots,birds,insects boosted
        water: [[5, 4], [4, 4], [11, 3], [15, 4], [16, 3], [17, 3], [20, 2], [21, 4], [22, 4], [25, 3], [26, 2], [27, 2], [29, 3], [30, 1], [33, 1], [39, 4]],   // tropical fish, blue frog boosted
        land: [[6, 2], [7, 2], [8, 2], [9, 2], [10, 3], [13, 2], [12, 1], [20, 1], [23, 2], [23, 2], [28, 1], [29, 3], [33, 3], [39, 2], [38, 3], [40, 4],
        [25, 4], [27, 4], [30, 4], [32, 2], [36, 4], [37, 3]]  // iguana, leopard, giraffe
    }
};

let currentLang = "el";

function updateUILang() {
    document.querySelectorAll("[data-el]").forEach(el => {
        // skip elements that contain child elements (like labels with inputs)
        /*if (el.children.length > 0) {
          // // has child elements (like label with input) /only update the first text node
          for (let node of el.childNodes) {
            if (node.nodeType === 3 && node.textContent.trim()) {
              if (currentLang === "el") {
                if (!el.dataset.en) el.dataset.en = node.textContent.trim();
                node.textContent = el.dataset.el + " ";
              } else {
                if (el.dataset.en) node.textContent = el.dataset.en + " ";
              }
              break;
            }
          }
        } else {*/
        // no children — safe to replace textContent
        if (currentLang === "el") {
            if (!el.dataset.en) el.dataset.en = el.textContent.trim();
            el.textContent = el.dataset.el;

        } else {
            if (el.dataset.en) el.textContent = el.dataset.en;
        }
        // }
    });
}

function setMode(mode) { //Mode Tools Switch-deleitourgounakoma
    currentMode = mode;

    /* disableAllTools();//thaginei me css
 
     if (mode === "flora") enableFloraTools();
     if (mode === "animals") enableAnimalTools();
     if (mode === "humans") enableHumanTools();*/
    console.log("Mode set to:", mode);

    document.body.classList.remove("flora", "animals", "civil", "mg6");

    if (mode === "mg6") {
        //currentMode = "mg6"; // default click behaviour starts as flora
        // open BOTH panels
        document.body.classList.add("mg6"); // both CSS states active
        document.querySelectorAll(".flora-tools-toggle, .animal-tools-toggle, .civil-tools-toggle")
            .forEach(el => el.style.display = "none");
        /*setTimeout(() => {
            document.querySelector(".flora-tools")?.classList.add("open");
            document.querySelector(".animal-tools")?.classList.add("open");
        }, 100);*/
        return;
    }



    document.body.classList.add(mode);
    // close all panels
    document.querySelectorAll(".flora-tools, .animal-tools, .civil-tools")
        .forEach(el => el.classList.remove("open"));

    // open the active one
    /* const active = document.querySelector("." + mode + "-tools");
     if (active) active.classList.add("open");*/

}
function sunSizeFromPlanet(index) {
    return map(index, 1, 7, 80, 20);
}
//defines zones 
function getZone(x, y) {
    if (y < horizonLine && y > 0) return "sky";
    if (waterValue > 0 && isPointInWater(x, y)) return "water";
    //if (y > height - (window.mg1Water ?? 0) * height) return "water";
    return "land";
}

//plirofories apo to game 2 kai prompt kai ui - ola se ena mplok ----------ENA ANA ARXEIO 
window.addEventListener("message", (event) => {
    if (event.data?.type === "pref_from_parent") {
        console.log("Received preference from parent:", event.data.value);//2-the hue from parent sent
        step = Number(event.data.value);   // NOW call your background generator // 0–4
        seed = step;
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
        const source = event.data.source;

        // MG3 → delete plants only-+
        /*
        if (source === 3) {
            plants = [];
            console.log("[RESET] Flora → plants cleared");
        }

        // MG4 → delete animals only
        if (source === 4) {
            animals = [];
            console.log("[RESET] Fauna → animals vanished");
        }

        //  MG5 → ignore reset
        if (source === 5) {
             civil = [];
            console.log("[RESET] Civil terminated");
        }*/
        plants = [];
        regenerate = true;
        //regenerateScene();
        return;
    }

    //gia to prompt
    if (event.data?.type === "set_prompt") {
        const el = document.getElementById("mg-prompt");
        if (el) el.textContent = event.data.text || "";
    }

    if (event.data?.type === "minigame1_water") {
        waterValue = Number(event.data.value) || 0;
        console.log("[WATER] Received waterValue from parent:", waterValue);// 1-the water arrives from parent
        regenerate = true; // force landscape rebuild
    }
    if (event.data.type === "set_mode") {
        setMode(event.data.mode);
         if (event.data.mode === "mg6" && typeof stopWipeHandpose === "function") {
            console.log("[WORLD] stopping wipe for mg6");
        stopWipeHandpose();
    }
     
    }
      if (event.data?.type === "start_wipe_camera") {
            console.log("[WORLD] received start_wipe_camera!");
            if (typeof initWipeHandpose === "function") {
                initWipeHandpose();
            }
        }
    if (event.data.type === "hide_ui") {
        currentMode = "view";
        document.querySelectorAll(".flora-tools, .flora-tools-toggle, .animal-tools, .animal-tools-toggle, .civil-tools, .civil-tools-toggle")
            .forEach(el => el.style.display = "none");
        const prompt = document.getElementById("mg-prompt");
        if (prompt) prompt.style.display = "none";
    }

    if (event.data.type === "init_world") {
        const worldState = event.data.payload;
        console.log("[WORLD] Restoring saved world from prev");

        // restore parameters
        step = worldState.landscape.step;
        planetIndex = worldState.landscape.planetIndex;
        mg1Height = worldState.landscape.mg1Height;
        waterValue = worldState.landscape.mg1Water;
        seed = worldState.landscape.seed;
        //  landscape = worldState.landscape;
        plants = deserializePlants(worldState.plants || []);// plants = worldState.plants || [];
        animals = worldState.animals || [];
        civil = worldState.civil || [];
        pollutionLayers = worldState.pollutionLayers || 0;
        worldRestored = false;//3-telos ta regens 

        regenerate = true; // redraw from saved state


    }

    if (event.data?.type === "set_lang") {
        currentLang = event.data.lang;
        updateUILang();
    }

});

function setup() {
    prevW = width;
    prevH = height;
    const w = window.innerWidth;
    const h = window.innerHeight;
    createCanvas(w, h);
    colorMode(HSB, 360, 100, 100, 255);
    frameRate(5);

    //*******************************************fyta
    const floraTools = document.querySelector(".flora-tools");
    const floraToggle = document.querySelector(".flora-tools-toggle");
    if (floraToggle && floraTools) {
        floraToggle.onclick = () => {
            floraTools.classList.toggle("open");
            // currentMode = "flora";
            if (currentMode !== "mg6") currentMode = "flora";
        };
    }
    //3 sliders
    sizeSlider = document.getElementById("sizeSlider");
    detailSlider = document.getElementById("detailSlider");
    heightSlider = document.getElementById("heightSlider");

    document.getElementById("treeBtn").onclick = () => (currentPlant = "tree");
    document.getElementById("flowerBtn").onclick = () => (currentPlant = "flower");
    document.getElementById("randomizeColorsBtn").onclick = randomizeColors;

    //*******************************zwa
    document.querySelectorAll("[data-animal]").forEach(btn => {
        btn.onclick = () => {
            currentAnimalClass = btn.dataset.animal;
        };
    });
    const animalTools = document.querySelector(".animal-tools");
    const animalToggle = document.querySelector(".animal-tools-toggle");
    // const animalPanel = document.querySelector(".animal-tools-panel");
    //if (animalToggle && animalPanel) {
    //    animalToggle.onclick = () => animalPanel.classList.toggle("open");
    if (animalToggle && animalTools) {
        animalToggle.onclick = () => {
            animalTools.classList.toggle("open");
            //currentMode = "animals";
            if (currentMode !== "mg6") currentMode = "animals";
        };
    }
    //size slideer
    const animalSizeSlider = document.getElementById("animalSizeSlider");
    animalSizeSlider.oninput = () => {
        animalSize = parseInt(animalSizeSlider.value);
    };
    // random color
    const randBtn = document.getElementById("animalRandomBtn");
    if (randBtn) {
        randBtn.onclick = () => animalHue = random(360);
    };

    // ******************************* CIVILIZATION (MG5)

    let civilDetailSlider;

    document.querySelectorAll("[data-civil]").forEach(btn => {
        btn.onclick = () => {
            currentCivilType = btn.dataset.civil;
            console.log("civil type:", currentCivilType); // debu
        };
    });

    const civilTools = document.querySelector(".civil-tools");
    const civilToggle = document.querySelector(".civil-tools-toggle");

    if (civilToggle && civilTools) {
        civilToggle.onclick = () => {
            civilTools.classList.toggle("open");
            currentMode = "civil";   // switch mode
        };
    }

    // detail slider
    civilDetailSlider = document.getElementById("detailCivilSlider");
    if (civilDetailSlider) {
        civilDetail = parseInt(civilDetailSlider.value);
        civilDetailSlider.oninput = () => {
            civilDetail = parseInt(civilDetailSlider.value);
        };
    }

    /*document.getElementById("animalRandomBtn").onclick = () => {
       animalHue = Math.random() * 360;
   };*/
    /* toggle.onclick = () => {
         tools.classList.toggle("open");
     };*/



    // RESET button
    /*
    const resetBtn = document.createElement("button");
    resetBtn.innerText = "Reset";
    resetBtn.onclick = () => (plants = []);
    document.body.children[0].appendChild(resetBtn);*/




    /*document.getElementById("animalSizeSlider").oninput = e => {
         animalSize = parseInt(e.target.value);
     };
 
     document.getElementById("animalRandomize").onclick = () => {
         animalHue = Math.random() * 360;
     };*/
    /*
    if (regenerate) {
        landscape = createGraphics(width, height);
        generateLandscape(landscape, step);
       
    }*/

    updateUILang();

}
function windowResized() {//resize support
    // horizonRatio = horizonLine / height; // keep ratio
    const newW = window.innerWidth;
    const newH = window.innerHeight;

    const sx = newW / prevW;
    const sy = newH / prevH;
    resizeCanvas(newW, newH);

    //  remap plant positions
    for (let p of plants) {
        if (p.x !== undefined) {
            p.x *= sx;
            p.y *= sy;
        }

        if (p.type === "tree") {
            for (let b of p.branches) {
                b.x1 *= sx;
                b.y1 *= sy;
                b.x2 *= sx;
                b.y2 *= sy;
            }
        }
    }

    prevW = newW;
    prevH = newH;
    // resizeCanvas(window.innerWidth, window.innerHeight);
    // horizonLine = height * horizonRatio; // recompute horizon using same ratio

    // regenerateScene();
    /*   if (cloudLayer) {
      cloudLayer.resizeCanvas(windowWidth, windowHeight);
    }*/
    regenerate = true;
    // regenerateScene();
}
function regenerateScene() {
    //randomSeed(millis());   // optional but helps randomness
    noiseSeed(millis());

    determineValues();      // horizon, mountains, trees, sun size, etc.

    cloudLayer.clear();     // VERY important to avoid black garbage
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
function mousePressed() {//If a value depends on a click → mousePressed handler
    // GUARD: ignore clicks on any UI panel or button
    if (document.querySelector(".flora-tools:hover, .animal-tools:hover, .civil-tools:hover")) return;
    // More reliable version:
    // Convert p5 canvas coords to viewport coords for elementFromPoint
    const cnv = document.querySelector("canvas");
    if (cnv) {
        const rect = cnv.getBoundingClientRect();
        const vpX = rect.left + (mouseX / width) * rect.width;
        const vpY = rect.top + (mouseY / height) * rect.height;
        const target = document.elementFromPoint(vpX, vpY);
        if (target && target !== cnv) return;
    }

    if (currentMode === "view") return;//no interaction

    // Notify parent of every game click (for narration triggers)
    try { window.parent.postMessage({ type: "minigame_click", mode: currentMode }, "*"); } catch (e) { }

    if (currentMode === "flora") {
        handleFloraClick();
        return;
    }

    if (currentMode === "animals") {
        handleAnimalClick(mouseX, mouseY);
        return;
    }

    if (currentMode === "civil") {
        handleCivilClick(mouseX, mouseY, currentCivilType);
        return;
    }
    if (currentMode === "view") return;

    if (currentMode === "mg6") {
        const zone = getZone(mouseX, mouseY);
        const roll = Math.random();

        if (zone === "land") { // randomly place tree OR flower OR land animal

            if (roll < 0.4) {
                currentPlant = "tree";
                handleFloraClick();
            } else if (roll < 0.6) {
                currentPlant = "flower";
                handleFloraClick();
            } else {    // random land animal
                const landTypes = [4, 6, 7, 8, 9, 10, 12, 13, 14, 17, 18]; // frog sheep,cow,fox,chicken,ladybug,tortoise,lizard  duck bat bee
                animals.push({
                    x: mouseX, y: mouseY,
                    size: animalSize, hue: random(360),
                    facing: random() > 0.5 ? 1 : -1,
                    depth: depth,
                    type: landTypes[Math.floor(Math.random() * landTypes.length)]
                });
                removeSmudges(1);
            }
        } else if (zone === "sky") {
            const skyTypes = [14, 17, 18]; // bat, bird, bee
            animals.push({
                x: mouseX, y: mouseY,
                size: animalSize, hue: random(360),
                facing: random() > 0.5 ? 1 : -1,
                depth: random(0.4, 1.2),
                type: skyTypes[Math.floor(Math.random() * skyTypes.length)]
            });
            removeSmudges(1);

        } else if (zone === "water") {
            const roll2 = Math.random();
            if (roll2 < 0.4) {   //  bamboo or lotus
                currentPlant = roll2 < 0.2 ? "tree" : "flower"; // tree bamboo, flower lotus in water
                handleFloraClick();
            } else { // water animals
                const waterTypes = [4, 5, 11, 15, 16]; // frog, fish, turtle, shrimp, hippo
                animals.push({
                    x: mouseX, y: mouseY,
                    size: animalSize, hue: random(360),
                    facing: random() > 0.5 ? 1 : -1,
                    depth: depth,
                    type: waterTypes[Math.floor(Math.random() * waterTypes.length)]
                });
                removeSmudges(1);
            }
        }
        return;
    }
    /*
        if (currentMode === "mg6") {
            const zone = getZone(mouseX, mouseY);
            if (zone === "land") handleFloraClick();
            else if (zone === "water" || zone === "sky") handleAnimalClick(mouseX, mouseY);
            // or just always do both — your call
            return;
        }*/
    //  console.log("MODE:", currentMode);

}


function handleFloraClick() {
    if (mouseY < mbgMin) return;

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
            removeSmudges(1); //
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
            removeSmudges(1); //
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
        removeSmudges(2); //clean smudges
    }

    else if (currentPlant === "flower") {
        let roll = random();
        if (roll < 0.3) {
            // existing flower
            plants.push(generateFlower(mouseX, mouseY, detailNorm, flowerScale));
            removeSmudges(1);
        } else {
            // grass — drawn immediately, also stored as plant object
            plants.push({
                type: "grass",
                x: mouseX,
                y: mouseY,
                grassStyle: random() < (grassBladeWeight[planetIndex] ?? 0.5) ? "blade" : "field",
                blades: generateBlades(mouseX, mouseY, sizeNorm, detailNorm, scaledHeight),
                segments: generateGrassSegments(mouseX, mouseY, sizeNorm, detailNorm, scaledHeight) // pre-baked
            });

            removeSmudges(1); //
        }
    }
}
//syxnotita kate zoou
function weighted(list) {
    // list = [ [type, weight], [type, weight] ]
    let total = 0;

    for (let item of list) {
        total += item[1];
    }

    let r = random(total);

    for (let item of list) {
        if (r < item[1]) return item[0];
        r -= item[1];
    }

    return list[0][0];
}
function handleAnimalClick(x, y) {
    const zone = getZone(mouseX, mouseY);
    let animalDepth;//ignore prorspective
    if (zone === "sky") {
        animalDepth = random(0.4, 1.2); // random size range for sky
    } else {
        animalDepth = depth; // normal perspective for land/water
    }

    if (currentMode === "mg6") removeSmudges(1);

    const pool = animalPools[planetIndex] ?? animalPools[4];
    let type;

    if (currentAnimalClass === "random") {
        type = getRandomAnimalForZone(zone, pool);
    } else if (currentAnimalClass === "mammal") {
        if (zone === "sky") type = 14;
        else if (zone === "water") type = pool.pale ? 21 : 16;
        else {
            let mammalList = pool.pale
                ? [[19, 3], [6, 3], [7, 2], [8, 1], [21, 3]]
                : pool.land.filter(([t]) => [6, 7, 8, 16, 19, 21, 27, 31, 32, 33, 36, 37].includes(t));
            if (mammalList.length === 0) mammalList = [[6, 3], [7, 2], [8, 1]]; // fallback
            type = weighted(mammalList);
        }
    } else if (currentAnimalClass === "reptile/ave/fish") {
        if (zone === "sky") {
            let list = pool.sky.filter(([t]) => [17, 23, 24, 26, 28].includes(t));
            if (list.length === 0) list = [[17, 3]];
            type = weighted(list);
        } else if (zone === "water") {
            let list = pool.water.filter(([t]) => [4, 5, 11, 20, 22, 26, 29].includes(t));
            if (list.length === 0) list = [[5, 3]];
            type = weighted(list);
        } else {
            let list = pool.land.filter(([t]) => [4, 9, 12, 13, 17, 20, 25, 26, 28, 29, 34].includes(t));
            if (list.length === 0) list = [[9, 3]];
            type = weighted(list);
        }
    } else if (currentAnimalClass === "insect") {
        if (zone === "sky") {
            let list = pool.sky.filter(([t]) => [18, 39].includes(t));
            if (list.length === 0) list = [[18, 3]];
            type = weighted(list);
        } else if (zone === "water") {
            let list = pool.water.filter(([t]) => [15, 39].includes(t));
            if (list.length === 0) list = [[15, 3]];
            type = weighted(list);
        } else {
            type = weighted([[10, 4], [18, 3], [35, 2], [38, 4], [40, 4], [39, 2]]);
        }
    }
    /*} else if (currentAnimalClass === "mammal") {
        if (zone === "sky") type = 14;
        else if (zone === "water") type = pool.pale ? 21 : 16; // seal on Ahra
        else type = weighted(pool.pale
            ? [[19, 3], [6, 3], [7, 2], [8, 1],[21, 3], [27, 1]]   // polar bear boosted on Ahra
            : pool.land.filter(([t]) => [6, 7, 8, 16, 19, 21, 27, 30, 31, 32, 33, 36, 37].includes(t)).concat([[6, 3]])
        );
    } else if (currentAnimalClass === "reptile/ave/fish") {
        if (zone === "sky") type = weighted(pool.sky.filter(([t]) => [17, 23, 24, 26, 28].includes(t)).concat([[17, 3]]));
        else if (zone === "water") type = weighted(pool.water.filter(([t]) => [4, 5, 11, 20, 22, 29].includes(t)).concat([[5, 3]]));
        else type = weighted(pool.land.filter(([t]) => [4, 9, 12, 17, 20, 13, 25, 26, 29, 34].includes(t)).concat([[9, 3]])
        );


    } else if (currentAnimalClass === "insect") {
        if (zone === "sky") type = weighted(pool.sky.filter(([t]) => [18, 39].includes(t)).concat([[18, 2]]));
        else if (zone === "water") type = weighted(pool.water.filter(([t]) => [15, 39].includes(t)).concat([[15, 3]]));
        //else type = weighted(pool.land.filter(([t]) => [10, 18, 35, 38, 39, 40,].includes(t)).concat([[40, 4]]) );
        else type = weighted([[10, 4], [18, 3], [35, 2], [38, 4], [40, 4], [39, 2]]);

    }*/

    // add universal insects occasionally
    // if (Math.random() < 0.08) type = UNIVERSAL[Math.floor(Math.random() * UNIVERSAL.length)];

    const sizeScale = pool.sizeMultiplier ?? 1.0;

    animals.push({
        x: mouseX, y: mouseY,
        size: animalSize * sizeScale,
        hue: animalHue,
        facing: random() > 0.5 ? 1 : -1,
        depth: animalDepth,
        pale: pool.pale ?? false,
        dark: pool.dark ?? false,
        type: type
    });
}
/*
function handleAnimalClick(x, y) {*/
// console.log("handleAnimalClick running");

/* animals.push({
     x: mouseX,
     y: mouseY,
     type: "animal"*/
//if (mouseY < mmgMin) return;

/*const zone = getZone(mouseX, mouseY);

let type;
if (currentMode === "mg6") {
    removeSmudges(1);
}
// ====RANDOM MODE
if (currentAnimalClass === "random") {
    type = getRandomAnimalForZone(zone);
}
// ===MAMMALS
else if (currentAnimalClass === "mammal") {
    if (zone === "sky") type = 14;  // bat

    else if (zone === "water") type = 16; // hippo
    //else type = random([6, 7, 8]); // sheep cow fox
    else { // land
        type = weighted([
            [6, 5],   // sheep common
            [7, 3],   // cow
            [8, 1]    // fox rare
        ]);
        // bat

    }
}
// ====REPTILE
else if (currentAnimalClass === "reptile/ave/fish") {
    if (zone === "sky") type = 17; // bird
    //else if (zone === "water") type = random([4, 5, 11]); // fish turtle frog
    else if (zone === "water") {
        type = weighted([
            [5, 5],   // fish common
            [11, 2],  // turtle
            [4, 2],    // frog
            [17, 3] //duck
        ]);

    }
    // else type = random([9, 12, 13 ]); // lizard chicken tortoise
    else { // land
        type = weighted([
            [9, 5],   // chicken VERY common
            [13, 3],  // lizard
            [12, 1]   // tortoise rare
        ]);

    }
}
// ===INSECTS
else if (currentAnimalClass === "insect") {
    if (zone === "sky") 
         // type = 18; // bee
        type = weighted([
            [18, 4],   // bee
            [39, 5],  // mosquito
          
         ]);
       
    else if (zone === "water") 
        //type = 15; // shrimp
        type = weighted([
            [15, 4],   // shrimp
            [39, 5],  // mosquito
          
         ]);
        
    else 
        type = weighted([
            [40, 3],   // spider
            [38, 5],  // ant
            [39, 2],  // mosquito
            [10, 3],  // ladybug
            [18, 2],  // bee
          
         ]);//}type = 10; // ladybug
}
console.log("pushing animal", type);

animals.push({
    x: mouseX,
    y: mouseY,
    size: animalSize,
    hue: animalHue,
    //kind: currentAnimalClass,
    //zone: zone,
    //species: pickSpecies(zone, currentAnimalClass),
    facing: random() > 0.5 ? 1 : -1,
    depth: depth,
    type: type
    //type: speciesToType[species]

});
}*/
function getRandomAnimalForZone(zone) {

    if (zone === "sky") {
        return weighted([
            [14, 3], // bat
            [17, 3], // bird
            [18, 2]   // bee
        ]);
    }

    if (zone === "water") {
        return weighted([
            [5, 5],  // fish
            [11, 2], // turtle
            [15, 2], // shrimp
            [16, 1]  // hippo
        ]);
    }

    return weighted([
        [6, 5], [7, 3], [8, 1],//sheep,cow, fox
        [9, 4], [13, 3], [12, 1],//chicken. tortoise,lizard
        [10, 3]//ladybag
    ]);
}
function addSmudge(x, y) {
    smudges.push({
        x,
        y,
        size: random(20, 60),
        alpha: random(40, 120)
    });
}

function handleCivilClick() {
    /* humans.push({
         x: mouseX,
         y: mouseY,
         role: "human"
     });*/
    //function handleHumanClick(x,y,type) {
    if (mouseY < horizonLine) return;
    const maxPerType = {
        human: civilDetail,                    // full slider range
        house: Math.min(civilDetail, 5),       // capped at 5 posa na einai
        production: Math.min(civilDetail, 3)   // capped at 3
    };
    const count = maxPerType[currentCivilType] ?? civilDetail;

    for (let i = 0; i < civilDetail; i++) {

        let x = mouseX + random(-50, 90);
        let y = mouseY + random(-70, 100);
        if (y < horizonLine) continue;
        civil.push({
            x,
            y,
            type: currentCivilType,
            skinHue: random(10, 40),
            shirtHue: random(360),
            depth: depth
        });

        let smudgeMultiplier = 2; // poso thes
        for (let s = 0; s < smudgeMultiplier; s++) {
            addSmudgeRandom();
        }
        if (plants.length > 0 && animals.length > 0) {//na svisei futa H zwa afou einai >0
            // alternate removal
            if (Math.random() > 0.5) plants.splice(Math.floor(Math.random() * plants.length), 1);
            else animals.splice(Math.floor(Math.random() * animals.length), 1);
        } else if (plants.length > 0) {
            plants.splice(Math.floor(Math.random() * plants.length), 1);
        } else if (animals.length > 0) {
            animals.splice(Math.floor(Math.random() * animals.length), 1);
        }
    }
    pollutionLayers++;
}
function addSmudgeRandom() {// pollution
    let x = random(width);
    let y = random(height);
    let size = random(20, 120);
    if (currentCivilType === "house") size = random(60, 150);
    if (currentCivilType === "production") size = random(80, 200);

    smudges.push({
        x,
        y,
        size,
        alpha: random(20, 90)
    });
}


//panw apo draw
function drawFloraTools() {
    // for now, flora tools are ALWAYS visible
    // because sketchFL already handles UI via DOM
}

function draw() { // draw dinei sxima generate dinei dedomena
    //If a value depends on mouse position or canvas size =====draw
    //console.log("animals count:", animals.length);


    //one canvas to rule them all
    /*nderTerrain();
    renderFlora();
    renderAnimals();
    renderHumans();*/
    depth = map(mouseY, mmgMin, height, 0.2, 1.6);
    depth = constrain(depth, 0.2, 2.2);

    let baseHeight = parseInt(heightSlider.value);   // Smaller near mountains, larger near bottom.
    scaledHeight = baseHeight * depth;
    if (typeof updateWipeHandpose === "function") updateWipeHandpose();
    // after restoring world, never regenerate again
    if (worldRestored) {
        regenerate = false;
    }

    if (regenerate) {
        landscape = createGraphics(width, height);
        generateLandscape(landscape, step);
        regenerate = false;
    }
    background(180, 20, 100, 255);
    noStroke();
    image(landscape, 0, 0, width, height);// draw static


    /*drawPlantsFromMG3(this, worldData);
    drawAnimals(worldData);
    drawHumans(worldData);*/
    /*
      if (currentMode === "flora") {
          drawFloraTools();
      }
  
      if (currentMode === "animals") {
          drawAnimalTools();
      }
  
      if (currentMode === "humans") {
          drawHumanTools();
      }
  
      //  World layers ALWAYS render
      drawPlantsFromMG3(this, worldData);
      drawAnimals(worldData);
      drawHumans(worldData);*/

    push();
    scale(width / landscape.width, height / landscape.height);

    drawAnimals();
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
            // scale(1);   // 1/4 size
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
            // scale(0.5);   // 1/4 size

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
        else if (p.type === "grass") {
            if (p.grassStyle === "blade") {
                drawGrassBlade(p);
            } else {
                drawGrassField(p);
            }
        }
    }
    drawCivil();
    drawSmudges();
    pop();

    // draw pollution overlay
    if (pollutionLayers > 0) {
        noStroke();
        // slightly greenish-gray tint
        fill(80, 8, 88, Math.min(pollutionLayers * 13, 200)); // HSB: muted olive-gray, capped at ~200 alpha
        //The 13 per layer means 4 clicks = alpha 52, 8 clicks ≈ 104, 16 clicks hits the cap of 200.
        rect(0, 0, width, height);
    }
}
function determineValues() {
    horizonLine = height * horizonRatio;//*.42
    const heightNorm = constrain(mg1Height / 0.1, 0, 1); // to 0.1 tou slider ginetai 1 
    console.log("[MG2] mg1Height:", mg1Height, "multiplier:", heightNorm);
    //horizonLine = height * 0.42;

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
    lightMult = map(sunSize, 20, 80, 1.2, 0.8);

}
function getPlanetHue(index) {
    const planetHues = {
        1: 95,  // Hamarik – green tone
        2: 35,  // Tahay – beige gray
        3: 10,  // Chura – bordeaux base
        4: 20,  // Santamasa – terracotta
        5: 335, // Ahra – cold pink
        6: 45,  // Lete – indian yellow
        7: 215  // Veles – cobalt blue
    };

    return planetHues[index] || 45;
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
        random(70, 90) * lightMult
    );
    mmgCol = hsbColor(
        pickHueWithinRange(range),
        random(50, 70),
        random(40, 70) * lightMult
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

    landCol = color(getPlanetHue(planetIndex), 50, 65 * lightMult);
    let planetHue = getPlanetHue(planetIndex);
    let h_lake1 = wrapHue(lerp(hue(sky2), planetHue, 0.1));
    let h_lake2 = wrapHue(lerp(hue(sky1), planetHue, 0.2));
    lake1 = hsbColor(h_lake1, saturation(sky2), brightness(sky2) * 0.8);
    lake2 = hsbColor(h_lake2, saturation(sky1), brightness(sky1) * 0.7);


}
function generateLandscape(pg, step) {
    randomSeed(seed);
    noiseSeed(seed);
    randomSeed(landscapeSeed);
    noiseSeed(landscapeSeed);//auto pagwni to fonto gia panta

    /* randomSeed(step * 10000 + millis());
     noiseSeed(step * 20000 + millis());*/

    pg.colorMode(HSB, 360, 100, 100, 255);

    determineValues();           // generates geometry
    generateColorsForStep(step); // generatespalette

    //pg.noStroke();
    sky(pg, 0, 0, width, horizonLine, sky1, sky2);
    sun(pg);
    makeClouds(pg);  // now because noiseSeed is fixed

    pg.noStroke();
    pg.fill(landCol);
    pg.rect(0, horizonLine, width, height - horizonLine);//the land
    //KLENO PROSORINA
    if (waterValue > 0) {
        console.log("[WATER] waterValue > 0 → generating water");
        generateWater(pg);
        cutLakeHole(pg, waterShape);
        //drawWaterGradient(pg);
        drawWater(pg, waterShape);
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

    // drawWater(pg, waterShape);
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
        //let col = lerpColor(sky2, sky1, inter);
        let col = lerpColor(lake1, lake2, inter);
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
/*
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
}*/
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
function generateAnimal(x, y) {
    animals.push({ x, y });
}
function generateHuman(x, y) {
    civil.push({ x, y, type: currentCivilType });
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
//----------TOUCHGRASS--------nea futa-----//
function drawGrassBlade(p) {
    // converted from your Processing void grass()
    colorMode(HSB, 360, 100, 100, 255);

    for (let blade of p.blades) {
        stroke(blade.h, blade.s, blade.b, blade.a);
        strokeWeight(blade.w);
        line(blade.x1, blade.y1, p.x, p.y);
    }
    noStroke();
    colorMode(HSB, 360, 100, 100, 255);
}

function drawGrassField(p) {
    // converted from your Processing draw() grass
    colorMode(HSB, 360, 100, 100, 255);
    for (let seg of p.segments) {
        stroke(seg.h, seg.s, seg.b);
        //strokeWeight(0.9);
        strokeWeight(seg.w);  // use stored weight
        line(seg.x1, seg.y1, seg.x2, seg.y2);
    }
    noStroke();
    colorMode(HSB, 360, 100, 100, 255);
}
function drawGrass(x, y) {
    let bladeW = grassBladeWeight[planetIndex] ?? 0.5;
    if (random() < bladeW) {
        drawGrassBlade(x, y);
    } else {
        drawGrassField(x, y);
    }
}
function generateBlades(x, y, sizeNorm, detailNorm, scaledHeight) {
    let blades = [];
    //let count = floor(random(4, 10));
    let count = floor(map(detailNorm, 0, 1, 3, 20)); // detail → more blades
    for (let i = 0; i < count; i++) {
        let bladeH = map(scaledHeight, 0, 160, 10, 40); // height → taller
        blades.push({
            h: random(80, 140),
            s: random(50, 90),
            b: random(40, 80),
            //a: random(60, 100),
            /* w: 0.9 + y / 600,          // thinner — was y/200
             x1: x + random(-20, 20),   // shorter spread — was -30,30
             y1: y + random(-20, 0)     // shorter blades — was -50,0
             */
            w: map(sizeNorm, 0.5, 1.0, 0.9, 2.5),  // size → thicker stroke
            x1: x + random(-10, 10),
            y1: y - random(5, bladeH)               // height → taller blades
        });
    }
    return blades;
}
function generateGrassSegments(x, y, sizeNorm, detailNorm, scaledHeight) {
    let segs = [];
    let fieldWidth = map(detailNorm, 0, 1, 20, 80); // detail → wider field
    let bladeH = map(scaledHeight, 0, 160, 6, 40);  // height → taller waves
    let strokeW = map(sizeNorm, 0.5, 1.0, 0.9, 2.2); // size → thicker
    let startX = x - fieldWidth / 2;
    let lastx = -999, lasty = -999;

    for (let gx = startX; gx <= startX + fieldWidth; gx += 1.5) {
        let gy = y + (1 - pow(random(1), 5)) * bladeH - bladeH / 2;
        if (lastx > -999) {
            segs.push({
                h: random(80, 110),
                s: random(55, 80),
                b: random(40, 70),
                w: strokeW,
                x1: gx, y1: gy,
                x2: lastx + random(2), y2: lasty
            });
        }
        lastx = gx;
        lasty = gy;
    }
    return segs;
}

/* //PALIA LOGIKH
function pickSpecies(zone, animalClass) {
    if (animalClass === "mammal") {
        if (zone === "sky") return random(["bat"]);
        if (zone === "water") return random(["hippo"]);
        return random(["sheep"]);//land
    }

    if (animalClass === "insect") {
        if (zone === "sky") return random(["bee"]);
        if (zone === "water") return random(["shrimp"]);
        return random(["ladybug"]);
    }

    if (animalClass === "reptile/ave/fish") {
        if (zone === "sky") return random(["tit"]);
        if (zone === "water") return "fish"; //random(["frog", "fish"]);
        return "chicken";//return random(["tortoise", "lizard", "chicken" ]);
    }

}*/
function drawSmudges() {
    noStroke();
    for (let s of smudges) {
        fill(0, 0, 70, s.alpha);
        ellipse(s.x, s.y, s.size);
    }
}
function drawCivil() {
    /*for (let e of civilEntities) {
        drawEntity(e.x, e.y, e.type);
    }*/
    push();
    noStroke();
    for (let c of civil) {
        if (c.y < horizonLine) continue;
        // drawHuman(c.x, c.y, c.type);
        let d = c.depth ?? depthScale(c.y);
        push();
        translate(c.x, c.y);
        scale(d);
        drawHuman(0, 0, c.type, c.skinHue ?? 30, c.shirtHue ?? 210);
        pop();

    }
    pop();

}
function removeSmudges(count = 2) {
    for (let i = 0; i < count; i++) {
        if (smudges.length > 0) {
            //  let index = floor(random(smudges.length));
            smudges.splice(Math.floor(Math.random() * smudges.length), 1);//sbinei tuxaia smudges
        }
        if (pollutionLayers > 0) pollutionLayers--;// remove a pollution layer alongside each smudge
    }
    // if (smudges.length === 0 &&  currentMode !== "civil") {//only during mg6
    if (smudges.length === 0 && pollutionLayers === 0 && currentMode === "mg6") {
        // 1. Freeze-no more interaction
        currentMode = "view";
        window.parent.postMessage({ type: "smudges_cleared" }, "*");  // 3. Tell parent we're done
        /*  setTimeout(() => {//wait 2sec
                 
                 saveCanvas("my-planet", "png"); // p5.js triggers download // 2. Save canvas as image to user's PC
               
            }, 2000); // wait 2s for smudges to visually clear first*/
    }
}
function drawHuman(x, y, type, skinHue = 30, shirtHue = 210) {

    if (type === "production") {
        push(); scale(3);
        fill(210, 10, 70);
        rect(x - 10, y - 4, 20, 12);

        fill(0, 0, 85);
        rect(x - 12, y - 8, 24, 6);

        fill(50, 80, 95);
        rect(x - 6, y - 1, 3, 3);
        rect(x - 1, y - 1, 3, 3);
        rect(x + 4, y - 1, 3, 3);

        fill(0, 0, 60);
        rect(x + 8, y - 14, 4, 8);

        fill(0, 0, 80);
        ellipse(x + 10, y - 16, 5, 4);
        ellipse(x + 13, y - 19, 4, 3);
        pop();
    }


    else if (type === "human") {
        push(); scale(1.5);
        fill(skinHue, 40, 85);
        ellipse(x, y - 6, 5, 6);

        fill(shirtHue, 60, 80);
        ellipse(x, y + 1, 7, 10);

        fill(25, 60, 60);
        rect(x - 2, y + 6, 2, 6);
        rect(x + 1, y + 6, 2, 6);
        pop();
    }


    else if (type === "house") {
        push(); scale(2);
        fill(30, 60, 95);
        rect(x - 8, y - 4, 16, 12);

        fill(10, 80, 80);
        triangle(x - 10, y - 4, x + 10, y - 4, x, y - 12);

        fill(40, 30, 70);
        rect(x - 2, y + 2, 4, 6);
        pop();
    }
}
function drawAnimals() {

    // colorMode(HSB, 360, 100, 100, 255);
    noStroke();

    for (let a of animals) {
        push();
        let d = a.depth ?? depthScale(a.y);
        let facing = a.facing ?? 1;
        translate(a.x, a.y);

        // let s = a.size / 20;
        scale(facing * d, d);
        if (a.pale) {
            drawingContext.filter = "saturate(30%) brightness(130%)";
        } else if (a.dark) {
            drawingContext.filter = "saturate(120%) brightness(70%)";
        }
        drawAnimal(0, 0, a.type, a ?? 0);
        drawingContext.filter = "none";
        pop();

        switch (a.species) {

            case "tit":
                ellipse(a.x, a.y, a.size * 1.2, a.size * 0.6);
                break;

            case "libellula":
                ellipse(a.x, a.y, a.size, a.size * 0.3);
                break;

            case "hippo":
                ellipse(a.x, a.y, a.size * 1.4, a.size);
                break;

            case "frog":
                ellipse(a.x, a.y, a.size, a.size);
                break;

            case "stork":
                rect(a.x, a.y, a.size * 0.3, a.size);
                break;

            case "sheep":
                ellipse(a.x, a.y, a.size, a.size * 0.8);
                break;

            case "turtle":
                ellipse(a.x, a.y, a.size, a.size * 0.6);
                break;

            case "fox":
                triangle(
                    a.x, a.y - a.size,
                    a.x - a.size, a.y + a.size,
                    a.x + a.size, a.y + a.size
                );
                break;
        }
    }

    //  colorMode(HSB, 360, 100, 100, 255);
}
function drawAnimal(x, y, type, animal) {

    push();
    translate(x, y);

    //stroke(0);
    //strokeWeight(1);

    if (type === 4) {// frog

        // body
        fill(110, 50, 75);
        ellipse(x, y, 18, 12);
        // head bump
        ellipse(x + 6, y - 2, 10, 9);
        // eyes
        fill(0, 0, 100);
        ellipse(x + 8, y - 6, 4, 4);
        ellipse(x + 3, y - 6, 5, 5);
        fill(0, 0, 0);
        ellipse(x + 8, y - 6, 2, 2);
        ellipse(x + 3, y - 6, 2, 2);
        //legs
        fill(110, 60, 65);
        ellipse(x - 6, y + 5, 8, 5);
        ellipse(x + 8, y + 5, 6, 3);

    }
    if (type === 5) { // fish

        fill(200, 60, 90);
        ellipse(x, y, 18, 10); // body
        // tail
        triangle(x - 8, y, x - 15, y - 5, x - 15, y + 5);
        // eye
        fill(0, 0, 100);
        ellipse(x + 5, y - 1, 4, 4);
        fill(0, 0, 0);
        ellipse(x + 5, y - 1, 2, 2);
    }
    if (type === 6) { // sheep
        push(); scale(1.2);
        // wool
        fill(20, 0, 90);
        ellipse(x, y, 16, 12);
        ellipse(x - 6, y, 10, 8);
        ellipse(x + 6, y, 10, 8);
        ellipse(x, y - 5, 12, 8);
        // face
        fill(30, 0, 50);
        ellipse(x + 12, y - 2, 3, 6);
        fill(20, 0, 20);
        ellipse(x + 8, y - 2, 8, 8);
        fill(30, 0, 70);
        ellipse(x + 4, y - 2, 4, 7);
        pop();
    }
    if (type === 7) {// cow
        push(); scale(1.2);
        fill(0, 0, 255);
        ellipse(x, y, 25, 15); // body
        ellipse(x + 13, y - 2, 8, 8); //head
        // spots
        fill(0, 0, 20);
        ellipse(x - 3, y, 6, 4);
        ellipse(x + 5, y - 3, 5, 3);
        ellipse(x + 10, y - 5, 4, 4);
        //nose
        fill(350, 20, 90);
        ellipse(x + 15, y, 5, 5);
        pop();
    }
    if (type === 8) { // fox
        push(); scale(1.1);
        fill(20, 200, 240);
        ellipse(x, y, 18, 10); // body
        // head
        triangle(x + 8, y - 6, x + 16, y, x + 8, y + 2);
        //nose
        fill(0, 0, 20);
        ellipse(x + 16, y, 2, 1);
        // tail
        fill(0, 0, 255);
        triangle(x - 8, y, x - 21, y - 5, x - 15, y);
        fill(20, 200, 240);
        triangle(x - 8, y, x - 21, y - 5, x - 13, y - 6);
        pop();

    }
    if (type === 9) { // chicken

        // comb
        fill(0, 200, 220);
        ellipse(x + 4, y - 8, 5, 3);

        fill(0, 0, 255);
        ellipse(x, y, 14, 11); // body
        ellipse(x + 4, y - 5, 7, 6); // head
        // beak
        fill(40, 200, 255);
        triangle(x + 7, y - 6, x + 10, y - 4, x + 7, y - 3);
        //tail
        fill(0, 0, 255);
        triangle(x - 6, y + 2, x - 6, y - 2, x - 12, y);
    }
    if (type === 10) {// ladybug

        push(); scale(0.7);
        fill(0, 220, 220);
        ellipse(x, y, 13, 10); // shell
        // head
        fill(0, 0, 20);
        ellipse(x - 5, y - 1, 5, 5);
        // dots
        ellipse(x + 2, y - 2, 3, 2);
        ellipse(x - 1, y + 2, 3, 3);
        ellipse(x + 4, y + 2, 3, 2);
        pop();
    }
    if (type === 11) {  // turtle

        // shell
        fill(120, 45, 65);
        ellipse(x, y, 18, 12);
        // head
        fill(120, 35, 80);
        ellipse(x + 10, y - 1, 6, 6);
        // legs
        ellipse(x - 6, y + 6, 4, 3);
        ellipse(x + 4, y + 6, 4, 3);

    }
    if (type === 12) { // tortoise

        // shell
        fill(70, 35, 55);
        ellipse(x, y, 20, 12);
        // head
        fill(80, 30, 65);
        ellipse(x + 11, y, 6, 6);
        // legs
        rect(x - 7, y + 4, 4, 3, 1);
        rect(x + 1, y + 4, 4, 3, 1);

    }
    if (type === 13) { // lizard
        push(); scale(0.8);
        // body
        fill(130, 55, 80);
        ellipse(x, y, 18, 6);
        ellipse(x + 10, y - 1, 7, 4); // head
        triangle(x - 8, y - 1, x - 28, y, x - 8, y + 2); // tail
        // legs
        ellipse(x - 4, y + 4, 4, 3);
        ellipse(x + 4, y + 4, 4, 3);
        pop();
    }
    if (type === 14) {// bat

        fill(0, 0, 25);
        // wings
        triangle(x - 10, y, x, y - 6, x, y + 4);
        triangle(x + 10, y, x, y - 6, x, y + 4);
        triangle(x - 8, y, x - 2, y - 1, x - 9, y - 8);
        triangle(x + 8, y, x + 2, y - 1, x + 9, y - 8);
        ellipse(x, y - 1, 6, 11); // body
        // ears
        fill(0, 0, 35);
        triangle(x - 2, y - 7, x - 1, y - 10, x, y - 5);
        triangle(x + 2, y - 7, x + 1, y - 10, x, y - 5);

    }
    if (type === 15) {// shrimp

        push(); scale(0.5);
        fill(15, 50, 95);
        // body curve
        ellipse(x, y, 12, 9);
        ellipse(x - 7, y + 1, 9, 7);
        ellipse(x - 13, y + 1, 8, 4);
        ellipse(x + 7, y - 1, 8, 7); // head
        triangle(x - 16, y, x - 16, y + 3, x - 22, y + 3); // tail
        // eye
        fill(0, 0, 20);
        ellipse(x + 8, y - 2, 3, 2);
        // antenna
        stroke(15, 60, 80);
        line(x + 8, y + 3, x + 16, y + 8);
        line(x + 6, y + 3, x + 14, y + 9);
        noStroke();
        pop();
    }
    if (type === 16) { // hippo

        fill(300, 15, 65);
        ellipse(x, y, 25, 17); // body
        ellipse(x + 13, y - 4, 12, 10); // head
        ellipse(x + 17, y + 1, 10, 10); // head
        // ears
        ellipse(x + 11, y - 10, 4, 4);
        ellipse(x + 15, y - 10, 3, 4);
        fill(0, 0, 25)
        ellipse(x + 11, y - 9, 2, 2);
        ellipse(x + 15, y - 9, 2, 2);
        // nostrils
        fill(0, 0, 45);
        ellipse(x + 15, y, 2, 2);
        ellipse(x + 19, y - 1, 2, 2);
    }
    if (type === 17) {//duck
        // body — yellow
        push(); scale(0.7);
        fill(55, 80, 100);
        ellipse(x, y, 14, 8);
        fill(210, 70, 60);
        triangle(x - 6, y + 1, x - 5, y - 2, x - 12, y);// tail
        ellipse(x + 5, y - 5, 7, 6);// head 
        // wing — blue
        fill(210, 70, 60, 180);
        ellipse(x, y - 1, 11, 5);
        // beak
        fill(40, 90, 100);
        triangle(x + 8, y - 5, x + 11, y - 4, x + 8, y - 3);
        // eye
        fill(0, 0, 0);
        ellipse(x + 6, y - 6, 1.5, 1.5);
        pop();
    }
    if (type === 18) {// bee

        push(); scale(0.7);
        // body
        fill(50, 90, 95);
        ellipse(x, y, 18, 12);
        // stripes
        stroke(0, 0, 20);
        line(x - 4, y - 5, x - 4, y + 5);
        line(x, y - 6, x, y + 6);
        noStroke();
        // head
        fill(0, 0, 30);
        ellipse(x - 9, y - 1, 6, 6);
        // wings
        fill(0, 0, 100, 50);
        ellipse(x + 2, y - 7, 12, 8);
        ellipse(x + 4, y - 4, 15, 6);
        // stinger
        fill(60);
        triangle(x + 9, y + 2, x + 9, y - 2, x + 14, y);
        pop();
    }
    if (type === 19) {// polar bear
        push(); scale(1.6);
        fill(0, 0, 92);
        ellipse(x, y, 28, 20);           // body
        ellipse(x + 10, y - 4, 14, 12); // head
        ellipse(x + 10, y + 8, 8, 12);//legs
        ellipse(x - 10, y + 8, 8, 12);
        fill(0, 0, 88);
        ellipse(x + 9, y - 9, 6, 6);    // ear L
        ellipse(x + 13, y - 9, 6, 6);    // ear R
        fill(0, 0, 0);
        ellipse(x + 15, y - 5, 2, 2);   // eye
        ellipse(x + 12, y - 5, 2, 2);
        fill(0, 0, 35);
        ellipse(x + 15, y - 1, 4, 3);   // nose
        pop();
    }
    if (type === 20) {// penguin
        push(); scale(0.8);
        fill(0, 0, 15);
        ellipse(x - 2, y + 15, 6, 4);
        ellipse(x + 3, y + 15, 6, 4);
        ellipse(x, y + 2, 18, 26);       // body
        fill(0, 0, 95);
        ellipse(x, y + 3, 12, 18);       // belly
        fill(52, 52, 90);
        ellipse(x, y - 4, 8, 4);      //neck
        fill(0, 0, 10);
        ellipse(x, y - 10, 12, 12);      // head
        fill(10, 80, 50);
        ellipse(x, y - 8, 6, 3);         // beak
        fill(235, 35, 30);
        ellipse(x - 8, y + 1, 4, 10);    // wing L
        ellipse(x + 8, y + 1, 4, 9);    // wing R
        fill(0, 0, 95);
        ellipse(x - 2, y - 11, 3, 3);    // eye L
        ellipse(x + 2, y - 11, 3, 3);    // eye R
        fill(0, 0, 0);
        ellipse(x - 2, y - 10, 1.5, 2);
        ellipse(x + 2, y - 10, 1.5, 2);
        pop();
    }
    if (type === 21) { // seal
        push(); scale(0.8);
        fill(30, 15, 50);
        ellipse(x + 14, y + 6, 7, 4);   // flipper L
        fill(30, 20, 60);
        ellipse(x, y, 32, 18);           // body
        ellipse(x - 17, y + 5, 18, 8); //taail
        ellipse(x - 16, y + 1, 14, 8);
        ellipse(x + 15, y - 7, 14, 11); // head
        fill(30, 15, 50);
        ellipse(x + 6, y + 8, 11, 4);   // flipper R
        fill(0, 0, 0);
        ellipse(x + 14, y - 8, 3, 2);   // eye
        ellipse(x + 19, y - 8, 3, 2);
        fill(10, 20, 30);
        ellipse(x + 18, y - 5, 5, 3);   // nose
        stroke(30, 20, 35);
        strokeWeight(0.7);
        line(x + 19, y - 5, x + 23, y - 4);  // whiskers
        line(x + 19, y - 6, x + 23, y - 7);
        noStroke();
        pop();
    }
    if (type === 22) {//fish
        //     let h = random(360), s = random(50, 90), b = random(80, 100);
        if (animal && animal.h === undefined) {
            animal.h = random(360);
            animal.s = random(50, 90);
            animal.b = random(80, 100);
        }
        let h = animal.h, s = animal.s, b = animal.b;
        fill(h, 70, 70);
        ellipse(x, y, 20, 11);           // body
        triangle(x - 9, y, x - 17, y - 6, x - 17, y + 6); // tail
        fill(h, 50, b);
        ellipse(x - 1, y, 16, 7);        // colour stripe (lighter)
        triangle(x + 2, y - 5, x - 4, y - 5, x - 4, y - 10);
        fill(0, 0, 100);
        ellipse(x + 6, y - 1, 5, 5);     // eye
        fill(0, 0, 0);
        ellipse(x + 6, y - 1, 2.5, 2.5);
        fill(h, s, 60);
        rect(x - 1, y - 5, 2, 10, 1);// vertical stripe detail
    }
    if (type === 23) {// parrot green

        fill(120, 65, 75);
        ellipse(x, y + 2, 18, 22); // body
        ellipse(x, y - 10, 14, 14); // head
        ellipse(x - 3, y + 16, 9, 20); // tail
        fill(110, 70, 60);
        ellipse(x - 8, y + 4, 8, 20); // wing L

        fill(0, 0, 95);
        ellipse(x + 3, y - 11, 4, 4); // eye R
        fill(0, 0, 0);
        ellipse(x + 3, y - 11, 2, 2);

        fill(40, 90, 100);
        ellipse(x + 7, y - 7, 4, 6); // beak top
        triangle(x + 9, y - 9, x + 6, y - 5, x + 10, y - 2); // beak tip
        fill(50, 50, 95); // yellow cheek patch
        ellipse(x, y - 7, 5, 4);
    }
    if (type === 24) {// parrot  red

        fill(0, 80, 85);
        ellipse(x, y + 2, 18, 22); // body
        ellipse(x, y - 10, 14, 14); // head
        ellipse(x - 3, y + 18, 9, 22); // tail

        fill(220, 75, 80); // blue wings
        ellipse(x - 8, y + 7, 8, 21);
        fill(50, 90, 95); // yellow wing
        ellipse(x - 8, y + 3, 8, 18);
        fill(0, 70, 70); //red wing
        ellipse(x - 8, y, 8, 16);

        fill(10, 20, 85); // yellow cheek patch
        ellipse(x + 3, y - 8, 7, 7);

        fill(0, 0, 95);
        ellipse(x + 3, y - 11, 4, 4); // eye R
        fill(0, 0, 0);
        ellipse(x + 3, y - 11, 2, 2);

        fill(40, 90, 10);
        ellipse(x + 7, y - 7, 4, 6); // beak top
        triangle(x + 9, y - 9, x + 6, y - 5, x + 10, y - 2); // beak tip
    }
    if (type === 25) {// iguana
        push(); scale(0.9);
        fill(120, 55, 70);
        ellipse(x, y, 30, 8);           // body
        ellipse(x + 12, y - 1, 12, 8);  // head
        triangle(x - 13, y - 2, x - 38, y, x - 12, y + 3); // tail
        stroke(120, 55, 70);
        strokeWeight(1.3);
        line(x - 29, y + 1, x - 50, y + 2);
        noStroke();

        fill(120, 50, 60);
        ellipse(x - 8, y + 3, 4, 9);    // leg L-back
        ellipse(x - 8, y + 7, 8, 2);
        stroke(120, 55, 60);
        strokeWeight(3);
        line(x + 8, y + 2, x + 12, y + 7);// leg R-back
        strokeWeight(2);
        line(x + 12, y + 7, x + 15, y + 7);
        noStroke();

        // dorsal spines
        fill(110, 60, 80);
        for (let i = -8; i <= 8; i += 4) {
            triangle(x + i, y - 4, x + i - 1, y - 8, x + i + 1, y - 4);
        }
        fill(0, 0, 0);
        ellipse(x + 14, y - 3, 2.5, 2.5); // eye
        fill(120, 40, 80);
        ellipse(x + 14, y, 3, 3);         // dewlap hint
        pop();
    }
    if (type === 26) { // blue bird 

        // let h = random(150, 270);
        if (animal && animal.h === undefined) {
            animal.h = random(150, 270);
        }
        let h = animal.h;
        fill(h, 75, 85);
        ellipse(x, y, 18, 12);           // body
        ellipse(x + 7, y - 2, 12, 10);  // head
        fill(h, 80, 65);
        triangle(x - 8, y + 2, x - 8, y - 2, x - 16, y); // tail

        fill(40, 90, 100);
        triangle(x + 12, y - 5, x + 15, y - 3, x + 12, y - 1); // beak
        fill(h, 70, 55);
        ellipse(x - 1, y - 1, 13, 5);// wing stripe
        fill(0, 0, 95);
        ellipse(x + 9, y - 4, 4, 4);    // eye
        fill(0, 0, 0);
        ellipse(x + 9, y - 4, 2, 2);
    }
    if (type === 27) {// leopard
        push(); scale(1.1);
        fill(40, 65, 85);
        rect(x, y, 32, 10, 10);           // body
        ellipse(x + 32, y - 7, 10, 8); // head
        ellipse(x + 28, y - 10, 3, 3);
        ellipse(x + 32, y - 11, 3, 3); //ears

        stroke(40, 60, 85);
        strokeWeight(7);
        line(x + 28, y, x + 30, y - 5);
        strokeWeight(3);
        line(x, y + 4, x - 20, y + 6);//tail
        strokeWeight(5);
        line(x + 2, y + 6, x, y + 14);
        line(x, y + 14, x + 2, y + 20);
        line(x + 7, y + 6, x + 8, y + 18);
        strokeWeight(6);
        line(x + 26, y + 6, x + 29, y + 18);
        noStroke();


        fill(25, 80, 35);// spots — rosette style
        ellipse(x + 25, y + 1, 5, 4);
        ellipse(x + 15, y + 2, 4, 3);
        ellipse(x + 4, y + 2, 4, 3);
        ellipse(x + 29, y + 5, 3, 3);
        ellipse(x + 12, y + 6, 4, 3);
        ellipse(x + 22, y + 8, 4, 3);
        ellipse(x + 27, y + 16, 3, 3);
        ellipse(x, y + 14, 4, 3);

        fill(0, 0, 0);
        ellipse(x + 36, y - 8, 2, 2);
        ellipse(x + 32, y - 8, 3, 2);   // eyes
        fill(10, 20, 30);
        ellipse(x + 36, y - 6, 4, 2);        // nose
        stroke(40, 30, 30);
        strokeWeight(0.5);
        line(x + 38, y - 6, x + 42, y - 5);
        line(x + 38, y - 7, x + 42, y - 8);
        noStroke();
        pop();
    }
    if (type === 28) {// toucan

        fill(0, 0, 12);
        ellipse(x - 3, y + 5, 18, 22);       // body
        ellipse(x, y - 5, 14, 14);       // head
        ellipse(x - 7, y + 15, 8, 14);       // tail
        fill(20, 0, 20);
        ellipse(x + 2, y + 14, 3, 4);
        ellipse(x - 1, y + 14, 3, 4);
        fill(0, 0, 95);
        ellipse(x, y - 2, 10, 8);        // white throat
        // big beak
        fill(40, 90, 100);               // yellow top
        ellipse(x + 6, y - 5, 16, 5);
        fill(40, 80, 80);               // green mid
        ellipse(x + 6, y - 4, 16, 4);
        fill(20, 80, 60);                 // red tip
        ellipse(x + 11, y - 4, 6, 4);
        fill(0, 0, 95);
        ellipse(x - 2, y - 7, 4, 4);    // eye ring
        fill(0, 0, 0);
        ellipse(x - 2, y - 7, 2.5, 2.5);
    }
    if (type === 29) { // poison dart frog 

        fill(215, 85, 80);               // blue body
        ellipse(x, y, 18, 12);
        fill(190, 80, 80);                // yellow pattern stripe
        ellipse(x - 1, y - 3, 16, 6);
        fill(215, 85, 80);
        ellipse(x + 6, y - 2, 10, 9);   // head bump
        fill(190, 80, 80);
        ellipse(x + 4, y - 5, 8, 6);
        fill(215, 90, 65);
        ellipse(x - 6, y + 4, 10, 6);    // leg L
        rect(x - 6, y + 6, 8, 2, 2);
        ellipse(x + 7, y + 5, 6, 4);    // leg R

        fill(0, 0, 95);
        ellipse(x + 8, y - 6, 4, 4);    // eye
        ellipse(x + 3, y - 6, 5, 5);
        fill(0, 0, 0);
        ellipse(x + 8, y - 6, 2, 2);
        ellipse(x + 3, y - 6, 2, 2);
    }
    if (type === 30) {// giraffe
        let s = random(55, 80);
        let b = random(75, 95);
        fill(40, s, b);
        ellipse(x + 3, y, 18, 17);
        ellipse(x - 4, y + 2, 14, 14);        // body
        rect(x + 4, y - 25, 8, 22, 2);    // neck
        ellipse(x + 10, y - 24, 10, 8);  // head
        ellipse(x + 3, y - 24, 5, 3);        //ear
        ellipse(x - 8, y + 12, 5, 14);    // leg L
        rect(x - 9, y + 16, 2, 12)
        ellipse(x + 5, y + 12, 4, 14);    // leg R
        ellipse(x + 11, y + 9, 4, 14);
        rect(x + 11, y + 14, 2, 12)
        rect(x + 5, y + 16, 2, 12)

        fill(35, 70, 55);                // patches
        ellipse(x + 7, y - 12, 6, 5);
        ellipse(x + 9, y - 18, 4, 3);
        ellipse(x + 3, y - 3, 5, 3);
        ellipse(x - 5, y + 2, 6, 5);
        ellipse(x + 7, y + 3, 5, 4);

        fill(35, 70, 65);// ossicones
        rect(x + 8, y - 32, 2, 5, 1);
        rect(x + 5, y - 31, 2, 6, 1);
        ellipse(x + 4, y - 23, 5, 3);//ear
        fill(0, 0, 0);
        ellipse(x + 11, y - 25, 3, 2.5); // eye
    }
    if (type === 31) {// camel 
        push(); scale(1.1);
        fill(35, 40, 65);// legs
        rect(x - 18, y + 8, 4, 19, 3);
        rect(x - 12, y + 10, 4, 21, 3);
        rect(x + 12, y + 14, 4, 17, 3);
        rect(x + 10, y + 7, 5, 9, 3);
        rect(x + 5, y + 8, 4, 21, 3);

        fill(35, 50, 75);
        // ellipse(x, y + 2, 36, 18);       // body
        rect(x - 20, y - 6, 34, 18, 10);
        ellipse(x - 5, y - 6, 14, 12); // humps
        ellipse(x + 7, y - 4, 12, 10);
        rect(x - 21, y - 16, 7, 16, 4)// neck ;
        ellipse(x - 23, y - 14, 13, 8);// head

        fill(0, 0, 0);
        ellipse(x - 24, y - 15, 2, 3); // eye
        fill(35, 30, 60);
        ellipse(x - 29, y - 12, 4, 5);    // nostril
        fill(35, 30, 50);
        ellipse(x - 18, y - 18, 3, 4);//ear
        pop();
    }
    if (type === 32) {// jerboa
        push(); scale(0.6);
        fill(35, 30, 65);
        ellipse(x + 2, y + 6, 4, 12);//leg

        stroke(35, 25, 65);
        strokeWeight(2);
        line(x - 5, y + 12, x + 5, y + 14);
        line(x + 2, y + 11, x + 8, y + 12);
        noStroke();
        fill(35, 30, 72);
        ellipse(x, y, 16, 12); // body
        ellipse(x + 7, y - 1, 10, 10); // head

        // huge ears
        fill(30, 20, 80);
        ellipse(x + 4, y - 8, 4, 10);
        ellipse(x + 9, y - 8, 4, 10);
        fill(10, 30, 95);
        ellipse(x + 4, y - 8, 2, 7); // inner ear
        ellipse(x + 9, y - 8, 2, 7);
        // long hind legs
        fill(35, 30, 65);
        ellipse(x - 4, y + 8, 4, 12);

        // front paw
        ellipse(x + 6, y + 5, 3, 5);
        // long tail
        //line(x - 7, y + 2, x - 20, y + 12); // drawn with stroke
        stroke(35, 25, 55);
        strokeWeight(1.5);
        line(x - 7, y + 2, x - 24, y + 14);
        noStroke();
        fill(10, 10, 80);
        ellipse(x - 27, y + 14, 8, 3); // tail tuft

        fill(0, 0, 0);
        ellipse(x + 9, y - 3, 2.5, 2.5); // eye
        fill(10, 30, 90);
        ellipse(x + 12, y + 1, 3, 2); // nose
        pop();
    }
    if (type === 33) {// horse
        push(); scale(1.1);
        fill(25, 50, 45); // legs
        ellipse(x - 3, y + 10, 7, 12);
        rect(x - 5, y + 15, 4, 10, 5);
        ellipse(x + 9, y + 10, 5, 12);
        rect(x + 8, y + 11, 4, 12, 5);

        fill(25, 55, 50);
        rect(x - 16, y - 9, 32, 18, 8); // body
        //fill(25, 55, 40);//
        rect(x + 12, y - 16, 8, 20, 5);
        ellipse(x + 19, y - 19, 14, 10); // head
        rect(x + 20, y - 20, 12, 6, 4);
        ellipse(x + 20, y - 17, 10, 8);

        ellipse(x - 10, y + 10, 8, 12); //legs
        rect(x - 12, y + 15, 4, 12, 5);
        ellipse(x + 16, y + 8, 6, 15);
        rect(x + 14, y + 13, 4, 13, 5);

        fill(25, 60, 45);
        ellipse(x + 13, y - 15, 5, 20); // mane
        ellipse(x + 9, y - 7, 9, 7);
        rect(x + 17, y - 28, 3, 5, 4); //ears
        rect(x + 14, y - 28, 3, 7, 4);
        ellipse(x + 31, y - 17, 4, 5); // nostril
        ellipse(x - 16, y, 8, 14); // tail
        triangle(x - 12, y, x - 20, y + 1, x - 18, y + 15);

        fill(0, 0, 0);
        ellipse(x + 21, y - 19, 3, 2); // eye
        pop();
        // fill(25, 30, 40);
    }
    if (type === 34) {// snake 
        push(); scale(0.8);
        stroke(115, 55, 55);
        strokeWeight(5);
        line(x + 15, y - 2, x - 6, y - 1);
        line(x - 6, y - 1, x - 15, y + 6);
        line(x - 15, y + 6, x - 25, y + 6);
        line(x - 25, y + 6, x - 39, y + 2);
        strokeWeight(4);
        line(x - 40, y + 2, x - 55, y + 3);
        noStroke();

        // head
        fill(115, 50, 60);
        ellipse(x + 16, y - 3, 10, 7);
        // tongue
        stroke(0, 90, 70);
        strokeWeight(1);
        line(x + 21, y - 2, x + 27, y - 1);
        line(x + 27, y - 1, x + 30, y - 3);
        line(x + 27, y - 1, x + 30, y + 1);
        noStroke();
        fill(0, 0, 0);
        ellipse(x + 17, y - 5, 2.5, 2.5); // eye
        pop();
    }
    if (type === 35) { // scorpion
        push(); scale(0.7);
        fill(40, 55, 55);
        ellipse(x, y, 20, 10);           // cephalothorax
        fill(40, 50, 45);
        ellipse(x - 10, y, 12, 8);       // abdomen
        // tail segments curling up
        ellipse(x - 18, y - 2, 7, 8);
        ellipse(x - 22, y - 8, 6, 8);
        ellipse(x - 20, y - 14, 5, 7);
        // stinger
        fill(0, 60, 60);
        ellipse(x - 19, y - 18, 5, 4);
        triangle(x - 19, y - 20, x - 17, y - 28, x - 21, y - 20);
        // claws
        fill(40, 50, 50);
        ellipse(x + 14, y - 4, 10, 5);
        ellipse(x + 13, y + 4, 12, 5);
        fill(40, 45, 40);
        triangle(x + 16, y - 2, x + 22, y - 8, x + 17, y - 6);
        triangle(x + 15, y - 4, x + 24, y - 5, x + 17, y);
        triangle(x + 17, y + 4, x + 23, y - 2, x + 18, y);
        triangle(x + 16, y + 2, x + 26, y + 6, x + 18, y + 7);


        stroke(40, 45, 40);
        strokeWeight(2);
        for (let i = -2; i <= 2; i++) {// legs 
            if (i !== 0) {
                //line(x + i * 2, y - 5, x + i * 3, y - 11);
                line(x + i * 2, y + 5, x + i * 3, y + 11);
            }
        }
        noStroke();
        pop();
        //fill(0, 0, 0);
        // ellipse(x + 6, y - 3, 2, 2);    // eyes
        // ellipse(x + 6, y + 3, 2, 2);
    }
    if (type === 36) { // meerkat (suricata)
        push(); scale(0.7);
        // tail
        fill(30, 35, 55);
        rect(x - 6, y + 8, 3, 14, 2);//tail
        ellipse(x - 8, y + 22, 7, 2);

        fill(30, 30, 60);
        ellipse(x - 3, y + 18, 3, 14);//legs
        ellipse(x + 3, y + 18, 4, 14);
        ellipse(x + 7, y + 6, 3, 12);//arm

        fill(30, 30, 72);
        ellipse(x, y + 5, 14, 20);       // body

        fill(30, 15, 85);
        ellipse(x, y + 6, 8, 14); // belly patch

        fill(30, 30, 68);
        ellipse(x, y - 8, 12, 12);// head

        fill(30, 25, 50);// ears
        ellipse(x - 6, y - 11, 3, 4);
        ellipse(x + 6, y - 11, 3, 4);

        fill(0, 0, 20); // eye mask (dark)
        ellipse(x - 3, y - 9, 4, 4);
        ellipse(x + 3, y - 9, 4, 4);
        fill(0, 0, 95);
        ellipse(x - 3, y - 9, 2.5, 2.5);
        ellipse(x + 3, y - 9, 2.5, 2.5);
        fill(0, 0, 0);
        ellipse(x - 3, y - 9, 1.5, 1.5);
        ellipse(x + 3, y - 9, 1.5, 1.5);

        fill(0, 0, 25);// nose
        ellipse(x, y - 6, 3, 2);

        fill(30, 30, 60);// arms out to sides
        ellipse(x - 6, y + 5, 2, 12);
        ellipse(x - 3, y + 10, 7, 2);
        ellipse(x + 4, y + 11, 4, 2);

        pop();


    }
    if (type === 37) {// fennec fox
        push(); scale(0.8);
        fill(35, 40, 90);
        ellipse(x, y, 24, 14);           // body
        ellipse(x + 10, y - 2, 12, 10); // head
        ellipse(x + 10, y + 6, 2, 10);
        ellipse(x + 6, y + 6, 2, 10);
        ellipse(x - 4, y + 5, 2, 10);
        ellipse(x - 8, y + 6, 2, 10);
        // HUGE ears
        fill(35, 35, 85);
        ellipse(x + 5, y - 14, 8, 18);
        ellipse(x + 14, y - 14, 8, 18);
        fill(10, 30, 100);               // inner ear
        ellipse(x + 5, y - 14, 4, 12);
        ellipse(x + 14, y - 14, 4, 12);


        fill(10, 30, 45);
        ellipse(x + 2, y + 6, 7, 6);   // tail tip 

        fill(10, 50, 65);
        ellipse(x - 1, y + 5, 7, 6);   // tail tip 

        fill(35, 35, 80);//tail
        ellipse(x - 8, y + 4, 16, 7);
        ellipse(x - 12, y + 1, 9, 8);


        fill(0, 0, 0);
        ellipse(x + 10, y - 3, 3, 2);   // eye
        ellipse(x + 14, y - 3, 3, 2);
        fill(0, 0, 20);
        ellipse(x + 13, y, 2, 2);        // nose
        stroke(35, 30, 65);
        strokeWeight(0.7);
        line(x + 15, y - 1, x + 21, y - 1);
        line(x + 15, y + 1, x + 21, y + 2);
        noStroke();
        pop();
    }
    if (type === 38) { // spider
        push(); scale(0.5);
        fill(270, 55, 32);
        ellipse(x - 10, y, 24, 18);      // abdomen
        fill(270, 48, 40);
        ellipse(x + 6, y + 3, 14, 10);   // cephalothorax
        fill(270, 55, 32);
        ellipse(x + 13, y + 5, 3, 6);    // fang
        // 4 legs down from body
        stroke(0, 0, 10);
        strokeWeight(1.5);
        line(x - 5, y + 1, x - 18, y + 14);
        line(x - 3, y + 5, x - 6, y + 16);
        line(x + 1, y + 3, x + 6, y + 16);
        line(x + 4, y + 4, x + 12, y + 14);
        noStroke();
        pop();
    }
    if (type === 39) { // mosquito

        push(); scale(0.4);
        fill(210, 30, 96, 30);
        ellipse(x - 12, y, 36, 10);// wing

        // abdomen
        fill(85, 45, 40);
        ellipse(x - 10, y + 1, 22, 10);
        // thorax
        fill(85, 42, 46);
        ellipse(x + 2, y - 2, 12, 12);
        // head
        fill(85, 40, 40);
        ellipse(x + 10, y - 3, 10, 10);
        // proboscis
        stroke(85, 40, 28);
        strokeWeight(1.2);
        line(x + 14, y, x + 26, y + 6);
        noStroke();
        fill(210, 30, 96, 30);
        ellipse(x - 10, y - 5, 36, 10);// wing
        // antenna
        stroke(85, 35, 40);
        strokeWeight(1);
        line(x + 10, y - 7, x + 8, y - 16);
        line(x + 8, y - 16, x + 4, y - 21);
        noStroke();
        // 3 legs
        stroke(85, 35, 45);
        strokeWeight(1.2);
        line(x - 4, y + 3, x - 14, y + 14);
        line(x + 2, y + 4, x + 2, y + 16);
        line(x + 7, y + 3, x + 16, y + 12);
        noStroke();
        pop();
    }
    if (type === 40) {  // ant
        push(); scale(0.3);
        // gaster
        fill(0, 78, 55);
        ellipse(x - 14, y, 22, 18);
        // petiole
        fill(0, 75, 48);
        ellipse(x - 2, y + 1, 6, 8);
        // thorax
        fill(0, 72, 55);
        ellipse(x + 6, y - 1, 14, 12);
        // head
        fill(0, 70, 52);
        ellipse(x + 15, y - 5, 14, 12);

        stroke(0, 70, 38);
        strokeWeight(1.5);  // mandible
        line(x + 20, y - 3, x + 25, y);
        stroke(0, 80, 55);
        strokeWeight(1.2);
        line(x + 16, y - 10, x + 20, y - 18);// antenna
        line(x + 20, y - 18, x + 24, y - 14);
        line(x - 6, y + 4, x - 16, y + 14);// 3 legs
        line(x + 2, y + 5, x + 2, y + 16);
        line(x + 9, y + 4, x + 18, y + 13);
        noStroke();
        pop();
    }
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
function serializePlants(plants) {
    return plants.map(p => {
        if (p.type === "tree") {
            return {
                type: "tree",
                branches: p.branches.map(b => ({
                    x1: b.x1,
                    y1: b.y1,
                    x2: b.x2,
                    y2: b.y2,
                    color: b.color,   // already plain {r,g,b}
                    width: b.width
                }))
            };
        }

        if (p.type === "bamboo") {
            return {
                type: "bamboo",
                x: p.x,
                y: p.y,
                h: p.h,
                w: p.w,
                internodes: p.internodes,
                internodeH: p.internodeH,
                lean: p.lean,
                leaves: p.leaves,
                textureLines: p.textureLines,
                color: {
                    h: hue(p.color),
                    s: saturation(p.color),
                    b: brightness(p.color)
                }
            };
        }

        if (p.type === "lotus" || p.type === "flower") {
            return {
                ...p,
                col: [hue(p.col), saturation(p.col), brightness(p.col)],
                leafCol: p.leafCol
                    ? [hue(p.leafCol), saturation(p.leafCol), brightness(p.leafCol)]
                    : null
            };
        }
        if (p.type === "grass") {
            return { type: "grass", x: p.x, y: p.y, grassStyle: p.grassStyle, blades: p.blades, segments: p.segments };
        }
    });
}
// This listens for the parent asking for the slider value
window.addEventListener("message", (event) => {

    if (event.data?.type === "request_slider_value") {
        //const sliderValue = document.getElementById("hueSlider").value;
        /*  const sliderValue = hueSlider.value();
          // Send value back to parent
          window.parent.postMessage(
              { type: "minigame2_result", value: sliderValue },
              "*"
          ); */
        return;
    }

    /*if (event.data?.type === "set_prompt") {
        const el = document.getElementById("mg-prompt");
        if (el) el.textContent = event.data.text || "";
    }*/

    if (event.data?.type === "request_mg3_snapshot") {//edw oti zitan ta ta paixnidia prow mg4 mg5 mg6 
        window.parent.postMessage({
            type: "minigame3_result",
            payload: {
                landscape: {
                    step,
                    planetIndex,
                    mg1Height,
                    mg1Water: waterValue,
                    seed
                },
                plants: serializePlants(plants),
                animals: animals.map(a => ({ ...a })),
                civil: civil.map(c => ({ ...c })),
                pollutionLayers
            }
        }, "*");

        console.log("[WORLD] Snapshot sent to parent");
    }

    if (event.data.type === "save_canvas") {
        saveCanvas("my-planet", "png");
    }

});
function deserializePlants(data) {
    return data.map(p => {

        if (p.type === "tree") {
            return {
                ...p,
                type: "tree"
            };
        }

        if (p.type === "bamboo") {
            return {
                ...p,
                color: color(p.color.h, p.color.s, p.color.b)
            };
        }

        if (p.type === "lotus" || p.type === "flower") {
            return {
                ...p,
                col: color(...p.col),
                leafCol: p.leafCol ? color(...p.leafCol) : null
            };
        }
        if (p.type === "grass")
            return {
                ...p,
            }
    });
}

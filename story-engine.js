document.addEventListener("DOMContentLoaded", () => {
  // === Grab elements ===
  const textEl = document.getElementById("story-text");
  const btnNext = document.getElementById("story-next");
  const btnPrev = document.getElementById("story-prev");
  //const soundToggle = document.getElementById("sound-toggle");
  const startBtn = document.getElementById("start-btn");
  // hide arrows initially
  btnNext.style.display = "none";
  btnPrev.style.display = "none";
  // create prompt text at top
  const promptText = document.createElement("div");
  promptText.id = "prompt-text";
  document.body.appendChild(promptText);
  let choice = false;

  if (!textEl) {
    console.warn("❌ story-text element not found in DOM");
    return;
  }

  // === Story data ===
  const story = [
  {
    text: [
      "Hello cosmic explorer! Earth seemed boring and trashy, so you’ve been invited to travel to the new world.",
      "Can you make it interesting and clean?",
      "Before you stands this new solar system, far away from Earth. Explorers come all the time to attempt what you do right now — build a new home.",
      "Make a new multiplanet community. Expand, compete, collaborate."
    ],
    audio: "audio/intro1.mp3",
    prompt: "Available planets at this moment [Q]"
  },
  {
    text: [
      "Here stand 7 planets; and you can choose your own.",
      "NOTE: if a planet appears colorful, it means there's another explorer on that. choose a white one.",
      "Oh! and any similarities with your home solar system are purely coincidental!"
    ],
    // audio: "audio/intro2.mp3"
  },
  {
    text: ["Pick any planet to conquer!"],
    // audio: "audio/choose_planet.mp3",
    onEnd: "choosePlanet",
    prompt: "Roll over a planet and click on it"
  }
];


  // === Globals ===
  let index = 0;
  let audio = null;
  let soundEnabled = true;

  // === Actions triggered by story lines ===
  const storyActions = {
    choosePlanet: () => {
      enablePlanetSelectionGlow();
       //showChooseWindow(); // <== 👈 this shows the popup
      if (choice === true) return;
        
      const chooseWindow = document.createElement("div");
        chooseWindow.className = "choose-window";
        chooseWindow.innerHTML = `
          <div class="choose-content">
            <p>Click on the planet you want to choose</p>
          </div>
        `;
        document.body.appendChild(chooseWindow);
        
    },
    openMiniGame1: () => {
      console.log(">>> Mini game placeholder");
    }
  };

  // === Core function ===
  function showStory(i) {
    const entry = story[i];
    if (!entry) return;

    // update text and fade it in
    if (Array.isArray(entry.text)) {
    textEl.innerHTML = entry.text.map(line => `<p>${line}</p>`).join("");
    } else {
      textEl.innerHTML = `<p>${entry.text}</p>`;
    }

    textEl.classList.remove("show");
    setTimeout(() => textEl.classList.add("show"), 50);

    // update top prompt
    if (entry.prompt) {
      promptText.textContent = entry.prompt;
      promptText.classList.add("visible");
    } else {
      promptText.classList.remove("visible");
    }

    // play narration
    if (audio) audio.pause();
    if (entry.audio && soundEnabled) {
      audio = new Audio(entry.audio);
      audio.play();
      if (entry.onEnd && typeof storyActions[entry.onEnd] === "function") {
        audio.onended = storyActions[entry.onEnd];
      }
    } else if (entry.onEnd) {
      storyActions[entry.onEnd]();
    }

    // buttons
    btnPrev.disabled = i === 0;
    btnNext.disabled = i === story.length - 1;

    if (choice === true) btnNext.disabled = i === story.length - 2; // If the player has made their choice they can no longer access the planet choice menu
  }

  // === Start button ===
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      startBtn.classList.add("hidden");
      setTimeout(() => {
        btnNext.style.display = "block"; // show arrows when story starts
        btnPrev.style.display = "block"; // show arrows when story starts
        showStory(0); // start narration after 3 seconds
      }, 3000);
    });
  } else {
    showStory(0);
  }

  // === Navigation ===
  btnNext.addEventListener("click", () => {
    if (index < story.length - 1) {
      document.querySelector(".choose-window") ? document.querySelector(".choose-window").remove() : '';
      index++;
      showStory(index);
    }
  });
  btnPrev.addEventListener("click", () => {
    if (index > 0) {
      document.querySelector(".choose-window") ? document.querySelector(".choose-window").remove() : '';
      index--;
      showStory(index);
    }
  });

  // === SOUND TOGGLE ===
  const soundToggle = document.getElementById("sound-toggle");
  const soundIcon = document.getElementById("sound-icon");

  if (soundToggle && soundIcon) {
    soundToggle.addEventListener("click", () => {
      soundEnabled = !soundEnabled;

      // 👇 Make sure these filenames match the actual files
      soundIcon.src = soundEnabled
        ? "images/volume.svg"
        : "images/mute.svg";

      soundIcon.alt = soundEnabled ? "Sound On" : "Sound Off";

      if (!soundEnabled && audio) audio.pause();
    });
  }

  // === Example helper ===
function enablePlanetSelectionGlow() {
  // allow info panels to still open (they use click handlers from script.js)
  document.querySelectorAll(".planet").forEach(p => {
    p.addEventListener("click", (e) => {
      e.stopPropagation(); // don't bubble into other listeners

      // Show the confirmation window when a planet is clicked
      showChooseWindow(p);
    });
  });
}

    function showChooseWindow(planetEl) {
      // Prevent multiple windows
      document.querySelector(".choose-window") ? document.querySelector(".choose-window").remove() : '';
      if (choice === true || index !== 2) return;

      const chooseWindow = document.createElement("div");
      chooseWindow.className = "choose-window";
      chooseWindow.innerHTML = `
      <div class="choose-content">
        <p>Choose this planet?</p>
        <div style="display:flex; gap:10px; justify-content:center;">
          <button id="confirm-yes">Yes</button>
          <button id="confirm-no">No</button>
        </div>
      </div>
      `;
      document.body.appendChild(chooseWindow);

      const yes = chooseWindow.querySelector("#confirm-yes");
      const no = chooseWindow.querySelector("#confirm-no");

      yes.addEventListener("click", () => {
        
        document.querySelectorAll(".planet").forEach(el => el.classList.remove("chosen-permanent"));
        planetEl.classList.add("chosen-permanent");
        choice = true;
        chooseWindow.remove();
      });

      no.addEventListener("click", () => {
          chooseWindow.innerHTML = `
          <div class="choose-content">
            <p>Choose a different planet.</p>
            <div style="display:flex; gap:10px; justify-content:center;">
            </div>
          </div>
        `;
      });
  }
});

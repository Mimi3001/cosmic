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
  },

  //------------------//
  //next//
  //------------------//

   {
    text: ["Great, you have chosen one!"],
    prompt: () => `You chose the planet: ${window.selectedPlanet?.name || "[unknown]"}`
  },

  {
    text: ["This many users chose it before you:"],
    prompt: () =>
      `${window.selectedPlanet?.y || 0} users of ${window.selectedPlanet?.z || 0} total players, last date: ${window.selectedPlanet?.date || ""}`
  },

  { text: ["Let's dive in and see how the world is in there shall we?"] },

  { text: ["This is your planet right now. A blank canvas!"] },

  { text: ["Will you fill it with your touch of creativity? You are scientist and artist."] },

  { text: ["You can make the terrain, the climate, and a place for a new civilization. Manipulate it with the notion of your hand!"] },

  { text: ["Thus you are the god here. You have limitl—well, not limitless—but still many options to make the planet as you wish!"] },

  {
    text: ["Let's sculpt this planet—give it lands, oceans, and some pretty clouds, shall we?"],
    prompt: "Move the bars with mouse. Adjust your terrain, atmosphere and water level",
    onEnd: "openMiniGame1" // triggers the canvas popup
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
      // Create popup container
      const name = window.selectedPlanet?.name || "Unknown";
      const popup = document.createElement("div");
      popup.className = "minigame-popup";

      popup.innerHTML = `
         <div class="minigame-content">
          <iframe src="minigames/myplanets/index.html?planet=${encodeURIComponent(name)}" frameborder="0"></iframe>
          <button class="close-minigame">Close</button>
        </div>
      `;

      document.body.appendChild(popup);

      // Close logic
      popup.querySelector(".close-minigame").addEventListener("click", () => {
        popup.remove();
      });
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
      const value = typeof entry.prompt === "function" ? entry.prompt() : entry.prompt;
      promptText.textContent = value;
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
      if (!choice && index >= 2) {
        console.log("User must choose a planet before continuing.");
        return;
      }
    if (index < story.length - 1) {
        const win = document.querySelector(".choose-window");
        if (win) win.remove();
     
      index++;
      showStory(index);
    }
  });
  btnPrev.addEventListener("click", () => {
    if (choice && index <= 3) {
      console.log("Cannot go back after confirming a planet.");
      return;
    }


    if (index > 0) {
      const win = document.querySelector(".choose-window");
      if (win) win.remove();
      
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

          // visually mark chosen planet
        document.querySelectorAll(".planet").forEach(el => el.classList.remove("chosen-permanent"));
        planetEl.classList.add("chosen-permanent");

        // mark that a choice has been made
        choice = true;

        //try aria-label ----
        let name = planetEl.getAttribute("aria-label")?.trim();

        //if not found, try using data-planet to find matching .planet-info #info-{n} ----
        if (!name) {
          const dataId = planetEl.dataset.planet; // e.g. "7"
          if (dataId) {
            const infoPanel = document.getElementById(`info-${dataId}`);
            name = infoPanel?.querySelector("h2")?.textContent?.trim();
          }
        }

        // try to find any .planet-info that contains the same name text (defensive) ----
        if (!name) {
          const ariaGuess = planetEl.getAttribute("aria-label");
          if (ariaGuess) {
            const match = Array.from(document.querySelectorAll(".planet-info")).find(pi => {
              const h = pi.querySelector("h2");
              return h && h.textContent.trim().toLowerCase() === ariaGuess.trim().toLowerCase();
            });
            name = match?.querySelector("h2")?.textContent?.trim();
          }
        }
        name = name || "Unknown Planet";
               // placeholder values for now
        const usersBefore = Math.floor(Math.random() * 50) + 1; // akala random 
        const totalUsers = 200; // akl random Replace the placeholder usersBefore / totalUsers with real values from your backend when you have one.
        const lastDate = new Date().toLocaleDateString("en-GB"); // dd/mm/yy

        window.selectedPlanet = {
          id: planetEl.dataset.planet || null,
           name,
          y: usersBefore,
          z: totalUsers,
          date: lastDate
        };
 
        chooseWindow.remove();

        // move to next story entry (the first new one)
        index++;
        showStory(index);
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

document.addEventListener("DOMContentLoaded", () => {
  //to lock the minigames
  let storyPaused = false;
  const minigameState = {
    1: { url: "minigames/myplanets/index.html", submitted: false },
    2: { url: "minigames/temperature/index.html", submitted: false },
    3: { url: "minigames/life/index.html", submitted: false } // prepare for minigame 3
  };

  let currentMinigame = null;  // id of the currently opened minigame

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
    console.warn(" story-text element not found in DOM");
    return;
  }

  // === Story data ===
  const story = [
    {
      text: ["Hello cosmic explorer! Earth seemed boring and trashy, so you've been invited to travel to the new world."],
      // audio: "audio/intro1_1.mp3",
    },
    {
      text: ["Can you make it interesting and clean?"],
      // audio: "audio/intro1_2.mp3"
    },
    {
      text: [
        "Before you stands this new solar system, far away from Earth. Explorers come all the time to attempt what you do right now — build a new home."
      ],
      // audio: "audio/intro1_3.mp3"
    },
    {
      text: ["Make a new multiplanet community. Expand, compete, collaborate."],
      // audio: "audio/intro1_4.mp3"
    },

    {
      text: ["Here stand 7 planets; and you can choose your own."],
      //audio: "audio/intro2_1.mp3"
      prompt: "Available planets at this moment: 7"
    },
    {
      text: [
        "NOTE: if a planet appears colorful, it means there's another explorer on that. Choose a white one."
      ],
      //audio: "audio/intro2_2.mp3"
    },
    {
      text: [
        "Oh! and any similarities with your home solar system are purely coincidental!"
      ],
      // audio: "audio/intro2_3.mp3"
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
  //---------------------//
  //  STORY AFTER MINIGAME 1 //
  //---------------------//

  story.push(
    { text: ["Let's move to more details."] },
    { text: ["What's the temperature range / atmosphere?"] },
    {
      text: ["Move your hand(slider) for tempersture adjustments in front of the camera."],
      prompt:
        "Move (slider) your hands up/down following the number markers.",
      onEnd: "openMiniGame2"
    },

    // AFTER MINIGAME 2
    { text: ["Great, you almost completed the first step."] },
    { text: ["Le petit paradise!"] },
    { text: ["Here’s your world now."] },
    {
      text: ["It is not ready yet though.."],
      onEnd: "lockAfterMiniGame2"
    },
    { text: ["Something is still missing..."] },
    { text: ["LIFE! Fauna and flora should thrive here."] },
    {
      text: ["Design your animals, build your landscape!"],
      prompt:
        "Draw plants and trees. Tap <Generate Population> to create colors & creatures. You can generate multiple times.",
      onEnd: "openMiniGame3"
    }
  );

  const neoindex = story.findIndex(item => item.onEnd === "choosePlanet");


  // === Globals ===
  let index = 0;
  let audio = null;
  let soundEnabled = true;


  //===prin to storyActions gia na to xrisomopoioun ta actions===//
  const minigameConfirmText = {
    1: "Submit your terrain & atmosphere settings?",
    2: "Submit your temperature & climate settings?",
    3: "Submit your flora generation?"
  };
  // === UNIVERSAL CONFIRM WINDOW (Same style as choose planet) ===
  function createConfirmWindow(message, yesCallback, noCallback) {
    // Remove existing windows
    const old = document.querySelector(".choose-window");
    if (old) old.remove();

    const win = document.createElement("div");
    win.className = "choose-window";

    win.innerHTML = `
    <div class="choose-content">
      <p>${message}</p>
      <div style="display:flex; gap:10px; justify-content:center;">
        <button class="confirm-yes">Yes</button>
        <button class="confirm-no">No</button>
      </div>
    </div>
  `;

    document.body.appendChild(win);

    win.querySelector(".confirm-yes").onclick = () => {
      win.remove();
      yesCallback();
    };

    win.querySelector(".confirm-no").onclick = () => {
      win.remove();
      if (noCallback) noCallback();
    };

    return win;
  }

  //===universal open minigame system===//

  // === UNIVERSAL MINIGAME POPUP FUNCTION ===
  /*
  function openMinigame(url) {

    minigameActive = true;
    minigameSubmitted = false;
    storyPaused = true;

    const popup = document.createElement("div");
    popup.className = "minigame-popup";

    popup.innerHTML = `
        <div class="minigame-content">
            <iframe src="${url}" frameborder="0"
                class="mg-iframe"
                style="width:100%; height:100%; border:none;"></iframe>

            <div class="minigame-buttons">
                
                
                <button class="submit-minigame">Submit</button>
                <button class="close-minigame">Close</button>
            </div>
        </div>
    `;

    document.body.appendChild(popup);

    const iframe = popup.querySelector(".mg-iframe");

    // CLOSE
    popup.querySelector(".close-minigame").onclick = () => {
      canReopenMinigame = true;//alla mporei na ksananoiksei
      popup.remove(); // but story remains locked
    };
    // SUBMIT
    popup.querySelector(".submit-minigame").onclick = () => {
      if (minigameSubmitted) return;

      const box = document.createElement("div");
      box.className = "confirm-submit";

      box.innerHTML = `
          <p>Submit?</p>
          <button class="yes-submit">Yes</button>
          <button class="no-submit">No</button>
        `;

      document.body.appendChild(box);

      box.querySelector(".no-submit").onclick = () => box.remove();

      box.querySelector(".yes-submit").onclick = () => {
        box.remove();
        popup.remove();

        minigameSubmitted = true;
        minigameActive = false;
        storyPaused = false;

        console.log("Minigame submitted → story unlocked");
      };
    };
  }
*/
  function openMinigame(id) {
    const mg = minigameState[id];
    if (!mg) return console.error("Unknown minigame ID:", id);

    currentMinigame = id;
    storyPaused = true;

    const popup = document.createElement("div");
    popup.className = "minigame-popup";

    popup.innerHTML = `
    <div class="minigame-content">
      <iframe src="${mg.url}" class="mg-iframe" allow="camera"></iframe>
      <div class="minigame-buttons">
        <button class="submit-minigame">Submit</button>
        <button class="close-minigame">Close</button>
      </div>
    </div>
  `;

    document.body.appendChild(popup);

    // Close = user tries to leave without submitting
    popup.querySelector(".close-minigame").onclick = () => {
      popup.remove();
      // storyPaused stays true ,  user must still submit
      
      //promt to mpoulo
      promptText.textContent = "";
      promptText.classList.remove("visible");
    };

    popup.querySelector(".submit-minigame").onclick = () => {
      // USER ALREADY SUBMITTED BEFORE → ask if they want to resubmit
      if (mg.submitted) {
        createConfirmWindow(
          "You already submitted this minigame. Submit a new one?",
          () => {       // YES
            mg.submitted = true;
            popup.remove();
            storyPaused = false;
          },
          () => { }      // NO → do nothing
        );
        return;
      }

      // FIRST SUBMISSION → normal confirm
      createConfirmWindow(
        minigameConfirmText[id] || "Submit your results?",
        () => {        // YES
          mg.submitted = true;
          popup.remove();

          promptText.textContent = "";
          promptText.classList.remove("visible");//mpoulo prompt

          storyPaused = false;
        },
        () => { }       // NO
      );
    };
  }



  // === Actions triggered by story lines ===
  const storyActions = {
    choosePlanet: () => {
      enablePlanetSelectionGlow();
      //showChooseWindow(); // <== this shows the popup
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


    openMiniGame1: () => openMinigame(1),
    openMiniGame2: () => openMinigame(2),
    openMiniGame3: () => openMinigame(2),

    lockAfterMiniGame2: () => {
      window.lockPoint = index; // store the index where back is disabled
    },

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
  }

  // === Start button ===
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      startBtn.classList.add("hidden");
      setTimeout(() => {
        btnNext.style.display = "block"; // show arrows when story starts
        btnPrev.style.display = "block"; // show arrows when story starts
        showStory(0); // start narration after 3 seconds
      }, 1000);//GIATI ARGEISSSSSSS
    });
  } else {
    showStory(0);
  }

  // === Navigation ===
  btnNext.addEventListener("click", () => {
    if (storyPaused) {
      console.log("Reopening minigame… submit to continue.");
      openMinigame(currentMinigame);
      return;
    }
    /*
        if (minigameActive && !minigameSubmitted) {
          console.log("You must submit the minigame before continuing.");
          return;
        }
    */
    if (!choice && index >= neoindex) {
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
    if (choice && index <= neoindex + 1) {
      console.log("Cannot go back after confirming a planet.");
      return;
    }
    if (window.lockPoint !== undefined && index <= window.lockPoint) {
      console.log("You cannot go back from this point.");
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
    if (choice === true || index !== neoindex) return;

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
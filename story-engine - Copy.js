document.addEventListener("DOMContentLoaded", () => {
  //to lock the minigames
  let storyPaused = false;
  let waitingForMG2Value = false;
  let waitingForMG1Height = false;
  let waitingForMG3Value = false;
  let smudgesPending = false;

  const minigameState = {
    1: { url: "minigames/myplanets/index.html", submitted: false },
    2: { url: "minigames/temperature/index.html", submitted: false },
    3: { url: "minigames/life/index.html", submitted: false },
    4: { url: "minigames/life/index.html", submitted: false },
    5: { url: "minigames/life/index.html", submitted: false },
    6: { url: "minigames/life/index.html", submitted: false },

  };

  let currentMinigame = null;  // id of the currently opened minigame
  let currentMinigamePrompt = ""; // remembers the correct prompt for reopen (LEFT/RIGHT bug fix)

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
  let storedMG3World = null;
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
      gamePrompt: "Move the bars with mouse. Adjust your terrain, atmosphere and water level",
      onEnd: "openMiniGame1" // triggers the canvas popup
    }

  ];
  //---------------------//
  //  STORY AFTER MINIGAME 1 //
  //---------------------//

  story.push(
    {
      text: ["Let's move to more details."],
      onEnd: "lockAfterMiniGame1"
    },
    { text: ["What's the temperature range / atmosphere?"] },
    {
      text: ["Move your hand(slider) for tempersture adjustments in front of the camera."],
      gamePrompt:
        "Move (slider) your hands up/down following the number markers.",
      onEnd: "openMiniGame2"
    },

    // AFTER MINIGAME 2
    {
      text: ["Great, you almost completed the first step."],
      onEnd: "lockAfterMiniGame2"
    },
    { text: ["Le petit paradise!"] },
    { text: ["Here’s your world now."] },
    { text: ["It is not ready yet though.."] },
    { text: ["Something is still missing..."] },
    { text: ["LIFE! Fauna and flora should thrive here."] },
    {
      text: ["Build your landscape! Design your animals"],
      //
      gamePrompt:
        "Click on the landscape to draw flowers and trees. Adjust size and detail and randomise colors. Submit your design.",
      onEnd: "openMiniGame3"
    },

    // during MINIGAME 3
    {
      text: ["Lets start with plants, then!"],
      onEnd: "waitForMiniGame3"  //mg3 closes and story continues
    },
    { text: ["beautyfull. like a true urban architect"] },

    {
      text: ["but it's still too silent."],
      onEnd: "lockAfterMiniGame3",

    },
    { text: ["lets make some noisy animals to live in this pretty planet "] },
    { text: ["birds, fish, mammals, incects, you name it! "] },
    {
      text: ["Place animals, on your planet!"],
      //
      gamePrompt:
        "Click on the land, sky and water to make random animals. ",
      onEnd: "openMiniGame4"
    },
    //during mg4
    {
      text: ["how do they sound? give them a voice "]
    },
    {
      text: ["what a nature!"],
      onEnd: "waitForMiniGame4"
    },
    // AFTER MINIGAME 4
    { text: ["it is lonely for the explorer"] },
    {
      text: ["where's the civilization?"],
      onEnd: "lockAfterMiniGame4"
    },
    {
      text: ["humans must enjoy your paradise"],
      gamePrompt:
        "Click on the planet, to add human population, build cities and factories.",
      onEnd: "openMiniGame5"
    },
    // DURING MINIGAME 5
    {
      text: ["Bravo! you made a new home for humans"]
    },
    { text: ["but wait what are these clouds?"] },
    {
      text: ["phew phew! push them away!"],
      gamePrompt:
        "Click on the smudges to clean them from the solar system",//3 leave 1 appear
    },
    { text: ["oh is it the humans doing it?"] },
    {
      text: ["your paradise will become a dumbster if you don't clean it"],
      gamePrompt:
        "Wipe wave hand to clean the trash"
    },
    { text: ["wait the plants and the animals go away too"] },//kathe click na afairei ena animal/futo
    {
      text: ["you should stop generating that much civilization"],
      onEnd: "waitForMiniGame5"// story stops , wait mg5  to close
    },

    //AFTER MINIGAME 5
    { text: ["humans are too many. they must eat and build and build"] },//afou kleisti to game
    { text: ["their actions keep polluting"] },
    {
      text: ["you should generate more nature."],
      onEnd: "lockAfterMiniGame5"
    },
    {
      text: ["fix the balance between humans and nature"],
      //
      gamePrompt:
        "generate MOooORE plants, mOOoooOre green, moOore ANiMAls",
      onEnd: "openMiniGame6"
    },
    // DURING AND AFTER MINIGAME 6 - the end
    { text: ["that's it. pollution goes away"] },
    {
      text: ["keep adding"],
      //  onEnd: "lockAfterMiniGame6",
      onEnd: "waitForSmudgesCleared"
    },
    {
      text: ["you made it!"],
      onEnd: "lockAfterMiniGame6",
    },//IMAGE of the landscape gets saved locally
    {
      text: ["this planet is balanced and thriving!"],
      // onEnd: "waitForMG6Close" //GAME CLOSES HERE
    },
    { text: "you see humans should give more.. space to nature" },
    { text: "but you did a great job explorer!" },
    {
      text: ["you may rest now and enjoy the view"],//edw kleinei to paixnidi
      onEnd: "openview"


    },
    // after the save - mg6 close
    { text: ["you are a caring god that made a clean and safe space for all the creatures"] },
    {
      text: ["thank you for your input explorer"],
      prompt: "the end"
    },



  );

  const neoindex = story.findIndex(item => item.onEnd === "choosePlanet");


  // === Globals ===
  let index = 0;
  let audio = null;
  let soundEnabled = true;
  let pendingMG3Value = null;

  //===prin to storyActions gia na to xrisomopoioun ta actions===//
  const minigameConfirmText = {
    1: "Submit your terrain & atmosphere settings?",
    2: "Submit your temperature & climate settings?",
    3: "Submit your flora generation?",
    4: "Submit your fauna population?",
    5: "Submit your civilization?",
    6: "Submit your final nature balance?"
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

  function openMinigame(id, { reopen = false } = {}) {

    let existingPopup = document.getElementById("minigame-popup");

    if (existingPopup) {
      existingPopup.style.display = "flex";
      currentMinigame = id;

      const entry = story[index];
      const gamePrompt = entry?.gamePrompt
        ? (typeof entry.gamePrompt === "function" ? entry.gamePrompt() : entry.gamePrompt)
        : "";
      currentMinigamePrompt = gamePrompt; // overwrite MG3's old prompt
      /* oxi auta
            if (gamePrompt) {
              promptText.textContent = gamePrompt;
              promptText.classList.add("visible");
            } else {
              promptText.classList.remove("visible");
            }*/

      const iframe = existingPopup.querySelector("iframe");
      iframe.contentWindow.postMessage({ type: "set_prompt", text: gamePrompt }, "*");//send updated prompt

      //SWITCH MODE INSTEAD OF RELOADING
      if (id === 3) {
        iframe.contentWindow.postMessage({
          type: "set_mode",
          mode: "flora",

        }, "*");
      }
      if (id === 4) {
        // FIXED: Send saved world state BEFORE switching mode
        if (storedMG3World) {
          iframe.contentWindow.postMessage({
            type: "init_world",
            payload: storedMG3World
          }, "*");
          console.log("[PARENT] Restored world state for animals stage");
        }
        iframe.contentWindow.postMessage({
          type: "set_mode",
          mode: "animals",

        }, "*");
      }
      if (id === 5) {
        // FIXED: Send saved world state BEFORE switching mode
        if (storedMG3World) {
          iframe.contentWindow.postMessage({
            type: "init_world",
            payload: storedMG3World
          }, "*");
          console.log("[PARENT] Restored world state for civil stage");
        }
        iframe.contentWindow.postMessage({
          type: "set_mode",
          mode: "civil",

        }, "*");
      }
      if (id === 6) {
        existingPopup.querySelector(".submit-minigame").style.display = "none";
        iframe.contentWindow.postMessage({
          type: "set_mode", mode: "mg6",
          // gamePrompt: "generate MOooORE plants, mOOoooOre green"
        }, "*");
      }/*
      existingPopup.querySelector(".close-minigame").onclick = () => {
        if (currentMinigame === 6) {
          popup.remove();
          storyPaused = false;  // unfreeze
          index++;
          showStory(index);     // advance to "you are a caring god..."
        } else {
          existingPopup.style.display = "none";
          promptText.textContent = "";
          promptText.classList.remove("visible");
        }
      };*/
      const closeBtn = existingPopup.querySelector(".close-minigame");
      const newClose = closeBtn.cloneNode(true); // cloning removes all old listeners
      closeBtn.replaceWith(newClose);

      newClose.onclick = () => {
        if (currentMinigame === 6 || currentMinigame === "view") {
          // existingPopup.remove();//auto to katastrefei
          existingPopup.style.display = "none";  // HIDE not remove
          storyPaused = false;
          index++;
          showStory(index);
        } else {
          existingPopup.style.display = "none";
          promptText.textContent = "";
          promptText.classList.remove("visible");
        }
      };
      return;
    }
    /*const mg = minigameState[id];
    const entry = story[index];
    const gamePrompt = entry?.gamePrompt ? (typeof entry.gamePrompt === "function" ? entry.gamePrompt() : entry.gamePrompt) : "";*/
    const mg = minigameState[id];

    // IMPORTANT: when reopening after LEFT/RIGHT, story[index] is no longer the minigame entry.
    // So we reuse the remembered prompt instead of recomputing it from the wrong story index.
    let gamePrompt = "";
    if (reopen) {
      gamePrompt = currentMinigamePrompt || "";
    } else {
      const entry = story[index];
      gamePrompt = entry?.gamePrompt
        ? (typeof entry.gamePrompt === "function" ? entry.gamePrompt() : entry.gamePrompt)
        : "";
      currentMinigamePrompt = gamePrompt; // remember correct prompt for reopening
    }

    if (!mg) return console.error("Unknown minigame ID:", id);


    currentMinigame = id;
    storyPaused = true;

    const planetName = window.selectedPlanet?.name || "";
    const planetIndex = window.selectedPlanet?.index ?? 4; //h estw 4o planiti
    const mg1Height = window.mg1Height ?? 0;//h estw 0 upsos
    const mg1Water = window.mg1Water ?? 0;

    console.log("[PARENT] opening MG", id, "with planetIndex:", planetIndex);

    const popup = document.createElement("div");
    popup.id = "minigame-popup";
    popup.className = "minigame-popup";

    //one source to rull them all, name, index, height, WATEeeR
    popup.innerHTML = `
    <div class="minigame-content">
      <iframe 
        src="${mg.url}?planet=${encodeURIComponent(planetName)}&planetIndex=${planetIndex}&mg1Height=${mg1Height}&mg1Water=${mg1Water}" 
        class="mg-iframe" allow="camera">
      </iframe>
      <div class="minigame-buttons">
        <button class="submit-minigame">Submit</button>
        <button class="close-minigame">Close</button>
      </div>
    </div>
  `;

    if (id === 3) {
      const iframe = popup.querySelector("iframe");
      //TO UI TOY
      //iframe.onload = () => {
      iframe.addEventListener("load", () => {
        iframe.contentWindow.postMessage({
          type: "ui_theme",
          vars: {
            "--ui-bg": "rgba(10,10,30,0.9)",
            "--ui-text": "#cdeeff",
            "--ui-accent": "#00ccff"
          }
        }, "*");

        if (pendingMG3Value !== null) {//MG3 only receives the value if:
          iframe.contentWindow.postMessage(
            { type: "pref_from_parent", value: pendingMG3Value },
            "*"
          );
          console.log("Sent stored MG2 value to MG3.");
        } else {
          console.log("MG3 opened but no stored value found.");
        }


        //na mpei reset mono gt to 3o game
        /*const resetBtn = document.createElement("button");
        resetBtn.textContent = "Reset";
        resetBtn.className = "ui-button reset-minigame";
        popup.querySelector(".minigame-buttons").prepend(resetBtn);

        resetBtn.onclick = () => {
          const iframe = popup.querySelector("iframe");
          iframe.contentWindow.postMessage({ type: "reset_game", source: id }, "*");
        };*/
      });
    }
    if (id === 4 || id === 5) {
      const iframe = popup.querySelector("iframe");

      iframe.addEventListener("load", () => {
        if (storedMG3World) {
          iframe.contentWindow.postMessage({
            type: "init_world",
            payload: storedMG3World
          }, "*");
          console.log("[PARENT] Sent stored world to Life minigames", id);
        } else {
          console.warn("MG4 opened with no MG3 world");
        }
      });
    }

    const iframe = popup.querySelector("iframe");
    //to promt
    iframe.addEventListener("load", () => {
      iframe.contentWindow.postMessage(
        { type: "set_prompt", text: gamePrompt }, "*"
      );
    })
    //neo
    iframe.addEventListener("load", () => {

      //  MODE SWITCHING
      if (id === 3) {
        iframe.contentWindow.postMessage({
          type: "set_mode",
          mode: "flora"
        }, "*");
      }

      if (id === 4) {
        iframe.contentWindow.postMessage({
          type: "set_mode",
          mode: "animals"
        }, "*");
      }

      if (id === 5) {
        iframe.contentWindow.postMessage({
          type: "set_mode",
          mode: "civil"
        }, "*");
      }

    });

    document.body.appendChild(popup);



    //===============================================================
    // Close = user tries to leave without submitting
    popup.querySelector(".close-minigame").onclick = () => {
      //popup.remove();
      popup.style.display = "none";
      // storyPaused stays true ,  user must still submit

      //promt to mpoulo
      promptText.textContent = "";
      promptText.classList.remove("visible");
    };

    // popup.querySelector(".submit-minigame").onclick = () => {
    //   //=======================================================================
    //   // USER ALREADY SUBMITTED BEFORE  ask if they want to resubmit
    //   if (mg.submitted) {
    //     if (currentMinigame === 2) {
    //       const iframe = popup.querySelector("iframe");
    //       iframe.contentWindow.postMessage({ type: "request_slider_value" }, "*");
    //     }
    //     createConfirmWindow(
    //       "You already submitted this minigame. Submit a new one?",
    //       () => {       // YES
    //         const iframe = popup.querySelector("iframe");
    //         iframe.contentWindow.postMessage(
    //           { type: "request_slider_value" },
    //           "*"
    //         );
    //         if (currentMinigame === 1) {
    //           const iframe = popup.querySelector("iframe");
    //           iframe.contentWindow.postMessage(
    //             { type: "request_mg1_height" },//zitame to ipsos on submit MG1
    //             "*"
    //           );
    //           //console.log("height", id, "with planetIndex:", planetIndex);
    //         }
    //         mg.submitted = true;
    //         popup.remove();
    //         storyPaused = false;
    //       },
    //       () => { }      // NO do nothing
    //     );
    //     return;
    //   }
    //   //=========================================================================Ω
    //   // FIRST SUBMISSION========================================================
    //   createConfirmWindow(
    //     minigameConfirmText[id] || "Submit your results?",
    //     () => {        // YES

    //       if (currentMinigame === 1) {
    //         waitingForMG1Height = true;//na perimenei
    //         const iframe = popup.querySelector("iframe");
    //         iframe.contentWindow.postMessage(
    //           { type: "request_mg1_height" },
    //           "*"
    //         );
    //         iframe.contentWindow.postMessage(
    //           { type: "request_mg1_water" },
    //           "*"
    //         );
    //         return; //idia logiki epilusis sto mg2 pros mg3
    //       }

    //       if (currentMinigame === 2) {
    //         const iframe = popup.querySelector("iframe");

    //         waitingForMG2Value = true;

    //         iframe.contentWindow.postMessage(
    //           { type: "request_slider_value" },
    //           "*"
    //         );


    //         return; // DO NOT close yet
    //       }

    //       if (currentMinigame === 3 || currentMinigame === 4 || currentMinigame === 5) {//OLOI STELNOUN
    //         const iframe = popup.querySelector("iframe");

    //         waitingForMG3Value = true;

    //         iframe.contentWindow.postMessage(
    //           { type: "request_mg3_snapshot" },
    //           "*"
    //         );


    //         return; // DO NOT close yet
    //       }

    //       mg.submitted = true;
    //       // popup.remove();
    //       popup.style.display = "none";

    //       promptText.textContent = "";
    //       promptText.classList.remove("visible");//mpoulo prompt

    //       storyPaused = false;
    //     },
    //     () => { }       // NO
    //   );
    // };

    popup.querySelector(".submit-minigame").onclick = () => {
      // Use currentMinigame (live value) instead of closure-captured id
      const activeId = currentMinigame;
      const activeMg = minigameState[activeId];

      //=======================================================================
      // USER ALREADY SUBMITTED BEFORE  ask if they want to resubmit
      if (activeMg.submitted) {
        if (activeId === 2) {
          const iframe = popup.querySelector("iframe");
          iframe.contentWindow.postMessage({ type: "request_slider_value" }, "*");
        }
        createConfirmWindow(
          "You already submitted this minigame. Submit a new one?",
          () => {       // YES
            const iframe = popup.querySelector("iframe");

            if (activeId === 1) {
              iframe.contentWindow.postMessage(
                { type: "request_mg1_height" },
                "*"
              );
            } else if (activeId === 2) {
              iframe.contentWindow.postMessage(
                { type: "request_slider_value" },
                "*"
              );
            } else if (activeId === 3 || activeId === 4 || activeId === 5) {
              waitingForMG3Value = true;
              iframe.contentWindow.postMessage(
                { type: "request_mg3_snapshot" },
                "*"
              );
            }

            activeMg.submitted = true;
            popup.style.display = "none";
            storyPaused = false;
          },
          () => { }      // NO do nothing
        );
        return;
      }
      //=========================================================================
      // FIRST SUBMISSION========================================================
      createConfirmWindow(
        minigameConfirmText[activeId] || "Submit your results?",
        () => {        // YES

          if (activeId === 1) {
            waitingForMG1Height = true;
            const iframe = popup.querySelector("iframe");
            iframe.contentWindow.postMessage(
              { type: "request_mg1_height" },
              "*"
            );
            iframe.contentWindow.postMessage(
              { type: "request_mg1_water" },
              "*"
            );
            return;
          }

          if (activeId === 2) {
            const iframe = popup.querySelector("iframe");

            waitingForMG2Value = true;

            iframe.contentWindow.postMessage(
              { type: "request_slider_value" },
              "*"
            );

            return; // DO NOT close yet
          }

          if (activeId === 3 || activeId === 4 || activeId === 5) {
            const iframe = popup.querySelector("iframe");

            waitingForMG3Value = true;

            iframe.contentWindow.postMessage(
              { type: "request_mg3_snapshot" },
              "*"
            );

            return; // DO NOT close yet
          }

          activeMg.submitted = true;
          popup.style.display = "none";

          promptText.textContent = "";
          promptText.classList.remove("visible");

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


    openMiniGame1: () => openMinigame(1),//planetsterain
    openMiniGame2: () => openMinigame(2),//temp

    openMiniGame3: () => {
      openMinigame(3); setTimeout(() => { storyPaused = false; }, 0);
    },
    waitForMiniGame3: () => { if (!minigameState[3].submitted) storyPaused = true; },//flora // freezes here

    openMiniGame4: () => {
      openMinigame(4); setTimeout(() => { storyPaused = false; }, 0);
    },
    waitForMiniGame4: () => { if (!minigameState[4].submitted) storyPaused = true; }, //animals // freezes here

    openMiniGame5: () => {
      openMinigame(5);
      setTimeout(() => { storyPaused = false; }, 0); // runs AFTER openMinigame finishes
    },
    waitForMiniGame5: () => { if (!minigameState[5].submitted) storyPaused = true; },//civil


    openMiniGame6: () => {
      openMinigame(6); setTimeout(() => { storyPaused = false; }, 0); // same fix
    },
    waitForSmudgesCleared: () => {  // lock here — only smudges_cleared message will unlock
      //waitForMG6Close: () => {
      storyPaused = true; //telos // freeze narration
      currentMinigame = 6;

      /*
            const popup = document.getElementById("minigame-popup");
            const iframe = popup?.querySelector("iframe");// send save command to iframe
            if (iframe) {
              iframe.contentWindow.postMessage({ type: "save_canvas" }, "*");
            }
            // if player already closed the popup, reopen it in view mode (no tools, just landscape)
            if (!popup || popup.style.display === "none") {
              const existingPopup = document.getElementById("minigame-popup");
              if (existingPopup) {
                existingPopup.style.display = "flex";
                existingPopup.querySelector(".submit-minigame").style.display = "none";
                const iframe2 = existingPopup.querySelector("iframe");
                iframe2.contentWindow.postMessage({ type: "hide_ui" }, "*");
              }
            }
      */
    },

    /* openMiniGame5: () => {
       openMinigame(5); // humans
       storyPaused = false; //narration continues
     },
     waitForMiniGame5: () => {
       storyPaused = true;  // only freeze HERE
     },
     openMiniGame6: () => {
       openMinigame(6);
       storyPaused = false;
       setTimeout(() => {
         const btn = document.querySelector(".submit-minigame");
         if (btn) btn.style.display = "none";//na min exei koumpia
       }, 50);
     }, */



    lockAfterMiniGame1: () => {
      window.lockPoint = index; // store the index where back is disabled
    },
    lockAfterMiniGame2: () => {
      window.lockPoint = index; // store the index where back is disabled
    },
    lockAfterMiniGame3: () => {
      window.lockPoint = index; // store the index where back is disabled
    },
    lockAfterMiniGame4: () => {
      window.lockPoint = index; // store the index where back is disabled
    },
    lockAfterMiniGame5: () => {
      window.lockPoint = index; // store the index where back is disabled
    },
    lockAfterMiniGame6: () => {
      window.lockPoint = index;     //to kratame
    },

    openview: () => {
      storyPaused = true; // freeze until player closes view
      currentMinigame = "view"; // distinguish from active game

      const popup = document.getElementById("minigame-popup");
      // popup should always exist at this point — just show and configure it
      if (!popup) {
        console.error("[BUG] popup missing in openview — was it removed somewhere?");
        return;
      }

      popup.style.display = "flex";
      //function setupViewPopup(popup) {//oxi
      // hide submit, keep close
      const submit = popup.querySelector(".submit-minigame");
      if (submit) submit.style.display = "none";

      // send hide_ui and save_canvas to iframe
      const iframe = popup.querySelector("iframe");
      if (iframe) {

        iframe.contentWindow.postMessage({ type: "save_canvas" }, "*");
        setTimeout(() => {// delay close to let the canvas render fully
          iframe.contentWindow.postMessage({ type: "hide_ui" }, "*");
        }, 500);
      }

      // close button advances story
      const closeBtn = popup.querySelector(".close-minigame");
      const newClose = closeBtn.cloneNode(true);
      closeBtn.replaceWith(newClose);
      newClose.onclick = () => {
        popup.style.display = "none";
        storyPaused = false;
        index++;
        showStory(index);
      };
      //}
      /*
            if (existingPopup && existingPopup.style.display !== "none") {
              // popup is already open — just configure it
              setupViewPopup(existingPopup);
            } else if (existingPopup) {
              // popup exists but hidden — show it
              existingPopup.style.display = "flex";
              setupViewPopup(existingPopup);
            } else {
              // popup was removed — rebuild it
              const planetName = window.selectedPlanet?.name || "";
              const planetIndex = window.selectedPlanet?.index ?? 4;
              const mg1Height = window.mg1Height ?? 0;
              const mg1Water = window.mg1Water ?? 0;
              const popup = document.createElement("div");
              popup.id = "minigame-popup";
              popup.className = "minigame-popup";
              popup.innerHTML = `
            <div class="minigame-content">
              <iframe src="minigames/life/index.html?planet=${encodeURIComponent(planetName)}&planetIndex=${planetIndex}&mg1Height=${mg1Height}&mg1Water=${mg1Water}"
                class="mg-iframe" allow="camera">
              </iframe>
              <div class="minigame-buttons">
                <button class="close-minigame">Close</button>
              </div>
            </div>
          `;
              document.body.appendChild(popup);
              const iframe = popup.querySelector("iframe");
              iframe.addEventListener("load", () => {
                if (storedMG3World) {
                  iframe.contentWindow.postMessage({ type: "init_world", payload: storedMG3World }, "*");
                }
                iframe.contentWindow.postMessage({ type: "set_mode", mode: "view" }, "*");
                setTimeout(() => {
                  iframe.contentWindow.postMessage({ type: "save_canvas" }, "*");
                }, 2000); // longer delay for fresh load
                iframe.contentWindow.postMessage({ type: "hide_ui" }, "*");
              });
              setupViewPopup(popup);
            }*/
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

    // update top prompt non-minigames odigies
    if (entry.prompt) {
      const value = typeof entry.prompt === "function" ? entry.prompt() : entry.prompt;
      promptText.textContent = value;
      promptText.classList.add("visible");
    } else {
      promptText.textContent = "";
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
      // just show the popup again, don't reinitialise anything
      const existing = document.getElementById("minigame-popup");//not sure
      if (existing) existing.style.display = "flex";

      //openMinigame(currentMinigame, { reopen: true });
      return;
    }

    if (!choice && index >= neoindex) return;
    if (index < story.length - 1) {
      const win = document.querySelector(".choose-window");
      if (win) win.remove();
      index++;
      showStory(index);
    }
  });



  /*
      if (minigameActive && !minigameSubmitted) {
        console.log("You must submit the minigame before continuing.");
        return;
      }
  */
  /*sbinw not sure
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
 });*/
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
  // ===========music toggle======
  const musicToggle = document.getElementById("music-toggle");
  const musicIcon = document.getElementById("music-icon");
  const bgMusic = new Audio("audio/music.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.4;
  let musicEnabled = false;


  if (musicToggle && musicIcon) {
    musicToggle.addEventListener("click", () => {
      musicEnabled = !musicEnabled;
      if (musicEnabled) {
        bgMusic.play();
        musicIcon.src = "images/music.svg";
        musicIcon.alt = "Music On";
      } else {
        bgMusic.pause();
        musicIcon.src = "images/nomusic.svg";
        musicIcon.alt = "Music Off";
      }
    });
  }

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

      // lock planet name display permanently ---panw deksia
      const nameDisplay = document.getElementById("planet-name-display");
      if (nameDisplay) {
        nameDisplay.classList.add("visible");
        // prevent script.js from changing it anymore
        nameDisplay.dataset.locked = "true";
      }

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
        index: Number(planetEl.dataset.planet),
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

    //receive data from minigame2
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
  window.addEventListener("message", (event) => { //-------ENA ANA ARXEIO 
    console.log("PARENT RECEIVED MESSAGE:", event.data);

    if (event.data?.type === "minigame1_height") {
      window.mg1Height = Number(event.data.value);

      console.log("Parent stored MG1 height:", window.mg1Height);

      if (waitingForMG1Height) {
        waitingForMG1Height = false;

        const popup = document.querySelector(".minigame-popup");
        if (popup) popup.remove();//MG1 closes after sending height

        minigameState[1].submitted = true;// Parent has the value before MG2 opens
        storyPaused = false;
      }
    }

    if (event.data?.type === "minigame1_water") {
      window.mg1Water = Number(event.data.value);

      console.log("Parent stored MG1 water:", window.mg1Water);
    }


    if (event.data?.type === "minigame2_result") {
      pendingMG3Value = event.data.value;
      console.log("Parent received from minigame 2:", event.data.value);
      //if (waitingForMG2Value) {
      waitingForMG2Value = false;

      const popup = document.querySelector(".minigame-popup");
      if (popup) popup.remove();

      storyPaused = false;
      minigameState[2].submitted = true;
      // }

    }
    // if (event.data?.type === "minigame3_result") {
    //   storedMG3World = event.data.payload;
    //   console.log("[MAIN] Stored MG3 world", storedMG3World);

    //   if (waitingForMG3Value) {
    //     waitingForMG3Value = false;

    //     const popup = document.querySelector(".minigame-popup");
    //     if (popup) popup.style.display = "none";// popup.remove();

    //     minigameState[3].submitted = true;
    //     storyPaused = false;
    //   }
    //   /*
    //         // Find MG3 iframe
    //         const mg3 = document.querySelector('iframe[src="minigames/flora/index.html"]');
    //         if (!mg3) {
    //           console.warn("Minigame 3 iframe not found.");
    //           return;
    //         }

    //         mg3.contentWindow.postMessage(
    //           {
    //             type: "pref_from_parent",
    //             value: event.data.value
    //           },
    //           "*"
    //         );

    //         console.log("Parent forwarded value to minigame 3.");
    //         */
    //   //pendingMG3Value = event.data.value;   // <-- store it
    // }
    if (event.data?.type === "minigame3_result" && waitingForMG3Value) {
      storedMG3World = event.data.payload;
      console.log("[MAIN] Stored MG3 world", storedMG3World);
      waitingForMG3Value = false;
      // if this was triggered by smudges_cleared, jump to "you made it!"
      if (//currentMinigame === 6 &&
        smudgesPending) {
        smudgesPending = false;
        const target = story.findIndex(s => s.onEnd === "lockAfterMiniGame6");
        if (target !== -1) {
          index = target;
          storyPaused = false;
          showStory(index);
        }

        return;// don't hide popup or mark submitted
      }
      //if (waitingForMG3Value) {
      //  waitingForMG3Value = false;

      const popup = document.querySelector(".minigame-popup");
      if (popup) popup.style.display = "none";

      minigameState[currentMinigame].submitted = true;
      storyPaused = false;
      //}

      /* if (currentMinigame === 6) {
         // Reopen as cinematic view — no buttons
         const cinematic = document.createElement("div");
         cinematic.id = "minigame-popup";
         cinematic.className = "minigame-popup";
         cinematic.innerHTML = `
           <div class="minigame-content">
             <iframe src="minigames/life/index.html?planet=...&planetIndex=..."
               class="mg-iframe" allow="camera">
             </iframe>
             <!-- no buttons -->
           </div>
         `;
         document.body.appendChild(cinematic);
 
         const iframe = cinematic.querySelector("iframe");
         iframe.addEventListener("load", () => {
           iframe.contentWindow.postMessage({ type: "init_world", payload: storedMG3World }, "*");
           iframe.contentWindow.postMessage({ type: "set_mode", mode: "view" }, "*"); // new mode
           iframe.contentWindow.postMessage({ type: "hide_ui" }, "*"); // tell world.js to hide tools
         });
       }*/
    }
    if (event.data?.type === "smudges_cleared") {
      // only fires during MG6
      if (currentMinigame !== 6) return;
      smudgesPending = true;
      // capture final world state including MG6 plants/animals
      const popup = document.getElementById("minigame-popup");
      const iframe = popup?.querySelector("iframe");
      if (iframe) {
        waitingForMG3Value = true; // reuse existing snapshot mechanism
        iframe.contentWindow.postMessage({ type: "request_mg3_snapshot" }, "*");
        // minigame3_result handler will fire, update storedMG3World,
        // then we jump story from there:
      }

      // jump to "you made it!" beat
      //auto paei allou
      /*const target = story.findIndex(s => s.onEnd === "lockAfterMiniGame6");
      if (target !== -1) {
        index = target;
        storyPaused = false;
        showStory(index);
      }*/
    }
    //   if (event.data?.type === "smudges_cleared" && currentMinigame === 6) {
    // freeze tools, save image — world.js handles this
    // then after a short delay, close the popup and continue story
    /* setTimeout(() => {
       const popup = document.getElementById("minigame-popup");
       if (popup) popup.remove();
       storyPaused = false;
       index++;
       showStory(index);
     }, 2000);
     */ // 2s to let the save complete
    /*      const target = story.findIndex(s => s.onEnd === "lockAfterMiniGame6");
    if (target !== -1) {
      index = target;
      storyPaused = false;
      showStory(index);
    }
        const popup = document.getElementById("minigame-popup");
        const iframe = popup?.querySelector("iframe");
        if (iframe) {
          iframe.contentWindow.postMessage({ type: "hide_ui" }, "*");
        }
      }
  */

  });


  //--=======escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const popup = document.getElementById("minigame-popup");
      if (!popup || popup.style.display === "none") return;

      const closeBtn = popup.querySelector(".close-minigame");
      if (closeBtn) closeBtn.click(); // trigger the same logic as clicking close
    }
  });


}); 
 // ===== DEV SKIP SYSTEM =====
  window.devSkipTo = function (mgNumber) {
    console.log("DEV SKIP to minigame", mgNumber);

    // Fake required previous states
    choice = true;

    window.selectedPlanet = {
      id: 4,
      index: 7,
      name: "Test Planet",
      y: 10,
      z: 200,
      date: new Date().toLocaleDateString("en-GB")
    };

    // Fake MG1 values
    window.mg1Height = 50;
    window.mg1Water = 40;
    minigameState[1].submitted = true;

    // Fake MG2 result
    pendingMG3Value = 2;
    minigameState[2].submitted = true;

    // Fake MG3 world (minimal structure)
    storedMG3World = {
      landscape: {           // ADD landscape wrapper
        step: 2,
        planetIndex: 7,
        mg1Height: 50,
        mg1Water: 40,
        seed: 2
      },
      plants: [],
      // colors: ["#00ff00"],
      //landscape: [],
      animals: [],
      civil: []
    };
    minigameState[3].submitted = true;


    if (mgNumber > 4) minigameState[4].submitted = true;
    if (mgNumber > 5) minigameState[5].submitted = true;
    if (mgNumber > 6) minigameState[6].submitted = true;
    storyPaused = false;
    // Jump to correct story index
    const target = story.findIndex(s => s.onEnd === `openMiniGame${mgNumber}`);
    if (target !== -1) {
      index = target;
      showStory(index);
    }
  };
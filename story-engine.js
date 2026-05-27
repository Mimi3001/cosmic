document.addEventListener("DOMContentLoaded", () => {
  if (window.availablePlanets === undefined) window.availablePlanets = 7;//posoi planites
  //Using window.availablePlanets (instead of a local let) so it survives the replay reset. 
  //We initialize it only once — it persists across replays.

  //to lock the minigames
  let storyPaused = false;
  let waitingForMG2Value = false;
  let waitingForMG1Height = false;
  let waitingForMG3Value = false;
  let smudgesPending = false;
  //let mgClickCount = 0;

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
  let currentLang = "el";
  let langSwitching = false;
  Object.defineProperty(window, 'currentLang', {
    get: () => currentLang
  });

  let onEndFired = false;
  let subHideTimer = null;
  function scheduleSubHide() {
    if (subHideTimer) clearTimeout(subHideTimer);
    subHideTimer = setTimeout(() => { textEl.classList.remove("show"); }, 1500);
  }
  let narrativePaused = false; // space bar pause
  // === Story data ===

  const story = [
    {
      text: ["Hello cosmic explorer!"],
      textEl: ["Γεια σου κοσμικέ εξερευνητή!"],
      audio: "audio/en/00_hello_explorer.mp3",
      audioEl: "audio/el/00_hello_explorer.mp3"
    },
    {
      text: ["Earth seemed boring and trashy,"],
      textEl: ["Η Γη έγινε λίγο βαρετή και βρόμικη,"],
      audio: "audio/en/00_trashy.mp3",
      audioEl: "audio/el/00_trashy.mp3"
    },

    {
      text: ["so you've been invited to travel to a new world for restart."],
      textEl: ["οπότε σε καλέσαμε να ταξίδεψεις για restart."],
      audio: "audio/en/01_invited_travel.mp3",
      audioEl: "audio/el/01_invited_travel.mp3"
    },

    {
      text: ["Your mission: make a planet interesting and clean."],
      textEl: ["Αποστολή σου: φτιάξε έναν πλανήτη όμορφο και καθαρό."],
      audio: "audio/en/02_your_mission.mp3",
      audioEl: "audio/el/02_your_mission.mp3"
    },

    {
      text: ["Before you stands this new solar system. Explorers come all the time like in Roblox servers"],
      textEl: ["Μπροστά σου βρίσκεται ένα ολοκαίνουριο ηλιακό σύστημα. Οι εξερευνητές σκάνε σαν είναι Roblox servers"],
      audio: "audio/en/03_solar_system.mp3",
      audioEl: "audio/el/03_solar_system.mp3"
    },

    {
      text: ["to attempt what you do right now - build a new home."],
      textEl: ["για τον ίδιο λόγο που ήρθες και συ - να φτίαξουν ένα νέο σπίτι."],
      audio: "audio/en/04_build_home.mp3",
      audioEl: "audio/el/04_build_home.mp3"
    },

    {
      text: ["Here stand 7 planets; and you can choose your own."],
      prompt: () => `Available planets at this moment: ${window.availablePlanets}`,
      promptEl: () => `Διαθέσιμοι πλανήτες αυτήν την στιγμή: ${window.availablePlanets}`,
      textEl: ["Εδώ βρίσκονται 7 διαθέσιμοι πλανήτες. Διάλεξε όποιον θέλεις."],
      audio: "audio/en/05_seven_planets.mp3",
      audioEl: "audio/el/05_seven_planets.mp3"
    },

    {
      text: ["Read each planet's collected info. Take your time.. and pick any planet to conquer!"],
      onEnd: "choosePlanet",
      prompt: "Roll over a planet and click on it, ",
      promptEl: "Πέρασε το ποντίκι πάνω από πλανήτη που θες και κάνε κλικ",
      textEl: ["Διάβασε τις πληροφορίες του κάθε πλανήτη. Με το πάσο σου.. και διάλεξε πλανήτη να κατακτήσεις!"],
      audio: "audio/en/06_pick_planet.mp3",
      audioEl: "audio/el/06_pick_planet.mp3"
    },

    {
      text: ["Great, you have chosen one!"],
      prompt: () => `You chose the planet: ${window.selectedPlanet?.name || "[unknown]"}`,
      promptEl: () => `Διάλεξες τον πλανήτη: ${window.selectedPlanet?.name || "[άγνωστο]"}`,
      textEl: ["Τέλεια επιλογή. Καλορίζικο."],
      audio: "audio/en/07_great_choice.mp3",
      audioEl: "audio/el/07_great_choice.mp3"
    },
    /*
        {
          text: ["This many users chose it before you:"],
          prompt: () => `${window.selectedPlanet?.y || 0} users of ${window.selectedPlanet?.z || 0} total players, last date: ${window.selectedPlanet?.date || ""}`,
          promptEl: () => `${window.selectedPlanet?.y || 0} χρήστες από ${window.selectedPlanet?.z || 0} συνολικά, τελευταία ημερομηνία: ${window.selectedPlanet?.date || ""}`,
          textEl: ["Δεν είσαι ο πρώτος που είδε αυτήν την πέτρα και είπε «δικός μου»."],
          audio: "audio/en/08_users_before.mp3",
          audioEl: "audio/el/08_users_before.mp3"
        },
    */
    {
      text: ["Let's dive in and see how the world is in there shall we?"],
      textEl: ["Ας ρίξουμε μία ματιά να δούμε πως μπορούμε να το διαμορφώσουμε."],
      audio: "audio/en/09_dive_in.mp3",
      audioEl: "audio/el/09_dive_in.mp3"
    },

    {
      text: ["This is your planet right now. A blank canvas!"],
      textEl: ["Ιδού ο πλανήτης σου αυτή τη στιγμή."],
      audio: "audio/en/10_blank_canvas.mp3",
      audioEl: "audio/el/10_blank_canvas.mp3",
      onStart: "zoomToChosenPlanet"
    },

    {
      text: ["You are a scientist and an artist. Maybe even overqualified for the occasion."],
      textEl: ["Είσαι επιστήμονας, καλλιτέχνης, θεός... Eίσαι και λίγο overqualified για την περίσταση βασικά."],
      audio: "audio/en/11_scientist_artist.mp3",
      audioEl: "audio/el/11_scientist_artist.mp3"
    },

    {
      text: ["You can make the terrain, the climate, and a place for a new civilization."],
      textEl: ["Διαμόρφωσε έδαφος, το κλίμα και την ανθρωπότητα, το περιβάλλον."],
      audio: "audio/en/12_terrain_climate.mp3",
      audioEl: "audio/el/12_terrain_climate.mp3"
    },

    {
      text: ["Manipulate it with the notion of your hand!"],
      textEl: ["Όλα με μία κίνηση του χεριού σου."],
      audio: "audio/en/12_hand.mp3",
      audioEl: "audio/el/12_hand.mp3"
    },

    {
      text: ["Thus you are the admin here."],
      textEl: ["Είσαι βασικά admin εδώ."],
      audio: "audio/en/13_admin_here.mp3",
      audioEl: "audio/el/13_admin_here.mp3"
    },
    {
      text: ["You have limitl—well, not limitless—but still many options to make the planet as you wish!"],
      textEl: ["Έχεις ατελειτ- ντάξει όχι ατελείωτες- αλλά πολλές επιλογές."],
      audio: "audio/en/13_limitless.mp3",
      audioEl: "audio/el/13_limitless.mp3"
    },
    {
      text: ["Let's sculpt this planet and give it lands, oceans and some pretty clouds, shall we?"],
      gamePrompt: "Click on controls to the left. Adjust your terrain, atmosphere and water level",
      gamePromptEl: "Κλίκαρε τα χειριστήρια αριστερά. Προσάρμοσε έδαφος, ατμόσφαιρα και επίπεδο νερού",
      onEnd: "openMiniGame1",
      textEl: ["Πάμε να σμιλέψουμε τον πλανήτη. Βάλε στεριές, ωκεανούς και κανά ωραίο aesthetic σύννεφο."],
      audio: "audio/en/14_sculpt_planet.mp3",
      audioEl: "audio/el/14_sculpt_planet.mp3"
    },

    /*********************************************** */

  ];
  //---------------------//
  //  STORY AFTER MINIGAME 1 //
  //---------------------//

  story.push(

    {
      text: ["Let's move to more details."],
      textEl: ["Ωραία. Ώρα για περισσότερες λεπτομέρειες."],
      onEnd: "lockAfterMiniGame1",
      audio: "audio/en/15_more_details.mp3",
      audioEl: "audio/el/15_more_details.mp3"
    },

    {
      text: ["What's the temperature range? Are we getting hot or freezing?"],
      textEl: ["Πάμε τώρα για τη θερμοκρασία. Θα ψηθούμε ή θα ξυλιάσουμε;"],
      audio: "audio/en/16_temperature.mp3",
      audioEl: "audio/el/16_temperature.mp3"
    },

    {
      text: ["Or else mother-explorer will chase us down with a jacket."],
      textEl: ["Μη 'ρθει η μαμά-εξερευνητής να μας βάλει ζακέτα!"],
      audio: "audio/en/17_mother_jacket.mp3",
      audioEl: "audio/el/17_mother_jacket.mp3"
    },

    {
      text: ["Move your hand(slider) for temperature adjustments. Yes, you are the thermostat now."],
      textEl: ["Κούνα το χέρι σου για να ρυθμίσεις τη θερμοκρασία. Ναι, θα κάνεις το θερμοστάτη τώρα."],
      gamePrompt: "Move your hand up/down or move the bar with mouse to adjust temperature",
      gamePromptEl: "Κούνα το χέρι σου πάνω/κάτω, ή χρησιμοποίησε ποντίκι, για να αλλάξεις θερμοκρασία.",
      onEnd: "openMiniGame2",
      audio: "audio/en/18_thermostat.mp3",
      audioEl: "audio/el/18_thermostat.mp3"
    },

    //---------------------//
    //  STORY AFTER MINIGAME 2 //
    //---------------------//

    {
      text: ["Great, you almost completed the first step."],
      textEl: ["Τέλεια. Πρώτη φάση σχεδόν έτοιμη."],
      onEnd: "lockAfterMiniGame2",
      audio: "audio/en/19_first_step.mp3",
      audioEl: "audio/el/19_first_step.mp3"
    },

    {
      text: ["Le petit paradise! Cozy space corner unlocked "],
      textEl: ["Le petit paradise! Cozy space corner ξεκλειδώθηκε."],
      audio: "audio/en/20_petit_paradise.mp3",
      audioEl: "audio/el/20_petit_paradise.mp3"
    },

    {
      text: ["It is not ready yet though.."],
      textEl: ["Δεν είναι έτοιμο όμως.."],
      audio: "audio/en/21_not_ready.mp3",
      audioEl: "audio/el/21_not_ready.mp3"
    },

    {
      text: ["Something is still missing.."],
      textEl: ["Αλλά κάτι λείπει ακόμα.."],
      audio: "audio/en/22_still_missing.mp3",
      audioEl: "audio/el/22_still_missing.mp3"
    },

    {
      text: ["LIFE! Flora and fauna in their chaotic form should thrive here."],
      textEl: ["ΖΩΗ! Η χλωρίδα και η πανίδα στη χαοτική και θορυβώδη μορφή της."],
      audio: "audio/en/23_life.mp3",
      audioEl: "audio/el/23_life.mp3"
    },

    {
      text: ["Build your landscape, plants, trees, you know.. po ta toes."],
      textEl: ["Βάλε λίγα δέντρα, λουλούδια, you know.. po ta toes."],
      audio: "audio/en/24_potatoes.mp3",
      audioEl: "audio/el/24_potatoes.mp3"
    },

    {
      text: ["Time for cosmic gardening."],
      textEl: ["Ώρα για cosmic gardening."],
      gamePrompt: "Click on the landscape to draw flowers and trees. Adjust size and detail and randomize colors.",
      gamePromptEl: "Κάνε κλικ στο τοπίο για να τοποθετήσεις λουλούδια και δέντρα. Ρύθμισε μέγεθος και χρώματα.",
      onEnd: "openMiniGame3",
      audio: "audio/en/24_cosmic_gardening.mp3",
      audioEl: "audio/el/24_cosmic_gardening.mp3"
    },


    //---------------------//
    //  DURING MINIGAME 3 (flora) //
    //---------------------//

    {
      text: ["Lets start with plants, then! Oxygen factories go brrrr"],
      textEl: ["Ξεκινάμε με φυτά. Oxygen factories go brrrr"],
      onEnd: "waitForMiniGame3",
      audio: "audio/en/25_plants_brrrr.mp3",
      audioEl: "audio/el/25_plants_brrrr.mp3"
    },

    {
      text: ["Beautifull. like a true urban architect."],
      textEl: ["Πανέμορφα. Μα τι αρχιτέκτων."],
      audio: "audio/en/26_beautiful.mp3",
      audioEl: "audio/el/26_beautiful.mp3"
    },

    {
      text: ["But it's still too silent."],
      textEl: ["Αλλά είναι ακόμα πολύ ήσυχα."],
      onEnd: "lockAfterMiniGame3",
      audio: "audio/en/27_too_silent.mp3",
      audioEl: "audio/el/27_too_silent.mp3"
    },

    {
      text: ["Let's make some noisy animals..."],
      textEl: ["Πάμε να βάλουμε λίγα ζωντανά. Λίγη τσαχπινιά!"],
      audio: "audio/en/28_noisy_animals.mp3",
      audioEl: "audio/el/28_noisy_animals.mp3"
    },

    {
      text: ["Birds, fish, insects, mammals, you name it!"],
      textEl: ["Πουλιά, έντομα, ψάρια, θηλαστικά, λογιών λογιών!"],
      audio: "audio/en/29_birds_fish.mp3",
      audioEl: "audio/el/29_birds_fish.mp3"
    },

    {
      text: ["Maybe a labubu will live behind this little tree."],
      textEl: ["Πίσω από αυτό το δεντράκι ίσως ζει ένα μικρό labubu."],
      audio: "audio/en/29_labubu.mp3",
      audioEl: "audio/el/29_labubu.mp3"
    },

    {
      text: ["Place animals, on your planet!"],
      textEl: ["Τοποθέτησε ζώα στον πλανήτη!"],
      gamePrompt: "Click on the land, water and sky to plant.. animals",
      gamePromptEl: "Κάνε κλικ σε γη, ουρανό και νερό για να.. φυτρώσουν ζωακια.",
      onEnd: "openMiniGame4",
      audio: "audio/en/30_place_animals.mp3",
      audioEl: "audio/el/30_place_animals.mp3"
    },

    //---------------------//
    //  DURING MINIGAME 4 (animals) //
    //---------------------//

    {
      text: ["How do they sound? give them a voice, time for ASMR."],
      textEl: ["Πώς ακούγονται; Δώσε τους φωνή, ώρα για ASMR."],
      audio: "audio/en/31_asmr.mp3",
      audioEl: "audio/el/31_asmr.mp3",
      delayMs: 4500
    },

    {
      text: ["What a national geographic documentary is this?!"],
      textEl: ["Τι ντοκιμαντέρ national geographic είναι αυτό!"],
      onEnd: "waitForMiniGame4",
      audio: "audio/en/32_natgeo.mp3",
      audioEl: "audio/el/32_natgeo.mp3",
      waitForClicks: 3
    },

    {
      text: ["It is lonely for the explorer.."],
      textEl: ["Χμμ… ακόμα όμως έχει λίγο μοναξιά για τον εξερευνητή."],
      audio: "audio/en/33_lonely.mp3",
      audioEl: "audio/el/33_lonely.mp3"
    },

    {
      text: ["Where's the civilization? Let's spice things up"],
      textEl: ["Πού είναι ο πολιτισμός; Ξέρεις τι σημαίνει αυτό; ώρα για αλατάκι!"],
      onEnd: "lockAfterMiniGame4",
      audio: "audio/en/34_civilization.mp3",
      audioEl: "audio/el/34_civilization.mp3"
    },

    {
      text: ["Humans shall enjoy your paradise."],
      textEl: ["Ήθε οι άνθρωποι να απολαύσουν τούτο τον Παράδεισο.."],
      audio: "audio/en/35_add_humans.mp3",
      audioEl: "audio/el/35_add_humans.mp3"
    },

    {
      text: ["Add a few NPCs-uh humans, Ι mean!"],
      textEl: ["Πρόσθεσε NPCs- εε εννοώ ανθρώπoυς!"],
      gamePrompEl: "Click on the land to add population, cities and factories.",
      gamePromptEl: "Κάνε κλικ στο έδαφος για να προσθέσεις κοινότητες, πόλεις και εργοστάσια.",
      onEnd: "openMiniGame5",
      audio: "audio/en/35_npc.mp3",
      audioEl: "audio/el/35_npc.mp3"
    },


    //---------------------//
    //  DURING MINIGAME 5 (civil) //
    //---------------------//

    {
      text: ["Bravo! civilization speedrun just started"],
      textEl: ["Μπράβο! Πολιτιστικό speedrun ξεκίνησε."],
      audio: "audio/en/36_speedrun.mp3",
      audioEl: "audio/el/36_speedrun.mp3",
      waitForClicks: 3
    },

    {
      text: ["But wait.. what are these clouds?"],
      textEl: ["..κάτσε. Τι είναι αυτά τα νέφη;;"],
      audio: "audio/en/37_clouds.mp3",
      audioEl: "audio/el/37_clouds.mp3",
      delayMs: 2000
    },

    {
      text: ["phew phew! push them away!"],
      textEl: ["φου φου - διώξ' τα γρήγορα!"],
     // gamePrompt: "Click on the smudges to clean them from the solar system",
     // gamePromptEl: "Κάνε κλικ στους ρύπους για να καθαρίσεις το ηλιακό σύστημα",
      audio: "audio/en/38_phew_phew.mp3",
      audioEl: "audio/el/38_phew_phew.mp3"
    },

    {
      text: ["Oh, is it the humans doing it?"],
      textEl: ["Ωχ… Οι άνθρωποι το κάνουν αυτό;"],
      audio: "audio/en/39_humans_doing.mp3",
      audioEl: "audio/el/39_humans_doing.mp3"
    },

    {
      text: ["Your paradise will become a dumpster if you don't clean it."],
      textEl: ["Ο παράδεισός σου πάει για τα μπάζα. Τώρα καθάριζε."],
      gamePrompt: "Wipe. Move your hand left and right to clean the pollution",
      gamePromptEl: "Σκούπισε. Κούνα το χέρι δεξία-αριστερά για να καθαρίσεις τους ρύπους",
      audio: "audio/en/40_dumpster.mp3",
      audioEl: "audio/el/40_dumpster.mp3",
      onStart: "startWipeCamera"
    },

    {
      text: ["Wait a minute —the plants and the animals go away too!"],
      textEl: ["Μισό λεπτο -και τα φυτά και τα ζώα εξαφανίζονται!"],
      audio: "audio/en/41_plants_disappear.mp3",
      audioEl: "audio/el/41_plants_disappear.mp3"
    },

    {
      text: ["You should stop generating that much civilization. Stop it"],
      textEl: ["Ναι… ίσως μην κάνεις generate ανθρώπους άλλο. ΣΤΑΜΑΤΑAΑ"],
      onEnd: "waitForMiniGame5",
      audio: "audio/en/42_stop_generating.mp3",
      audioEl: "audio/el/42_stop_generating.mp3"
    },

    //---------------------//
    //  AFTER MINIGAME 5 //
    //---------------------//

    {
      text: ["Humans are too many. they must eat and build and build"],
      textEl: ["Οι άνθρωποι πλήθυναν. Τρώνε, χτίζουν..η ρύπανση ανέβηκε."],
      audio: "audio/en/43_too_many.mp3",
      audioEl: "audio/el/43_too_many.mp3"
    },

    {
      text: ["Their actions keep polluting"],
      textEl: ["Οι πράξεις τους βρομίζουν."],
      audio: "audio/en/44_polluting.mp3",
      audioEl: "audio/el/44_polluting.mp3"
    },

    {
      text: ["You should generate more nature."],
      textEl: ["Χρειάζεται περισσότερη φύση."],
      onEnd: "lockAfterMiniGame5",
      audio: "audio/en/45_more_nature.mp3",
      audioEl: "audio/el/45_more_nature.mp3"
    },

    //---------------------//
    //  MINIGAME 6 (balance) //
    //---------------------//

    {
      text: ["Fix the balance between humans and nature."],
      textEl: ["Βρες την ισορροπία μεταξύ των ανθρώπων και της φύσης."],
      gamePrompt: "generate MOooORE plants, mOOoooOre green, moOore ANiMAls",
      gamePromptEl: "βάλε ΠΕΡΙΣΣΟΤΕΡΗ φύση, πιο πολύ πρασινάδα, περισσότερα ΖΩΑ",
      onEnd: "openMiniGame6",
      audio: "audio/en/46_fix_balance.mp3",
      audioEl: "audio/el/46_fix_balance.mp3"
    },

    {
      text: ["You got it."],
      textEl: ["Το 'χεις."],
      audio: "audio/en/46_got.mp3",
      audioEl: "audio/el/46_got.mp3"
    },

    {
      text: ["Keep adding"],
      textEl: ["Συνέχισε, λίγο ακόμα.."],
      onEnd: "waitForSmudgesCleared",
      audio: "audio/en/47_keep_adding.mp3",
      audioEl: "audio/el/47_keep_adding.mp3",
      waitForClicks: 2
    },

    {
      text: ["That's it. Pollution left the chat"],
      textEl: ["ΝΑΙ. Η ρύπανση left the chat."],
      audio: "audio/en/48_pollution_gone.mp3",
      audioEl: "audio/el/48_pollution_gone.mp3"
    },

    {
      text: ["You made it! Planet is thriving again"],
      textEl: ["Το κατάφερες. Ο πλανήτης ευημερεί!"],
      onEnd: "lockAfterMiniGame6",
      audio: "audio/en/49_you_made_it.mp3",
      audioEl: "audio/el/49_you_made_it.mp3"
    },

    //---------------------//
    //  ENDING //
    //---------------------//

    {
      text: ["This planet is balanced and thriving!"],
      textEl: ["Αυτός ο κόσμος είναι πλέον ισορροπημένος και γεμάτος ζωή."],
      audio: "audio/en/50_balanced.mp3",
      audioEl: "audio/el/50_balanced.mp3"
    },

    {
      text: ["You see humans should give more space to nature"],
      textEl: ["Βλέπεις; Οι άνθρωποι απλώς χρειάζονται περισσότερο χώρο για τη φύση."],
      audio: "audio/en/51_more_space.mp3",
      audioEl: "audio/el/51_more_space.mp3"
    },

    {
      text: ["But you did a great job explorer!"],
      textEl: ["Έκανες εξαιρετική δουλειά, εξερευνητή."],
      audio: "audio/en/52_great_job.mp3",
      audioEl: "audio/el/52_great_job.mp3"
    },

    {
      text: ["You may rest now and enjoy the view. Maybe Dubai chocolate too"],
      textEl: ["Μπορείς τώρα να ξεκουραστείς και να απολαύσεις τη θέα. Ίσως και μια Dubai σοκολάτα."],
      onEnd: "openview",
      audio: "audio/en/53_view.mp3",
      audioEl: "audio/el/53_view.mp3"
    },

    {
      text: ["Your treat."],
      textEl: ["Εσύ κερνάς."],
      audio: "audio/en/54_your_treat.mp3",
      audioEl: "audio/el/54_your_treat.mp3"
    },

    {
      text: ["You are a caring god that made a clean and safe space for all the creatures"],
      textEl: ["Είσαι ένας προσεκτικός θεός που δημιούργησε έναν καθαρό και ασφαλή κόσμο."],
      audio: "audio/en/55_caring_god.mp3",
      audioEl: "audio/el/55_caring_god.mp3"
    },

    {
      text: ["Thank you for your input explorer"],
      textEl: ["Ευχαριστούμε για τη συμβολή σου, εξερευνητή."],
      prompt: "The end",
      promptEl: "Τέλος",
      audio: "audio/en/56_thank_you.mp3",
      audioEl: "audio/el/56_thank_you.mp3",
      onEnd: "showReplayButton"
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
    const yesText = currentLang === "el" ? "Ναι" : "Yes";
    const noText = currentLang === "el" ? "Όχι" : "No";


    win.innerHTML = `
    <div class="choose-content">
      <p>${message}</p>
      <div style="display:flex; gap:10px; justify-content:center;">
        <button class="confirm-yes">${yesText}</button>
        <button class="confirm-no">${noText}</button>
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
      const gamePrompt = (() => {
        const key = currentLang === "el" && entry?.gamePromptEl ? "gamePromptEl" : "gamePrompt";
        const val = entry?.[key];
        return val ? (typeof val === "function" ? val() : val) : "";
      })();
      /*const gamePrompt = entry?.gamePrompt
  ? (currentLang === "el" && entry.gamePromptEl
      ? entry.gamePromptEl
      : (typeof entry.gamePrompt === "function" ? entry.gamePrompt() : entry.gamePrompt))
  : "";
      /*
        ? (typeof entry.gamePrompt === "function" ? entry.gamePrompt() : entry.gamePrompt)
        : "";*/
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
        existingPopup.querySelector(".close-minigame").style.display = "none";
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
      const gpKey = currentLang === "el" && entry?.gamePromptEl ? "gamePromptEl" : "gamePrompt";
      const gpVal = entry?.[gpKey];
      gamePrompt = gpVal ? (typeof gpVal === "function" ? gpVal() : gpVal) : "";
      /*
          gamePrompt = entry?.gamePrompt
            ? (typeof entry.gamePrompt === "function" ? entry.gamePrompt() : entry.gamePrompt)
            : "";*/
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
    /* popup.innerHTML = `
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
   `;*/
    //diglwso
    popup.innerHTML = `
  <div class="minigame-content">
    <iframe 
      src="${mg.url}?planet=${encodeURIComponent(planetName)}&planetIndex=${planetIndex}&mg1Height=${mg1Height}&mg1Water=${mg1Water}" 
      class="mg-iframe" allow="camera">
    </iframe>
    <div class="minigame-buttons">
    
      <button class="submit-minigame">${currentLang === "el" ? "Υποβολή" : "Submit"}</button>
<button class="close-minigame" ${id === 6 ? 'style="display:none"' : ''}>${currentLang === "el" ? "Κλείσιμο" : "Close"}</button>
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
      iframe.contentWindow.postMessage({ type: "set_lang", lang: currentLang }, "*");
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
        const resubmitMsg = currentLang === "el"
          ? "Έχεις ήδη υποβάλει. Θέλεις να υποβάλεις ξανά;"
          : "You already submitted this minigame. Submit a new one?";
        createConfirmWindow(
          resubmitMsg,
          //"You already submitted this minigame. Submit a new one?",
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
      const confirmMsgEl = {
        1: "Υποβολή της διαμόρφωσης του εδάφους;",
        2: "Υποβολή της θερμοκρασίας;",
        3: "Υποβολή της βλάστησης;",
        4: "Υποβολή της πανίδας;",
        5: "Υποβολή του πολιτισμού;",
        6: "Υποβολή της τελικής ισορροπίας της φύσεως;"
      };
      createConfirmWindow(
        // minigameConfirmText[activeId] || "Submit your results?",
        currentLang === "el"
          ? (confirmMsgEl[activeId] || "Υποβολή αποτελέσματος;")
          : (minigameConfirmText[activeId] || "Submit your results?"),
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
    //===========neo zoom==========
    zoomToChosenPlanet: () => {
      if (typeof window.zoomToChosenPlanet === "function") {
        window.zoomToChosenPlanet(4);
      }
    },
    choosePlanet: () => {

      enablePlanetSelectionGlow();
      //showChooseWindow(); // <== this shows the popup
      if (choice === true) return;

      const chooseWindow = document.createElement("div");
      chooseWindow.className = "choose-window";
      chooseWindow.innerHTML = `
          <div class="choose-content">
            <p>${currentLang === "el" ? "Κάνε κλικ στον πλανήτη που θέλεις να επιλέξεις" : "Click on the planet you want to choose"}</p>
          </div>
        `;
      document.body.appendChild(chooseWindow);
    },
    startWipeCamera: () => {
      const popup = document.querySelector(".minigame-popup iframe");
      const iframe = popup?.querySelector("iframe");
      console.log("[Story] startWipeCamera firing, iframe found:", !!iframe);
      if (popup) {
        popup.contentWindow.postMessage({ type: "start_wipe_camera" }, "*");
      }
    },

    openMiniGame1: () => openMinigame(1),//planetsterain
    openMiniGame2: () => openMinigame(2),//temp

    openMiniGame3: () => {
      openMinigame(3); setTimeout(() => { storyPaused = false; index++; showStory(index); }, 0);
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
      newClose.textContent = currentLang === "el" ? "Κλείσιμο" : "Close";
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
    },
    showReplayButton: () => {
      setTimeout(() => {//=======================replay

        // === CREDITS ===
        const credits = document.createElement("div");
        credits.id = "credits-panel";
        credits.className = "user-id-display"; // reuse same style
        credits.innerHTML = `Scenario/Visualsation/Game Development:<br>Mimi Anastasiadou<br>Soundtrack-Music Production:<br>Arthur Dolzenko<br>Voice Over in Greek and English:<br>Konstantinos Sapountzis`;
        document.body.appendChild(credits);

        const replayBtn = document.createElement("button");
        replayBtn.id = "replay-btn";
        replayBtn.className = "start-btn";  // same style as START
        replayBtn.textContent = currentLang === "el" ? "Παίξε ξανά" : "Play Again?";
        replayBtn.dataset.el = "Παίξε ξανά";
        replayBtn.dataset.en = "Play Again?";
        document.body.appendChild(replayBtn);

        replayBtn.addEventListener("click", () => {
          // We'll wire up the full reset logic later
          console.log("Replay clicked");
          const chosenEl = document.querySelector(".planet.chosen-permanent");
          if (chosenEl) {
            chosenEl.classList.remove("chosen-permanent");
            chosenEl.classList.remove("temp-blue");
            chosenEl.classList.add("used-planet");
            window.availablePlanets--;
          }

          replayBtn.classList.add("hidden");// Hide replay button
          setTimeout(() => replayBtn.remove(), 600);
          const oldCredits = document.getElementById("credits-panel");
          if (oldCredits) oldCredits.remove();// credits disappear on restart

          // Reset story state
          choice = false;
          storyPaused = false;
          onEndFired = false;
          window.lockPoint = undefined;
          window.selectedPlanet = null;
          window.mg1Height = undefined;
          window.mg1Water = undefined;
          storedMG3World = null;
          pendingMG3Value = null;
          waitingForMG2Value = false;
          waitingForMG1Height = false;
          waitingForMG3Value = false;
          smudgesPending = false;
          currentMinigame = null;
          currentMinigamePrompt = "";

          // Reset all minigame submitted flags
          Object.keys(minigameState).forEach(k => minigameState[k].submitted = false);

          // Remove minigame popup if it exists
          const popup = document.getElementById("minigame-popup");
          if (popup) popup.remove();

          // Unlock planet name display
          const nameDisplay = document.getElementById("planet-name-display");
          if (nameDisplay) {
            nameDisplay.textContent = "";
            nameDisplay.classList.remove("visible");
            nameDisplay.dataset.locked = "false";
          }

          index = 0;// Reset story to beginning and start narration
          btnNext.style.display = "block";
          btnPrev.style.display = "block";
          showStory(0);

        });
      }, 3500);

      setTimeout(() => {//=========================the end
        promptText.textContent = "";
        promptText.classList.remove("visible");
      }, 5000);
    }
  };

  // === Core function ===
  function showStory(i) {
    const entry = story[i];
    if (!entry) return;
    // --- delayMs: hold text+audio until delay passes ---
    /*  if (entry.delayMs && !entry._gateOpen) {
        scheduleSubHide(); // hide the PREVIOUS subtitle
        setTimeout(() => {
          entry._gateOpen = true;
          showStory(i);
        }, entry.delayMs);
        return;
      }
      if (entry._gateOpen) delete entry._gateOpen;
  
      // --- waitForClicks: hold text+audio until N clicks in minigame ---
      if (entry.waitForClicks && !entry._gateOpen) {
        scheduleSubHide(); // hide the PREVIOUS subtitle
        let clicksSoFar = 0;
        const needed = entry.waitForClicks;
        const handler = (event) => {
          if (event.data?.type === "minigame_click") {
            clicksSoFar++;
            if (clicksSoFar >= needed) {
              window.removeEventListener("message", handler);
              entry._gateOpen = true;
              showStory(i);
            }
          }
        };
        window.addEventListener("message", handler);
        return;
      }
      if (entry._gateOpen) delete entry._gateOpen;*/


    // --- delayMs: hold text+audio until delay passes ---
    if (entry.delayMs && !entry._delayDone) {
      scheduleSubHide();
      setTimeout(() => {
        entry._delayDone = true;
        showStory(i);
      }, entry.delayMs);
      return;
    }
    if (entry._delayDone) delete entry._delayDone;

    // --- waitForClicks: hold text+audio until N clicks in minigame ---
    if (entry.waitForClicks && !entry._clicksDone) {
      scheduleSubHide();
      let clicksSoFar = 0;
      const needed = entry.waitForClicks;
      const handler = (event) => {
        if (event.data?.type === "minigame_click") {
          clicksSoFar++;
          if (clicksSoFar >= needed) {
            window.removeEventListener("message", handler);
            entry._clicksDone = true;
            showStory(i);
          }
        }
      };
      window.addEventListener("message", handler);
      return;
    }
    if (entry._clicksDone) delete entry._clicksDone;

    // pick text based on language
    const textLines = (currentLang === "el" && entry.textEl) ? entry.textEl : entry.text;


    // update text and fade it in
    if (Array.isArray(textLines)) {
      textEl.innerHTML = textLines.map(line => `<p>${line}</p>`).join("");
    } else {
      textEl.innerHTML = `<p>${textLines}</p>`;
    }

    textEl.classList.remove("show");
    setTimeout(() => textEl.classList.add("show"), 50);

    if (entry.onStart && typeof storyActions[entry.onStart] === "function") {
      storyActions[entry.onStart]();
    }
    // Send updated gamePrompt to the already-open iframe
    if (entry.gamePrompt || entry.gamePromptEl) {
      const key = currentLang === "el" && entry.gamePromptEl ? "gamePromptEl" : "gamePrompt";
      const val = entry[key];
      const prompt = typeof val === "function" ? val() : val;
      const iframe = document.querySelector(".minigame-popup iframe");
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: "set_prompt", text: prompt }, "*");
      }
    }

    // update top prompt non-minigames odigies
    if (entry.prompt) {
      const key = currentLang === "el" && entry.promptEl ? "promptEl" : "prompt";
      //const value = typeof entry.prompt === "function" ? entry.prompt() : entry.prompt;
      const value = typeof entry[key] === "function" ? entry[key]() : entry[key];
      promptText.textContent = value;
      promptText.classList.add("visible");
    } else {
      promptText.textContent = "";
      promptText.classList.remove("visible");
    }

    // play narration
    /* if (audio) audio.pause();
     if (entry.audio && soundEnabled) {
       audio = new Audio(entry.audio);
       audio.play();
       if (entry.onEnd && typeof storyActions[entry.onEnd] === "function") {
         audio.onended = storyActions[entry.onEnd];
       }
     } else if (entry.onEnd && !langSwitching) {
       storyActions[entry.onEnd]();
     }*/

    // διγλωσσο play narration
    if (audio) { audio.pause(); audio = null; }
    onEndFired = false;
    if (subHideTimer) { clearTimeout(subHideTimer); subHideTimer = null; }//cancels any pending hide when a new line appears
    const audioKey = (currentLang === "el" && entry.audioEl) ? "audioEl" : "audio";
    const audioSrc = entry[audioKey];

    if (audioSrc) {
      audio = new Audio(audioSrc);
      audio.muted = !soundEnabled;
      //audio.play();
      if (!narrativePaused) audio.play();

      audio.onended = () => {
        // If this step has a story action (like opening a minigame), fire that
        if (entry.onEnd && typeof storyActions[entry.onEnd] === "function") {
          onEndFired = true;
          storyActions[entry.onEnd]();
        }/*
        // Otherwise, auto-advance like pressing "next"
         if (!storyPaused && index < story.length - 1) {
          if (!choice && index >= neoindex) return; // planet gate
          index++;
          showStory(index);*/

        // If story paused (minigame, planet choice, waiting), hide subs after 1.5s
        if (storyPaused) { scheduleSubHide(); return; }
        // Otherwise, auto-advance like pressing "next"
        if (!storyPaused && index < story.length - 1) {
          if (!choice && index >= neoindex) { scheduleSubHide(); return; } // planet gate
          index++;
          showStory(index);
        } else {
          scheduleSubHide(); // end of story or can't advance
        }
      };
    } else if (entry.onEnd && !langSwitching) {
      // No audio file — fire action immediately (current behavior)
      onEndFired = true;
      storyActions[entry.onEnd]();
      if (storyPaused) scheduleSubHide();
    }


    // buttons
    btnPrev.disabled = i === 0;
    btnNext.disabled = i === story.length - 1;
    if (i === story.length - 1) {
      btnNext.style.display = "none";
      btnPrev.style.display = "none";
    }
  }

  // === Start button ===
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      startBtn.classList.add("hidden");
      bgMusic.play().catch(e => console.warn("Music blocked:", e));
      musicEnabled = true;
      setTimeout(() => {
        btnNext.style.display = "block"; // show arrows when story starts
        btnPrev.style.display = "block"; // show arrows when story starts
        showStory(0); // start narration after 3 seconds
      }, 1000);//GIATI ARGEISSSSSSS

      // Show pause hint for 5 seconds
      const pauseHint = document.getElementById("pause-hint");
      if (pauseHint) {
        pauseHint.textContent = currentLang === "el" ? "Πάτα Space για παύση" : "Press Space to pause";
        pauseHint.classList.add("show");
        setTimeout(() => pauseHint.classList.remove("show"), 5000);
      }
    });
  } else {
    showStory(0);
  }

  // === SPACE BAR PAUSE ===
  document.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      const pauseHint = document.getElementById("pause-hint");

      if (!narrativePaused) {
        // PAUSE
        narrativePaused = true;
        if (audio) audio.pause();
        if (pauseHint) {
          pauseHint.textContent = currentLang === "el" ? "Παύση" : "Paused";
          pauseHint.classList.add("show");
        }
      } else {
        // UNPAUSE
        narrativePaused = false;
        if (audio) audio.play();
        if (pauseHint) {
          pauseHint.classList.remove("show");
        }
      }
    }
  });

  // === Navigation ===
  btnNext.addEventListener("click", () => {
    if (audio) { audio.pause(); audio = null; }//να σταματα 
    if (storyPaused) {
      console.log("Reopening minigame… submit to continue.");
      // just show the popup again, don't reinitialise anything
      const existing = document.getElementById("minigame-popup");//not sure
      if (existing) existing.style.display = "flex";

      //openMinigame(currentMinigame, { reopen: true });
      return;
    }



    // If audio was still playing, its onended never fired.
    // Fire the current entry's onEnd now so minigames/planet selection still open.
    const currentEntry = story[index];
    if (!onEndFired && currentEntry?.onEnd && typeof storyActions[currentEntry.onEnd] === "function") {
      onEndFired = true;
      storyActions[currentEntry.onEnd]();
      if (storyPaused) return; // action opened a minigame — stop here
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
    if (audio) { audio.pause(); audio = null; }
    if (choice && index <= neoindex + 1) {
      console.log("Cannot go back after confirming a planet.");
      showStory(index); // replay current entry so audio restarts
      return;
    }
    if (window.lockPoint !== undefined && index <= window.lockPoint) {
      console.log("You cannot go back from this point.");
      showStory(index); // replay current entry so audio restarts
      return;
    }

    if (index > 0) {
      const win = document.querySelector(".choose-window");
      if (win) win.remove();

      index--;
      showStory(index);
    }
  });



  // ===========lang toggle======

  const langToggle = document.getElementById("lang-toggle");
  const langIcon = document.getElementById("lang-icon");

  // tooltip showing current language
  const langTooltip = document.createElement("div");
  langTooltip.className = "lang-tooltip";
  document.body.appendChild(langTooltip);

  const musicTooltip = document.createElement("div");
  musicTooltip.className = "music-tooltip";
  document.body.appendChild(musicTooltip);

  const soundTooltip = document.createElement("div");
  soundTooltip.className = "sound-tooltip";
  document.body.appendChild(soundTooltip);

  if (window.refreshUserDisplay) window.refreshUserDisplay();

  //--------allagi glwssas sta planet info
  function updatePlanetPanels() {
    document.querySelectorAll(".planet-info h2, .planet-info p").forEach(el => {
      if (currentLang === "el" && el.dataset.el) {
        el.dataset.en = el.dataset.en || el.textContent; // save English
        el.textContent = el.dataset.el;
      } else if (currentLang === "en" && el.dataset.en) {
        el.textContent = el.dataset.en;
      }
    });
  }

  function updateStaticUI() {
    const startBtn = document.getElementById("start-btn");
    if (startBtn) {
      startBtn.textContent = currentLang === "el" ? "Έναρξη" : "Press Start";
    }
  }

  // run once on load with default language
  updatePlanetPanels();
  updateStaticUI();


  if (langToggle) {
    langToggle.addEventListener("mouseenter", () => {
      langTooltip.textContent = currentLang === "el" ? "English / en" : "Ελληνικά / el";
      langTooltip.classList.add("visible");
    });
    langToggle.addEventListener("mouseleave", () => {
      langTooltip.classList.remove("visible");
    });
    langToggle.addEventListener("click", () => {
      currentLang = currentLang === "en" ? "el" : "en";
      langTooltip.textContent = currentLang === "en" ? "English / en" : "Ελληνικά / el";
      updatePlanetPanels();
      updateStaticUI();
      if (window.refreshUserDisplay) window.refreshUserDisplay();

      // send lang to open iframe
      const popup = document.getElementById("minigame-popup");
      const iframe = popup?.querySelector("iframe");
      if (iframe) {
        iframe.contentWindow.postMessage({ type: "set_lang", lang: currentLang }, "*");
      }


      if (btnNext.style.display !== "none") {
        langSwitching = true;
        // re-render current story beat in new language
        showStory(index);
        langSwitching = false;
      }
    });
  }

  // ===========music toggle======
  const musicToggle = document.getElementById("music-toggle");
  const musicIcon = document.getElementById("music-icon");
  const bgMusic = new Audio("audio/music.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.3;
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
  if (musicToggle) {
    musicToggle.addEventListener("mouseenter", () => {
      musicTooltip.textContent = currentLang === "el" ? "Μουσική" : "Music";
      musicTooltip.classList.add("visible");
    });
    musicToggle.addEventListener("mouseleave", () => {
      musicTooltip.classList.remove("visible");
    });
  }
  // === SOUND TOGGLE ===
  const soundToggle = document.getElementById("sound-toggle");
  const soundIcon = document.getElementById("sound-icon");

  if (soundToggle && soundIcon) {
    soundToggle.addEventListener("click", () => {
      soundEnabled = !soundEnabled;
      soundIcon.src = soundEnabled ? "images/volume.svg" : "images/mute.svg";
      soundIcon.alt = soundEnabled ? "Sound On" : "Sound Off";
      if (audio) audio.muted = !soundEnabled; // ← mute instead of pause
      //if (!soundEnabled && audio) audio.pause();
    });
  }
  if (soundToggle) {
    soundToggle.addEventListener("mouseenter", () => {
      soundTooltip.textContent = currentLang === "el" ? "Ήχος" : "Sound";
      soundTooltip.classList.add("visible");
    });
    soundToggle.addEventListener("mouseleave", () => {
      soundTooltip.classList.remove("visible");
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
    if (planetEl.classList.contains("used-planet") && index === neoindex) {
      const msg = currentLang === "el"
        ? "Αυτός ο πλανήτης είναι κατειλημμένος. Διάλεξε άλλον."
        : "This planet is taken. Choose a different one.";

      const warn = document.createElement("div");
      warn.className = "choose-window";
      warn.innerHTML = `<div class="choose-content"><p>${msg}</p></div>`;
      document.body.appendChild(warn);
      setTimeout(() => warn.remove(), 2500);
      return;
    }

    // Prevent multiple windows
    document.querySelector(".choose-window") ? document.querySelector(".choose-window").remove() : '';
    if (choice === true || index !== neoindex) return;

    const chooseText = currentLang === "el" ? "Διαλέγεις αυτόν τον πλανήτη;" : "Choose this planet?";
    const yesText = currentLang === "el" ? "Ναι" : "Yes";
    const noText = currentLang === "el" ? "Όχι" : "No";
    const diffText = currentLang === "el" ? "Διάλεξε διαφορετικό πλανήτη." : "Choose a different planet.";

    const chooseWindow = document.createElement("div");
    chooseWindow.className = "choose-window";
    chooseWindow.innerHTML = `
  <div class="choose-content">
    <p>${chooseText}</p>
    <div style="display:flex; gap:10px; justify-content:center;">
      <button id="confirm-yes">${yesText}</button>
      <button id="confirm-no">${noText}</button>
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
           <p>${currentLang === "el" ? "Διάλεξε διαφορετικό πλανήτη." : "Choose a different planet."}</p>
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
        const iframe = popup.querySelector("iframe");
        if (iframe) iframe.src = "about:blank";//kleinei kleinei
        if (popup) popup.remove();//MG1 closes after sending height

        minigameState[1].submitted = true;// Parent has the value before MG2 opens
        storyPaused = false;
        index++;           // na sunexisei
        showStory(index);
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
      const iframe = popup.querySelector("iframe");
      if (iframe) iframe.src = "about:blank";// kleinei kleinei
      if (popup) popup.remove();

      storyPaused = false;
      minigameState[2].submitted = true;
      index++;           // na sunexisei
      showStory(index);

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
      index++;           // na sunexisei
      showStory(index);
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
      if (popup) {
       const closeBtn = popup?.querySelector(".close-minigame");
  if (closeBtn) {
    closeBtn.style.display = "";
      closeBtn.style.removeProperty("display");  // belt and suspenders
    }
  }
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
    //minigameState[1].submitted = true;

    // Fake MG2 result
    pendingMG3Value = 2;
    // minigameState[2].submitted = true;

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
    //minigameState[3].submitted = true;
    if (mgNumber > 1) minigameState[1].submitted = true;
    if (mgNumber > 2) minigameState[2].submitted = true;
    if (mgNumber > 3) minigameState[3].submitted = true;


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
  window.devSkipToEnd = function () {
    console.log("DEV SKIP to end");

    choice = true;
    const fakePlanet = document.querySelector('.planet[data-planet="4"]');
    if (fakePlanet) {
      fakePlanet.style.setProperty("--planet-hue", 20);
      fakePlanet.classList.add("chosen-permanent");
    }
    const startBtn = document.getElementById("start-btn");
    if (startBtn) startBtn.classList.add("hidden");
    const nameDisplay = document.getElementById("planet-name-display");
    if (nameDisplay) {
      nameDisplay.textContent = "Santamasa";
      nameDisplay.classList.add("visible");
      nameDisplay.dataset.locked = "true";
    }
    window.selectedPlanet = {
      id: 4, index: 7, name: "Test Planet",
      y: 10, z: 200, date: new Date().toLocaleDateString("en-GB")
    };
    window.mg1Height = 50;
    window.mg1Water = 40;

    Object.keys(minigameState).forEach(k => minigameState[k].submitted = true);

    storedMG3World = {
      landscape: { step: 2, planetIndex: 7, mg1Height: 50, mg1Water: 40, seed: 2 },
      plants: [], animals: [], civil: []
    };

    storyPaused = false;
    index = story.length - 1;
    showStory(index);
  };
});
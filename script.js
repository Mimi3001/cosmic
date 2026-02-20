/*
* Removed aria-hidden from html and commented out aria-hidden true or false in the script
* In css changed all position: fixed to absolute so it works on mobile too
* In story-engine commented out missing .mp3 files
* Added choice boolean to story-engine to prevent re-choosing of planet and multiplication glitch
* If the player has made their choice they can no longer access the planet choice menu
*/

// ===== PLANET CLICK INFO LOGIC =====
console.log("Planet script loaded!");

document.addEventListener('DOMContentLoaded', () => {
  const planets = document.querySelectorAll('.planet');
  const panels = document.querySelectorAll('.planet-info');
  const planetHues = {
    1: 95,   // Hamarik
    2: 35,   // Tahay
    3: 10,   // Chura
    4: 20,   // Santamasa
    5: 335,  // Ahra
    6: 45,   // Lete
    7: 215   // Veles
  };

  
  function clearPlanetStates() {
  planets.forEach(p => {
    p.classList.remove('temp-blue');
  });
}
function closeAllPanels() {
    panels.forEach(p => {
      p.classList.remove('active');
      // p.setAttribute('aria-hidden', 'true');
      clearPlanetStates();
    });
  }
  // open panel for given id (string or number)
  function openPanel(id) {
    closeAllPanels();
    const activePanel = document.getElementById(`info-${id}`);
    if (activePanel) {
      activePanel.classList.add('active');
      // activePanel.setAttribute('aria-hidden', 'false');
      // ensure clicking inside panel doesn't close it
      activePanel.addEventListener('click', (ev) => ev.stopPropagation());
    } else {
      console.warn(`No panel found for id: ${id}`);
    }
  }

  // click / touch on planets
  planets.forEach(planet => {

    // This does nothing (?)
    // support keyboard activation
    // planet.tabIndex = 0;


    function handleActivate(event) {
      event.stopPropagation(); // avoid document click handler
      const id = planet.getAttribute('data-planet');
      if (!id) {
        console.warn('Planet element missing data-planet attribute', planet);
        return;
      }
      openPanel(id);
    }

    planet.addEventListener('click', handleActivate);
    planet.addEventListener('touchstart', handleActivate, { passive: true });
    planet.addEventListener("click", () => {

      planets.forEach(el => {
        el.classList.remove("temp-blue");
      });

      const id = planet.dataset.planet;
      const hue = planetHues[id];

      planet.style.setProperty("--planet-hue", hue);
      planet.classList.add("temp-blue");
    });
    // This does nothing also (?)

    // planet.addEventListener('keydown', (e) => {
    //   if (e.key === 'Enter' || e.key === ' ') {
    //     e.preventDefault();
    //     handleActivate(e);
    //   }
    // });
  });

  // close when clicking outside
  document.addEventListener('click', () => {
    closeAllPanels();
  });

  // close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllPanels();
  });

  // wire up any close buttons inside panels (the '✕' button)
  document.querySelectorAll('.planet-info .info-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const panel = btn.closest('.planet-info');
      if (panel) {
        panel.classList.remove('active');
        // panel.setAttribute('aria-hidden', 'true');
      }
    });
  });
});

// Weird logic

// ===== USER ID BY IP =====
async function showUserId() {
  const display = document.getElementById('user-id-display');
  if (!display) return;

  try {
    // Get IP address
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    const ip = data.ip;

    // Convert IP (e.g. 192.168.1.2) to a numeric hash
    const num = ip.split('.')
      .reduce((acc, part) => (acc * 256 + parseInt(part)) % 100000, 0);

    // Format as User 001, 002, etc.
    const id = String(num % 999).padStart(3, '0');

    display.textContent = `User ${id}`;
  } catch (err) {
    console.error('Failed to get IP:', err);
    display.textContent = 'User ???';
  }
}

document.addEventListener('DOMContentLoaded', showUserId);


// ===== ZOOM + DRAG PAN CONTROL =====
(function setupZoomAndPan() {
  const container = document.querySelector('.space-container');
  const space = document.querySelector('.space');
  if (!container || !space) return;

  let scale = 1;
  const minScale = 0.5;
  const maxScale = 2;

  let posX = 0;
  let posY = 0;
  let isDragging = false;
  let startX, startY;

  function updateTransform() {
    // Apply the transform (keeps your translate/scale formatting consistent)
    space.style.transform = `translate(calc(-50% + ${posX}px), calc(-50% + ${posY}px)) scale(${scale})`;
    // Also store the numeric values on the element so other scripts can read them reliably
    space.dataset.posX = String(posX);
    space.dataset.posY = String(posY);
    space.dataset.scale = String(scale);
  }


  // Mouse drag
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    container.style.cursor = 'grabbing';
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    container.style.cursor = 'grab';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    startX = e.clientX;
    startY = e.clientY;
    posX += dx;
    posY += dy;
    updateTransform();
  });

  // Touch drag
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }
  }, { passive: true });

  container.addEventListener('touchend', () => (isDragging = false));

  container.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      posX += dx;
      posY += dy;
      updateTransform();
    }
  }, { passive: false });

  // Pinch zoom
  let lastDist = 0;
  container.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (lastDist) {
        const zoom = (dist - lastDist) * 0.003;
        scale = Math.min(maxScale, Math.max(minScale, scale + zoom));
        updateTransform();
      }
      lastDist = dist;
    }
  }, { passive: false });

  container.addEventListener('touchend', () => (lastDist = 0));

  // Mouse wheel zoom
  container.addEventListener('wheel', (e) => {
    if (e.ctrlKey) return;
    e.preventDefault();
    const zoomAmount = -e.deltaY * 0.001;
    scale = Math.min(maxScale, Math.max(minScale, scale + zoomAmount));
    updateTransform();
  });

  // Optional: press "C" to recenter
  window.addEventListener('keydown', (e) => {
    if (e.key === 'c' || e.key === 'C') {
      posX = 0;
      posY = 0;
      updateTransform();
    }
  });
})();

// === RE-CENTER BUTTON LOGIC (robust) ===
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("recenter-btn");
  const space = document.querySelector(".space");
  if (!btn || !space) return;

  let visible = false;
  const threshold = 300; // px distance to consider "off center"

  function readState() {
    // Read numeric values from data attributes (fallback to 0/1 if missing)
    const posX = parseFloat(space.dataset.posX || "0");
    const posY = parseFloat(space.dataset.posY || "0");
    const scale = parseFloat(space.dataset.scale || "1");
    return { posX, posY, scale };
  }

  function checkVisibility() {
    const { posX, posY, scale } = readState();
    const dist = Math.sqrt(posX * posX + posY * posY);
    const shouldShow = dist > threshold || scale < 0.8 || scale > 1.5;

    if (shouldShow && !visible) {
      btn.classList.add("show");
      visible = true;
    } else if (!shouldShow && visible) {
      btn.classList.remove("show");
      visible = false;
    }
  }

  // Run once on load to set initial state
  checkVisibility();

  // Poll for changes (cheap and reliable). Interval 250ms is smooth and cheap.
  const poll = setInterval(checkVisibility, 250);

  // Wire up the click to dispatch existing "C" key handler (recenter)
  btn.addEventListener("click", () => {
    // Recenter variables in your pan/zoom module are posX/posY and updateTransform()
    // We trigger the key event the rest of your code already listens to:
    const evt = new KeyboardEvent("keydown", { key: "c" });
    window.dispatchEvent(evt);
    btn.classList.remove("show");
  });

  // Optional: clear the interval on page unload
  window.addEventListener('beforeunload', () => clearInterval(poll));
});


/* ===================================PROSORINA KLEISTON*/
/*
// === GDPR Notice with Cookies (Cosmic Version) ===
document.addEventListener("DOMContentLoaded", () => { 
  const gdprModal = document.getElementById("gdpr-modal");
  const acceptBtn = document.getElementById("gdpr-accept-btn");

  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax`;
  }

  function getCookie(name) {
    const cookies = document.cookie.split(";").map(c => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith(name + "=")) return cookie.split("=")[1];
    }
    return "";
  }

  // Show modal only if cookie not found
  if (!getCookie("gdprAccepted")) {
    gdprModal.classList.remove("hidden");
  }

  // Handle Accept button click
  acceptBtn.addEventListener("click", async () => {
    setCookie("gdprAccepted", "true", 30);
    gdprModal.classList.add("hidden");

    try {
      // Request camera + mic permissions
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log("Camera and microphone access granted.");
    } catch (err) {
      console.warn("Camera/microphone permission denied:", err);

      // === Show on-screen warning if denied ===
      let warn = document.createElement("div");
      warn.className = "permission-warning";
      warn.innerHTML = `
        ⚠️ Some games may not work correctly.<br>
        Please reload and allow camera/microphone access.
      `;
      document.body.appendChild(warn);
      setTimeout(() => warn.classList.add("show"), 100);

      // Optional: auto-hide after 10 seconds
      setTimeout(() => warn.remove(), 10000);
      
    }
  });
});

*/

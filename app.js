// app.js — Authentic Med Finder (Enhanced Version)
console.log("✅ App.js loading...");

// Wait for both DOM and QR library to load
window.addEventListener("load", function () {
  console.log("✅ Window loaded");

  // Check if Html5Qrcode is available
  if (typeof Html5Qrcode === "undefined") {
    console.error("❌ Html5Qrcode library not loaded!");
    alert("ERROR: QR Scanner library failed to load. Please check your internet connection and refresh the page.");
    return;
  }

  console.log("✅ Html5Qrcode library confirmed available");

  // Initialize the app
  initializeApp();
});

function initializeApp() {
  console.log("🚀 Initializing app...");

  // Get all elements
  const startBtn = document.getElementById("startScanBtn");
  const stopBtn = document.getElementById("stopScanBtn");
  const scanStatus = document.getElementById("scanStatus");
  const manualBtn = document.getElementById("manualBtn");
  const manualEntry = document.getElementById("manualEntry");
  const manualCheckBtn = document.getElementById("manualCheckBtn");
  const manualCode = document.getElementById("manualCode");
  const resultBox = document.getElementById("resultBox");
  const refreshPharm = document.getElementById("refreshPharm");
  const pharmList = document.getElementById("pharmList");
  const submitReportBtn = document.getElementById("submitReportBtn");
  const reportCode = document.getElementById("reportCode");
  const reportName = document.getElementById("reportName");
  const reportComment = document.getElementById("reportComment");
  const reportStatus = document.getElementById("reportStatus");
  const scanSpinner = document.getElementById("scanSpinner");

  // Stats
  let totalScans = 0;
  let verifiedMeds = 0;
  let nearbyPharmaciesCount = 0;

  let html5QrCode = null;
  let isScanning = false;

  /* -------------------------
      UPDATE STATS
  -------------------------- */
  function updateStats() {
    document.getElementById("totalScans").textContent = totalScans;
    document.getElementById("verifiedMeds").textContent = verifiedMeds;
    document.getElementById("nearbyPharmacies").textContent = nearbyPharmaciesCount;
  }

  /* -------------------------
      START SCANNER
  -------------------------- */
  startBtn.addEventListener("click", async () => {
    console.log("🎬 Start Scan clicked");

    if (isScanning) {
      console.warn("⚠️ Already scanning");
      return;
    }

    scanStatus.className = "status-badge scanning";
    scanStatus.innerHTML = "📸 Requesting camera access...";
    startBtn.disabled = true;
    stopBtn.disabled = false;

    // 🎥 Show spinner and glow effect
    if (scanSpinner) scanSpinner.classList.remove("hidden");
    document.body.classList.add("scanning");

    try {
      if (!html5QrCode) {
        console.log("🔧 Creating Html5Qrcode instance...");
        html5QrCode = new Html5Qrcode("qr-reader");
      }

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        throw new Error("No camera found. Please check camera permissions.");
      }

      console.log(`✅ Found ${cameras.length} camera(s):`, cameras.map(c => c.label));

      const backCam = cameras.find(c => {
        const label = c.label.toLowerCase();
        return label.includes("back") || label.includes("rear") || label.includes("environment");
      });

      const selectedCamera = backCam || cameras[0];
      console.log("📸 Selected camera:", selectedCamera.label);

      const config = {
        fps: 30,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
      };

      await html5QrCode.start(
        selectedCamera.id,
        config,
        async (decodedText) => {
          console.log("✅ QR CODE SCANNED:", decodedText);

          // Stop camera
          if (html5QrCode && isScanning) {
            try {
              await html5QrCode.stop();
              console.log("📷 Camera stopped after scan");
            } catch (e) {
              console.warn("⚠️ Error stopping camera:", e);
            }
            isScanning = false;
            startBtn.disabled = false;
            stopBtn.disabled = true;
          }

          // Hide spinner
          if (scanSpinner) scanSpinner.classList.add("hidden");
          document.body.classList.remove("scanning");

          // Update UI
          scanStatus.className = "status-badge success";
          scanStatus.innerHTML = `✅ Scanned: ${decodedText.substring(0, 25)}...`;

          totalScans++;
          updateStats();

          // Show result
          verifyMedicine(decodedText);
        },
        (errorMessage) => {
          // Ignore scan errors
        }
      );

      isScanning = true;
      scanStatus.className = "status-badge scanning";
      scanStatus.innerHTML = "📷 Camera active - Point at QR code";
      console.log("✅ Camera started successfully!");
    } catch (err) {
      console.error("❌ Camera error:", err);
      scanStatus.className = "status-badge error";
      scanStatus.innerHTML = `❌ ${err.message}`;
      startBtn.disabled = false;
      stopBtn.disabled = true;
      isScanning = false;

      // Hide spinner
      if (scanSpinner) scanSpinner.classList.add("hidden");
      document.body.classList.remove("scanning");

      showToast(`Camera Error: ${err.message}`, "error");
    }
  });

  /* -------------------------
      STOP SCANNER
  -------------------------- */
  stopBtn.addEventListener("click", async () => {
    console.log("⏹️ Stop button clicked");

    try {
      if (html5QrCode && isScanning) {
        await html5QrCode.stop();
        html5QrCode.clear();
        isScanning = false;
        console.log("✅ Camera stopped");
      }
      scanStatus.className = "status-badge idle";
      scanStatus.innerHTML = "⏹️ Camera stopped";
    } catch (e) {
      console.warn("⚠️ Error stopping camera:", e);
      scanStatus.className = "status-badge idle";
      scanStatus.innerHTML = "⚠️ Camera stopped (with warning)";
    }

    // Hide spinner and glow
    if (scanSpinner) scanSpinner.classList.add("hidden");
    document.body.classList.remove("scanning");

    startBtn.disabled = false;
    stopBtn.disabled = true;
  });

  /* -------------------------
      MANUAL ENTRY
  -------------------------- */
  manualBtn.addEventListener("click", () => {
    manualEntry.classList.toggle("hidden");
    if (!manualEntry.classList.contains("hidden")) {
      manualCode.focus();
    }
  });

  manualCheckBtn.addEventListener("click", () => {
    const code = manualCode.value.trim();
    if (!code) {
      showToast("Please enter a batch code", "error");
      return;
    }
    totalScans++;
    updateStats();
    verifyMedicine(code);
  });

  manualCode.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      manualCheckBtn.click();
    }
  });

  /* -------------------------
      VERIFY MEDICINE
  -------------------------- */
  function verifyMedicine(code) {
    resultBox.innerHTML = `
      <div class="spinner"></div>
      <p style="text-align: center; margin-top: 1rem; color: var(--text-light);">
        Verifying medicine code...
      </p>
    `;

    setTimeout(() => {
      const isValid = code.toUpperCase().startsWith("MED");

      if (isValid) {
        verifiedMeds++;
        updateStats();

        resultBox.innerHTML = `
          <div class="result good fade-in">
            <strong>✅ Medicine Verified</strong>
            <div class="result-details">
              <div><b>Batch Code:</b> ${code}</div>
              <div><b>Status:</b> Authentic (Demo Mode)</div>
              <div><b>Name:</b> Sample Medicine</div>
              <div><b>Company:</b> Sample Pharma Ltd.</div>
              <div><b>Expiry:</b> Dec 2026</div>
            </div>
          </div>
        `;
        showToast("✅ Medicine verified successfully!", "success");
      } else {
        resultBox.innerHTML = `
          <div class="result bad fade-in">
            <strong>⚠️ Medicine Not Verified</strong>
            <p>Code: ${code}</p>
            <p>Status: Not found in database</p>
          </div>
        `;
        showToast("⚠️ Medicine not found", "error");
      }
    }, 1000);
  }

  /* -------------------------
      LOAD PHARMACIES
  -------------------------- */
  function loadPharmacies() {
    pharmList.innerHTML = '<div class="spinner"></div>';

    setTimeout(() => {
      const demoPharmacies = [
        { name: "City Pharmacy", address: "123 Main Street, Artist Village", phone: "+91 98765 43210", distance: "0.5 km" },
        { name: "HealthCare Plus", address: "456 Market Road, Artist Village", phone: "+91 98765 43211", distance: "1.2 km" },
        { name: "MediStore", address: "789 Center Plaza, Artist Village", phone: "+91 98765 43212", distance: "2.0 km" },
      ];

      pharmList.innerHTML = "";
      nearbyPharmaciesCount = demoPharmacies.length;
      updateStats();

      demoPharmacies.forEach((pharm) => {
        const div = document.createElement("div");
        div.className = "pharm";
        div.innerHTML = `
          <b>🏥 ${pharm.name}</b>
          <div class="pharm-address">📍 ${pharm.address}</div>
          <div style="margin-top: 0.5rem; font-size: 0.875rem;">📞 ${pharm.phone}</div>
          <span class="pharm-distance">📏 ${pharm.distance}</span>
        `;
        pharmList.appendChild(div);
      });

      showToast(`Loaded ${nearbyPharmaciesCount} pharmacies`, "success");
    }, 500);
  }

  refreshPharm.addEventListener("click", loadPharmacies);

  /* -------------------------
      REPORT SYSTEM
  -------------------------- */
  submitReportBtn.addEventListener("click", () => {
    const code = reportCode.value.trim();
    const name = reportName.value.trim();
    const comment = reportComment.value.trim();

    if (!code || !comment) {
      reportStatus.style.display = "block";
      reportStatus.className = "status-badge error";
      reportStatus.innerHTML = "⚠️ Please fill in batch code and description";
      return;
    }

    submitReportBtn.disabled = true;
    submitReportBtn.innerHTML = '<span>⏳</span> Submitting...';
    reportStatus.style.display = "block";
    reportStatus.className = "status-badge scanning";
    reportStatus.innerHTML = "⏳ Submitting report...";

    setTimeout(() => {
      reportStatus.className = "status-badge success";
      reportStatus.innerHTML = "✅ Report submitted successfully! Thank you for helping keep medicines safe.";

      reportCode.value = "";
      reportName.value = "";
      reportComment.value = "";

      submitReportBtn.disabled = false;
      submitReportBtn.innerHTML = '<span>📤</span> Submit Report';

      showToast("Report submitted successfully!", "success");
    }, 1500);
  });

  /* -------------------------
      HELPER FUNCTIONS
  -------------------------- */
  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "slideInRight 0.3s ease reverse";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /* -------------------------
      INITIALIZE
  -------------------------- */
  loadPharmacies();
  updateStats();

  console.log("✅ App fully initialized and ready!");
}

/* 🌙 Dark Mode Toggle Logic */
const toggleBtn = document.getElementById("darkModeToggle");
if (toggleBtn) {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    toggleBtn.textContent = "☀️ Light Mode";
  }

  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    toggleBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

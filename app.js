// app.js — Simplified version for testing camera first
console.log("✅ App.js loading...");

// Check if Html5Qrcode is available
if (typeof Html5Qrcode === 'undefined') {
  console.error("❌ Html5Qrcode library not loaded!");
  alert("ERROR: QR Scanner library failed to load. Check your internet connection.");
} else {
  console.log("✅ Html5Qrcode library loaded successfully");
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM ready");

  // Get all elements
  const startBtn = document.getElementById("startScanBtn");
  const stopBtn = document.getElementById("stopScanBtn");
  const scanStatus = document.getElementById("scanStatus");
  const manualBtn = document.getElementById("manualBtn");
  const manualEntry = document.getElementById("manualEntry");
  const manualCheckBtn = document.getElementById("manualCheckBtn");
  const manualCode = document.getElementById("manualCode");
  const resultBox = document.getElementById("resultBox");

  let html5QrCode = null;
  let isScanning = false;

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
    scanStatus.innerHTML = "📸 Requesting camera...";
    startBtn.disabled = true;
    stopBtn.disabled = false;

    try {
      // Initialize scanner
      if (!html5QrCode) {
        console.log("🔧 Creating new Html5Qrcode instance...");
        html5QrCode = new Html5Qrcode("qr-reader");
      }

      // Get available cameras
      console.log("📷 Getting available cameras...");
      const cameras = await Html5Qrcode.getCameras();
      
      if (!cameras || cameras.length === 0) {
        throw new Error("No camera detected on this device");
      }

      console.log(`✅ Found ${cameras.length} camera(s):`, cameras);

      // Try to find back camera
      const backCam = cameras.find(c => 
        c.label.toLowerCase().includes("back") || 
        c.label.toLowerCase().includes("rear") ||
        c.label.toLowerCase().includes("environment")
      );
      
      const selectedCam = backCam || cameras[0];
      console.log("📸 Using camera:", selectedCam.label);

      // Start scanning
      const config = { 
        fps: 30,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await html5QrCode.start(
        selectedCam.id,
        config,
        async (decodedText) => {
          console.log("✅ QR SCANNED:", decodedText);
          
          // Stop immediately
          if (html5QrCode && isScanning) {
            await html5QrCode.stop();
            isScanning = false;
            startBtn.disabled = false;
            stopBtn.disabled = true;
          }
          
          scanStatus.className = "status-badge success";
          scanStatus.innerHTML = `✅ Scanned: ${decodedText.substring(0, 30)}...`;
          
          // Show result
          showResult(decodedText);
        },
        (errorMessage) => {
          // Silent - too many false positives during scanning
        }
      );

      isScanning = true;
      scanStatus.className = "status-badge scanning";
      scanStatus.innerHTML = "📷 Camera active - Point at QR code";
      console.log("✅ Camera started successfully");
      
    } catch (err) {
      console.error("❌ Camera error:", err);
      scanStatus.className = "status-badge error";
      scanStatus.innerHTML = `❌ ${err.message}`;
      startBtn.disabled = false;
      stopBtn.disabled = true;
      isScanning = false;
      
      alert(`Camera Error: ${err.message}\n\nPlease check:\n1. Camera permissions\n2. HTTPS connection\n3. Camera not in use by another app`);
    }
  });

  /* -------------------------
      STOP SCANNER
  -------------------------- */
  stopBtn.addEventListener("click", async () => {
    console.log("⏹️ Stop Scan clicked");
    
    try {
      if (html5QrCode && isScanning) {
        await html5QrCode.stop();
        html5QrCode.clear();
        isScanning = false;
        console.log("✅ Camera stopped");
      }
      scanStatus.className = "status-badge idle";
      scanStatus.innerHTML = "⏹️ Stopped scanning";
    } catch (e) {
      console.warn("⚠️ Error stopping camera:", e);
      scanStatus.className = "status-badge idle";
      scanStatus.innerHTML = "⚠️ Camera stopped";
    }
    
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
      alert("Please enter a valid batch code");
      return;
    }
    console.log("🔍 Manual check:", code);
    showResult(code);
  });

  // Enter key support
  manualCode.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      manualCheckBtn.click();
    }
  });

  /* -------------------------
      SHOW RESULT (TEST VERSION)
  -------------------------- */
  function showResult(code) {
    console.log("📊 Showing result for:", code);
    
    // For now, just show a test result
    resultBox.innerHTML = `
      <div class="result good">
        <strong>✅ Code Scanned Successfully</strong>
        <div class="result-details">
          <div class="result-detail">
            <b>Code:</b>
            <span>${code}</span>
          </div>
          <div class="result-detail">
            <b>Status:</b>
            <span>Scanner working! Now connect to Firebase.</span>
          </div>
        </div>
        <p style="margin-top: 1rem; font-size: 0.875rem; opacity: 0.8;">
          ✅ Camera is working correctly. Next step: Connect Firebase to verify actual medicine data.
        </p>
      </div>
    `;
  }

  console.log("✅ App initialized successfully");
  
  // Test if Html5Qrcode is accessible
  if (typeof Html5Qrcode !== 'undefined') {
    console.log("✅ Html5Qrcode confirmed available");
  } else {
    console.error("❌ Html5Qrcode NOT available in this scope!");
  }
});
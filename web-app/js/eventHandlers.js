// eventHandlers.js
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { renderCharts } from "./chartConfig.js";

// Check if user is signed in
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  // Already on monitoring page, do nothing
  document
    .getElementById("monitoringButton")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
    });

  document
    .getElementById("tableSectionButton")
    ?.addEventListener("click", () => {
      window.location.href = "./Dashboard_page2.html";
    });

  document
    .getElementById("AnalysisButton")
    ?.addEventListener("click", async () => {
      await renderCharts();
    });

  document.getElementById("seedDataButton")?.addEventListener("click", () => {
    window.location.href = "./seed.html";
  });
});

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

  // Only run page code when user is signed in
  document
    .getElementById("tableSectionButton")
    ?.addEventListener("click", () => {
      const targetUrl = "./Dashboard_page2.html";
      if (window.location.href !== targetUrl) {
        window.location.href = targetUrl;
      } else {
        alert("You are already on the target page!");
      }
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

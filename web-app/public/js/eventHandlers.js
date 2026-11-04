// eventHandlers.js
import { renderCharts } from "./chartConfig.js";

document.getElementById("tableSectionButton").addEventListener("click", () => {
  const targetUrl = "./Dashboard_page2.html";
  if (window.location.href !== targetUrl) {
    window.location.href = targetUrl;
  } else {
    alert("You are already on the target page!");
  }
});

document
  .getElementById("AnalysisButton")
  .addEventListener("click", async () => {
    await renderCharts();
  });

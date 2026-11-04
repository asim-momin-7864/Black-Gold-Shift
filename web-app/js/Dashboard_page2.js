// Dashboard_page2.js
import { db } from "./firebase.js";
import { doc, getDoc } from "firebase/firestore";

// Function to format the current date
const getFormattedDate = () => {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, "0");
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const year = today.getFullYear();
  return `${day}${month}${year}M`;
};

// Helper to calculate percentage safely
const percent = (value, total) => {
  if (!total || total === 0) return 0;
  return (value / total) * 100;
};

// Function to fetch and display data from Firestore
const fetchAndDisplayData = async () => {
  const formattedDate = getFormattedDate();
  const docRef = doc(db, "ShiftLog", formattedDate);

  try {
    const docSnap = await getDoc(docRef);
    const data = docSnap.exists() ? docSnap.data() : null;

    if (!data) {
      console.error("Document not found!");
      return;
    }

    data["cleanCoalPercent"] = percent(
      data.washery_Cleancoal,
      data.washery_Rawcoal
    );
    data["middlingPercent"] = percent(
      data.washery_Midding,
      data.washery_Rawcoal
    );
    data["rejectedPercent"] = percent(
      data.washery_Rejected,
      data.washery_Rawcoal
    );
    data["slurryPercent"] = percent(data.washery_Slurry, data.washery_Rawcoal);

    // Compile the Handlebars template and render it
    const source = document.getElementById("table-template").innerHTML;
    const template = Handlebars.compile(source);
    const html = template(data);
    document.querySelector(".table-container").innerHTML = html;
  } catch (error) {
    console.error("Error fetching document:", error);
  }
};

// Event listener for the Generate Log button
document
  .getElementById("Generate-Log-Button")
  .addEventListener("click", fetchAndDisplayData);

// Function to handle navigation to the monitoring page
const handleMonitoringButtonClick = () => {
  window.location.href = "./Dashboard_page1.html";
};

// Event listener for the monitoring button
document
  .getElementById("monitoringButton")
  .addEventListener("click", handleMonitoringButtonClick);

// Event listener for the test seeder button
document.getElementById("seedDataButton")?.addEventListener("click", () => {
  window.location.href = "./seed.html";
});

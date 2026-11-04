// Dashboard_page2.js (top)
import { db } from "./firebase.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Function to format the current date
const getFormattedDate = () => {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, "0");
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const year = today.getFullYear();
  return `${day}${month}${year}M`;
};

// Function to fetch and display data from Firestore
const fetchAndDisplayData = async () => {
  const formattedDate = getFormattedDate();
  console.log(formattedDate);

  // Document reference
  const docRef = doc(db, "ShiftLog", formattedDate);
  try {
    const docSnap = await getDoc(docRef);
    const data = docSnap.exists() ? docSnap.data() : null;

    if (!data) {
      console.error("Document not found!");
      return;
    }

    console.log("Data retrieved:", data);

    let cleanCoalPercent =
      (data.washery_Cleancoal / data.washery_Rawcoal) * 100;
    let middlingPercent = (data.washery_Midding / data.washery_Rawcoal) * 100;
    let rejectedPercent = (data.washery_Rejected / data.washery_Rawcoal) * 100;
    let slurryPercent = (data.washery_Slurry / data.washery_Rawcoal) * 100;

    data["cleanCoalPercent"] = cleanCoalPercent;
    data["middlingPercent"] = middlingPercent;
    data["rejectedPercent"] = rejectedPercent;
    data["slurryPercent"] = slurryPercent;

    // Compile the Handlebars template and render it
    const source = document.getElementById("table-template").innerHTML;
    const template = Handlebars.compile(source);
    const html = template(data);
    document.querySelector(".table-container").innerHTML = html;
  } catch (error) {
    console.error("Error fetching document:");
  }
};

// Event listener for the Generate PDF button
document
  .getElementById("Generate-Log-Button")
  .addEventListener("click", fetchAndDisplayData);

// Function to handle navigation to the monitoring page
const handleMonitoringButtonClick = () => {
  const targetUrl = "./Dashboard_page1.html"; // Desired URL
  const isCurrentUrl = window.location.href === targetUrl;

  if (!isCurrentUrl) {
    window.location.href = targetUrl;
  } else {
    alert("You are already on the target page!");
  }
};

// Event listener for the monitoring button
document
  .getElementById("monitoringButton")
  .addEventListener("click", handleMonitoringButtonClick);

// Event listener for the test seeder button
document.getElementById("seedDataButton")?.addEventListener("click", () => {
  window.location.href = "./seed.html";
});

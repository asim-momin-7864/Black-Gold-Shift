// chartConfig.js

import { db } from "./firebase.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

export async function renderCharts() {
  try {
    const formattedDate = getFormattedDate();
    const docRef = doc(db, "ShiftLog", formattedDate);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      alert("No shift data available for today.");
      return;
    }

    const data = docSnap.data();

    // ---------- INFO BOXES ----------
    setText("BoxValue1", data.coal_Surfaceminer_Minerno);
    setText("BoxValueName1", "No. Surface Miner");

    setText(
      "BoxValue2",
      (data.coal_Explosives_Explosivescharged || 0) +
        (data.overburden_Explosives_Explosivescharged || 0)
    );
    setText("BoxValueName2", "Total Explosives");

    setText("BoxValue3", data.washery_Rawcoal);
    setText("BoxValueName3", "Total Raw Coal");

    setText(
      "BoxValue4",
      (data.dispatch_Rail_Actual || 0) + (data.dispatch_Road_Actual || 0)
    );
    setText("BoxValueName4", "Total Coal Dispatch");

    // ---------- PIE CHARTS ----------

    renderPieChart(
      "pieChart1",
      "Coal Washery Section",
      ["Clean Coal", "Middling", "Rejected", "Slurry"],
      [
        data.washery_Cleancoal || 0,
        data.washery_Midding || 0,
        data.washery_Rejected || 0,
        data.washery_Slurry || 0,
      ],
      ["#36a2eb", "#ffcd56", "#ff6384", "#34a853"]
    );

    renderPieChart(
      "pieChart2",
      "Actual Coal Dispatch",
      ["Rail", "Road"],
      [data.dispatch_Rail_Actual || 0, data.dispatch_Road_Actual || 0],
      ["#4285f4", "#ea4335"]
    );

    renderPieChart(
      "pieChart4",
      "Overburden Excavator",
      ["Solid", "Rehandling"],
      [
        data.overburden_Shovel_Solidquantity || 0,
        data.overburden_Shovel_Rehandalingquantity || 0,
      ],
      ["#ffcd56", "#ff6384"]
    );

    renderPieChart(
      "pieChart7",
      "Overburden Tripper",
      ["Solid", "Rehandling"],
      [
        data.overburden_Tripper_Soilquantity || 0,
        data.overburden_Tripper_Rehanquantity || 0,
      ],
      ["#34a853", "#ff6384"]
    );

    // ---------- BAR CHARTS ----------

    renderBarChart(
      "barChart3",
      "Coal Dispatch Section",
      ["Target", "Actual"],
      [
        {
          label: "Rail",
          data: [
            data.dispatch_Rail_Target || 0,
            data.dispatch_Rail_Actual || 0,
          ],
          backgroundColor: "#4285f4",
        },
        {
          label: "Road",
          data: [
            data.dispatch_Road_Target || 0,
            data.dispatch_Road_Actual || 0,
          ],
          backgroundColor: "#ea4335",
        },
      ]
    );

    renderBarChart(
      "barChart5",
      "Drill Performance Metrics",
      ["Overburden Drill", "Coal Mining Drill"],
      [
        {
          label: "No. Shot Holes",
          data: [
            data.overburden_Drill_Noofshotholesdrilled || 0,
            data.coal_Drill_Noofshotholesdrilled || 0,
          ],
          backgroundColor: "#ffcd56",
        },
        {
          label: "Drill Meters",
          data: [
            data.overburden_Drill_Drillingmeter || 0,
            data.coal_Drill_Drillingmeter || 0,
          ],
          backgroundColor: "#34a853",
        },
        {
          label: "Total",
          data: [data.overburden_Drill_Total || 0, data.coal_Drill_Total || 0],
          backgroundColor: "#ff9f40",
        },
      ]
    );

    renderBarChart(
      "barChart6",
      "Explosives Metrics",
      ["Overburden", "Coal Mining"],
      [
        {
          label: "Holes Charged",
          data: [
            data.overburden_Explosives_Noholescharged || 0,
            data.coal_Explosives_Noholescharged || 0,
          ],
          backgroundColor: "#34a853",
        },
        {
          label: "Explosives Charged",
          data: [
            data.overburden_Explosives_Explosivescharged || 0,
            data.coal_Explosives_Explosivescharged || 0,
          ],
          backgroundColor: "#4285f4",
        },
        {
          label: "Holes Blasted",
          data: [
            data.overburden_Explosives_NoholesBlasetedd || 0,
            data.coal_Explosives_NoholesBlasetedd || 0,
          ],
          backgroundColor: "#ff9f40",
        },
        {
          label: "Explosives Blasted",
          data: [
            data.overburden_Explosives_Explosiveblasted || 0,
            data.coal_Explosives_Explosiveblasted || 0,
          ],
          backgroundColor: "#ea4335",
        },
      ]
    );
  } catch (err) {
    console.error("Chart rendering failed:", err);
  }
}

// ---------------- HELPERS ----------------

function getFormattedDate() {
  const d = new Date();
  return (
    String(d.getDate()).padStart(2, "0") +
    String(d.getMonth() + 1).padStart(2, "0") +
    d.getFullYear() +
    "M"
  );
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value ?? 0;
}

function renderPieChart(id, title, labels, data, colors) {
  const canvas = document.getElementById(id);
  if (!canvas) return;

  new Chart(canvas.getContext("2d"), {
    type: "pie",
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors }],
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: title },
      },
    },
  });
}

function renderBarChart(id, title, labels, datasets) {
  const canvas = document.getElementById(id);
  if (!canvas) return;

  new Chart(canvas.getContext("2d"), {
    type: "bar",
    data: { labels, datasets },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true },
      },
      plugins: {
        title: { display: true, text: title },
      },
    },
  });
}

# Black Gold Shift — Complete Project Documentation

> **Purpose of this document:** Full handoff reference. Every architectural decision, file, data field, screen, and known limitation is documented here so another model or developer can immediately understand and continue work on this project.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [System Architecture](#3-system-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Firebase Backend (Shared)](#5-firebase-backend-shared)
6. [Data Model — Firestore Schema](#6-data-model--firestore-schema)
7. [Web Application](#7-web-application)
8. [Android Application](#8-android-application)
9. [Document ID Convention](#9-document-id-convention)
10. [End-to-End Data Flow](#10-end-to-end-data-flow)
11. [Known Limitations & Trade-offs](#11-known-limitations--trade-offs)
12. [Build & Run Instructions](#12-build--run-instructions)
13. [Team & Contributions](#13-team--contributions)
14. [License](#14-license)

---

## 1. Project Overview

**Black Gold Shift** is a hackathon project that digitizes daily coal-mining shift logs. It replaces manual paper-based shift handover records with a mobile + web system backed by Firebase.

| Property | Value |
|---|---|
| Project name | Black Gold Shift |
| Type | Hackathon / learning project |
| Firebase project ID | `black-gold-shift` |
| Firebase hosting domain | `black-gold-shift.firebaseapp.com` |
| Status | Revived and demo-ready |

The system has **two front-ends** that share **one Firebase backend**:

- **Android App** — used by field supervisors/operators to enter shift data
- **Web Dashboard** — used by managers/admins to view, analyse, and export reports

There is **no custom server**. All logic lives in the client apps; Firebase handles auth, storage, and the database.

---

## 2. Problem Statement

In many coal-mining operations, daily shift data (overburden removal, coal excavation, washery outputs, dispatches, drilling, explosives) is still recorded on paper forms. This creates:

- Delayed reporting (paper must be physically handed over)
- Risk of loss or illegibility
- No centralized view for managers
- No analytics or trend analysis

**Black Gold Shift** addresses this by:

- Providing a structured mobile form for operators to enter data in real-time
- Automatically making that data available to managers on the web dashboard
- Generating a formatted PDF shift report with a single click
- Supporting demo/test data seeding for presentations

---

## 3. System Architecture

```
+-----------------------------------------------------------+
|                        CLIENTS                            |
|                                                           |
|   +-----------------+         +-----------------------+  |
|   |  Android App    |         |   Web Dashboard        |  |
|   |  (Java)         |         |   (HTML/CSS/JS)        |  |
|   |                 |         |                        |  |
|   |  - Splash       |         |  - Login / Sign-up     |  |
|   |  - Sign-In      |         |  - Analysis Dashboard  |  |
|   |  - Dashboard    |         |    (charts + KPIs)     |  |
|   |  - Date/Shift   |         |  - Shift Log Table     |  |
|   |  - Data Entry   |         |  - PDF Export          |  |
|   |    Forms        |         |  - Seeder Tool         |  |
|   +--------+--------+         +-----------+------------+  |
|            |  WRITES                      |  READS        |
+------------+------------------------------+---------------+
             |                              |
             v                              v
+---------------------------------------------------------+
|                  FIREBASE (Backend)                      |
|                                                          |
|  +------------------+  +---------------------------+   |
|  |  Firebase Auth   |  |   Cloud Firestore          |   |
|  |                  |  |                            |   |
|  |  Email/Password  |  |  Collection: ShiftLog      |   |
|  |  (same users     |  |  Document ID: DDMMYYYYS    |   |
|  |   for both apps) |  |  (e.g. 16122025M)          |   |
|  +------------------+  +---------------------------+   |
|                                                          |
|  +--------------------------------------------------+   |
|  |  Firebase Hosting (Web App served from here)     |   |
|  +--------------------------------------------------+   |
|                                                          |
|  +--------------------------------------------------+   |
|  |  Firebase Storage (DISABLED - free tier removed) |   |
|  |  Was used to upload PDFs for Android download    |   |
|  +--------------------------------------------------+   |
+---------------------------------------------------------+
```

**Key design decisions:**

- No custom server — 100% serverless using Firebase
- Both apps read/write to the **same Firestore document** keyed by date+shift
- PDF is generated entirely client-side (no server rendering)
- Firebase Analytics is included but optional (fails silently in non-browser contexts)

---

## 4. Technology Stack

### Web Application

| Layer | Technology | Version / Source |
|---|---|---|
| Markup | HTML5 | Static files |
| Styling | Vanilla CSS | Static files |
| Logic | Vanilla JavaScript (ES Modules) | Static files |
| Charts | Chart.js | CDN (cdn.jsdelivr.net/npm/chart.js) |
| Templating | Handlebars.js | CDN (cdnjs.cloudflare.com) |
| PDF generation | jsPDF | CDN (cdnjs.cloudflare.com/jspdf/2.5.1) |
| DOM-to-image | html2canvas | CDN (html2canvas.hertzen.com + cdnjs) |
| Firebase SDK | Firebase JS SDK (ESM) | gstatic.com/firebasejs/12.6.0 |
| Hosting | Firebase Hosting | firebase.json config |
| Fonts | Google Fonts | Cantora One, Poppins, Roboto, Inter |
| Icons | Google Material Symbols | fonts.googleapis.com |

### Android Application

| Layer | Technology | Version |
|---|---|---|
| Language | Java | Java 8 |
| Build system | Gradle (Kotlin DSL) | build.gradle.kts |
| Min SDK | 24 (Android 7.0) | minSdk = 24 |
| Target SDK | 34 (Android 14) | targetSdk = 34 |
| UI toolkit | XML Layouts + AppCompat | AndroidX |
| Firebase BOM | Firebase Android BoM | 34.7.0 |
| Firebase modules | Auth, Firestore, Storage, Analytics | via BOM |
| Material Design | Material Components | libs.material |
| Constraint Layout | ConstraintLayout | libs.constraintlayout |
| CardView | CardView | Used in Dashboard |

### Firebase Services Used

| Service | Used for |
|---|---|
| Firebase Authentication | Email/password login (both apps) |
| Cloud Firestore | Primary database — shift log documents |
| Firebase Hosting | Serves the web app |
| Firebase Storage | **DISABLED** — was for PDF uploads |
| Firebase Analytics | Optional telemetry |

---

## 5. Firebase Backend (Shared)

Both the web and Android apps connect to the same Firebase project:

```
Project ID:        black-gold-shift
Auth Domain:       black-gold-shift.firebaseapp.com
Storage Bucket:    black-gold-shift.firebasestorage.app
Messaging Sender:  1075088195518
App ID (Web):      1:1075088195518:web:e1b8f5ebc4cfffb88043ef
Measurement ID:    G-4ZSTES71WK
```

The web SDK config lives in `web-app/firebase/firebase.js`.
The Android config lives in `Androidapp/app/google-services.json`.

**Exported singletons (web):**

```js
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);   // imported but upload disabled
export default app;
```

---

## 6. Data Model — Firestore Schema

### Collection: `ShiftLog`

**Document ID format:** `DDMMYYYYS`

- `DD` = zero-padded day
- `MM` = zero-padded month
- `YYYY` = 4-digit year
- `S` = shift code (`M` = Morning, potentially others)

**Example:** `16122025M` = December 16, 2025, Morning shift

### Full Field List

All fields are **flat** (no nested objects) at the document root level.

#### Overburden — Excavator (Shovel)

| Field | Description |
|---|---|
| `overburden_Shovel_SIno` | Serial number |
| `overburden_Shovel_Shovelno` | Shovel/Excavator number |
| `overburden_Shovel_Benchno` | Bench number |
| `overburden_Shovel_Solidquantity` | Solid quantity ('000 cu meter) |
| `overburden_Shovel_Rehandalingquantity` | Rehandling quantity |
| `overburden_Shovel_Totalquantity` | Total quantity |

#### Overburden — Tipper (Tripper/Dumper)

| Field | Description |
|---|---|
| `overburden_Tripper_SIno` | Serial number |
| `overburden_Tripper_Tripperno` | Tipper number |
| `overburden_Tripper_Benchno` | Bench number |
| `overburden_Tripper_Dumperfac` | Dumper factor |
| `overburden_Tripper_Tripsno` | Number of trips |
| `overburden_Tripper_Soilquantity` | Solid quantity |
| `overburden_Tripper_Rehanquantity` | Rehandling quantity |
| `overburden_Tripper_Totalquantity` | Total quantity |

#### Overburden — Drilling

| Field | Description |
|---|---|
| `overburden_Drill_Serialno` | Serial number |
| `overburden_Drill_Drillno` | Drill number |
| `overburden_Drill_Benchno` | Bench number |
| `overburden_Drill_Noofshotholesdrilled` | Number of shot holes drilled |
| `overburden_Drill_Drillingmeter` | Drilling meters |
| `overburden_Drill_Total` | Total |

#### Overburden — Explosives

| Field | Description |
|---|---|
| `overburden_Explosives_SIno` | Serial number |
| `overburden_Explosives_Benchno` | Bench number |
| `overburden_Explosives_Noholescharged` | Number of holes charged |
| `overburden_Explosives_NoholesBlasetedd` | Number of holes blasted |
| `overburden_Explosives_Explosivescharged` | Explosives charged (tonnes) |
| `overburden_Explosives_Explosiveblasted` | Explosives blasted (tonnes) |

#### Coal Mining — Excavator (Shovel)

| Field | Description |
|---|---|
| `coal_Shovel_Serialno` | Serial number |
| `coal_Shovel_Shovelno` | Shovel/Excavator number |
| `coal_Shovel_Benchno` | Bench number |
| `coal_Shovel_Coalquantity` | Coal quantity excavated (Te) |

#### Coal Mining — Tipper (Tripper/Dumper)

| Field | Description |
|---|---|
| `coal_Tripper_Serialno` | Serial number |
| `coal_Tripper_Tripperno` | Tipper number |
| `coal_Tripper_Benchno` | Bench number |
| `coal_Tripper_Dumperfactor` | Dumper factor (Te/Trip) |
| `coal_Tripper_Tripsnowithoutwieghts` | Trips without weighment |
| `coal_Tripper_CoalQuantitywithoutweights` | Coal quantity without weighment (T) |
| `coal_Tripper_Tripsnowithweights` | Trips with weighment |
| `coal_Tripper_CoalQuantitywithweights` | Coal quantity with weighment (T) |

#### Coal Mining — Drilling

| Field | Description |
|---|---|
| `coal_Drill_Serialno` | Serial number |
| `coal_Drill_Drillno` | Drill number |
| `coal_Drill_Benchno` | Bench number |
| `coal_Drill_Noofshotholesdrilled` | Number of shot holes drilled |
| `coal_Drill_Drillingmeter` | Drilling meters |
| `coal_Drill_Total` | Total |

#### Coal Mining — Explosives

| Field | Description |
|---|---|
| `coal_Explosives_SIno` | Serial number |
| `coal_Explosives_Benchno` | Bench number |
| `coal_Explosives_Noholescharged` | Number of holes charged |
| `coal_Explosives_NoholesBlasetedd` | Number of holes blasted |
| `coal_Explosives_Explosivescharged` | Explosives charged (tonnes) |
| `coal_Explosives_Explosiveblasted` | Explosives blasted (tonnes) |

#### Coal Mining — Surface Miners

| Field | Description |
|---|---|
| `coal_Surfaceminer_Serialno` | Serial number |
| `coal_Surfaceminer_Minerno` | Surface miner number |
| `coal_Surfaceminer_Benchno` | Bench number |
| `coal_Surfaceminer_Coalquantity` | Coal quantity cut ('000 Te) |

#### Coal Washery

| Field | Description |
|---|---|
| `washery_Rawcoal` | Raw coal fed (tonnes) |
| `washery_Cleancoal` | Clean coal produced ('000 Te) |
| `washery_Midding` | Middling produced |
| `washery_Rejected` | Rejects produced |
| `washery_Slurry` | Slurry produced |

> **Computed fields (web-only, not stored in Firestore):**
> `cleanCoalPercent`, `middlingPercent`, `rejectedPercent`, `slurryPercent`
> Calculated at render time by the web app as percentage of raw coal.

#### Coal Dispatch

| Field | Description |
|---|---|
| `dispatch_Rail_Grade` | Coal grade dispatched via rail |
| `dispatch_Rail_Target` | Target dispatch (rail) |
| `dispatch_Rail_Actual` | Actual dispatch (rail) |
| `dispatch_Road_Grade` | Coal grade dispatched via road |
| `dispatch_Road_Target` | Target dispatch (road) |
| `dispatch_Road_Actual` | Actual dispatch (road) |

---

## 7. Web Application

### 7.1 Web File Structure

```
web-app/
+-- .firebaserc                  # Firebase project alias
+-- firebase.json                # Hosting config (public dir = ./public)
+-- package.json                 # npm config (firebase@^12.6.0 dependency)
+-- package-lock.json
+-- seed.html                    # Demo data seeder (standalone)
+-- firebase/
|   +-- firebase.js              # Firebase SDK init + exports
+-- public/
    +-- index.html               # Sign-up page (entry point)
    +-- login.html               # Login page
    +-- Dashboard_page1.html     # Analysis dashboard (charts + KPI cards)
    +-- Dashboard_page1.css      # Styles for page 1
    +-- Dashboard_page2.html     # Shift log table + PDF generator
    +-- Dashboard_page2.css      # Styles for page 2
    +-- Dashboard_page2.js       # Fetches Firestore -> renders Handlebars table
    +-- chartConfig.js           # Fetches Firestore -> renders Chart.js charts
    +-- eventHandlers.js         # Sidebar navigation button wiring
    +-- GeneratePDF.js           # jsPDF + html2canvas PDF export
    +-- login.js                 # Firebase Auth sign-in
    +-- sign_up.js               # Firebase Auth sign-up
    +-- sign_up.css              # Shared login/signup styles
    +-- firebaseConfig.old.js    # Legacy config (not used)
    +-- firebaseSignUp.old.js    # Legacy signup (not used)
    +-- Assets-MainPage/
    |   +-- favicon.ico
    |   +-- logo.png
    +-- assets/
        +-- logo.png
```

### 7.2 Pages & Routing

All routing uses plain `window.location.href` — no client-side router.

| File | Purpose | User type |
|---|---|---|
| `index.html` | Sign-up form | New users |
| `login.html` | Login form | All users |
| `Dashboard_page1.html` | Analysis dashboard (charts + KPIs) | Managers |
| `Dashboard_page2.html` | Shift log table + PDF export | Managers |
| `seed.html` | Demo data seeder | Dev/demo only |

**Sidebar navigation** (both dashboard pages):
- Monitoring icon → `Dashboard_page1.html`
- Table chart icon → `Dashboard_page2.html`

### 7.3 Firebase Integration (Web)

The Firebase SDK is loaded entirely from Google's CDN using ES module imports:

```js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
```

This avoids bundling and lets the web app run as pure static files. All pages import Firebase from `../firebase/firebase.js`.

**Auth flow:**
- `login.js` calls `signInWithEmailAndPassword(auth, email, password)`
- `sign_up.js` calls `createUserWithEmailAndPassword(auth, email, password)`
- On success → redirect to `Dashboard_page1.html`

### 7.4 Analysis Dashboard (Page 1)

**Files:** `Dashboard_page1.html` + `chartConfig.js`

**Data source:** Reads today's Firestore document (`DDMMYYYYM`) on page load.

**KPI Cards (4 info boxes):**

| Box | Field(s) | Label |
|---|---|---|
| Box 1 (white) | `coal_Surfaceminer_Minerno` | No. Surface Miner |
| Box 2 (yellow) | `coal_Explosives_Explosivescharged + overburden_Explosives_Explosivescharged` | Total Explosives |
| Box 3 (yellow) | `washery_Rawcoal` | Total Raw Coal |
| Box 4 (white) | `dispatch_Rail_Actual + dispatch_Road_Actual` | Total Coal Dispatch |

**Charts rendered (Chart.js):**

| Chart ID | Type | Title | Data |
|---|---|---|---|
| `pieChart1` | Pie | Coal Washery Section | Clean Coal, Middling, Rejected, Slurry |
| `pieChart2` | Pie | Actual Coal Dispatch | Rail vs Road actual |
| `barChart3` | Bar | Coal Dispatch Section | Rail & Road: Target vs Actual |
| `pieChart4` | Pie | Overburden Excavator | Solid vs Rehandling |
| `barChart5` | Bar | Drill Performance Metrics | OB Drill & Coal Drill: Shot Holes, Drill Meters, Total |
| `barChart6` | Bar | Explosives Metrics | OB & Coal: Holes Charged, Explosives Charged, Holes Blasted, Explosives Blasted |
| `pieChart7` | Pie | Overburden Tripper | Solid vs Rehandling |

### 7.5 Shift Log & PDF (Page 2)

**Files:** `Dashboard_page2.html` + `Dashboard_page2.js`

**Flow:**
1. User clicks **"Generate Log"**
2. `fetchAndDisplayData()` fetches today's Firestore document
3. Derived percentage fields computed for washery:
   ```js
   cleanCoalPercent = (washery_Cleancoal / washery_Rawcoal) * 100
   middlingPercent  = (washery_Midding   / washery_Rawcoal) * 100
   rejectedPercent  = (washery_Rejected  / washery_Rawcoal) * 100
   slurryPercent    = (washery_Slurry    / washery_Rawcoal) * 100
   ```
4. Handlebars template (`#table-template` script tag) compiled and rendered
5. Rendered HTML replaces `.table-container` div

**Handlebars template sections:**
- Overburden: Excavator, Tipper, Drilling, Explosives
- Coal Mining: Excavator, Tipper (with/without weighment), Drilling, Explosives
- Surface Miners
- Coal Washery (with computed yield %)
- Coal Dispatch (Rail + Road: Grade, Target, Actual)

### 7.6 PDF Generation Logic

**File:** `GeneratePDF.js`

Triggered by clicking **"Generate PDF"**.

**Process:**
1. `html2canvas(element, { scale: 2 })` — captures `#all-table-container` as high-res image
2. `jsPDF("p", "mm", "a4")` — creates A4 portrait PDF
3. Title "Coal Mining Shift Log" centered at top, date right-aligned
4. Image tiled across pages with pagination:
   ```js
   while (heightLeft >= 0) {
     pdf.addPage();
     pdf.addImage(imgData, "PNG", marginLeft, position, imgWidth, imgHeight);
     heightLeft -= pageHeight;
   }
   ```
5. `pdf.save()` — browser downloads the file locally

**Filename format:** `DDMMYYYYM.pdf` (e.g. `16122025M.pdf`)

> **Cloud upload is DISABLED.** Code still imports Storage SDK but `uploadBytes`/`getDownloadURL` calls are commented out. Was previously used to store PDFs in Firebase Storage for Android download links. Disabled because the free tier was removed.

### 7.7 Seeder Tool

**File:** `seed.html`

A standalone HTML page that inserts hardcoded demo shift data into Firestore. Used to populate the dashboard during demos without needing the Android app. Not part of the hosted Firebase Hosting public directory.

---

## 8. Android Application

### 8.1 Android File Structure

```
Androidapp/
+-- build.gradle.kts             # Root-level Gradle config
+-- settings.gradle.kts          # Project settings
+-- gradle.properties            # Gradle properties
+-- gradlew / gradlew.bat        # Gradle wrapper scripts
+-- Key.jks                      # Release keystore (signing key)
+-- app/
    +-- build.gradle.kts         # App-level build config (deps, SDK versions)
    +-- google-services.json     # Firebase Android config
    +-- proguard-rules.pro       # ProGuard rules
    +-- src/
        +-- main/
            +-- AndroidManifest.xml
            +-- ic_launcher-playstore.png
            +-- java/com/example/myapplication/
            |   +-- MainActivity.java        # Splash screen (entry point)
            |   +-- SignIn.java              # Login screen
            |   +-- Dashboard.java           # Main menu (4 cards)
            |   +-- DateTime.java            # Date + shift selector
            |   +-- CreateRepo.java          # Creates Firestore document
            |   +-- Overburden.java          # Overburden section menu
            |   +-- Shovel.java              # OB Excavator form
            |   +-- ShovelTemp.java          # OB Excavator temp holder
            |   +-- Tripper.java             # OB Tipper form
            |   +-- TripperTemp.java         # OB Tipper temp holder
            |   +-- Drill.java               # OB Drilling form
            |   +-- DrillTemp.java           # OB Drilling temp holder
            |   +-- Explosives.java          # OB Explosives form
            |   +-- ExplosiveTemp.java       # OB Explosives temp holder
            |   +-- CoalMined.java           # Coal Mining section menu
            |   +-- ShovelCoal.java          # Coal Excavator form
            |   +-- ShovelCoalTemp.java      # Coal Excavator temp holder
            |   +-- TripperCoal.java         # Coal Tipper form
            |   +-- TripperCoalTemp.java     # Coal Tipper temp holder
            |   +-- DrillCoal.java           # Coal Drilling form
            |   +-- DrillCoalTemp.java       # Coal Drilling temp holder
            |   +-- ExplosivesCoal.java      # Coal Explosives form
            |   +-- ExplosivesCoalTemp.java  # Coal Explosives temp holder
            |   +-- SurfaceMiner.java        # Surface Miner form
            |   +-- SufacemineCoalTemp.java  # Surface Miner temp holder
            |   +-- Washery.java             # Coal Washery form
            |   +-- WasheryTemp.java         # Washery temp holder
            |   +-- CoalDispatched.java      # Coal Dispatch form
            |   +-- CoalDispatchedTemp.java  # Dispatch temp holder
            |   +-- SecurityInst.java        # Security instructions screen
            |   +-- Datepdf.java             # Date selector for PDF view
            +-- res/
                +-- (layouts, drawables, values, menus, xml, etc.)
```

### 8.2 Activity Flow

```
App Launch
    |
    v
MainActivity (Splash — 3 second delay)
    |
    v
SignIn (Firebase Email/Password Auth)
    |  on success
    v
Dashboard (4 CardViews)
    |
    +---> [Create Report] ---> DateTime (Mode=Create)
    |                               |
    |                               v
    |                          CreateRepo (creates Firestore doc for date+shift)
    |                               |
    |                               v
    |                          Overburden ---> Shovel -> Tripper -> Drill -> Explosives
    |                               |
    |                               v
    |                          CoalMined ---> ShovelCoal -> TripperCoal -> DrillCoal
    |                               |          -> ExplosivesCoal -> SurfaceMiner
    |                               v
    |                          Washery ---> CoalDispatched
    |
    +---> [Edit Report] ----> DateTime (Mode=Edit)
    |                               |  (same flow, overwrites existing doc)
    |
    +---> [View PDF] -------> Datepdf (select date -> open PDF URL)
    |                          [Currently non-functional - Storage disabled]
    |
    +---> [Security] -------> SecurityInst (info screen)
```

### 8.3 All Activities (Screen-by-screen)

| Activity | Purpose |
|---|---|
| `MainActivity` | 3-second splash screen, then navigates to `SignIn` |
| `SignIn` | Firebase email/password login |
| `Dashboard` | 4-button menu: Create Report, View PDF, Edit Report, Security |
| `DateTime` | Pick date + shift; passes `Mode` intent extra (Create/Edit) |
| `CreateRepo` | Creates the Firestore document with document ID based on date+shift |
| `Overburden` | Sub-menu for overburden data entry sections |
| `Shovel` | Form: Overburden Excavator data entry |
| `ShovelTemp` | Temporary data holder between Shovel and next screen |
| `Tripper` | Form: Overburden Tipper/Dumper data entry |
| `TripperTemp` | Temporary holder |
| `Drill` | Form: Overburden Drilling data entry |
| `DrillTemp` | Temporary holder |
| `Explosives` | Form: Overburden Explosives data entry |
| `ExplosiveTemp` | Temporary holder |
| `CoalMined` | Sub-menu for coal mining data entry sections |
| `ShovelCoal` | Form: Coal Excavator data entry |
| `ShovelCoalTemp` | Temporary holder |
| `TripperCoal` | Form: Coal Tipper data entry |
| `TripperCoalTemp` | Temporary holder |
| `DrillCoal` | Form: Coal Drilling data entry |
| `DrillCoalTemp` | Temporary holder |
| `ExplosivesCoal` | Form: Coal Explosives data entry |
| `ExplosivesCoalTemp` | Temporary holder |
| `SurfaceMiner` | Form: Surface Miner data entry |
| `SufacemineCoalTemp` | Temporary holder |
| `Washery` | Form: Coal Washery data entry |
| `WasheryTemp` | Temporary holder |
| `CoalDispatched` | Form: Coal Dispatch data (Rail + Road) |
| `CoalDispatchedTemp` | Temporary holder |
| `SecurityInst` | Informational screen: security instructions |
| `Datepdf` | Date picker for viewing existing PDF (non-functional without Storage) |

> **Pattern note:** `*Temp` activities are intermediate screens that hold data in memory between form screens. Used to batch data before writing to Firestore in one go. Force-quitting the app mid-flow loses unsaved data.

### 8.4 Firebase Integration (Android)

Firebase is initialized via `google-services.json` and the Google Services Gradle plugin:

```kotlin
// build.gradle.kts (app level)
id("com.google.gms.google-services")

// Dependencies (via Firebase BOM 34.7.0):
implementation(platform("com.google.firebase:firebase-bom:34.7.0"))
implementation("com.google.firebase:firebase-analytics")
implementation("com.google.firebase:firebase-auth")
implementation("com.google.firebase:firebase-firestore")
implementation("com.google.firebase:firebase-storage")
```

Firestore writes happen when the user completes each form section. The document ID is constructed from the date + shift code selected in `DateTime.java`.

### 8.5 Data Entry Forms & Firestore Fields Written

Each form activity collects user input and writes the corresponding flat fields to the Firestore document. The full field reference is in Section 6.

The app uses `set()` or `update()` on the Firestore document — **no subcollections**. All data is at the root document level.

---

## 9. Document ID Convention

The Firestore document ID encodes both the date and the shift:

```
Format:  DDMMYYYYS
Example: 16122025M

DD    = day (zero-padded)      e.g. 16
MM    = month (zero-padded)    e.g. 12
YYYY  = year (4-digit)         e.g. 2025
S     = shift code             M = Morning
```

**Web implementation (JS):**

```js
const d = new Date();
const formattedDate =
  String(d.getDate()).padStart(2, "0") +
  String(d.getMonth() + 1).padStart(2, "0") +
  d.getFullYear() +
  "M";
// Result: "16122025M"
```

**Android:** Constructed in `DateTime.java` from user-selected date + shift choice.

> **Important:** The web dashboard currently always reads **today's date** with a hardcoded `"M"` suffix. There is no date or shift picker on the web side. The Android app supports selecting any date and any shift.

---

## 10. End-to-End Data Flow

```
STEP 1 — FIELD OPERATOR (Android App)
  Opens app -> Splash -> Sign In
  Dashboard -> "Create Report"
  Selects date: Dec 16 2025, Shift: Morning
    -> Document ID will be "16122025M"
  Works through all form screens:
    Overburden: Shovel -> Tripper -> Drill -> Explosives
    Coal Mining: Shovel -> Tripper -> Drill -> Explosives -> Surface Miner
    Washery -> Dispatch
  Each form section writes its fields to:
    Firestore > ShiftLog > "16122025M"

STEP 2 — FIREBASE FIRESTORE
  Document "16122025M" now contains ~50 flat fields
  Available in real-time; no caching layer between apps

STEP 3 — MANAGER (Web Dashboard)
  Opens web app -> Login
  Dashboard_page1.html loads
  chartConfig.js fetches Firestore doc "16122025M" (today + "M")
  4 KPI boxes + 7 Chart.js charts rendered from data

STEP 4 — GENERATE SHIFT LOG REPORT
  Manager navigates to Dashboard_page2.html
  Clicks "Generate Log"
  Dashboard_page2.js fetches same Firestore doc
  Handlebars compiles template -> renders structured tables
  Washery yield percentages calculated client-side

STEP 5 — EXPORT PDF
  Manager clicks "Generate PDF"
  GeneratePDF.js:
    html2canvas -> captures rendered tables -> high-res PNG image
    jsPDF -> creates A4 PDF with title and date header
    Paginates across multiple pages as needed
    pdf.save() -> browser downloads "16122025M.pdf" locally
```

---

## 11. Known Limitations & Trade-offs

| Limitation | Detail |
|---|---|
| **Not responsive** | Web UI designed for desktop/tablet only; no mobile layout |
| **No RBAC** | All logged-in users have identical access; no manager vs operator separation |
| **Basic Firestore rules** | Security rules not hardened; not production-safe |
| **Large PDF files** | html2canvas at scale:2 produces multi-MB PDFs |
| **No cloud PDF** | Firebase Storage free tier removed; PDFs download locally only. `Datepdf.java` on Android is non-functional |
| **Today-only on web** | Web reads only today's date with hardcoded "M"; no date/shift picker |
| **No backend validation** | All data comes directly from clients; no server-side validation |
| **One entry per section** | Data model supports only one machine/row per section per shift |
| **Single shift per document** | One document per date+shift; multi-shift aggregation not built |
| **No offline support** | Android requires internet; Firestore offline persistence not configured |
| **Temp activity data loss** | Force-quitting mid-flow loses all buffered form data |

---

## 12. Build & Run Instructions

### Web App

**Prerequisites:** Node.js 18+, Firebase CLI

```bash
cd web-app
npm install
firebase serve --only hosting   # local preview at localhost:5000
# or
firebase deploy                 # deploy to Firebase Hosting
```

**Without Firebase CLI (pure static):**

Just open `public/login.html` in any modern browser.
Firebase CDN ES module imports work without a build step.

**Seeder:**

```bash
open web-app/seed.html          # macOS
# or open directly in browser — it is NOT a hosted Firebase route
```

### Android App

**Prerequisites:** Android Studio, JDK 8+, Android SDK 34

1. Open `Androidapp/` folder in Android Studio
2. Verify `app/google-services.json` is present
3. Run on emulator or physical device (min API 24 / Android 7.0)

```bash
cd Androidapp

./gradlew assembleDebug          # debug APK
./gradlew assembleRelease        # release APK (requires Key.jks credentials)
```

**APK output:** `app/release/` directory

---

## 13. Team & Contributions

| Component | Contributor |
|---|---|
| Web Dashboard (analysis, PDF, Firebase integration) | Primary developer (Asim) |
| Android Application (all activities, data entry, Firebase writes) | **Sujal** |

Both applications share the same Firebase backend and data model. Built as a college hackathon team project.

---

## 14. License

**MIT License**

Do what you want with this code. If you reuse it, a short attribution is appreciated.

See `LICENSE` file for full details.

---

## Appendix: Key File Quick Reference

| File | Purpose |
|---|---|
| `web-app/firebase/firebase.js` | Firebase SDK init, exports auth / db / storage |
| `web-app/public/chartConfig.js` | Fetches Firestore, renders all Chart.js charts + KPI boxes |
| `web-app/public/Dashboard_page2.js` | Fetches Firestore, renders Handlebars shift log tables |
| `web-app/public/GeneratePDF.js` | html2canvas + jsPDF — local PDF download |
| `web-app/public/Dashboard_page1.html` | Analysis dashboard layout (canvas elements for 7 charts) |
| `web-app/public/Dashboard_page2.html` | Shift log layout + inline Handlebars template |
| `web-app/seed.html` | Demo data seeder (standalone, not hosted) |
| `Androidapp/app/build.gradle.kts` | Android dependencies — Firebase BOM 34.7.0 |
| `Androidapp/app/src/main/AndroidManifest.xml` | Declares all 20+ activities |
| `docs/architecture.png` | System architecture diagram |
| `docs/data-flow.png` | Data flow diagram |

---

*Documentation generated: October 2026 | Project: Black Gold Shift | Version: 1.0*

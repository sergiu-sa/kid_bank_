# KidBank – Financial Tool for Teens

## Project Overview

Kid Bank is a web-based financial application designed to help teenagers aged 14–18 manage money in a safe and responsible way. The app includes age-based restrictions for purchases and teaches basic financial literacy through real use scenarios.

This project was developed as part of a first-year team assignment at Noroff’s Front-End Development program. We worked collaboratively to define features, divide tasks, and deploy a functional MVP that integrates barcode scanning and product validation using the Open Food Facts API.

The application simulates a purchase process where teenagers can scan barcodes, check product eligibility based on age, and generate a QR code to complete a purchase.

---

## Links

- Live Site: [https://k1dbank.netlify.app](https://k1dbank.netlify.app)
- GitHub Repo: [https://github.com/sergiu-sa/kid_bank_](https://github.com/sergiu-sa/kid_bank_)

---

## Features

- Balance and transaction display
- Product scanning using barcode and camera (works in Chrome, Safari, and Firefox via a ZXing fallback when native `BarcodeDetector` is missing)
- Age-restricted product filtering
- Responsive design (custom CSS, mobile-first)
- Serverless function to bypass CORS for Open Food Facts API

---

## Tech Stack

- HTML, CSS, JavaScript (Vite)
- Node.js (Netlify Functions + Axios)
- Font Awesome, Google Fonts (Poppins), qrcodejs
- Open Food Facts API
- GitHub for version control

---

## My Role

In this team assignment, I was responsible for:

- Implementing the barcode scanner feature using the Open Food Facts API
- Creating a Node.js proxy server to overcome CORS/browser limitations
- Building the navigation
- Designing and coding the online shop layout
- Structuring the site and setting up the initial codebase in Vite

Team Members:

- Renate – Team Manager
- Thuba – Design Manager
- Hamad – Task Operator
- Sergiu Sarbu – Developer / Strategist

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A modern browser (Chrome, Safari, or Firefox — the scanner detects native `BarcodeDetector` support and falls back to a ZXing polyfill where missing).

### Install & run

```bash
git clone https://github.com/sergiu-sa/kid_bank_.git
cd kid_bank_
npm install
npm run dev
```

`npm run dev` runs Netlify Dev, which serves the Vite app **and** the Netlify Functions on the same port (default `http://localhost:8888`). No second terminal needed.

If you want Vite alone (no functions), use `npm run dev:vite`.

### Tests

```bash
npm test
```

Unit tests cover the pure modules (`cart`, `restrictedDetector`, `posCode` helpers, `money`). UI integration and platform APIs (camera, audio, vibration) are tested by hand.

### Architecture notes

- `index.html` (dashboard), `scanner.html`, and `checkout.html` are Vite multi-page entries; they share styles and modules.
- The scanner uses native `BarcodeDetector` where available and lazy-loads `@zxing/browser` as a polyfill on Firefox / older Safari.
- Restricted-product detection is structured-first: it checks Open Food Facts `categories_tags` and `labels_tags` before falling back to keyword matching (`src/data/restricted-keywords.json`).
- POS codes are issued by `netlify/functions/pos-code.js`, persisted in Netlify Blobs with a 60-second TTL, and resolved by the receipt page on any device. Locally without a linked Netlify site, the function falls back to an in-memory store so `npm run dev` works without setup.
- Open Food Facts requests go through `netlify/functions/barcode.js`, which wraps a small shared core in `src/server/openFoodFacts.js` (60s cache, trimmed DTO, typed errors).

## Usage

- Run the project using `npm run dev`
- Navigate to the homepage and click the "Scan" button
- Grant camera access
- Scan a barcode to fetch product details

### Local Storage

Transactions and savings goals are saved in your browser's `localStorage`. Any
new transactions you create or goals you add will remain available the next time
you open the app. Clearing browser data will remove this information.

---

## Deploying to Netlify

1. Install the Netlify CLI:

```bash
npm install -g netlify-cli
```

2.Build the project and deploy:

```bash
npm run build
netlify deploy --prod
```

---

## License

This project is open-source and available for educational use.

---

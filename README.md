# KidBank – Financial Tool for Teens

## Project Overview

Kid Bank is a web-based financial application designed to help teenagers aged 14–18 manage money in a safe and responsible way. The app includes age-based restrictions for purchases and teaches basic financial literacy through real use scenarios.

This project was developed as part of a first-year team assignment at Noroff’s Front-End Development program. We worked collaboratively to define features, divide tasks, and deploy a functional MVP that integrates barcode scanning and product validation using the Open Food Facts API.

The application simulates a purchase process where teenagers can scan barcodes, check product eligibility based on age, and generate a QR code to complete a purchase.

---

## Links

- Live Site: [https://kidbank.vercel.app](https://kidbank.vercel.app)
- GitHub Repo: [https://github.com/sergiu-sa/kid_bank_02](https://github.com/sergiu-sa/kid_bank_02)

---

## Features

- Balance and transaction display
- Product scanning using barcode and camera
- Age-restricted product filtering
- Responsive design using Bootstrap
- Serverless function to bypass CORS for Open Food Facts API

---

## Screenshot

![Kid Bank Screenshot](./assets/screenshots/kidbank-preview.png)  
_Replace with correct path if your screenshot is saved elsewhere._

---

## Tech Stack

- HTML, CSS, JavaScript (Vite)
- Node.js (Netlify Functions + Axios)
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

- Node.js v16 or higher
- Modern browser (Chrome recommended)

### Installation

```bash
git clone https://github.com/sergiu-sa/kid_bank_.git
cd kid_bank_02
npm install
npm run dev
```

In another terminal, start the local barcode proxy:

```bash
node proxy.js
```

The project will be available at `http://localhost:5173` by default.

## Serverless Barcode Function

The barcode lookup is handled by a Netlify Function in `netlify/functions/barcode.js`. When deployed, the scanner automatically calls `/.netlify/functions/barcode/<code>` instead of the local proxy.

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

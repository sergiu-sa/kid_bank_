# KidBank – Financial Tool for Teens

## Overview

KidBank is a responsive web-based financial app designed for teens aged 14–18. It allows users to manage their balance, view transaction history, and scan products before purchasing. Age-restricted items (like alcohol or energy drinks) are flagged and blocked.

Originally built as a team project, the code is now maintained and expanded by Sergiu Sarbu.

**Repository:** [github.com/sergiu-sa/kid_bank_02](https://github.com/sergiu-sa/kid_bank_.git)

---

## Features

- Balance and transaction display
- Product scanning using barcode and camera
- Age-restricted product filtering
- Responsive design using Bootstrap
- Serverless function to bypass CORS for Open Food Facts API

---

## Tech Stack

- HTML, CSS, JavaScript (Vite)
- Node.js (Netlify Functions + Axios)
- Open Food Facts API
- GitHub for version control

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

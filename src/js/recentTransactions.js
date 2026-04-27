// Recent transactions: source of truth for the dashboard list.
// Other modules (main.js) call addTransaction() to add new entries
// and the list re-renders from the in-memory array.

const transactionsContainerElement = document.querySelector("#js-transactions");
const STORAGE_KEY = "transactions";
const STORAGE_VERSION_KEY = "transactionsVersion";
const SEED_VERSION = "2"; // bump to re-seed users from transactions.json

let products = [];
let userAge = null;

if (transactionsContainerElement) {
  setup();
}

async function setup() {
  await fetchUserAge();
  await getProducts();
  renderProducts();
}

async function fetchUserAge() {
  try {
    const response = await fetch("userInfo.json");
    if (!response.ok) throw new Error("Failed to load user data.");
    const userData = await response.json();
    userAge = userData.age;
  } catch (error) {
    console.warn("Failed to load user data:", error);
  }
}

async function getProducts() {
  const stored = loadStoredTransactions();
  const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);

  if (stored && storedVersion === SEED_VERSION) {
    products = stored;
    return;
  }

  try {
    const response = await fetch("transactions.json");
    if (!response.ok) throw new Error("Failed to load transactions.");
    products = await response.json();
    saveTransactions(products);
    localStorage.setItem(STORAGE_VERSION_KEY, SEED_VERSION);
  } catch (error) {
    console.warn("Failed to load transactions:", error);
    products = stored || [];
  }
}

function loadStoredTransactions() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function saveTransactions(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function renderProducts() {
  if (!transactionsContainerElement) return;

  if (!products || products.length === 0) {
    transactionsContainerElement.innerHTML = "<p>No transactions available.</p>";
    return;
  }

  transactionsContainerElement.innerHTML = "";
  products.forEach((product) => {
    transactionsContainerElement.appendChild(buildTransactionCard(product));
  });
}

function buildTransactionCard(product) {
  const card = document.createElement("article");
  card.className = "transaction-card";

  const iconHtml = sortIcon(product);
  if (iconHtml) {
    const iconWrapper = document.createElement("div");
    iconWrapper.innerHTML = iconHtml;
    card.appendChild(iconWrapper.firstElementChild);
  }

  const info = document.createElement("div");
  info.className = "transaction-info";
  const title = document.createElement("h3");
  title.textContent = product.title ?? "";
  const description = document.createElement("p");
  description.textContent = product.description ?? "";
  info.appendChild(title);
  info.appendChild(description);
  card.appendChild(info);

  const amountWrapper = document.createElement("div");
  amountWrapper.className = "transaction-amount";
  if (product.positive) {
    amountWrapper.classList.add("positive");
  }

  const amount = document.createElement("p");
  amount.className = "amount-spent";
  amount.textContent = formatAmount(product);
  const date = document.createElement("p");
  date.className = "transaction-date";
  date.textContent = product.date ?? "";
  amountWrapper.appendChild(amount);
  amountWrapper.appendChild(date);
  card.appendChild(amountWrapper);

  return card;
}

function formatAmount(product) {
  const symbol = product.currencySymbol || "$";
  const numeric = Number(product.amount);
  if (Number.isNaN(numeric)) return String(product.amount ?? "");
  const sign = product.positive ? "+" : "-";
  return `${sign}${symbol}${Math.abs(numeric).toFixed(2)}`;
}

function sortIcon(product) {
  if (!product || !product.category || userAge === null) return "";

  if (userAge < (product.ageLimit ?? 0)) {
    return `
    <div class="transaction-icon restricted" style="background-color: #ee9b00;">
      <i class="fa-solid fa-circle-exclamation"></i>
    </div>`;
  }

  const iconType = {
    refreshments: "fa-burger",
    gift: "fa-gift",
    clothing: "fa-shirt",
    savings: "fa-piggy-bank",
    restricted: "fa-circle-exclamation",
  };

  const icon = iconType[product.category] || "fa-receipt";
  return `
    <div class="transaction-icon ${product.category}">
      <i class="fa-solid ${icon}"></i>
    </div>`;
}

// Public API used by main.js
export function addTransaction(entry) {
  products.unshift(entry);
  saveTransactions(products);
  renderProducts();
}

export function getCurrentTransactions() {
  return products.slice();
}

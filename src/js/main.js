// DOM Elements
import { addTransaction as pushTransaction } from "./recentTransactions.js";

const sidebar = document.getElementById("sidebar");
const toggleButton = document.getElementById("toggleSidebar");
const taskCards = document.querySelectorAll(".task-card");

// Navigation: sidebar collapse toggle (desktop only)
if (sidebar && window.innerWidth > 768) {
  sidebar.classList.remove("collapsed");
}

if (toggleButton && sidebar) {
  toggleButton.addEventListener("click", () => {
    if (window.innerWidth > 768) {
      sidebar.classList.toggle("collapsed");
      const icon = toggleButton.querySelector(".toggle-icon");
      if (icon) icon.classList.toggle("rotated");
    }
  });
}

window.addEventListener("resize", () => {
  if (sidebar && window.innerWidth <= 768) {
    sidebar.classList.remove("collapsed");
  }
});

//ONLINE SHOP SECTION
document.addEventListener("DOMContentLoaded", () => {
  const shopIframe = document.getElementById("shopIframe");
  const previewLoader = document.getElementById("previewLoader");
  const widgetContainer = document.getElementById("widgetContainer");
  const shopList = document.getElementById("shopList");
  const shopUrlInput = document.getElementById("shopUrlInput");
  const addShopButton = document.getElementById("addShopButton");
  const shopPreviewArea = document.getElementById("shopPreviewArea");
  const closePreviewBtn = document.getElementById("closePreviewBtn");
  const shopFallbackMessage = document.getElementById("shopFallbackMessage");

  function openShop(url, isWidget = false) {
    previewLoader.style.display = "block";
    shopFallbackMessage.style.display = "none";
    shopPreviewArea.classList.add("active");
    shopPreviewArea.scrollIntoView({ behavior: "smooth" });

    if (isWidget) {
      shopIframe.style.display = "none";
      shopIframe.src = "";
      widgetContainer.style.display = "block";
      previewLoader.style.display = "none";
      return;
    }

    widgetContainer.style.display = "none";
    shopIframe.style.display = "block";
    shopIframe.src = url;

    let fallbackTimer = setTimeout(() => {
      previewLoader.style.display = "none";
      shopFallbackMessage.style.display = "block";
      shopIframe.style.display = "none";
      window.open(url, "_blank");
    }, 4000);

    shopIframe.onload = () => {
      clearTimeout(fallbackTimer);
      previewLoader.style.display = "none";
    };
  }

  closePreviewBtn.addEventListener("click", () => {
    shopPreviewArea.classList.remove("active");
    shopIframe.src = "";
    widgetContainer.style.display = "none";
    shopIframe.style.display = "none";
    shopFallbackMessage.style.display = "none";
  });

  function attachClick(button) {
    if (button.dataset.widget === "elfsight") {
      button.addEventListener("click", () => openShop("", true));
    } else {
      button.addEventListener("click", () => openShop(button.dataset.url));
    }
  }

  function attachDelete(button) {
    const deleteBtn = button.querySelector(".remove-shop-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        button.remove();
        saveFavorites();
      });
    }
  }

  document.querySelectorAll(".shop-card").forEach(attachClick);

  addShopButton.addEventListener("click", () => {
    const url = shopUrlInput.value.trim();
    if (!url.startsWith("http")) {
      alert("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    const shopButton = document.createElement("button");
    shopButton.classList.add("shop-card");
    shopButton.dataset.url = url;
    shopButton.innerHTML = `<i class="fa-solid fa-globe"></i> ${
      new URL(url).hostname
    } <button class="remove-shop-btn">&times;</button>`;

    attachClick(shopButton);
    attachDelete(shopButton);

    shopList.appendChild(shopButton);
    shopUrlInput.value = "";

    saveFavorites();
  });

  function saveFavorites() {
    const shops = Array.from(shopList.querySelectorAll(".shop-card"))
      .filter((btn) => !btn.dataset.default)
      .map((btn) => btn.dataset.url);
    localStorage.setItem("favoriteShops", JSON.stringify(shops));
  }

  function loadFavorites() {
    const savedShops = JSON.parse(
      localStorage.getItem("favoriteShops") || "[]"
    );
    savedShops.forEach((url) => {
      const shopButton = document.createElement("button");
      shopButton.classList.add("shop-card");
      shopButton.dataset.url = url;
      shopButton.innerHTML = `<i class="fa-solid fa-globe"></i> ${
        new URL(url).hostname
      } <button class="remove-shop-btn">&times;</button>`;
      attachClick(shopButton);
      attachDelete(shopButton);
      shopList.appendChild(shopButton);
    });
  }

  loadFavorites();
});

// Show notification function
function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
        <p>${message}</p>
        <span class="notification-close">&times;</span>
    `;

  // Add to body
  document.body.appendChild(notification);

  // Add styles dynamically
  notification.style.position = "fixed";
  notification.style.bottom = "80px";
  notification.style.right = "20px";
  notification.style.padding = "15px 20px";
  notification.style.borderRadius = "10px";
  notification.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
  notification.style.zIndex = "9999";
  notification.style.minWidth = "250px";
  notification.style.display = "flex";
  notification.style.justifyContent = "space-between";
  notification.style.alignItems = "center";

  if (type === "success") {
    notification.style.backgroundColor = "#005F73";
    notification.style.color = "white";
  } else if (type === "error") {
    notification.style.backgroundColor = "#002432";
    notification.style.color = "white";
  } else {
    notification.style.backgroundColor = "#94D2BD";
    notification.style.color = "white";
  }

  // Add close functionality
  const closeNotification = notification.querySelector(".notification-close");
  closeNotification.style.cursor = "pointer";
  closeNotification.style.marginLeft = "10px";
  closeNotification.style.fontSize = "1.2rem";

  closeNotification.addEventListener("click", () => {
    document.body.removeChild(notification);
  });

  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  }, 3000);
}

// Read the current balance from the dashboard's balance node.
function readBalance() {
  const el = document.getElementById("re_balance");
  if (!el) return { value: 0, element: null };
  const numeric = parseFloat(el.textContent.replace(/[^\d.-]/g, ""));
  return { value: Number.isFinite(numeric) ? numeric : 0, element: el };
}

const scanLink = document.getElementById('scanLink')
if (scanLink) {
  scanLink.addEventListener('click', () => {
    const { value } = readBalance()
    sessionStorage.setItem('kb.balance', String(value))
  })
}

// Update balance — animates from current to current+amount.
function updateBalance(amount) {
  const { value: current, element } = readBalance();
  if (!element) return;
  const delta = parseFloat(amount);
  if (!Number.isFinite(delta)) return;
  animateBalance(element, current, current + delta, 500);
}

function animateBalance(element, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = progress * (end - start) + start;
    element.textContent = `$${value.toFixed(2)}`;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Add CSS for fade-in animation
const style = document.createElement("style");
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// Handle add money button
document
  .querySelector(".action-btn.add-money")
  .addEventListener("click", () => {
    // Create a modal for adding money
    const addMoneyModal = document.createElement("div");
    addMoneyModal.className = "modal";
    addMoneyModal.style.display = "flex";

    addMoneyModal.innerHTML = `
        <div class="modal-content">
            <span class="close-add-modal">&times;</span>
            <div class="modal-icon" style="background-color: #94D2BD;">
                <i class="fas fa-wallet"></i>
            </div>
            <h2>Add Money</h2>
            <p>Ask a parent or guardian to add money to your account.</p>
            <div class="amount-options">
                <button class="amount-option" data-amount="10">$10</button>
                <button class="amount-option" data-amount="20">$20</button>
                <button class="amount-option" data-amount="50">$50</button>
                <button class="amount-option" data-amount="100">$100</button>
            </div>
            <div class="custom-amount">
                <p>Or enter custom amount:</p>
                <input type="number" id="customAmount" placeholder="$0.00" min="1" max="500">
            </div>
            <button class="modal-btn add-money-btn">Request Money</button>
        </div>
    `;

    document.body.appendChild(addMoneyModal);

    // Style the modal elements
    const amountOptions = addMoneyModal.querySelectorAll(".amount-option");
    const amountOptionsContainer =
      addMoneyModal.querySelector(".amount-options");
    const customAmountContainer = addMoneyModal.querySelector(".custom-amount");
    const customAmountInput = addMoneyModal.querySelector("#customAmount");

    // Style amount options
    amountOptionsContainer.style.display = "grid";
    amountOptionsContainer.style.gridTemplateColumns = "repeat(2, 1fr)";
    amountOptionsContainer.style.gap = "10px";
    amountOptionsContainer.style.margin = "15px 0";

    amountOptions.forEach((option) => {
      option.style.padding = "10px";
      option.style.border = "2px solid #EE9B00";
      option.style.borderRadius = "8px";
      option.style.background = "none";
      option.style.color = "#EE9B00";
      option.style.fontWeight = "500";
      option.style.cursor = "pointer";
      option.style.transition = "all 0.2s ease";

      option.addEventListener("mouseover", () => {
        option.style.backgroundColor = "#EE9B00";
        option.style.color = "white";
      });

      option.addEventListener("mouseout", () => {
        option.style.backgroundColor = "transparent";
        option.style.color = "#EE9B00";
      });

      option.addEventListener("click", () => {
        const amount = option.getAttribute("data-amount");
        customAmountInput.value = amount;
      });
    });

    // Style custom amount container
    customAmountContainer.style.margin = "15px 0";
    customAmountContainer.style.textAlign = "left";

    customAmountInput.style.width = "100%";
    customAmountInput.style.padding = "10px";
    customAmountInput.style.borderRadius = "8px";
    customAmountInput.style.border = "1px solid #ddd";
    customAmountInput.style.marginTop = "5px";

    // Close modal functionality
    const closeAddModal = addMoneyModal.querySelector(".close-add-modal");
    closeAddModal.addEventListener("click", () => {
      document.body.removeChild(addMoneyModal);
    });

    // Close when clicking outside
    addMoneyModal.addEventListener("click", (e) => {
      if (e.target === addMoneyModal) {
        document.body.removeChild(addMoneyModal);
      }
    });

    // Add money button functionality
    const addMoneyBtn = addMoneyModal.querySelector(".add-money-btn");
    addMoneyBtn.addEventListener("click", () => {
      const amount = customAmountInput.value;

      if (!amount || isNaN(amount) || amount <= 0) {
        showNotification("Please enter a valid amount", "error");
        return;
      }

      // Remove modal
      document.body.removeChild(addMoneyModal);

      // Show notification
      showNotification("Money request sent to parent!", "success");

      // Simulate parent approval after 3 seconds
      setTimeout(() => {
        showNotification("Your parent approved your request!", "success");

        pushTransaction({
          title: "Money Added",
          description: "From Parent",
          category: "gift",
          amount: parseFloat(amount),
          date: new Date().toISOString().split("T")[0],
          ageLimit: 0,
          positive: true,
        });

        updateBalance(amount);
      }, 3000);
    });
  });

// Savings goal tracker functionality
document.querySelector(".add-goal").addEventListener("click", () => {
  // Create modal for adding a savings goal
  const addGoalModal = document.createElement("div");
  addGoalModal.className = "modal";
  addGoalModal.style.display = "flex";

  addGoalModal.innerHTML = `
        <div class="modal-content">
            <span class="close-goal-modal">&times;</span>
            <div class="modal-icon" style="background-color: #94D2BD;">
                <i class="fas fa-piggy-bank"></i>
            </div>
            <h2>Add Savings Goal</h2>
            <form id="goalForm">
                <div class="form-group">
                    <label for="goalName">What are you saving for?</label>
                    <input type="text" id="goalName" required placeholder="e.g. New Headphones">
                </div>
                <div class="form-group">
                    <label for="goalAmount">How much do you need to save?</label>
                    <input type="number" id="goalAmount" required min="1" placeholder="$0.00">
                </div>
                <div class="form-group">
                    <label for="goalIcon">Choose an icon</label>
                    <div class="icon-options">
                        <div class="icon-option selected" data-icon="fas fa-gamepad">
                            <i class="fas fa-gamepad"></i>
                        </div>
                        <div class="icon-option" data-icon="fas fa-laptop">
                            <i class="fas fa-laptop"></i>
                        </div>
                        <div class="icon-option" data-icon="fas fa-tshirt">
                            <i class="fas fa-tshirt"></i>
                        </div>
                        <div class="icon-option" data-icon="fas fa-plane">
                            <i class="fas fa-plane"></i>
                        </div>
                        <div class="icon-option" data-icon="fas fa-headphones">
                            <i class="fas fa-headphones"></i>
                        </div>
                        <div class="icon-option" data-icon="fas fa-bicycle">
                            <i class="fas fa-bicycle"></i>
                        </div>
                    </div>
                    <input type="hidden" id="goalIcon" value="fas fa-gamepad">
                </div>
                <button type="submit" class="modal-btn">Create Goal</button>
            </form>
        </div>
    `;

  document.body.appendChild(addGoalModal);

  // Style form elements
  const form = addGoalModal.querySelector("#goalForm");
  const formGroups = addGoalModal.querySelectorAll(".form-group");
  const inputs = addGoalModal.querySelectorAll('input:not([type="hidden"])');
  const labels = addGoalModal.querySelectorAll("label");
  const iconOptions = addGoalModal.querySelectorAll(".icon-option");
  const iconOptionsContainer = addGoalModal.querySelector(".icon-options");

  // Style form groups
  formGroups.forEach((group) => {
    group.style.marginBottom = "20px";
    group.style.textAlign = "left";
  });

  // Style labels
  labels.forEach((label) => {
    label.style.display = "block";
    label.style.marginBottom = "5px";
    label.style.fontWeight = "500";
  });

  // Style inputs
  inputs.forEach((input) => {
    input.style.width = "100%";
    input.style.padding = "10px";
    input.style.borderRadius = "8px";
    input.style.border = "1px solid #ddd";
  });

  // Style icon options
  iconOptionsContainer.style.display = "grid";
  iconOptionsContainer.style.gridTemplateColumns = "repeat(3, 1fr)";
  iconOptionsContainer.style.gap = "10px";
  iconOptionsContainer.style.marginTop = "10px";

  iconOptions.forEach((option) => {
    option.style.display = "flex";
    option.style.alignItems = "center";
    option.style.justifyContent = "center";
    option.style.width = "100%";
    option.style.height = "50px";
    option.style.backgroundColor = "#f8f9fa";
    option.style.borderRadius = "8px";
    option.style.cursor = "pointer";
    option.style.fontSize = "1.3rem";
    option.style.color = "#666";

    if (option.classList.contains("selected")) {
      option.style.backgroundColor = "#EE9B00";
      option.style.color = "white";
    }

    option.addEventListener("click", () => {
      // Remove selected class from all options
      iconOptions.forEach((opt) => {
        opt.classList.remove("selected");
        opt.style.backgroundColor = "#f8f9fa";
        opt.style.color = "#666";
      });

      // Add selected class to clicked option
      option.classList.add("selected");
      option.style.backgroundColor = "#EE9B00";
      option.style.color = "white";

      // Update hidden input
      document.getElementById("goalIcon").value =
        option.getAttribute("data-icon");
    });
  });

  // Close modal functionality
  const closeGoalModal = addGoalModal.querySelector(".close-goal-modal");
  closeGoalModal.addEventListener("click", () => {
    document.body.removeChild(addGoalModal);
  });

  // Close when clicking outside
  addGoalModal.addEventListener("click", (e) => {
    if (e.target === addGoalModal) {
      document.body.removeChild(addGoalModal);
    }
  });

  // Form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const goalName = document.getElementById("goalName").value;
    const goalAmount = document.getElementById("goalAmount").value;
    const goalIcon = document.getElementById("goalIcon").value;

    if (!goalName || !goalAmount || isNaN(goalAmount) || goalAmount <= 0) {
      showNotification("Please fill out all fields correctly", "error");
      return;
    }

    // Add the new goal to the goals list
    addSavingsGoal(goalName, goalAmount, goalIcon);

    // Remove modal
    document.body.removeChild(addGoalModal);

    // Show notification
    showNotification("New savings goal created!", "success");
  });
});

// Function to add a new savings goal
function addSavingsGoal(name, targetAmount, iconClass, savedAmount = 0, save = true) {
  const goalsList = document.querySelector(".goals-list");
  if (!goalsList) return;

  const newGoal = document.createElement("div");
  newGoal.className = "goal-card";
  const percentage = Math.min((savedAmount / targetAmount) * 100, 100);

  // Build with DOM APIs so user-entered `name` can't inject HTML.
  const iconWrap = document.createElement("div");
  iconWrap.className = "goal-icon";
  const iconEl = document.createElement("i");
  iconEl.className = iconClass; // iconClass comes from a fixed picker
  iconWrap.appendChild(iconEl);

  const info = document.createElement("div");
  info.className = "goal-info";

  const heading = document.createElement("h3");
  heading.textContent = name;

  const progressBar = document.createElement("div");
  progressBar.className = "progress-bar";
  const progressFill = document.createElement("div");
  progressFill.className = "progress";
  progressFill.style.width = `${percentage}%`;
  progressBar.appendChild(progressFill);

  const summary = document.createElement("p");
  summary.textContent = `$${parseFloat(savedAmount).toFixed(2)} `;
  const ofTarget = document.createElement("span");
  ofTarget.className = "of-target";
  ofTarget.textContent = `of $${parseFloat(targetAmount).toFixed(2)}`;
  summary.appendChild(ofTarget);

  info.appendChild(heading);
  info.appendChild(progressBar);
  info.appendChild(summary);

  newGoal.appendChild(iconWrap);
  newGoal.appendChild(info);
  goalsList.appendChild(newGoal);

  if (save) {
    const storedGoals = JSON.parse(localStorage.getItem("goals") || "[]");
    storedGoals.push({
      name,
      targetAmount: parseFloat(targetAmount),
      iconClass,
      savedAmount: parseFloat(savedAmount),
    });
    localStorage.setItem("goals", JSON.stringify(storedGoals));
  }

  // Add click event to the goal card to add money to it
  newGoal.addEventListener("click", () => {
    showAddToGoalModal(name, savedAmount, targetAmount, newGoal);
  });
}

function loadSavedGoals() {
  const saved = JSON.parse(localStorage.getItem("goals") || "[]");
  saved.forEach((goal) => {
    addSavingsGoal(
      goal.name,
      goal.targetAmount,
      goal.iconClass,
      goal.savedAmount,
      false
    );
  });
}

// Function to show modal for adding money to a goal
function showAddToGoalModal(
  goalName,
  currentAmount,
  targetAmount,
  goalElement
) {
  const addToGoalModal = document.createElement("div");
  addToGoalModal.className = "modal";
  addToGoalModal.style.display = "flex";

  addToGoalModal.innerHTML = `
        <div class="modal-content">
            <span class="close-add-to-goal-modal">&times;</span>
            <div class="modal-icon" style="background-color: #EE9B00;">
                <i class="fas fa-piggy-bank"></i>
            </div>
            <h2></h2>
            <p class="goal-progress-line"></p>
            <div class="form-group">
                <label for="addAmount">How much would you like to add?</label>
                <input type="number" id="addAmount" required min="1" max="${
                  parseFloat(targetAmount) - currentAmount
                }" placeholder="$0.00">
            </div>
            <button class="modal-btn add-to-goal-btn">Add to Goal</button>
        </div>
    `;

  // Set user-controlled text via textContent (prevents XSS via goal name).
  addToGoalModal.querySelector("h2").textContent = `Add to "${goalName}"`;
  addToGoalModal.querySelector(".goal-progress-line").textContent =
    `Current progress: $${currentAmount.toFixed(2)} of $${parseFloat(targetAmount).toFixed(2)}`;

  document.body.appendChild(addToGoalModal);

  // Style elements
  const input = addToGoalModal.querySelector("#addAmount");
  const formGroup = addToGoalModal.querySelector(".form-group");
  const label = addToGoalModal.querySelector("label");

  formGroup.style.marginBottom = "20px";
  formGroup.style.textAlign = "left";

  label.style.display = "block";
  label.style.marginBottom = "5px";
  label.style.fontWeight = "500";

  input.style.width = "100%";
  input.style.padding = "10px";
  input.style.borderRadius = "8px";
  input.style.border = "1px solid #ddd";

  // Close modal functionality
  const closeAddToGoalModal = addToGoalModal.querySelector(
    ".close-add-to-goal-modal"
  );
  closeAddToGoalModal.addEventListener("click", () => {
    document.body.removeChild(addToGoalModal);
  });

  // Close when clicking outside
  addToGoalModal.addEventListener("click", (e) => {
    if (e.target === addToGoalModal) {
      document.body.removeChild(addToGoalModal);
    }
  });

  // Add to goal button functionality
  const addToGoalBtn = addToGoalModal.querySelector(".add-to-goal-btn");
  addToGoalBtn.addEventListener("click", () => {
    const amount = parseFloat(document.getElementById("addAmount").value);

    if (
      !amount ||
      isNaN(amount) ||
      amount <= 0 ||
      amount > parseFloat(targetAmount) - currentAmount
    ) {
      showNotification("Please enter a valid amount", "error");
      return;
    }

    // Get current balance
    const { value: currentBalance } = readBalance();

    if (amount > currentBalance) {
      showNotification("You don't have enough money in your balance", "error");
      return;
    }

    // Update the goal
    const newAmount = currentAmount + amount;
    const percentage = (newAmount / targetAmount) * 100;

    // Update the goal element
    const progressBar = goalElement.querySelector(".progress");
    const amountText = goalElement.querySelector(".goal-info p");

    progressBar.style.width = `${percentage}%`;
    amountText.innerHTML = `$${newAmount.toFixed(
      2
    )} <span class="of-target">of $${parseFloat(targetAmount).toFixed(
      2
    )}</span>`;

    // Persist updated goal
    const storedGoals = JSON.parse(localStorage.getItem("goals") || "[]");
    const goalIdx = storedGoals.findIndex((g) => g.name === goalName);
    if (goalIdx !== -1) {
      storedGoals[goalIdx].savedAmount = newAmount;
      localStorage.setItem("goals", JSON.stringify(storedGoals));
    }

    // Update balance
    updateBalance(-amount);

    // Remove modal
    document.body.removeChild(addToGoalModal);

    // Show notification
    showNotification(
      `Added $${amount.toFixed(2)} to your ${goalName} goal!`,
      "success"
    );

    pushTransaction({
      title: `Savings: ${goalName}`,
      description: "Money added to goal",
      category: "savings",
      amount: amount,
      date: new Date().toISOString().split("T")[0],
      ageLimit: 0,
    });
  });
}

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  loadSavedGoals();
});

// Footer member popup
const memberPopup = document.getElementById("pop-up-member");

function showMember(image, name, role, github) {
  if (!memberPopup) return;
  const img = document.getElementById("memberImage");
  if (img) img.src = image;
  const nameEl = document.getElementById("memberName");
  if (nameEl) nameEl.textContent = name;
  const roleEl = document.getElementById("memberRole");
  if (roleEl) roleEl.textContent = role;
  const githubEl = document.getElementById("memberGithub");
  if (githubEl) {
    githubEl.href = github;
    githubEl.textContent = ` ${github}`;
  }
  memberPopup.style.display = "block";
}

document.querySelectorAll(".member-link").forEach((el) => {
  el.addEventListener("click", () => {
    showMember(
      el.dataset.image,
      el.dataset.name,
      el.dataset.role,
      el.dataset.github
    );
  });
});

const memberCloseBtn = document.getElementById("close-btn");
if (memberCloseBtn && memberPopup) {
  memberCloseBtn.addEventListener("click", () => {
    memberPopup.style.display = "none";
  });
}

window.addEventListener("click", (event) => {
  if (memberPopup && event.target === memberPopup) {
    memberPopup.style.display = "none";
  }
});

// Assign Tasks — credit only when the checkbox is ticked.
taskCards.forEach((task) => {
  const checkbox = task.querySelector('input[type="checkbox"]');
  if (!checkbox) return;

  checkbox.addEventListener("change", () => {
    if (!checkbox.checked) return;

    const amountText = task.querySelector(".amount")?.textContent ?? "";
    const taskAmount = parseFloat(amountText.replace(/[^\d.-]/g, ""));
    if (Number.isFinite(taskAmount)) {
      updateBalance(taskAmount);
    }

    setTimeout(() => {
      task.remove();
    }, 1000);
  });
});
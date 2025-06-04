document.addEventListener("DOMContentLoaded", function () {
  // Toggle between Kid Login and Parent Login
  const toggleButtons = document.querySelectorAll(".toggle-btn");
  const formSections = document.querySelectorAll(".form-section");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      toggleButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      // Hide all forms and show the selected one
      const target = this.getAttribute("data-target");
      formSections.forEach((section) => {
        section.classList.remove("active");
      });
      document.getElementById(target).classList.add("active");
    });
  });

  // Registration Pop-up Handling
  const registrationPop = document.getElementById("registration-pop");
  const closePop = document.querySelector(".close-pop");

  document
    .getElementById("kid-register-link")
    .addEventListener("click", function (event) {
      event.preventDefault();
      openRegistrationPopup("kid");
    });

  document
    .getElementById("parent-register-link")
    .addEventListener("click", function (event) {
      event.preventDefault();
      openRegistrationPopup("parent");
    });

  closePop.addEventListener("click", function () {
    registrationPop.style.display = "none";
  });

  function openRegistrationPopup(type) {
    registrationPop.style.display = "flex";

    if (type === "kid") {
      document.getElementById("pop-title").innerText = "Create Kid Account";
      document.getElementById("email-label").style.display = "none";
      document.getElementById("register-email").style.display = "none";
    } else {
      document.getElementById("pop-title").innerText = "Create Parent Account";
      document.getElementById("email-label").style.display = "block";
      document.getElementById("register-email").style.display = "block";
    }
  }

  // Form Validation
  function validateKidLogin() {
    const username = document.getElementById("kid-username").value.trim();
    const password = document.getElementById("kid-password").value.trim();
    let valid = true;

    document.getElementById("kid-username-error").style.display =
      username.length >= 3 ? "none" : "block";
    document.getElementById("kid-password-error").style.display =
      password.length >= 6 ? "none" : "block";

    if (username.length < 3 || password.length < 6) {
      valid = false;
    }

    return valid;
  }

  function validateParentLogin() {
    const email = document.getElementById("parent-email").value.trim();
    const password = document.getElementById("parent-password").value.trim();
    let valid = true;

    document.getElementById("parent-email-error").style.display =
      /\S+@\S+\.\S+/.test(email) ? "none" : "block";
    document.getElementById("parent-password-error").style.display =
      password.length >= 8 ? "none" : "block";

    if (!/\S+@\S+\.\S+/.test(email) || password.length < 8) {
      valid = false;
    }

    return valid;
  }

  function validateRegistrationForm() {
    const username = document.getElementById("register-username").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value.trim();
    const confirmPassword = document
      .getElementById("register-confirm-password")
      .value.trim();

    let valid = true;

    document.getElementById("register-username-error").style.display =
      username.length >= 3 ? "none" : "block";
    document.getElementById("register-email-error").style.display =
      email && !/\S+@\S+\.\S+/.test(email) ? "block" : "none";
    document.getElementById("register-password-error").style.display =
      password.length >= 6 ? "none" : "block";
    document.getElementById("register-confirm-password-error").style.display =
      password === confirmPassword ? "none" : "block";

    if (
      username.length < 3 ||
      email && !/\S+@\S+\.\S+/.test(email) ||
      password.length < 6 ||
      password !== confirmPassword
    ) {
      valid = false;
    }

    return valid;
  }

  // Event Listeners for Form Submissions
  document
    .getElementById("kid-login-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      if (validateKidLogin()) {
        alert("Kid Login Successful!");
        this.reset();
      }
    });

  document
    .getElementById("parent-login-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      if (validateParentLogin()) {
        alert("Parent Login Successful!");
        this.reset();
      }
    });

  document
    .getElementById("registration-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      if (validateRegistrationForm()) {
        alert("Registration Successful!");
        registrationPop.style.display = "none";
        this.reset();
      }
    });

  // Close pop-up if user clicks outside of it
  window.addEventListener("click", function (event) {
    if (event.target === registrationPop) {
      registrationPop.style.display = "none";
    }
  });
});

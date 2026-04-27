// Renate - Hero balance show/hide toggle
const balanceBlur = document.getElementById("blurred-currency");
const eyeButton = document.querySelector(".card-icon");

if (balanceBlur && eyeButton) {
  const eyeIcon = eyeButton.querySelector("i");
  let isBlurred = false;

  eyeButton.addEventListener("click", () => {
    isBlurred = !isBlurred;
    balanceBlur.style.filter = isBlurred ? "blur(1.5rem)" : "none";
    if (eyeIcon) {
      eyeIcon.classList.toggle("fa-eye");
      eyeIcon.classList.toggle("fa-eye-slash");
    }
  });
}

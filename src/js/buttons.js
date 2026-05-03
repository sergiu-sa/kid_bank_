import { renderIcons } from "./shared/icons.js"

// Hero balance show/hide toggle
const balanceBlur = document.getElementById("blurred-currency")
const eyeButton = document.querySelector(".card-icon")

if (balanceBlur && eyeButton) {
  const eyeIcon = eyeButton.querySelector(".icon")
  let isBlurred = false

  eyeButton.addEventListener("click", () => {
    isBlurred = !isBlurred
    balanceBlur.style.filter = isBlurred ? "blur(1.5rem)" : "none"
    if (eyeIcon) {
      eyeIcon.dataset.icon = isBlurred ? "eye-slash" : "eye"
      eyeIcon.removeAttribute("data-icon-rendered")
      renderIcons(eyeIcon.parentElement)
    }
  })
}

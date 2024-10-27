const form = document.querySelector("#reviewUpdate")
form.addEventListener("change", function () {
  const updateBtn = document.querySelector("button")
  updateBtn.removeAttribute("disabled")
})
const form1 = document.querySelector("#updateForm")
form1.addEventListener("change", function () {
  const updateBtn = document.querySelector("#updateButton")
  updateBtn.removeAttribute("disabled")
})

const form2 = document.querySelector("#passwordForm")
form2.addEventListener("change", function () {
  const updateBtn = document.querySelector("#passwordButton")
  updateBtn.removeAttribute("disabled")
})
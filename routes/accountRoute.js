// Needed Resources 
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const validate = require('../utilities/account-validation')

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));
// Route to build register view
router.get("/register", utilities.handleErrors(accountController.buildRegister));
// Process the login attempt
router.post(
  "/login",
  validate.loginRules(),
  validate.checkLoginData,
  accountController.processLogin
)
// Process the registration data
router.post(
  "/register",
  validate.registrationRules(),
  validate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

module.exports = router;
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
// Route to build register view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountView));
// Route to build management view
router.get("/update/:account_id", utilities.checkLogin, utilities.handleErrors(accountController.buildEditView));

// Logout 
router.get("/logout", (req, res) => {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out successfully.")
  res.redirect("/account/login")
});

// Route to get account information by ID
router.get("/getAccount/:account_id", utilities.handleErrors(accountController.getAccountById));

// Process the login attempt
router.post(
  "/login",
  validate.loginRules(),
  validate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)
// Process the registration data
router.post(
  "/register",
  validate.registrationRules(),
  validate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);
// Process Update Account
router.post(
  "/update",
  validate.updateUserInfoRules(),
  validate.checkUpdateUserInfoData,
  utilities.handleErrors(accountController.updateAccount)
)
// Process Update Password
router.post(
  "/change-password",
  validate.passwordChangeRules(),
  validate.checkChangePasswordData,
  utilities.handleErrors(accountController.changePassword)
)

module.exports = router;
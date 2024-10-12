// Needed Resources 
const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login to CSE Motors",
    nav,
    errors: null
  })
}
/* ****************************************
*  Deliver Register view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register to CSE Motors",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("/account/register", {
      title: "Register to CSE Motors",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login to CSE Motors",
      nav,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("/account/register", {
      title: "Register to CSE Motors",
      nav,
      errors: null
    })
  }
}

/* ****************************************
*  Process Login
* *************************************** */
async function processLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  // Fetch the account using the provided email
  const account = await accountModel.getAccountByEmail(account_email)

  if (account) {
    // Compare the plain password with the stored hashed password
    const passwordMatch = bcrypt.compareSync(account_password, account.account_password)

    if (passwordMatch) {
      req.flash("notice", `Welcome back, ${account.account_firstname}!`)
      res.redirect("/account/login")
    } else {
      req.flash("notice", "Login failed. Please check your email and password.")
      res.status(401).render("account/login", {
        title: "Login to CSE Motors",
        nav,
        account_email,
        errors: null
      })
    }
  } else {
    req.flash("notice", "Login failed. Please check your email and password.")
    res.status(401).render("account/login", {
      title: "Login to CSE Motors",
      nav,
      account_email,
      errors: null
    })
  }
}



module.exports = { buildLogin, buildRegister, registerAccount, processLogin }
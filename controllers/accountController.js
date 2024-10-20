// Needed Resources 
const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

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

/* ****************************************
*  Build Account View
* *************************************** */
async function buildAccountView(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/account", {
    title: "Account Dashboard",
    nav,
    errors: null
  })
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
  } catch (error) {
    return new Error("Access Forbidden")
  }
}

/* ***************************
 *  Build account update View
 * ************************** */
async function buildEditView(req, res, next) {
  const account_id = parseInt(req.params.account_id);
  try {
    const accountData = await accountModel.getAccountById(account_id);
    let nav = await utilities.getNav();

    res.render("account/update-account", {
      title: "Update Account Information",
      nav,
      errors: null,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id: accountData.account_id
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Update Account Data
 * ************************** */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav()
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_id
  } = req.body
  const updateResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  )

  if (updateResult) {
    const accountName = updateResult.account_firstname + " " + updateResult.account_lastname
    req.flash("notice", `${accountName} Your Information has been updated.`)
    res.redirect(`/account/update/${updateResult.account_id}`)
  } else {
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("account/update-account", {
      title: "Update Account Information",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
      account_id
    })
  }
}

/* ***************************
 *  Update Account Password
 * ************************** */
async function changePassword(req, res, next) {
  let nav = await utilities.getNav()
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
    account_id
  } = req.body
  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the update.')
    res.status(500).render("/account/update-account", {
      title: "Register to CSE Motors",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
      account_id
    })
  }

  const updateResult = await accountModel.changePassword(
    hashedPassword,
    account_id
  )

  if (updateResult) {
    const accountName = updateResult.account_firstname + " " + updateResult.account_lastname
    req.flash("notice", `${accountName} Your Password has been updated.`)
    res.redirect(`/account/update/${updateResult.account_id}`)
  } else {
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Update Account Information",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
      account_id
    })
  }
}


module.exports = { buildLogin, buildRegister, registerAccount, processLogin, accountLogin, buildAccountView, buildEditView, updateAccount, changePassword }
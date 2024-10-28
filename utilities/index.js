const invModel = require("../models/inventory-model")
const reviewModel = require("../models/review-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid = ""; // Initialize as an empty string
  console.log(data)
  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => {
      grid += '<li>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id
        + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
        + 'details"><img src="' + vehicle.inv_thumbnail
        + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
        + ' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View '
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$'
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************
 * Build vehicle detail HTML
 * ************************** */
Util.buildVehicleDetail = function (vehicle) {
  let detailHtml = `
    <div class="vehicle-detail">
      <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
      <div class="vehicle-info">
          <div class="price-box">
            <span>${vehicle.inv_year} | ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)} miles</span>
            <h1>${vehicle.inv_make} ${vehicle.inv_model}</h1>
            <div class="action-box"> 
              <button 
                id="buy-button" 
                aria-label="Buy Car"
                title="Buy Car">
                Buy This Car
              </button>
              <button 
                id="contact-button" 
                aria-label="Contact Owner"
                title="Contact">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      <div class="summary-box"> 
        <div class="characteristics-box">
          <hr>
          <h2><strong>Product Characteristics</strong></h2>
          <p><strong>Year:</strong> ${vehicle.inv_year}</p>
          <p><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>
          <p><strong>Miles:</strong> ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)} miles</p>
          <p><strong>Color:</strong> ${vehicle.inv_color}</p>
          <hr>
        </div>
        <div class="description-box">
          <h2><strong>Description</strong></h2>
          <p> ${vehicle.inv_description}</p>
        </div>
      </div>
    </div>
  `;
  return detailHtml;
};

/* **************************************
 * Build the classification list for dropdowns
 ************************************** */
Util.buildClassificationList = async function (classification_id = null) {
  const classifications = await invModel.getClassifications();
  let dropdown = "<select class='select-dropdown' name='classification_id' id='classification_id' required>";
  dropdown += "<option value=''>Select Classification</option>";

  classifications.rows.forEach((classification) => {
    dropdown += `<option value='${classification.classification_id}' ${classification.classification_id == classification_id ? "selected" : ""}>${classification.classification_name}</option>`;
  });
  dropdown += "</select>";

  return dropdown;
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      })
  } else {
    next()
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  console.log(res.locals.loggedin)
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
 * Middleware to verify if the user is a client
 * ************************************ */
Util.checkClient = (req, res, next) => {
  if (res.locals.accountData && res.locals.accountData.account_type === "Client") {
    return next();
  } else {
    req.flash("notice", "Access denied. Clients only.");
    return res.redirect("/account/login");
  }
}


/* ****************************************
* Middleware to check if the logged-in user is the owner of the review
 * ************************************ */
Util.verifyReviewOwner = async (req, res, next) => {
  const { reviewId } = req.params;
  const userId = res.locals.accountData.account_id;

  try {
    const review = await reviewModel.getReviewById(reviewId);
    if (review && review.client_id === userId) {
      return next();
    } else {
      req.flash("notice", "You are not authorized to edit or delete this review.");
      return res.redirect("/account/");
    }
  } catch (error) {
    next(error);
  }
}

/* ****************************************
* Middleware to check if user is an Admin or Employee
**************************************** */
Util.checkAccountType = (req, res, next) => {
  if (res.locals.accountData && (res.locals.accountData.account_type === "Admin" || res.locals.accountData.account_type === "Employee")) {
    next()
  } else {
    req.flash("notice", "You do not have permission to access this page.")
    return res.redirect("/account/login")
  }
}


module.exports = Util
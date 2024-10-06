const invModel = require("../models/inventory-model")
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
  let grid
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

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util
const { body, validationResult } = require("express-validator");
const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const validate = {};

/* **********************************
 *  Review Data Validation Rules
 * ********************************* */
validate.reviewRules = () => {
  return [
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Please provide a rating between 1 and 5.'),
    body('review_text')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('Review text cannot be empty.')
      .isLength({ min: 10 })
      .withMessage('Review text must be at least 10 characters long.'),
  ];
};

/* ******************************
 * Check Review Data
 * ***************************** */
validate.checkReviewData = async (req, res, next) => {
  const { inv_id, rating, review_text } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    const vehicle = await invModel.getVehicleById(inv_id);
    let nav = await utilities.getNav();
    res.render("./review/add-review", {
      title: `Add Review for ${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      inv_id,
      errors,
      rating,
      review_text,
    });
    return;
  }
  next();
};

module.exports = validate;

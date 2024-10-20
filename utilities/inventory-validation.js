const utilities = require(".")
const invModel = require("../models/inventory-model")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
  *  Classification Data Validation Rules
  * ********************************* */
validate.classificationRules = () => {
  return [
    // classification_name is required and must be a string
    body('classification_name')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('Please provide a classification name.')
      .isLength({ min: 3 })
      .withMessage('Classification name must be at least 3 characters long.')
      .custom(async (classification_name) => {
        const exists = await invModel.checkExistingClassification(classification_name);
        if (exists) {
          throw new Error('Classification name already exists.');
        }
      }),
  ];
};

/* ******************************
 * Check classification data
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    res.render('./inventory/add-classification', {
      title: 'Add New Classification',
      nav,
      errors: errors,
      classification_name
    });
    return;
  }
  next();
};

/*  **********************************
  *  Inventory Data Validation Rules
  * ********************************* */
validate.inventoryRules = () => {
  return [
    // Make is required and must be a non-empty string
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide the vehicle make."), // on error this message is sent

    // Model is required and must be a non-empty string
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide the vehicle model."),

    // Year is required and must be a 4-digit year
    body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 4, max: 4 })
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 }) // Checks if year is reasonable
      .withMessage("Please provide a valid year (4 digits)."),

    // Description is required and must be a string
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a description of the vehicle."),

    // Image URL is required and must be a valid URL
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Please provide a valid image URL."),

    // Thumbnail URL is required and must be a valid URL
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Please provide a valid thumbnail URL."),

    // Price is required and must be a positive number
    body("inv_price")
      .trim()
      .isNumeric()
      .isFloat({ min: 0 })
      .withMessage("Please provide a valid price (must be a positive number)."),

    // Miles are required and must be an integer
    body("inv_miles")
      .trim()
      .isInt({ min: 0 })
      .withMessage("Please provide the vehicle's mileage (must be a positive integer)."),

    // Color is required and must be a string
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide the vehicle color."),

    // Classification ID is required and must be a valid integer
    body("classification_id")
      .trim()
      .notEmpty()
      .isInt()
      .withMessage("Please select a valid classification.")
      .custom(async (classification_id) => {
        const classExists = await invModel.checkClassificationById(classification_id)
        if (!classExists) {
          throw new Error("The classification you selected does not exist.")
        }
      }),
  ]
}

/* ******************************
 * Check data and return errors or continue to inventory insertion
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
  let errors = []
  errors = validationResult(req)

  if (!errors.isEmpty()) {
    let classifications = await utilities.buildClassificationList(classification_id)
    let nav = await utilities.getNav()
    res.render("./inventory/add-inventory", {
      errors,
      title: "Add New Vehicle",
      nav,
      classifications,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    })
    return
  }
  next()
}

/* ******************************
 * Check data and return errors or continue to inventory update
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id, inv_id } = req.body
  let errors = []
  errors = validationResult(req)

  if (!errors.isEmpty()) {
    let classifications = await utilities.buildClassificationList(classification_id)
    let nav = await utilities.getNav()
    const itemName = `${vehicle.inv_make} ${vehicle.inv_model}`
    res.render("./inventory/edit-inventory", {
      errors,
      title: `Edit ${itemName}`,
      nav,
      classifications,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      inv_id
    })
    return
  }
  next()
}

module.exports = validate

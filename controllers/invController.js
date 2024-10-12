const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  try {
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    });
  } catch (error) {
    next(error);
  }
}
/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  const invId = req.params.invId;
  try {
    const vehicle = await invModel.getVehicleById(invId); // Fetch vehicle by ID
    let nav = await utilities.getNav();
    const vehicleHtml = utilities.buildVehicleDetail(vehicle); // Create HTML

    res.render("./inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleHtml,
    });
  } catch (error) {
    next(error);
  }
};
/* ****************************************
*  Build Management View
* *************************************** */
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/management", {
    title: "Management Options",
    nav,
    errors: null
  })
}
/* ****************************************
*  Build Add Classification View
* *************************************** */
invCont.buildAddClassificationView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null
  })
}
/* ****************************************
*  Add Classification
* *************************************** */
invCont.addClassification = async (req, res) => {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;

  try {
    const result = await invModel.insertClassification(classification_name);

    if (result) {
      req.flash("notice", `Classification ${classification_name} added successfully!`);
      res.status(201).redirect("/inv/");
    } else {
      req.flash("notice", "Sorry, adding the classification failed.");
      res.status(500).render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null
      });
    }
  } catch (error) {
    req.flash("notice", "Error adding classification.");
    res.status(500).render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null
    });
  }
};
/* ****************************************
*  Build Add Inventory View
* *************************************** */
invCont.buildAddInventoryView = async function (req, res, next) {
  try {
    let classifications = await utilities.buildClassificationList();
    let nav = await utilities.getNav();

    res.render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classifications,
      errors: null
    });
  } catch (error) {
    next(error);
  }
}

/* ****************************************
*  Add New Inventory Item
* *************************************** */
invCont.addInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const {
    inv_make, inv_model, inv_year, inv_description, inv_image,
    inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
  } = req.body;

  try {
    const result = await invModel.insertInventory({
      inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles,
      inv_color, classification_id
    });

    if (result) {
      req.flash("notice", `${inv_make} ${inv_model} added successfully!`);
      res.status(201).redirect("/inv/");
    } else {
      let classifications = await utilities.buildClassificationList(classification_id);
      req.flash("notice", "Sorry, adding the inventory failed.");
      res.status(500).render("./inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        errors: null,
        classifications,
        inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles,
        inv_color
      });
    }
  } catch (error) {
    let classifications = await utilities.buildClassificationList(classification_id);
    req.flash("notice", "Error adding inventory.");
    res.status(500).render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      errors: null,
      classifications,
      inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles,
      inv_color
    });
  }
};

module.exports = invCont
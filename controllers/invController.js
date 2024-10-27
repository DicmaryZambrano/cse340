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
  const invId = parseInt(req.params.invId);
  try {
    const vehicle = await invModel.getVehicleById(invId); // Fetch vehicle by ID
    let nav = await utilities.getNav();
    const vehicleHtml = utilities.buildVehicleDetail(vehicle); // Create HTML

    res.render("./inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleHtml,
      invId
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
  const classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Management Options",
    nav,
    errors: null,
    classificationSelect
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

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classifications = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classifications,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}


/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteItem = async function (req, res, next) {
  /*const invId = parseInt(req.params.invId);*/
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_price,
    inv_year
  } = req.body
  const deleteResult = await invModel.deleteInventoryItem(
    inv_id
  )

  if (deleteResult) {
    const itemName = inv_make + " " + inv_model
    req.flash("notice", `The ${itemName} was successfully deleted.`)
    res.redirect("/inv/")
  } else {
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the delete failed.")
    res.status(501).render("inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    const error = new Error("No data returned")
    console.error("Error fetching inventory classifications:", error);
    error.status = 500;
    next(error);
  }
}


/* ***************************
 *  Build vehicle edit view
 * ************************** */
invCont.buildEditView = async function (req, res, next) {
  const invId = parseInt(req.params.invId);
  try {
    const vehicle = await invModel.getVehicleById(invId); // Fetch vehicle by ID
    let nav = await utilities.getNav();
    let classifications = await utilities.buildClassificationList(vehicle.classification_id);

    const itemName = `${vehicle.inv_make} ${vehicle.inv_model}`

    res.render("./inventory/edit-inventory", {
      title: `Edit ${itemName}`,
      nav,
      classifications,
      errors: null,
      inv_id: vehicle.inv_id,
      inv_make: vehicle.inv_make,
      inv_model: vehicle.inv_model,
      inv_year: vehicle.inv_year,
      inv_description: vehicle.inv_description,
      inv_image: vehicle.inv_image,
      inv_thumbnail: vehicle.inv_thumbnail,
      inv_price: vehicle.inv_price,
      inv_miles: vehicle.inv_miles,
      inv_color: vehicle.inv_color,
      classification_id: vehicle.classification_id
    });
  } catch (error) {
    console.error("Error fetching inventory by classification:", error);
    error.status = 500;
    next(error);
  }
};

/* ***************************
 *  Build delete confirm view
 * ************************** */
invCont.buildDeleteView = async function (req, res, next) {
  const invId = parseInt(req.params.invId);
  try {
    const vehicle = await invModel.getVehicleById(invId); // Fetch vehicle by ID
    let nav = await utilities.getNav();
    const itemName = `${vehicle.inv_make} ${vehicle.inv_model}`

    res.render("./inventory/delete-confirm", {
      title: `Delete ${itemName}`,
      nav,
      errors: null,
      inv_id: vehicle.inv_id,
      inv_make: vehicle.inv_make,
      inv_model: vehicle.inv_model,
      inv_year: vehicle.inv_year,
      inv_price: vehicle.inv_price,
    });
  } catch (error) {
    console.error("Error fetching inventory by classification:", error);
    error.status = 500;
    next(error);
  }
};

module.exports = invCont
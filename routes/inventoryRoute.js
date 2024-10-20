// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const validate = require('../utilities/inventory-validation');

// Route to get a json of all inventory items by classification id

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route for a specific vehicle detail
router.get("/detail/:invId", utilities.handleErrors(invController.buildDetailView));

// Route for inventory management
router.get("/", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildManagementView));

// Route to build add classification view
router.get('/add-classification', utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildAddClassificationView));

// Route to get the inventory edit form
router.get("/edit/:invId", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildEditView));

// Route to get the inventory edit form
router.get("/delete/:invId", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildDeleteView));

// Route to build add inventory view
router.get('/add-inventory', utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildAddInventoryView));

// Route to add new inventory with validation
router.post(
  '/add-inventory',
  utilities.checkJWTToken,
  utilities.checkAccountType,
  validate.inventoryRules(),
  validate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

// Route to edit inventory with validation
router.post(
  '/update/',
  utilities.checkJWTToken,
  utilities.checkAccountType,
  validate.inventoryRules(),
  validate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// Route to delete inventory item
router.post(
  '/delete/',
  utilities.checkJWTToken,
  utilities.checkAccountType,
  utilities.handleErrors(invController.deleteItem)
);

// Route to add new classification with validation
router.post(
  '/add-classification',
  validate.classificationRules(),
  utilities.checkJWTToken,
  utilities.checkAccountType,
  validate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);


module.exports = router;
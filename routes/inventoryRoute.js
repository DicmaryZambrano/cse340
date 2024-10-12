// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const validate = require('../utilities/inventory-validation');

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route for a specific vehicle detail
router.get("/detail/:invId", utilities.handleErrors(invController.buildDetailView));

// Route for inventory management
router.get("/", utilities.handleErrors(invController.buildManagementView));

// Route to build add classification view
router.get('/add-classification', utilities.handleErrors(invController.buildAddClassificationView));

// Route to add new classification with validation
router.post(
  '/add-classification', 
  validate.classificationRules(),
  validate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// Route to build add inventory view
router.get('/add-inventory', utilities.handleErrors(invController.buildAddInventoryView));

// Route to add new inventory with validation
router.post(
  '/add-inventory', 
  validate.inventoryRules(),
  validate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

module.exports = router;
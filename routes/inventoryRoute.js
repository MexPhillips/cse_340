// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const { classificationRules, inventoryRules, handleValidationErrors } = require("../utilities/validation")

/* ****************************************
 * Route to build inventory view (all vehicles)
 **************************************** */
router.get("/", utilities.handleErrors(invController.buildInventory));

/* ****************************************
 * Route to build inventory management view
 **************************************** */
router.get("/management", utilities.handleErrors(invController.buildManagement));

/* ****************************************
 * Route to build add classification view
 **************************************** */
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));

/* ****************************************
 * Route to process add classification form
 **************************************** */
router.post("/add-classification", classificationRules(), utilities.handleErrors(invController.addClassification));

/* ****************************************
 * Route to build add vehicle view
 **************************************** */
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));

/* ****************************************
 * Route to process add vehicle form
 **************************************** */
router.post("/add-inventory", inventoryRules(), utilities.handleErrors(invController.addInventory));

router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));


/* ****************************************
 * Route to build vehicle detail view
 **************************************** */
router.get("/detail/:id", 
utilities.handleErrors(invController.buildDetail))

/* ****************************************
 * Error Route
 * Assignment 3, Task 3
 **************************************** */
router.get(
  "/broken",
  utilities.handleErrors(invController.throwError)
)


module.exports = router;
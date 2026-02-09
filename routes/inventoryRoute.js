// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")

/* ****************************************
 * Route to build inventory view (all vehicles)
 **************************************** */
router.get("/", utilities.handleErrors(invController.buildInventory));

/* ****************************************
 * Route to build inventory management view
 **************************************** */
router.get("/management", utilities.handleErrors(invController.buildManagement));

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
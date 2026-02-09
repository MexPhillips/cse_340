const utilities = require("../utilities")
const baseController = {}

baseController.buildHome = async function(req, res){
  res.render("index", {title: "Home"})
}

/* *********************************
 * Task 3 Trigger a 500 Server Error
 * ****************************** */
baseController.triggerError = async function (req, res, next) {
  throw new Error("500 Server Error")  
}


module.exports = baseController
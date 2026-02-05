/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements 
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const pages = require("./routes/pages")
const invRoutes = require("./routes/inventoryRoute")
const baseController = require("./controllers/baseController")

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "layouts/layout") // layout file under views/layouts/layout.ejs

/* ***********************
 * Routes
 *************************/
app.get("/", baseController.buildHome)

app.use(pages)
app.use('/inv', invRoutes)
app.use(static)

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})

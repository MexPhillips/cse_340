/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements 
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const session = require("express-session")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const pages = require("./routes/pages")
const invRoutes = require("./routes/inventoryRoute")
const accountRoutes = require("./routes/accountRoute")
const cartRoutes = require("./routes/cartRoute")
const adminRoutes = require("./routes/adminRoute")
const baseController = require("./controllers/baseController")
const errorController = require("./controllers/errorController")

/* ***********************
 * Body Parser Middleware
 *************************/
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

/* ***********************
 * Session Middleware
 *************************/
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: true,
  name: "id"
}))

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "layouts/layout") // layout file under views/layouts/layout.ejs

/* ***********************
 * Middleware to add nav and messages to all views
 *************************/
const utilities = require("./utilities")
app.use(async (req, res, next) => {
  try {
    res.locals.nav = await utilities.getNav()
    res.locals.messages = req.session.messages || []
    req.session.messages = []
    next()
  } catch (error) {
    next(error)
  }
})

/* ***********************
 * Routes
 *************************/
app.get("/", baseController.buildHome)

app.use(pages)
app.use('/inv', invRoutes)
app.use('/account', accountRoutes)
app.use('/cart', cartRoutes)
app.use('/admin', adminRoutes)
app.use(static)

/* ***********************
 * Express Error Handlers
 *************************/
// 404 handler
app.use((req, res, next) => {
  res.status(404).render('errors/error', {
    title: 'Page Not Found',
    message: 'Sorry, the page you requested does not exist.'
  })
})

// 500 error handler
app.use((err, req, res, next) => {
  console.error("=== SERVER ERROR ===")
  console.error(err)
  console.error("===================")
  res.status(500).render('errors/error', {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.'
  })
})

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

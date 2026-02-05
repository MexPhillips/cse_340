const invModel = require("../models/inventory-model")

function formatPrice(value) {
  const num = Number(value) || 0
  return num.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
}

function formatMileage(value) {
  const num = Number(value) || 0
  return `${num.toLocaleString("en-US")} miles`
}

function buildVehicleDetailHTML(v) {
  const title = `${v.inv_make} ${v.inv_model}`
  const price = formatPrice(v.inv_price)
  const mileage = formatMileage(v.inv_miles)
  const imageUrl = v.inv_image || "/images/vehicles/no-image.png"

  const html = `
    <article class="vehicle-detail__card" aria-labelledby="vehicle-title">
      <figure class="vehicle-detail__media">
        <img src="${imageUrl}" alt="${v.inv_make} ${v.inv_model} full-size image" loading="lazy" />
        <figcaption>Full-size image of ${v.inv_make} ${v.inv_model}</figcaption>
      </figure>
      <section class="vehicle-detail__info">
        <h2 id="vehicle-title">${v.inv_make} ${v.inv_model} — ${v.inv_year}</h2>
        <p class="vehicle-detail__price">Price: <strong>${price}</strong></p>
        <p class="vehicle-detail__miles">Mileage: ${mileage}</p>
        <dl class="vehicle-detail__specs">
          <dt>Make</dt><dd>${v.inv_make}</dd>
          <dt>Model</dt><dd>${v.inv_model}</dd>
          <dt>Year</dt><dd>${v.inv_year}</dd>
          <dt>MPG</dt><dd>${v.inv_mpg || "N/A"}</dd>
          <dt>Color</dt><dd>${v.inv_color || "Not specified"}</dd>
          <dt>Fuel Type</dt><dd>${v.inv_fuel || "N/A"}</dd>
          <dt>Drivetrain</dt><dd>${v.inv_drivetrain || "N/A"}</dd>
          <dt>Transmission</dt><dd>${v.inv_transmission || "N/A"}</dd>
          <dt>VIN</dt><dd>${v.inv_vin || "N/A"}</dd>
          <dt>Stock #</dt><dd>${v.inv_stock || "N/A"}</dd>
        </dl>
        <div class="vehicle-detail__desc">
          <h3>Description</h3>
          <p>${v.inv_description || "No description available."}</p>
          <p class="vehicle-detail__inspection">This vehicle has passed inspection by an ASE-certified technician.</p>
        </div>
      </section>
    </article>
  `
  return { title, html }
}

async function buildClassificationList(classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList = '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (classification_id != null && row.classification_id == classification_id) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

const Util = {}

Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list += '<a href="/inv/type/' + row.classification_id + '" title="See our inventory of ' + row.classification_name + ' vehicles">' + row.classification_name + "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

Util.buildClassificationGrid = async function (data) {
  let grid
  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach((vehicle) => {
      grid += '<li>'
      grid += '<a href="/inv/detail/' + vehicle.inv_id + '" title="View ' + vehicle.inv_make + " " + vehicle.inv_model + ' details"><img src="' + vehicle.inv_thumbnail + '" alt="Image of ' + vehicle.inv_make + " " + vehicle.inv_model + ' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += "<hr />"
      grid += "<h2>"
      grid += '<a href="/inv/detail/' + vehicle.inv_id + '" title="View ' + vehicle.inv_make + " " + vehicle.inv_model + ' details">' + vehicle.inv_make + " " + vehicle.inv_model + "</a>"
      grid += "</h2>"
      grid += "<span>$" + new Intl.NumberFormat("en-US").format(vehicle.inv_price) + "</span>"
      grid += "</div>"
      grid += "</li>"
    })
    grid += "</ul>"
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

Util.buildSingleVehicleDisplay = async (vehicle) => {
  let svd = '<section id="vehicle-display">'
  svd += "<div>"
  svd += '<section class="imagePrice">'
  svd += "<img src='" + vehicle.inv_image + "' alt='Image of " + vehicle.inv_make + " " + vehicle.inv_model + " on cse motors' id='mainImage'>"
  svd += "</section>"
  svd += '<section class="vehicleDetail">'
  svd += "<h3> " + vehicle.inv_make + " " + vehicle.inv_model + " Details</h3>"
  svd += '<ul id="vehicle-details">'
  svd += "<li><h4>Price: $" + new Intl.NumberFormat("en-US").format(vehicle.inv_price) + "</h4></li>"
  svd += "<li><h4>Description:</h4> " + vehicle.inv_description + "</li>"
  svd += "<li><h4>Color:</h4> " + vehicle.inv_color + "</li>"
  svd += "<li><h4>Miles:</h4> " + new Intl.NumberFormat("en-US").format(vehicle.inv_miles) + "</li>"
  svd += "</ul>"
  svd += "</section>"
  svd += "</div>"
  svd += "</section>"
  return svd
}

Util.handleErrors = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = {
  buildVehicleDetailHTML,
  buildClassificationList,
  ...Util
}

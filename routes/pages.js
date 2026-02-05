const express = require('express')
const router = new express.Router()
const utilities = require('../utilities')
const invModel = require('../models/inventory-model')

async function buildClassificationPage(classificationName, req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classifications = await invModel.getClassifications()
    const found = classifications.rows.find(
      (r) => r.classification_name.toLowerCase() === classificationName.toLowerCase()
    )
    if (!found) {
      return res.status(404).render('errors/404', { title: 'Not found', nav })
    }
    const data = await invModel.getInventoryByClassificationId(found.classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    res.render('inventory/classification', { title: found.classification_name, nav, grid })
  } catch (err) {
    next(err)
  }
}

router.get('/custom', (req, res, next) => buildClassificationPage('Custom', req, res, next))
router.get('/sedan', (req, res, next) => buildClassificationPage('Sedan', req, res, next))
router.get('/sport', (req, res, next) => buildClassificationPage('Sport', req, res, next))
router.get('/suv', (req, res, next) => buildClassificationPage('SUV', req, res, next))
router.get('/truck', (req, res, next) => buildClassificationPage('Truck', req, res, next))

module.exports = router

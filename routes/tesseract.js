var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('tesseract');
});

router.get('/outline', function(req, res, next) {
  res.render('tesseract_outline');
});

router.get('/glow', function(req, res, next) {
  res.render('tesseract_glow');
});

router.get('/volumetric', function(req, res, next) {
  res.render('volumetric');
});

module.exports = router;

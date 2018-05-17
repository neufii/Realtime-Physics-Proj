var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('tesseract');
});

router.get('/particle', function(req, res, next) {
  res.render('tesseract_particle');
});

module.exports = router;

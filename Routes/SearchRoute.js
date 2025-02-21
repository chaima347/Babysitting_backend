const express = require("express");
const {
  searchBabysitters,
  getBabysitterDetails,
} = require("../Controllers/SearchController");
const router = express.Router();

router.get("/babysitters", searchBabysitters);
router.get("/babysitters/:id", getBabysitterDetails);

module.exports = router;

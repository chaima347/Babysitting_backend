const express = require("express");
const { signIn, signUp, logout } = require("../Controllers/auth.js");
const ParentController = require("../Controllers/ParentController");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Parent route is working" });
});


router.post("/signIn", signIn);
router.post("/signUp", signUp);
router.post("/logout", authMiddleware, logout);

router.get("/profile", authMiddleware, ParentController.getProfile);
router.put("/profile", authMiddleware, ParentController.updateProfile);


router.post("/favorites/:babysitterId", authMiddleware, ParentController.addToFavorites);
router.get("/favorites", authMiddleware, ParentController.getFavorites);


router.get('/parents', ParentController.getParents);

router.get("/dashboard", authMiddleware, ParentController.getDashboardData);

module.exports = router;

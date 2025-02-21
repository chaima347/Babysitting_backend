const express = require("express");
const ReservationController = require("../Controllers/ReservationController");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.post("/", authMiddleware, ReservationController.createReservation);
router.get("/", authMiddleware, ReservationController.getReservations);
router.patch("/:id/status", authMiddleware, ReservationController.updateReservationStatus);
router.delete("/:id", authMiddleware, ReservationController.deleteReservation);

module.exports = router;

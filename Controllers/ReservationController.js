const Reservation = require("../Models/Reservation");
const Babysitter = require("../Models/Babysitter");
const Parent = require("../Models/Parent");


const ReservationController = {
  createReservation: async (req, res) => {
    try {
      console.log('Creating reservation - Request body:', req.body);
      console.log('Creating reservation - User:', req.user);
      
      const { babysitter, date, time, duration, description } = req.body;
      
      if (!req.user || !req.user._id) {
        console.error('No user or user ID in request');
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }

      // Validate required fields
      if (!babysitter || !date || !time || !duration) {
        console.log('Missing required fields:', { babysitter, date, time, duration });
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
          missing: {
            babysitter: !babysitter,
            date: !date,
            time: !time,
            duration: !duration
          }
        });
      }

      // Get babysitter
      const babysitterDoc = await Babysitter.findById(babysitter);
      if (!babysitterDoc) {
        console.log('Babysitter not found:', babysitter);
        return res.status(404).json({
          success: false,
          message: "Babysitter not found"
        });
      }

      // Calculate total cost
      const totale = babysitterDoc.tarif * duration;

      const reservationData = {
        babysitter: babysitter,
        parent: req.user._id.toString(), // Ensure parent ID is a string
        date: new Date(date),
        time,
        duration: parseInt(duration),
        description,
        totale,
        status: 'pending'
      };

      console.log('Creating reservation with data:', reservationData);

      const reservation = new Reservation(reservationData);

      await reservation.save();
      console.log('Reservation saved successfully:', reservation._id);

      // Populate the saved reservation
      await reservation.populate([
        { path: 'babysitter', select: 'name photo' },
        { path: 'parent', select: 'name photo' }
      ]);

      res.status(201).json({
        success: true,
        message: "Reservation created successfully",
        data: reservation
      });
    } catch (error) {
      console.error('Reservation creation error:', error);
      res.status(500).json({
        success: false,
        message: "Error creating reservation",
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  },

  getReservations: async (req, res) => {
    try {
      const { role, _id } = req.user;
      const query = role === "parent" ? { parent: _id } : { babysitter: _id };

      const reservations = await Reservation.find(query)
        .populate('babysitter', 'name photo')
        .populate('parent', 'name')
        .sort({ date: -1 });

      res.status(200).json(reservations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reservations", error });
    }
  },

  updateReservationStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Verify the user is a babysitter
      if (req.user.role !== 'babysitter') {
        return res.status(403).json({ 
          success: false,
          message: "Only babysitters can update reservation status" 
        });
      }

      const reservation = await Reservation.findById(id);
      
      // Verify the reservation exists
      if (!reservation) {
        return res.status(404).json({ 
          success: false,
          message: "Reservation not found" 
        });
      }

      // Verify the babysitter owns this reservation
      if (reservation.babysitter.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          success: false,
          message: "Not authorized to update this reservation" 
        });
      }

      const updatedReservation = await Reservation.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      )
      .populate('babysitter', 'name photo')
      .populate('parent', 'name');

      res.status(200).json({
        success: true,
        data: updatedReservation
      });
    } catch (error) {
      console.error('Error updating reservation status:', error);
      res.status(500).json({ 
        success: false,
        message: "Error updating reservation status",
        error: error.message 
      });
    }
  },

  deleteReservation: async (req, res) => {
    try {
      const { id } = req.params;
      const reservation = await Reservation.findByIdAndDelete(id);
      
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }

      res.status(200).json({ message: "Reservation deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting reservation", error });
    }
  }
};

module.exports = ReservationController;

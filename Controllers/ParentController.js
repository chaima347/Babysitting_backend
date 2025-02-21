const Parent = require("../Models/Parent");
const Babysitter = require("../Models/Babysitter");
const Reservation = require("../Models/Reservation");

class ParentController {
    static async getParents(req, res) {
        try {
            const parents = await Parent.find().select('-password');
            res.status(200).json({ success: true, data: parents });
        } catch (error) {
            res.status(500).json({ success: false, message: "Error fetching parents", error: error.message });
        }
    }

    static async getProfile(req, res) {
        try {
            const parent = await Parent.findById(req.user._id).select('-password');
            if (!parent) {
                return res.status(404).json({ success: false, message: "Parent not found" });
            }
            res.status(200).json({ success: true, data: parent });
        } catch (error) {
            res.status(500).json({ success: false, message: "Error fetching profile", error: error.message });
        }
    }

    static async updateProfile(req, res) {
        try {
            const parent = await Parent.findByIdAndUpdate(
                req.user._id,
                { $set: req.body },
                { new: true, runValidators: true }
            ).select('-password');

            res.status(200).json({ success: true, data: parent });
        } catch (error) {
            res.status(500).json({ success: false, message: "Error updating profile", error: error.message });
        }
    }

    static async addToFavorites(req, res) {
        try {
            const { babysitterId } = req.params;
            const parent = await Parent.findById(req.user._id);
            
            if (!parent.favoris.includes(babysitterId)) {
                parent.favoris.push(babysitterId);
                await parent.save();
            }

            await parent.populate('favoris', 'name photo adresse tarif rating');
            
            res.status(200).json({ 
                success: true, 
                message: "Added to favorites",
                data: parent.favoris
            });
        } catch (error) {
            res.status(500).json({ success: false, message: "Error adding to favorites", error: error.message });
        }
    }

    static async getFavorites(req, res) {
        try {
            const parent = await Parent.findById(req.user._id)
                .populate('favoris', 'name photo adresse tarif rating');

            res.status(200).json({ 
                success: true, 
                data: parent.favoris 
            });
        } catch (error) {
            res.status(500).json({ success: false, message: "Error fetching favorites", error: error.message });
        }
    }

    static async getDashboardData(req, res) {
        try {
            console.log('Fetching dashboard data for user:', req.user._id);
            
            const [reservations, favorites] = await Promise.all([
                Reservation.find({ parent: req.user._id })
                    .populate('babysitter', 'name photo')
                    .sort('-createdAt')
                    .limit(5),
                Parent.findById(req.user._id)
                    .populate('favoris', 'name photo adresse tarif rating')
            ]);

            console.log('Found reservations:', reservations.length);
            console.log('Found favorites:', favorites?.favoris?.length);

            const upcomingReservations = reservations.filter(r => new Date(r.date) > new Date());
            const totalHoursBooked = reservations.reduce((total, r) => total + (r.duration || 0), 0);

            const dashboardData = {
                success: true,
                data: {
                    upcomingReservations,
                    recentReservations: reservations,
                    favorites: favorites?.favoris || [],
                    stats: {
                        totalReservations: reservations.length,
                        upcomingReservationsCount: upcomingReservations.length,
                        favoritesCount: favorites?.favoris?.length || 0,
                        totalHoursBooked
                    }
                }
            };

            console.log('Sending dashboard data:', dashboardData);
            res.status(200).json(dashboardData);
        } catch (error) {
            console.error('Dashboard error:', error);
            res.status(500).json({ 
                success: false, 
                message: "Error fetching dashboard data", 
                error: error.message 
            });
        }
    }
}

console.log("ParentController loaded");

module.exports = ParentController; 
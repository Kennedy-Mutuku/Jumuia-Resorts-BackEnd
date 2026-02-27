const Booking = require('../models/Booking');
const Feedback = require('../models/Feedback');
const Transaction = require('../models/Transaction'); // Assuming this exists or will be needed for precise revenue

// @desc    Get dashboard statistics
// @route   GET /api/stats
// @access  Private (Admin/Manager)
const getDashboardStats = async (req, res) => {
    try {
        const { resort } = req.query;
        let filter = {};

        // Role-based filtering
        if (req.user.role === 'manager') {
            filter.resort = { $in: req.user.properties };
        } else if (resort && resort !== 'all') {
            filter.resort = resort;
        }

        // 1. Aggregate Booking Stats
        const bookingStats = await Booking.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: "$resort",
                    totalRevenue: { $sum: "$totalAmount" },
                    bookingCount: { $sum: 1 },
                    pendingBookings: {
                        $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
                    }
                }
            }
        ]);

        // 2. Aggregate Feedback Stats
        const feedbackStats = await Feedback.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: "$resort",
                    avgRating: { $avg: "$rating" },
                    feedbackCount: { $sum: 1 }
                }
            }
        ]);

        // 3. Format Response
        const properties = ['limuru', 'kanamai', 'kisumu'];
        const stats = {
            global: {
                totalRevenue: 0,
                totalBookings: 0,
                pendingBookings: 0,
                avgRating: 0,
                totalOccupancy: 0 // Logic for occupancy depends on room capacity
            },
            properties: {}
        };

        // Initialize properties
        properties.forEach(p => {
            stats.properties[p] = {
                revenue: 0,
                bookings: 0,
                occupancy: 0,
                rating: 0
            };
        });

        // Merge booking stats
        bookingStats.forEach(item => {
            if (stats.properties[item._id]) {
                stats.properties[item._id].revenue = item.totalRevenue;
                stats.properties[item._id].bookings = item.bookingCount;

                stats.global.totalRevenue += item.totalRevenue;
                stats.global.totalBookings += item.bookingCount;
                stats.global.pendingBookings += item.pendingBookings;
            }
        });

        // Merge feedback stats
        let totalRatingSum = 0;
        let totalRatingCount = 0;
        feedbackStats.forEach(item => {
            if (stats.properties[item._id]) {
                stats.properties[item._id].rating = Math.round(item.avgRating * 10) / 10;
                totalRatingSum += (item.avgRating * item.feedbackCount);
                totalRatingCount += item.feedbackCount;
            }
        });

        if (totalRatingCount > 0) {
            stats.global.avgRating = Math.round((totalRatingSum / totalRatingCount) * 10) / 10;
        }

        // Simplified Occupancy (based on arbitrary capacity for now)
        const capacity = { limuru: 50, kanamai: 80, kisumu: 100 };
        let totalOccSum = 0;
        properties.forEach(p => {
            const occ = Math.round((stats.properties[p].bookings / (capacity[p] || 50)) * 100);
            stats.properties[p].occupancy = Math.min(occ, 100);
            totalOccSum += stats.properties[p].occupancy;
        });
        stats.global.totalOccupancy = Math.round(totalOccSum / properties.length);

        res.json(stats);
    } catch (error) {
        console.error('Stats aggregation error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats
};

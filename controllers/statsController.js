const Booking = require('../models/Booking');
const Feedback = require('../models/Feedback');
// const Transaction = require('../models/Transaction'); // Assuming this exists or will be needed for precise revenue

// @desc    Get dashboard statistics
// @route   GET /api/stats
// @access  Private (Admin/Manager)
const getDashboardStats = async (req, res) => {
    try {
        const { resort } = req.query;
        let filter = {};

        // Role-based filtering
        let statsFilter = { ...filter };
        if (req.user.role === 'manager') {
            statsFilter.resort = { $in: req.user.properties };
            statsFilter.deletedByBranch = { $ne: true };
        } else if (resort && resort !== 'all') {
            statsFilter.resort = resort;
        }

        // 1. Aggregate Booking Stats
        const bookingStats = await Booking.aggregate([
            { $match: statsFilter },
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
            { $match: filter }, // Feedback doesn't have soft-delete yet, keeping 'filter'
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

        // --- 4. Revenue History - Monthly (Last 6 months) ---
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const monthlyRaw = await Booking.aggregate([
            { $match: { ...statsFilter, createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" }, resort: "$resort" },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // --- 5. Revenue History - Weekly (Last 8 weeks) ---
        const eightWeeksAgo = new Date();
        eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 55);
        eightWeeksAgo.setHours(0, 0, 0, 0);

        const weeklyRaw = await Booking.aggregate([
            { $match: { ...statsFilter, createdAt: { $gte: eightWeeksAgo } } },
            {
                $group: {
                    _id: { week: { $week: "$createdAt" }, year: { $year: "$createdAt" }, resort: "$resort" },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.week": 1 } }
        ]);

        // --- 6. Revenue History - Daily (Last 14 days) ---
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
        fourteenDaysAgo.setHours(0, 0, 0, 0);

        const dailyRaw = await Booking.aggregate([
            { $match: { ...statsFilter, createdAt: { $gte: fourteenDaysAgo } } },
            {
                $group: {
                    _id: { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" }, year: { $year: "$createdAt" }, resort: "$resort" },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ]);

        const properties_list = ['limuru', 'kanamai', 'kisumu'];

        // Months Generator
        const months = [];
        for (let i = 0; i < 6; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            const obj = { name: d.toLocaleString('default', { month: 'short' }), month: d.getMonth() + 1, year: d.getFullYear() };
            properties_list.forEach(p => obj[p] = 0);
            months.push(obj);
        }
        monthlyRaw.forEach(item => {
            const entry = months.find(m => m.month === item._id.month && m.year === item._id.year);
            if (entry) entry[item._id.resort] = item.revenue;
        });

        // Weeks Generator
        const weeks = [];
        for (let i = 0; i < 8; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (7 * (7 - i)));
            // Simple week calculation
            const firstJan = new Date(d.getFullYear(), 0, 1);
            const w = Math.ceil((((d - firstJan) / 86400000) + firstJan.getDay() + 1) / 7);
            const obj = { name: `Wk ${w}`, week: w, year: d.getFullYear() };
            properties_list.forEach(p => obj[p] = 0);
            weeks.push(obj);
        }
        weeklyRaw.forEach(item => {
            const entry = weeks.find(w => w.week === item._id.week && w.year === item._id.year);
            if (entry) entry[item._id.resort] = item.revenue;
        });

        // Days Generator
        const days = [];
        for (let i = 0; i < 14; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (13 - i));
            const obj = { name: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }), day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() };
            properties_list.forEach(p => obj[p] = 0);
            days.push(obj);
        }
        dailyRaw.forEach(item => {
            const entry = days.find(d => d.day === item._id.day && d.month === item._id.month && d.year === item._id.year);
            if (entry) entry[item._id.resort] = item.revenue;
        });

        stats.revenueHistory = { months, weeks, days };

        res.json(stats);
    } catch (error) {
        console.error('Stats aggregation error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats
};

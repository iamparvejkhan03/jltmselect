import User from "../models/user.model.js";
import UserSubscription from "../models/userSubscription.model.js";
import Member from "../models/member.model.js";

/**
 * @desc    Get all bidders with active subscription AND members (for cashier)
 * @route   GET /api/v1/cashier/bidders
 * @access  Private (Cashier only)
 */
export const getBiddersWithActiveSubscription = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 100,
            search = "",
        } = req.query;

        const now = new Date();
        let allMembers = [];

        // 1. Get all bidders with active subscriptions
        const activeSubscriptionsQuery = {
            status: "active",
            expiresAt: { $gt: now },
        };

        let activeSubscriptions = await UserSubscription.find(activeSubscriptionsQuery)
            .populate({
                path: "user",
                select: "firstName lastName email phone username userType",
                match: { userType: "bidder" }
            })
            .sort({ createdAt: -1 });

        // Filter out subscriptions where user is null
        let biddersWithActiveSubscription = activeSubscriptions.filter(
            (sub) => sub.user !== null
        );

        // 2. Get all active members
        const activeMembers = await Member.find({
            status: "active",
            expiresAt: { $gt: now },
            isActive: true
        }).populate({
            path: "mainSubscriber",
            select: "firstName lastName email phone"
        });

        // Format members data
        const formattedMembers = activeMembers.map((member) => ({
            _id: member._id,
            isMember: true,
            firstName: member.firstName,
            lastName: member.lastName,
            phone: member.phoneNumber,
            email: "N/A", // Members don't have email
            subscriptionTitle: `Member of ${member.mainSubscriber?.firstName || ''} ${member.mainSubscriber?.lastName || ''}`,
            subscriptionExpiry: member.expiresAt,
            isDiscountAvailed: member.isDiscountAvailed || false,
            mainSubscriber: member.mainSubscriber,
            memberId: member._id,
        }));

        // Combine both lists
        let allPeople = [
            ...biddersWithActiveSubscription.map((sub) => ({
                _id: sub.user._id,
                isMember: false,
                firstName: sub.user.firstName,
                lastName: sub.user.lastName,
                email: sub.user.email,
                phone: sub.user.phone || "Not provided",
                subscriptionTitle: sub.title,
                subscriptionExpiry: sub.expiresAt,
                isDiscountAvailed: sub.isDiscountAvailed || false,
                subscriptionId: sub._id,
            })),
            ...formattedMembers
        ];

        // Apply search filter
        if (search && search.trim()) {
            const searchTerm = search.toLowerCase().trim();
            allPeople = allPeople.filter((person) => {
                const fullName = `${person.firstName || ''} ${person.lastName || ''}`.toLowerCase().trim();
                return (
                    fullName.includes(searchTerm) ||
                    (person.firstName && person.firstName.toLowerCase().includes(searchTerm)) ||
                    (person.lastName && person.lastName.toLowerCase().includes(searchTerm)) ||
                    (person.email && person.email.toLowerCase().includes(searchTerm)) ||
                    (person.phone && person.phone.toLowerCase().includes(searchTerm))
                );
            });
        }

        // Calculate total before pagination
        const total = allPeople.length;

        // Apply pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const paginatedResults = allPeople.slice(skip, skip + parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                bidders: paginatedResults,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalBidders: total,
                    limit: parseInt(limit),
                    hasNextPage: skip + paginatedResults.length < total,
                    hasPrevPage: skip > 0,
                },
            },
        });
    } catch (error) {
        console.error("Get bidders with active subscription error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching bidders",
        });
    }
};

/**
 * @desc    Toggle discount availed status for a bidder or member
 * @route   PATCH /api/v1/cashier/:type/:id/discount
 * @access  Private (Cashier only)
 */
export const toggleDiscountAvailed = async (req, res) => {
    try {
        const { type, id } = req.params;

        let updatedItem = null;
        let isDiscountAvailed = false;

        if (type === 'bidder') {
            // Find the user's active subscription
            const now = new Date();
            const activeSubscription = await UserSubscription.findOne({
                user: id,
                status: "active",
                expiresAt: { $gt: now },
            });

            if (!activeSubscription) {
                return res.status(404).json({
                    success: false,
                    message: "No active subscription found for this bidder",
                });
            }

            // Toggle the discount availed status
            activeSubscription.isDiscountAvailed = !activeSubscription.isDiscountAvailed;
            await activeSubscription.save();
            isDiscountAvailed = activeSubscription.isDiscountAvailed;
            updatedItem = activeSubscription;
            
        } else if (type === 'member') {
            // Find the member
            const member = await Member.findById(id);

            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: "Member not found",
                });
            }

            // Check if member is active
            if (member.status !== "active" || member.expiresAt < new Date()) {
                return res.status(400).json({
                    success: false,
                    message: "This member is not active",
                });
            }

            // Toggle the discount availed status
            member.isDiscountAvailed = !member.isDiscountAvailed;
            await member.save();
            isDiscountAvailed = member.isDiscountAvailed;
            updatedItem = member;
            
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid type. Must be 'bidder' or 'member'",
            });
        }

        res.status(200).json({
            success: true,
            message: isDiscountAvailed
                ? "Discount marked as availed"
                : "Discount unmarked",
            data: {
                isDiscountAvailed,
                type,
                id,
            },
        });
    } catch (error) {
        console.error("Toggle discount availed error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while updating discount status",
        });
    }
};

/**
 * @desc    Get discount status for a specific bidder or member
 * @route   GET /api/v1/cashier/:type/:id/discount-status
 * @access  Private (Cashier only)
 */
export const getDiscountStatus = async (req, res) => {
    try {
        const { type, id } = req.params;
        let isDiscountAvailed = false;
        let found = false;

        if (type === 'bidder') {
            const now = new Date();
            const activeSubscription = await UserSubscription.findOne({
                user: id,
                status: "active",
                expiresAt: { $gt: now },
            });

            if (activeSubscription) {
                isDiscountAvailed = activeSubscription.isDiscountAvailed || false;
                found = true;
            }
        } else if (type === 'member') {
            const member = await Member.findById(id);
            if (member) {
                isDiscountAvailed = member.isDiscountAvailed || false;
                found = true;
            }
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid type. Must be 'bidder' or 'member'",
            });
        }

        if (!found) {
            return res.status(404).json({
                success: false,
                message: `${type} not found or not active`,
            });
        }

        res.status(200).json({
            success: true,
            data: {
                isDiscountAvailed,
                type,
                id,
            },
        });
    } catch (error) {
        console.error("Get discount status error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching discount status",
        });
    }
};
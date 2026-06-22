import Member from "../models/member.model.js";
import User from "../models/user.model.js";
import UserSubscription from "../models/userSubscription.model.js";
import { StripeService } from "../services/stripeService.js";

/**
 * @desc    Add member(s) to JLTM Junkie subscription
 * @route   POST /api/v1/members/add
 * @access  Private (JLTM Junkie subscribers only)
 */
export const addMembers = async (req, res) => {
    try {
        const { members } = req.body; // Array of members: [{ firstName, lastName, phoneNumber }]
        const userId = req.user._id;

        // Validate members array
        if (!members || !Array.isArray(members) || members.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide at least one member to add",
            });
        }

        if (members.length > 2) {
            return res.status(400).json({
                success: false,
                message: "You can add a maximum of 2 members at a time",
            });
        }

        // Get user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if user has JLTM Junkie subscription
        const activeSubscription = await UserSubscription.findOne({
            user: userId,
            status: "active",
            expiresAt: { $gt: new Date() },
            isCurrent: true,
        });

        if (!activeSubscription) {
            return res.status(403).json({
                success: false,
                message: "You need an active JLTM Junkie subscription to add members",
            });
        }

        // Check if the subscription is actually JLTM Junkie
        // You need to check the subscription title or ID
        // const isJLTMJunkie = activeSubscription.title === "JLTM junkie" ||
        //     activeSubscription.subscription?.title === "JLTM junkie";

        // If you want to check by ID instead:
        const isJLTMJunkie = activeSubscription.subscription.toString() === "69ca05a65d27190a2f01ba81";

        if (!isJLTMJunkie) {
            return res.status(403).json({
                success: false,
                message: "JLTM Junkie subscription is required to add members",
            });
        }

        // Check if user has remaining slots
        const remainingSlots = await Member.getRemainingSlots(userId);
        if (remainingSlots === 0) {
            return res.status(400).json({
                success: false,
                message: "You have already added the maximum of 2 members",
            });
        }

        if (members.length > remainingSlots) {
            return res.status(400).json({
                success: false,
                message: `You can only add ${remainingSlots} more member(s)`,
            });
        }

        // Validate member data
        for (const member of members) {
            if (!member.firstName || !member.lastName || !member.phoneNumber) {
                return res.status(400).json({
                    success: false,
                    message: "All members must have firstName, lastName, and phoneNumber",
                });
            }
        }

        // Calculate total amount
        const totalAmount = members.length * 20; // $20 per member

        // Ensure user has Stripe customer ID
        if (!user.stripeCustomerId) {
            return res.status(400).json({
                success: false,
                message: "No payment method found. Please add a payment method first.",
            });
        }

        // Process payment
        let paymentIntent = null;
        try {
            paymentIntent = await StripeService.createImmediateCharge(
                user.stripeCustomerId,
                user.paymentMethodId,
                totalAmount,
                `Add ${members.length} member(s) - ${members.map(m => m.firstName + ' ' + m.lastName).join(', ')}`
            );

            if (paymentIntent.status !== "succeeded") {
                throw new Error("Payment failed");
            }
        } catch (paymentError) {
            console.error("Payment error:", paymentError);
            return res.status(400).json({
                success: false,
                message: `Payment failed: ${paymentError.message}`,
            });
        }

        // Create member records
        const createdMembers = [];
        for (const memberData of members) {
            const member = await Member.create({
                mainSubscriber: userId,
                firstName: memberData.firstName.trim(),
                lastName: memberData.lastName.trim(),
                phoneNumber: memberData.phoneNumber.trim(),
                expiresAt: activeSubscription.expiresAt,
                paymentIntentId: paymentIntent.id,
                amountPaid: 20, // Each member costs $20
                currency: "USD",
                status: "active",
                isActive: true,
            });
            createdMembers.push(member);
        }

        res.status(200).json({
            success: true,
            message: `${members.length} member(s) added successfully`,
            data: {
                members: createdMembers,
                totalAmount: totalAmount,
                paymentIntent: {
                    id: paymentIntent.id,
                    status: paymentIntent.status,
                    amount: paymentIntent.amount,
                },
                remainingSlots: await Member.getRemainingSlots(userId),
            },
        });
    } catch (error) {
        console.error("Add members error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to add members",
        });
    }
};

/**
 * @desc    Get all members for the current user
 * @route   GET /api/v1/members/my-members
 * @access  Private
 */
export const getMyMembers = async (req, res) => {
    try {
        const userId = req.user._id;

        const members = await Member.find({
            mainSubscriber: userId,
        }).sort({ createdAt: -1 });

        const remainingSlots = await Member.getRemainingSlots(userId);

        res.status(200).json({
            success: true,
            data: {
                members,
                totalMembers: members.length,
                remainingSlots,
                maxSlots: 2,
            },
        });
    } catch (error) {
        console.error("Get members error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch members",
        });
    }
};

/**
 * @desc    Check if user can add members and get status
 * @route   GET /api/v1/members/status
 * @access  Private
 */
export const getMemberStatus = async (req, res) => {
    try {
        const userId = req.user._id;

        // Check if user has active JLTM Junkie subscription
        const activeSubscription = await UserSubscription.findOne({
            user: userId,
            status: "active",
            expiresAt: { $gt: new Date() },
            isCurrent: true,
        });

        let canAddMembers = false;
        let hasJLTMJunkie = false;
        let remainingSlots = 0;
        let activeMembers = [];

        if (activeSubscription) {
            // Check if it's JLTM Junkie
            hasJLTMJunkie = activeSubscription.title === "JLTM junkie" ||
                activeSubscription.subscription?.title === "JLTM junkie";

            if (hasJLTMJunkie) {
                remainingSlots = await Member.getRemainingSlots(userId);
                canAddMembers = remainingSlots > 0;
                activeMembers = await Member.find({
                    mainSubscriber: userId,
                    status: "active",
                });
            }
        }

        res.status(200).json({
            success: true,
            data: {
                canAddMembers,
                hasJLTMJunkie,
                remainingSlots,
                maxSlots: 2,
                activeMembersCount: activeMembers.length,
                subscriptionExpiry: activeSubscription?.expiresAt || null,
            },
        });
    } catch (error) {
        console.error("Get member status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch member status",
        });
    }
};

/**
 * @desc    Get all members with pagination and search
 * @route   GET /api/v1/admin/members
 * @access  Private (Admin only)
 */
export const getAllMembers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            status = "all",
        } = req.query;

        // Build filter
        const filter = {};

        if (status === "active") {
            filter.isActive = true;
            filter.status = "active";
            filter.expiresAt = { $gt: new Date() };
        } else if (status === "inactive") {
            filter.isActive = false;
        } else if (status === "expired") {
            filter.status = "expired";
            filter.expiresAt = { $lt: new Date() };
        }

        // Search filter
        if (search && search.trim()) {
            const searchTerm = search.trim();
            filter.$or = [
                { firstName: { $regex: searchTerm, $options: "i" } },
                { lastName: { $regex: searchTerm, $options: "i" } },
                { phoneNumber: { $regex: searchTerm, $options: "i" } },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get members with populated mainSubscriber
        const members = await Member.find(filter)
            .populate("mainSubscriber", "firstName lastName email phone")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Member.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                members,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalMembers: total,
                    limit: parseInt(limit),
                    hasNextPage: skip + members.length < total,
                    hasPrevPage: skip > 0,
                },
            },
        });
    } catch (error) {
        console.error("Get all members error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch members",
        });
    }
};

/**
 * @desc    Toggle member active status
 * @route   PATCH /api/v1/admin/members/:memberId/status
 * @access  Private (Admin only)
 */
export const toggleMemberStatus = async (req, res) => {
    try {
        const { memberId } = req.params;

        const member = await Member.findById(memberId);
        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found",
            });
        }

        // Toggle isActive status
        member.isActive = !member.isActive;
        
        // If deactivating, also set status to inactive
        if (!member.isActive) {
            member.status = "inactive";
        } else {
            member.status = "active";
        }

        await member.save();

        res.status(200).json({
            success: true,
            message: member.isActive ? "Member activated successfully" : "Member deactivated successfully",
            data: {
                isActive: member.isActive,
                status: member.status,
            },
        });
    } catch (error) {
        console.error("Toggle member status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update member status",
        });
    }
};

/**
 * @desc    Delete a member
 * @route   DELETE /api/v1/admin/members/:memberId
 * @access  Private (Admin only)
 */
export const deleteMember = async (req, res) => {
    try {
        const { memberId } = req.params;

        const member = await Member.findById(memberId);
        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found",
            });
        }

        await member.deleteOne();

        res.status(200).json({
            success: true,
            message: "Member deleted successfully",
        });
    } catch (error) {
        console.error("Delete member error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete member",
        });
    }
};

/**
 * @desc    Get a single member by ID
 * @route   GET /api/v1/admin/members/:memberId
 * @access  Private (Admin only)
 */
export const getMemberById = async (req, res) => {
    try {
        const { memberId } = req.params;

        const member = await Member.findById(memberId)
            .populate("mainSubscriber", "firstName lastName email phone");

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                member,
            },
        });
    } catch (error) {
        console.error("Get member by ID error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch member details",
        });
    }
};

/**
 * @desc    Update a member
 * @route   PATCH /api/v1/admin/members/:memberId
 * @access  Private (Admin only)
 */
export const updateMember = async (req, res) => {
    try {
        const { memberId } = req.params;
        const { firstName, lastName, phoneNumber } = req.body;

        // Find member
        const member = await Member.findById(memberId);
        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found",
            });
        }

        // Update fields
        if (firstName) member.firstName = firstName.trim();
        if (lastName) member.lastName = lastName.trim();
        if (phoneNumber) member.phoneNumber = phoneNumber.trim();

        await member.save();

        res.status(200).json({
            success: true,
            message: "Member updated successfully",
            data: {
                member,
            },
        });
    } catch (error) {
        console.error("Update member error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update member",
        });
    }
};
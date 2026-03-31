import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
import UserSubscription from "../models/userSubscription.model.js";
import { StripeService } from "../services/stripeService.js";

/**
 * @desc    Purchase a subscription
 * @route   POST /api/v1/subscriptions/purchase
 * @access  Private
 */
export const purchaseSubscription = async (req, res) => {
    try {
        const { subscriptionId, paymentMethodId } = req.body;
        const userId = req.user._id;

        // Validate subscription exists
        const subscription = await Subscription.findOne({
            _id: subscriptionId,
            isActive: true,
        });

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription plan not found",
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

        // Calculate end date
        const startDate = new Date();
        let endDate = new Date(startDate);
        const durationValue = subscription.duration.value;
        const durationUnit = subscription.duration.unit;

        switch (durationUnit) {
            case "day":
                endDate.setDate(endDate.getDate() + durationValue);
                break;
            case "week":
                endDate.setDate(endDate.getDate() + durationValue * 7);
                break;
            case "month":
                endDate.setMonth(endDate.getMonth() + durationValue);
                break;
            case "year":
                endDate.setFullYear(endDate.getFullYear() + durationValue);
                break;
            default:
                endDate.setMonth(endDate.getMonth() + 1); // Default 1 month
        }

        // Calculate amount in cents for Stripe
        const amountInCents = Math.round(subscription.price.amount * 100);

        let paymentIntent = null;
        let paymentMethodToUse = paymentMethodId;

        // If user already has a saved card and no new card provided
        if (!paymentMethodToUse && user.paymentMethodId) {
            paymentMethodToUse = user.paymentMethodId;
        }

        if (!paymentMethodToUse) {
            return res.status(400).json({
                success: false,
                message: "Payment method is required",
            });
        }

        // Ensure user has Stripe customer ID
        if (!user.stripeCustomerId) {
            // Create Stripe customer if not exists
            const customer = await StripeService.createCustomer(
                user.email,
                `${user.firstName} ${user.lastName}`
            );
            user.stripeCustomerId = customer.id;

            // Attach payment method to customer
            await StripeService.attachPaymentMethod(user.stripeCustomerId, paymentMethodToUse);
            await user.save();
        }

        try {
            // Create and charge payment intent
            paymentIntent = await StripeService.createImmediateCharge(
                user.stripeCustomerId,
                paymentMethodToUse,
                amountInCents,
                `${subscription.title} Subscription - ${durationValue} ${durationUnit}${durationValue > 1 ? 's' : ''}`
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

        // Create user subscription record
        const userSubscription = await UserSubscription.create({
            user: userId,
            subscription: subscriptionId,
            title: subscription.title,
            description: subscription.description,
            features: subscription.features,
            duration: subscription.duration,
            price: subscription.price,
            startDate,
            endDate,
            expiresAt: endDate,
            paymentIntentId: paymentIntent.id,
            paymentStatus: "succeeded",
            amountPaid: subscription.price.amount,
            currency: subscription.price.currency,
            status: "active",
        });

        // If this is the first active subscription or user had none, set isCurrent to true
        const activeSubscriptions = await UserSubscription.find({
            user: userId,
            status: "active",
            expiresAt: { $gt: new Date() },
        });

        if (activeSubscriptions.length === 1) {
            userSubscription.isCurrent = true;
            await userSubscription.save();
        } else {
            // If there are multiple active subscriptions, only the latest should be current
            // Set all others to isCurrent false
            await UserSubscription.updateMany(
                { user: userId, _id: { $ne: userSubscription._id } },
                { isCurrent: false }
            );
        }

        // Update subscription's subscriber count
        await Subscription.findByIdAndUpdate(subscriptionId, {
            $inc: { subscriberCount: 1 },
        });

        res.status(200).json({
            success: true,
            message: "Subscription purchased successfully",
            data: {
                subscription: userSubscription,
                paymentIntent: {
                    id: paymentIntent.id,
                    status: paymentIntent.status,
                    amount: paymentIntent.amount,
                },
            },
        });
    } catch (error) {
        console.error("Purchase subscription error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to purchase subscription",
        });
    }
};

/**
 * @desc    Get user's subscription history
 * @route   GET /api/v1/subscriptions/my-subscriptions
 * @access  Private
 */
export const getUserSubscriptions = async (req, res) => {
    try {
        const userId = req.user._id;
        const { status, page = 1, limit = 10 } = req.query;

        const filter = { user: userId };
        if (status) {
            filter.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const subscriptions = await UserSubscription.find(filter)
            .populate("subscription", "title slug tag")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await UserSubscription.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                subscriptions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalSubscriptions: total,
                    hasNextPage: skip + subscriptions.length < total,
                    hasPrevPage: skip > 0,
                },
            },
        });
    } catch (error) {
        console.error("Get user subscriptions error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch subscriptions",
        });
    }
};

/**
 * @desc    Get user's current active subscription
 * @route   GET /api/v1/subscriptions/active
 * @access  Private
 */
export const getActiveSubscription = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();

        const activeSubscription = await UserSubscription.findOne({
            user: userId,
            status: "active",
            expiresAt: { $gt: now },
        })
            .populate("subscription", "title slug tag")
            .sort({ expiresAt: 1 });

        if (!activeSubscription) {
            return res.status(200).json({
                success: true,
                data: null,
                hasActiveSubscription: false,
            });
        }

        // Calculate days remaining
        const daysRemaining = Math.ceil(
            (new Date(activeSubscription.expiresAt) - now) / (1000 * 60 * 60 * 24)
        );

        res.status(200).json({
            success: true,
            data: {
                ...activeSubscription.toObject(),
                daysRemaining,
                isActive: true,
            },
            hasActiveSubscription: true,
        });
    } catch (error) {
        console.error("Get active subscription error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch active subscription",
        });
    }
};

/**
 * @desc    Lightweight check if user has active subscription
 * @route   GET /api/v1/subscriptions/check-active
 * @access  Private
 */
export const checkActiveSubscription = async (req, res) => {
    try {
        const userId = req.user._id;
        const hasActive = await UserSubscription.hasActiveSubscription(userId);

        res.status(200).json({
            success: true,
            hasActiveSubscription: hasActive,
        });
    } catch (error) {
        console.error("Check active subscription error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to check subscription status",
        });
    }
};

/**
 * @desc    Cancel a subscription (mark as cancelled but keep until expiry)
 * @route   PATCH /api/v1/subscriptions/:subscriptionId/cancel
 * @access  Private
 */
export const cancelSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const userId = req.user._id;

        const subscription = await UserSubscription.findOne({
            _id: subscriptionId,
            user: userId,
        });

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found",
            });
        }

        if (subscription.status !== "active") {
            return res.status(400).json({
                success: false,
                message: "Only active subscriptions can be cancelled",
            });
        }

        subscription.status = "cancelled";
        await subscription.save();

        res.status(200).json({
            success: true,
            message: "Subscription cancelled successfully. You can use it until expiry.",
            data: subscription,
        });
    } catch (error) {
        console.error("Cancel subscription error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to cancel subscription",
        });
    }
};
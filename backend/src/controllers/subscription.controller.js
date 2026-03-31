import Subscription from "../models/subscription.model.js";

/**
 * @desc    Create a new subscription
 * @route   POST /api/v1/admin/subscriptions
 * @access  Private/Admin
 */
export const createSubscription = async (req, res) => {
    try {
        const admin = req.user;
        const {
            title,
            description,
            features,
            duration,
            price,
            tag,
            isActive,
            isPopular,
            displayOrder,
        } = req.body;

        // Validate required fields
        if (!title || title.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Subscription title is required",
            });
        }

        if (!duration || !duration.value || !duration.unit) {
            return res.status(400).json({
                success: false,
                message: "Duration is required",
            });
        }

        if (!price || price.amount === undefined || price.amount < 0) {
            return res.status(400).json({
                success: false,
                message: "Price is required",
            });
        }

        // Check if subscription already exists
        const existingSubscription = await Subscription.findOne({
            title: title.trim(),
        });

        if (existingSubscription) {
            return res.status(400).json({
                success: false,
                message: "Subscription with this title already exists",
            });
        }

        // Parse features if they're sent as JSON string
        let parsedFeatures = [];
        if (features) {
            try {
                parsedFeatures =
                    typeof features === "string" ? JSON.parse(features) : features;
            } catch (e) {
                console.error("Features parsing error:", e);
            }
        }

        // Create subscription
        const subscription = await Subscription.create({
            title: title.trim(),
            description: description?.trim() || "",
            features: parsedFeatures.map((f) => ({
                text: f.text,
                included: f.included !== false,
            })),
            duration: {
                value: parseInt(duration.value),
                unit: duration.unit,
            },
            price: {
                amount: parseFloat(price.amount),
                currency: price.currency || "USD",
            },
            tag: tag?.trim() || "",
            isActive: isActive === "true" || isActive === true,
            isPopular: isPopular === "true" || isPopular === true,
            displayOrder: parseInt(displayOrder) || 0,
            createdBy: admin._id,
        });

        res.status(201).json({
            success: true,
            message: "Subscription created successfully",
            data: {
                subscription,
            },
        });
    } catch (error) {
        console.error("Create subscription error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to create subscription",
        });
    }
};

/**
 * @desc    Get all subscriptions
 * @route   GET /api/v1/admin/subscriptions
 * @access  Private/Admin
 */
export const getAllSubscriptions = async (req, res) => {
    try {
        const {
            search = "",
            isActive,
            page = 1,
            limit = 20,
            sortBy = "displayOrder",
            sortOrder = "asc",
        } = req.query;

        // Build filter
        const filter = {};

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { tag: { $regex: search, $options: "i" } },
            ];
        }

        if (isActive !== undefined) {
            filter.isActive = isActive === "true";
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Sort
        const sort = {};
        sort[sortBy] = sortOrder === "desc" ? -1 : 1;

        // Get subscriptions
        const subscriptions = await Subscription.find(filter)
            .populate("createdBy", "username email")
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const totalSubscriptions = await Subscription.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                subscriptions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalSubscriptions / limit),
                    totalSubscriptions,
                    hasNextPage: skip + subscriptions.length < totalSubscriptions,
                    hasPrevPage: skip > 0,
                },
            },
        });
    } catch (error) {
        console.error("Get all subscriptions error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch subscriptions",
        });
    }
};

/**
 * @desc    Get subscription by ID
 * @route   GET /api/v1/admin/subscriptions/:id
 * @access  Private/Admin
 */
export const getSubscriptionById = async (req, res) => {
    try {
        const { id } = req.params;

        const subscription = await Subscription.findById(id).populate(
            "createdBy",
            "username email",
        );

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                subscription,
            },
        });
    } catch (error) {
        console.error("Get subscription by ID error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch subscription",
        });
    }
};

/**
 * @desc    Update subscription
 * @route   PUT /api/v1/admin/subscriptions/:id
 * @access  Private/Admin
 */
export const updateSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            features,
            duration,
            price,
            tag,
            isActive,
            isPopular,
            displayOrder,
        } = req.body;

        // Find subscription
        const subscription = await Subscription.findById(id);
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found",
            });
        }

        // Check if title is being changed and if it already exists
        if (title && title.trim() !== subscription.title) {
            const existingSubscription = await Subscription.findOne({
                title: title.trim(),
                _id: { $ne: id },
            });
            if (existingSubscription) {
                return res.status(400).json({
                    success: false,
                    message: "Subscription with this title already exists",
                });
            }
            subscription.title = title.trim();
        }

        // Update fields
        if (description !== undefined)
            subscription.description = description.trim();
        if (features) {
            try {
                const parsedFeatures =
                    typeof features === "string" ? JSON.parse(features) : features;
                subscription.features = parsedFeatures.map((f) => ({
                    text: f.text,
                    included: f.included !== false,
                }));
            } catch (e) {
                console.error("Features parsing error:", e);
            }
        }
        if (duration) {
            subscription.duration = {
                value: parseInt(duration.value),
                unit: duration.unit,
            };
        }
        if (price) {
            subscription.price = {
                amount: parseFloat(price.amount),
                currency: price.currency || subscription.price.currency,
            };
        }
        if (tag !== undefined) subscription.tag = tag?.trim() || "";
        if (isActive !== undefined)
            subscription.isActive = isActive === "true" || isActive === true;
        if (isPopular !== undefined)
            subscription.isPopular = isPopular === "true" || isPopular === true;
        if (displayOrder !== undefined)
            subscription.displayOrder = parseInt(displayOrder) || 0;

        await subscription.save();

        res.status(200).json({
            success: true,
            message: "Subscription updated successfully",
            data: {
                subscription,
            },
        });
    } catch (error) {
        console.error("Update subscription error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update subscription",
        });
    }
};

/**
 * @desc    Delete subscription
 * @route   DELETE /api/v1/admin/subscriptions/:id
 * @access  Private/Admin
 */
export const deleteSubscription = async (req, res) => {
    try {
        const { id } = req.params;

        const subscription = await Subscription.findById(id);
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found",
            });
        }

        // Check if subscription has active users
        // You'll need to import User model and check for active subscriptions
        // This is a placeholder - implement based on your user subscription logic
        if (subscription.subscriberCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete subscription. There are ${subscription.subscriberCount} active subscribers.`,
            });
        }

        await subscription.deleteOne();

        res.status(200).json({
            success: true,
            message: "Subscription deleted successfully",
        });
    } catch (error) {
        console.error("Delete subscription error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete subscription",
        });
    }
};

/**
 * @desc    Toggle subscription status (Active/Inactive)
 * @route   PATCH /api/v1/admin/subscriptions/:id/toggle-status
 * @access  Private/Admin
 */
export const toggleSubscriptionStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const subscription = await Subscription.findById(id);
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found",
            });
        }

        subscription.isActive = !subscription.isActive;
        await subscription.save();

        res.status(200).json({
            success: true,
            message: `Subscription ${subscription.isActive ? "activated" : "deactivated"} successfully`,
            data: {
                subscription,
            },
        });
    } catch (error) {
        console.error("Toggle subscription status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to toggle subscription status",
        });
    }
};

/**
 * @desc    Toggle popular status
 * @route   PATCH /api/v1/admin/subscriptions/:id/toggle-popular
 * @access  Private/Admin
 */
export const togglePopularStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const subscription = await Subscription.findById(id);
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found",
            });
        }

        subscription.isPopular = !subscription.isPopular;
        await subscription.save();

        res.status(200).json({
            success: true,
            message: `Subscription ${subscription.isPopular ? "marked as popular" : "removed from popular"} successfully`,
            data: {
                subscription,
            },
        });
    } catch (error) {
        console.error("Toggle popular status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to toggle popular status",
        });
    }
};

/**
 * @desc    Get active subscriptions for public display
 * @route   GET /api/v1/subscriptions/public/active
 * @access  Public
 */
export const getActiveSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({
            isActive: true,
        })
            .select(
                "title slug description features duration price tag isPopular displayOrder",
            )
            .sort({ displayOrder: 1, title: 1 });

        res.status(200).json({
            success: true,
            data: subscriptions,
        });
    } catch (error) {
        console.error("Get active subscriptions error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch subscriptions",
        });
    }
};

/**
 * @desc    Get subscription by slug
 * @route   GET /api/v1/subscriptions/public/:slug
 * @access  Public
 */
export const getSubscriptionBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const subscription = await Subscription.findOne({
            slug,
            isActive: true,
        }).select(
            "title slug description features duration price tag isPopular displayOrder",
        );

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found",
            });
        }

        res.status(200).json({
            success: true,
            data: subscription,
        });
    } catch (error) {
        console.error("Get subscription by slug error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch subscription",
        });
    }
};

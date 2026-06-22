import { model, Schema } from "mongoose";

const memberSchema = new Schema(
    {
        // Main subscriber who added this member (JLTM Junkie user)
        mainSubscriber: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Member details
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
        },
        // Subscription expiry (same as main subscriber's expiry)
        expiresAt: {
            type: Date,
            required: true,
        },
        // Member status
        isActive: {
            type: Boolean,
            default: true,
        },
        // Discount tracking
        isDiscountAvailed: {
            type: Boolean,
            default: false,
        },
        // Payment details
        paymentIntentId: {
            type: String,
            required: true,
        },
        amountPaid: {
            type: Number,
            required: true,
            default: 20,
        },
        currency: {
            type: String,
            default: "USD",
        },
        // Status
        status: {
            type: String,
            enum: ["active", "expired", "inactive"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
memberSchema.index({ mainSubscriber: 1 });
memberSchema.index({ mainSubscriber: 1, isActive: 1 });
memberSchema.index({ phoneNumber: 1 });
memberSchema.index({ expiresAt: 1 });

// Static method to check if subscriber can add more members
memberSchema.statics.canAddMember = async function (subscriberId) {
    const count = await this.countDocuments({
        mainSubscriber: subscriberId,
        status: "active",
    });
    return count < 2; // Max 2 members per subscriber
};

// Static method to get remaining member slots
memberSchema.statics.getRemainingSlots = async function (subscriberId) {
    const count = await this.countDocuments({
        mainSubscriber: subscriberId,
        status: "active",
    });
    return Math.max(0, 2 - count);
};

// Static method to get all active members for a subscriber
memberSchema.statics.getActiveMembers = async function (subscriberId) {
    return await this.find({
        mainSubscriber: subscriberId,
        status: "active",
    });
};

const Member = model("Member", memberSchema);
export default Member;
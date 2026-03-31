import { model, Schema } from "mongoose";

const userSubscriptionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subscription: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    // Subscription details at time of purchase (snapshot)
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    features: [
      {
        text: String,
        included: Boolean,
      },
    ],
    duration: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        required: true,
        enum: ["day", "week", "month", "year"],
      },
    },
    price: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },
    // Subscription period
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    // Payment details
    paymentIntentId: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "succeeded", "failed", "refunded"],
      default: "pending",
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    // Subscription status
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "pending"],
      default: "pending",
    },
    // For tracking multiple subscriptions
    isCurrent: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
userSubscriptionSchema.index({ user: 1, status: 1 });
userSubscriptionSchema.index({ user: 1, isCurrent: 1 });
userSubscriptionSchema.index({ expiresAt: 1 });
userSubscriptionSchema.index({ paymentIntentId: 1 });

// Compound index for finding active subscriptions
userSubscriptionSchema.index({ user: 1, status: 1, expiresAt: 1 });

// Method to check if subscription is active
userSubscriptionSchema.methods.isActive = function () {
  return this.status === "active" && new Date() < this.expiresAt;
};

// Static method to get user's current active subscription
userSubscriptionSchema.statics.getActiveSubscription = async function (userId) {
  const now = new Date();
  return await this.findOne({
    user: userId,
    status: "active",
    expiresAt: { $gt: now },
  }).sort({ expiresAt: 1 }); // Get the one that expires soonest
};

// Static method to get all active subscriptions for a user (if you allow stacking)
userSubscriptionSchema.statics.getActiveSubscriptions = async function (userId) {
  const now = new Date();
  return await this.find({
    user: userId,
    status: "active",
    expiresAt: { $gt: now },
  }).sort({ expiresAt: 1 });
};

// Static method to check if user has any active subscription
userSubscriptionSchema.statics.hasActiveSubscription = async function (userId) {
  const now = new Date();
  const count = await this.countDocuments({
    user: userId,
    status: "active",
    expiresAt: { $gt: now },
  });
  return count > 0;
};

const UserSubscription = model("UserSubscription", userSubscriptionSchema);
export default UserSubscription;
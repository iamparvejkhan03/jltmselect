import { Router } from "express";
import { auth, authAdmin } from "../middlewares/auth.middleware.js";
import {
  purchaseSubscription,
  getUserSubscriptions,
  getActiveSubscription,
  checkActiveSubscription,
  cancelSubscription,
  setCurrentSubscription,
  getAllUserSubscriptions,
  upgradeSubscription,
  checkUpgradeEligibility,
} from "../controllers/userSubscription.controller.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

const userSubscriptionRouter = Router();

// Protected routes - require authentication
userSubscriptionRouter.use(auth);

// Purchase a subscription
userSubscriptionRouter.post("/purchase", purchaseSubscription);

// upgrade a subscription
userSubscriptionRouter.post("/upgrade", upgradeSubscription);

// Get user's subscription history
userSubscriptionRouter.get("/my-subscriptions", getUserSubscriptions);

// Get current active subscription
userSubscriptionRouter.get("/active", getActiveSubscription);

// Check if user has active subscription (lightweight)
userSubscriptionRouter.get("/check-active", checkActiveSubscription);

userSubscriptionRouter.get("/upgrade/:planId/check", checkUpgradeEligibility);

// Cancel a specific subscription
userSubscriptionRouter.patch("/:subscriptionId/cancel", cancelSubscription);

// Set the subscription as currently active
userSubscriptionRouter.patch('/:subscriptionId/set-current', setCurrentSubscription);

// Get all subscription purchased for admin
userSubscriptionRouter.get('/admin/all-user-subscriptions', authAdmin, requirePermission("manage_subscriptions"), getAllUserSubscriptions);

export default userSubscriptionRouter;
import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";
import {
  purchaseSubscription,
  getUserSubscriptions,
  getActiveSubscription,
  checkActiveSubscription,
  cancelSubscription,
} from "../controllers/userSubscription.controller.js";

const userSubscriptionRouter = Router();

// Protected routes - require authentication
userSubscriptionRouter.use(auth);

// Purchase a subscription
userSubscriptionRouter.post("/purchase", purchaseSubscription);

// Get user's subscription history
userSubscriptionRouter.get("/my-subscriptions", getUserSubscriptions);

// Get current active subscription
userSubscriptionRouter.get("/active", getActiveSubscription);

// Check if user has active subscription (lightweight)
userSubscriptionRouter.get("/check-active", checkActiveSubscription);

// Cancel a specific subscription
userSubscriptionRouter.patch("/:subscriptionId/cancel", cancelSubscription);

export default userSubscriptionRouter;
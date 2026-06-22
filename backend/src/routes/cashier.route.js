import { Router } from "express";
import { auth, authCashier } from "../middlewares/auth.middleware.js";
import {
    getBiddersWithActiveSubscription,
    toggleDiscountAvailed,
    getDiscountStatus,
} from "../controllers/cashier.controller.js";

const cashierRouter = Router();

// All routes require authentication and cashier role
cashierRouter.use(auth, authCashier);

// Get all bidders with active subscriptions (including members)
cashierRouter.get("/bidders", getBiddersWithActiveSubscription);

// Toggle discount availed for bidder or member
cashierRouter.patch("/:type/:id/discount", toggleDiscountAvailed);

// Get discount status for bidder or member
cashierRouter.get("/:type/:id/discount-status", getDiscountStatus);

export default cashierRouter;
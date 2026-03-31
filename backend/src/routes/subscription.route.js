import express from 'express';
import {
    createSubscription,
    getAllSubscriptions,
    getSubscriptionById,
    updateSubscription,
    deleteSubscription,
    toggleSubscriptionStatus,
    togglePopularStatus,
    getActiveSubscriptions,
    getSubscriptionBySlug,
} from '../controllers/subscription.controller.js';
import { auth, authAdmin } from '../middlewares/auth.middleware.js';

const subscriptionRouter = express.Router();

// =============================================
// PUBLIC ROUTES - No authentication required
// =============================================

// Get active subscriptions for public display
subscriptionRouter.get('/public/active', getActiveSubscriptions);

// Get subscription by slug
subscriptionRouter.get('/public/:slug', getSubscriptionBySlug);

// =============================================
// ADMIN ROUTES - Authentication required
// =============================================

// All admin routes require authentication and admin privileges
subscriptionRouter.use(auth, authAdmin);

// Subscription management
subscriptionRouter.post('/', createSubscription);
subscriptionRouter.get('/', getAllSubscriptions);
subscriptionRouter.get('/:id', getSubscriptionById);
subscriptionRouter.put('/:id', updateSubscription);
subscriptionRouter.delete('/:id', deleteSubscription);

// Status toggles
subscriptionRouter.patch('/:id/toggle-status', toggleSubscriptionStatus);
subscriptionRouter.patch('/:id/toggle-popular', togglePopularStatus);

export default subscriptionRouter;
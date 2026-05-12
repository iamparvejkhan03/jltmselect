import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export const useSubscriptionGuard = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
    const [checking, setChecking] = useState(true);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

    // Check if user is exempt from subscription requirement
    const isExemptFromSubscription = () => {
        if (!user) return false;
        
        // Admins are always exempt
        if (user.userType === 'admin' || user.userType === 'staff') return true;
        
        // Sellers are exempt (they can view auctions without subscription)
        if (user.userType === 'seller') return true;
        
        // Brokers are exempt
        if (user.userType === 'broker') return true;
        
        return false;
    };

    const checkSubscription = async () => {
        if (!isAuthenticated || !user) {
            setHasActiveSubscription(false);
            setChecking(false);
            return;
        }

        // If user is exempt (admin/seller/broker), skip subscription check
        if (isExemptFromSubscription()) {
            setHasActiveSubscription(true); // Treat as having subscription
            setChecking(false);
            return;
        }

        try {
            const { data } = await axiosInstance.get("/api/v1/user-subscription/check-active");
            setHasActiveSubscription(data.hasActiveSubscription);
        } catch (error) {
            console.error("Subscription check error:", error);
            setHasActiveSubscription(false);
        } finally {
            setChecking(false);
        }
    };

    useEffect(() => {
        checkSubscription();
    }, [isAuthenticated, user]);

    // For auction-specific access (seller of the auction should have access)
    const canAccessAuction = (auctionSellerId) => {
        if (!user) return false;
        
        // Admin can access any auction
        if (user.userType === 'admin') return true;
        
        // Seller can access their own auction
        if (user.userType === 'seller' && auctionSellerId && user._id === auctionSellerId) return true;
        
        // Broker can access auctions they're associated with (if needed)
        if (user.userType === 'broker') return true;
        
        // Regular users need subscription
        return hasActiveSubscription;
    };

    const guardAction = (action, auctionSellerId = null) => {
        if (!isAuthenticated || !user) {
            toast.error("Please login to view auctions");
            navigate("/login");
            return false;
        }

        // Check if user can access this specific auction
        if (auctionSellerId && !canAccessAuction(auctionSellerId)) {
            setShowSubscriptionModal(true);
            return false;
        }

        // For non-auction specific actions, check general access
        if (!auctionSellerId && !isExemptFromSubscription() && !hasActiveSubscription) {
            setShowSubscriptionModal(true);
            return false;
        }

        if (action) {
            action();
        }
        return true;
    };

    return {
        hasActiveSubscription,
        checking,
        showSubscriptionModal,
        setShowSubscriptionModal,
        guardAction,
        checkSubscription,
        isExemptFromSubscription,
        canAccessAuction
    };
};
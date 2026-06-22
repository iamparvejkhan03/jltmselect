import { useState, useEffect } from "react";
import {
    AccountInactiveBanner,
    BidderContainer,
    BidderHeader,
    BidderSidebar,
    LoadingSpinner
} from "../../components";
import {
    CreditCard,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    TrendingUp,
    Wallet,
    Zap,
    ChevronRight,
    Star,
    Award,
    Loader
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import SubscriptionModal from "../../components/SubscriptionModal";

function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [activeSubscription, setActiveSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [statistics, setStatistics] = useState({
        totalSpent: 0,
        activePlans: 0,
        totalPurchases: 0,
        daysRemaining: 0
    });

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradePlans, setUpgradePlans] = useState([]);
    const [loadingUpgrade, setLoadingUpgrade] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [upgradeEligibility, setUpgradeEligibility] = useState(null);

    useEffect(() => {
        fetchSubscriptions();
        fetchActiveSubscription();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data } = await axiosInstance.get("/api/v1/user-subscription/my-subscriptions");

            if (data.success) {
                setSubscriptions(data.data.subscriptions);

                // Calculate statistics
                const totalSpent = data.data.subscriptions.reduce(
                    (sum, sub) => sum + (sub.amountPaid || 0),
                    0
                );
                const totalPurchases = data.data.subscriptions.length;

                setStatistics(prev => ({
                    ...prev,
                    totalSpent,
                    totalPurchases
                }));
            } else {
                setError("Failed to fetch subscriptions");
            }
        } catch (err) {
            setError("Error loading subscriptions");
            console.error("Fetch subscriptions error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveSubscription = async () => {
        try {
            const { data } = await axiosInstance.get("/api/v1/user-subscription/active");

            if (data.success && data.hasActiveSubscription) {
                setActiveSubscription(data.data);
                setStatistics(prev => ({
                    ...prev,
                    activePlans: 1,
                    daysRemaining: data.data.daysRemaining || 0
                }));
            }
        } catch (err) {
            console.error("Fetch active subscription error:", err);
        }
    };

    const handleActivatePlan = async (subscriptionId) => {
        try {
            const { data } = await axiosInstance.patch(`/api/v1/user-subscription/${subscriptionId}/set-current`);

            if (data.success) {
                toast.success(data.message);
                // Refresh both subscriptions and active subscription
                await fetchSubscriptions();
                await fetchActiveSubscription();
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to activate plan");
        }
    };

    const checkUpgradeEligibility = async (planId) => {
        try {
            const { data } = await axiosInstance.get(`/api/v1/user-subscription/upgrade/${planId}/check`);
            if (data.success) {
                setUpgradeEligibility(data.data);
                return data.data;
            }
        } catch (err) {
            console.error("Check eligibility error:", err);
            return null;
        }
    };

    // Add this function to handle upgrade
    const handleUpgrade = async (planId) => {
        try {
            setLoadingUpgrade(true);
            const { data } = await axiosInstance.post("/api/v1/user-subscription/upgrade", {
                subscriptionId: planId,
                paymentMethodId: null
            });

            if (data.success) {
                toast.success(data.message);
                setShowUpgradeModal(false);
                // Refresh data
                await fetchSubscriptions();
                await fetchActiveSubscription();
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to upgrade subscription");
        } finally {
            setLoadingUpgrade(false);
        }
    };

    const handleUpgradeClick = async () => {
        try {
            // Fetch available plans for upgrade
            const { data } = await axiosInstance.get("/api/v1/subscriptions/public/active");
            if (data.success) {
                const allPlans = data.data;

                // Filter plans that are upgrades (longer duration)
                const currentDuration = getDurationInDays(
                    activeSubscription.duration.value,
                    activeSubscription.duration.unit
                );

                const eligiblePlans = allPlans.filter(plan => {
                    const planDuration = getDurationInDays(plan.duration.value, plan.duration.unit);
                    return planDuration > currentDuration;
                });

                setUpgradePlans(eligiblePlans);
                setShowUpgradeModal(true);
            }
        } catch (err) {
            console.error("Failed to load upgrade plans:", err);
            toast.error("Failed to load upgrade plans");
        }
    };

    // Helper function to convert duration to days
    const getDurationInDays = (value, unit) => {
        switch (unit) {
            case "day": return value;
            case "week": return value * 7;
            case "month": return value * 30;
            case "year": return value * 365;
            default: return value;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "active":
                return (
                    <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                        <CheckCircle size={12} />
                        Active
                    </span>
                );
            case "expired":
                return (
                    <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        <XCircle size={12} />
                        Expired
                    </span>
                );
            case "cancelled":
                return (
                    <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">
                        <AlertCircle size={12} />
                        Cancelled
                    </span>
                );
            default:
                return null;
        }
    };

    const getDaysRemaining = (expiresAt) => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diffTime = expiry - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 0;
        return diffDays;
    };

    if (loading) {
        return (
            <section className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
                <BidderSidebar />
                <div className="w-full relative">
                    <BidderHeader />
                    <BidderContainer>
                        <div className="flex justify-center items-center min-h-96">
                            <LoadingSpinner />
                        </div>
                    </BidderContainer>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
                <BidderSidebar />
                <div className="w-full relative">
                    <BidderHeader />
                    <BidderContainer>
                        <AccountInactiveBanner />
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                            <p className="text-red-600">{error}</p>
                            <button
                                onClick={fetchSubscriptions}
                                className="mt-4 bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-lg"
                            >
                                Try Again
                            </button>
                        </div>
                    </BidderContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            <BidderSidebar />

            <div className="w-full relative">
                <BidderHeader />

                <BidderContainer>
                    <AccountInactiveBanner />

                    {/* Header */}
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <CreditCard className="text-primary" size={32} />
                                    <h2 className="text-3xl md:text-4xl font-bold bg-primary bg-clip-text text-transparent">
                                        My Membership
                                    </h2>
                                </div>
                            </div>
                            {/* <Link 
                                to="/pricing" 
                                className="mt-4 md:mt-0 bg-primary text-white hover:bg-primary/90 px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2"
                            >
                                <Zap size={18} />
                                Upgrade Plan
                                <ChevronRight size={18} />
                            </Link> */}
                        </div>
                    </div>

                    {/* Active Subscription Card */}
                    {activeSubscription && (
                        <div className="mb-8">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg overflow-hidden">
                                <div className="p-6 md:p-8">
                                    <div className="flex items-start justify-between flex-wrap gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Star size={20} className="text-yellow-300 fill-current" />
                                                <span className="text-yellow-100 text-sm font-semibold uppercase tracking-wide">
                                                    Active Plan
                                                </span>
                                            </div>
                                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                                {activeSubscription.title}
                                            </h3>
                                            <p className="text-emerald-100 mb-4">
                                                {activeSubscription.description}
                                            </p>
                                            <div className="flex flex-wrap gap-4">
                                                <div>
                                                    <p className="text-emerald-100 text-sm">Valid Until</p>
                                                    <p className="text-white font-semibold">
                                                        {formatDate(activeSubscription.expiresAt)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-emerald-100 text-sm">Days Remaining</p>
                                                    <p className="text-white font-semibold text-2xl">
                                                        {statistics.daysRemaining}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-emerald-100 text-sm">Amount Paid</p>
                                                    <p className="text-white font-semibold">
                                                        {formatCurrency(activeSubscription.amountPaid)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="bg-white/10 rounded-xl p-4 text-center">
                                                <Wallet size={32} className="text-white mx-auto mb-2" />
                                                <p className="text-white text-2xl font-bold">
                                                    {formatCurrency(activeSubscription.amountPaid)}
                                                </p>
                                                <p className="text-emerald-100 text-sm">Subscription Paid</p>
                                            </div>
                                            {/* Add Upgrade Button */}
                                            <button
                                                onClick={handleUpgradeClick}
                                                className="bg-white text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 w-full justify-center"
                                            >
                                                <Zap size={18} />
                                                Upgrade Plan
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Total Spent</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {formatCurrency(statistics.totalSpent)}
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <TrendingUp size={24} className="text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Total Purchases</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {statistics.totalPurchases}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <CreditCard size={24} className="text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Active Plans</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {statistics.activePlans}
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <Award size={24} className="text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Included Section */}
                    {activeSubscription && activeSubscription.features && activeSubscription.features.length > 0 && (
                        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Star size={18} className="text-primary" />
                                Features Included in Your Plan
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {activeSubscription.features.map((feature, idx) => (
                                    feature.included !== false && (
                                        <div key={idx} className="flex items-center gap-2">
                                            <CheckCircle size={14} className="text-green-500" />
                                            <span className="text-sm text-gray-700">{feature.text}</span>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Subscription History */}
                    <div className="bg-white mt-5 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900">
                                Purchase History
                            </h3>
                            <p className="text-gray-500 text-sm mt-1">
                                All your past and current subscriptions
                            </p>
                        </div>

                        {subscriptions.length === 0 ? (
                            <div className="p-12 text-center">
                                <CreditCard size={64} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                    No subscriptions yet
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    Purchase a subscription plan to start bidding on auctions
                                </p>
                                <button
                                    onClick={() => setShowSubscriptionModal(true)}
                                    className="inline-block bg-primary text-white hover:bg-primary/90 px-6 py-3 rounded-lg font-semibold transition-all"
                                >
                                    View Plans
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {subscriptions.map((subscription) => {
                                    const daysRemaining = subscription.status === "active"
                                        ? getDaysRemaining(subscription.expiresAt)
                                        : 0;

                                    return (
                                        <div key={subscription._id} className="p-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="text-lg font-semibold text-gray-900">
                                                            {subscription.title}
                                                        </h4>
                                                        {getStatusBadge(subscription.status)}
                                                    </div>
                                                    <p className="text-gray-600 text-sm mb-2">
                                                        {subscription.description}
                                                    </p>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-gray-500">Start Date</p>
                                                            <p className="font-medium text-gray-700 flex items-center gap-1">
                                                                <Calendar size={14} />
                                                                {formatDate(subscription.startDate)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500">Expiry Date</p>
                                                            <p className="font-medium text-gray-700 flex items-center gap-1">
                                                                <Calendar size={14} />
                                                                {formatDate(subscription.expiresAt)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500">Duration</p>
                                                            <p className="font-medium text-gray-700 flex items-center gap-1">
                                                                <Clock size={14} />
                                                                {subscription.duration?.value} {subscription.duration?.unit}
                                                                {subscription.duration?.value > 1 ? 's' : ''}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500">Amount</p>
                                                            <p className="font-semibold text-green-600">
                                                                {formatCurrency(subscription.amountPaid)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {subscription?.isCurrent && daysRemaining <= 7 && (
                                                        <div className="mb-2">
                                                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                                                                Expires in {daysRemaining} days
                                                            </span>
                                                        </div>
                                                    )}

                                                    {subscription?.isCurrent &&
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700 inline-flex items-center gap-1">
                                                            <CheckCircle size={12} />
                                                            Currently Active
                                                        </span>
                                                        {/* <Link
                                                                to="/pricing"
                                                                className="text-primary hover:text-primary/80 text-sm font-semibold inline-flex items-center gap-1"
                                                            >
                                                                Renew Plan
                                                                <ChevronRight size={14} />
                                                            </Link> */}
                                                    </div>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </BidderContainer>
            </div>

            {/* Subscription Modal */}
            <SubscriptionModal
                isOpen={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
                onSuccess={() => {
                    fetchSubscriptions();
                    fetchActiveSubscription();
                }}
            />

            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Upgrade Your Plan</h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    Get more features and longer duration
                                </p>
                            </div>
                            <button
                                onClick={() => setShowUpgradeModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <XCircle size={24} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Current Plan Info */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <p className="text-sm text-gray-500">Current Plan</p>
                                <div className="flex items-center justify-between mt-1">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{activeSubscription?.title}</h3>
                                        <p className="text-sm text-gray-600">
                                            {activeSubscription?.duration.value} {activeSubscription?.duration.unit}
                                            {activeSubscription?.duration.value > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Remaining</p>
                                        <p className="font-semibold text-emerald-600">{statistics.daysRemaining} days</p>
                                    </div>
                                </div>
                            </div>

                            {upgradePlans.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No upgrade plans available</p>
                                    <button
                                        onClick={() => setShowUpgradeModal(false)}
                                        className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {upgradePlans.map((plan) => (
                                        <div
                                            key={plan._id}
                                            className={`border rounded-xl p-4 transition-all ${selectedPlan?._id === plan._id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold text-gray-900">{plan.title}</h4>
                                                        {plan.isPopular && (
                                                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                                                                Popular
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <span className="text-sm text-gray-600">
                                                            {plan.duration.value} {plan.duration.unit}
                                                            {plan.duration.value > 1 ? 's' : ''}
                                                        </span>
                                                        <span className="text-sm font-semibold text-primary">
                                                            {formatCurrency(plan.price.amount)}
                                                        </span>
                                                    </div>
                                                    {/* Features */}
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {plan.features.slice(0, 3).map((feature, idx) => (
                                                            feature.included !== false && (
                                                                <span key={idx} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                                                                    <CheckCircle size={10} />
                                                                    {feature.text}
                                                                </span>
                                                            )
                                                        ))}
                                                        {plan.features.length > 3 && (
                                                            <span className="text-xs text-gray-400">+{plan.features.length - 3} more</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        const eligibility = await checkUpgradeEligibility(plan._id);
                                                        if (eligibility?.eligible) {
                                                            setSelectedPlan(plan);
                                                        } else {
                                                            toast.error("This plan cannot be upgraded to");
                                                        }
                                                    }}
                                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${selectedPlan?._id === plan._id
                                                        ? 'bg-primary text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {selectedPlan?._id === plan._id ? 'Selected' : 'Select'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Upgrade Summary */}
                            {selectedPlan && upgradeEligibility && (
                                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Upgrade Summary</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Current Plan</span>
                                            <span className="font-medium">{activeSubscription?.title}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">New Plan</span>
                                            <span className="font-medium">{selectedPlan.title}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Remaining Days</span>
                                            <span className="font-medium text-emerald-600">{upgradeEligibility.remainingDays} days</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">New Duration</span>
                                            <span className="font-medium">
                                                {selectedPlan.duration.value} {selectedPlan.duration.unit}
                                                {selectedPlan.duration.value > 1 ? 's' : ''}
                                                + {upgradeEligibility.remainingDays} days bonus
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                                            <span className="font-semibold text-gray-900">Amount to Pay</span>
                                            <span className="font-bold text-primary">
                                                {formatCurrency(selectedPlan.price.amount)}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleUpgrade(selectedPlan._id)}
                                        disabled={loadingUpgrade}
                                        className="mt-4 w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loadingUpgrade ? (
                                            <>
                                                <Loader size={18} className="animate-spin-slow" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Zap size={18} />
                                                Confirm Upgrade
                                            </>
                                        )}
                                    </button>

                                    <p className="text-xs my-2 text-gray-600">Note: This amount will be charged from your saved card.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default Subscriptions;
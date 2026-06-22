import { useState, useEffect } from "react";
import {
    BidderContainer,
    BidderHeader,
    BidderSidebar,
    LoadingSpinner,
    AccountInactiveBanner,
    SubscriptionModal
} from "../../components";
import {
    Users,
    UserPlus,
    Phone,
    User,
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock,
    Search,
    CreditCard,
    UserCheck,
    UserX,
    Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";

const AllMembers = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [memberStatus, setMemberStatus] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [debounceTimer, setDebounceTimer] = useState(null);
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [subscriptions, setSubscriptions] = useState([]);
    const [activeSubscription, setActiveSubscription] = useState(null);
    const [statistics, setStatistics] = useState({
        totalSpent: 0,
        activePlans: 0,
        totalPurchases: 0,
        daysRemaining: 0
    });

    const [canAccessPage, setCanAccessPage] = useState(true);
    const [accessMessage, setAccessMessage] = useState("");
    const [accessTitle, setAccessTitle] = useState("");

    const fetchMembers = async (search = "", status = "all") => {
        try {
            setLoading(true);

            // First check if user can access this page
            const statusResponse = await axiosInstance.get("/api/v1/members/status");

            if (statusResponse.data.success) {
                const statusData = statusResponse.data.data;

                // Check if user has JLTM Junkie subscription
                if (!statusData.hasJLTMJunkie) {
                    setCanAccessPage(false);
                    setAccessTitle("JLTM Junkie Subscription Required");
                    setAccessMessage("You need an active JLTM Junkie subscription to view and manage members. Upgrade your plan to unlock this feature.");
                    setLoading(false);
                    return;
                }

                // Check if user has any members (optional - still show page even with 0 members)
                setMemberStatus({
                    totalMembers: statusData.activeMembersCount || 0,
                    remainingSlots: statusData.remainingSlots,
                    maxSlots: statusData.maxSlots,
                });
            }

            // If user has JLTM Junkie, fetch their members
            const { data } = await axiosInstance.get("/api/v1/members/my-members");

            if (data.success) {
                let filteredMembers = data.data.members;

                // Apply search filter
                if (search) {
                    const searchLower = search.toLowerCase();
                    filteredMembers = filteredMembers.filter(member =>
                        member.firstName.toLowerCase().includes(searchLower) ||
                        member.lastName.toLowerCase().includes(searchLower) ||
                        member.phoneNumber.includes(search)
                    );
                }

                // Apply status filter
                if (status !== "all") {
                    filteredMembers = filteredMembers.filter(member =>
                        member.status === status
                    );
                }

                setMembers(filteredMembers);
                setCanAccessPage(true);
            }
        } catch (error) {
            console.error("Error fetching members:", error);
            toast.error("Failed to load members");
        } finally {
            setLoading(false);
        }
    };

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

    useEffect(() => {
        fetchMembers(searchTerm, statusFilter);
    }, [statusFilter]);

    const handleSearch = (value) => {
        setSearchTerm(value);

        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            fetchMembers(value, statusFilter);
        }, 500);

        setDebounceTimer(timer);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status, expiresAt) => {
        if (status === "expired") {
            return (
                <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    <XCircle size={12} />
                    Expired
                </span>
            );
        }

        if (status === "inactive") {
            return (
                <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">
                    <XCircle size={12} />
                    Inactive
                </span>
            );
        }

        // Check if member is expired based on date
        if (expiresAt && new Date(expiresAt) < new Date()) {
            return (
                <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    <XCircle size={12} />
                    Expired
                </span>
            );
        }

        return (
            <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                <CheckCircle size={12} />
                Active
            </span>
        );
    };

    const getDaysRemaining = (expiresAt) => {
        if (!expiresAt) return 0;
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diffTime = expiry - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const getDiscountStatusBadge = (isDiscountAvailed) => {
        if (isDiscountAvailed) {
            return (
                <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    <UserCheck size={12} />
                    Discount Availed
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                <UserX size={12} />
                Not Availed
            </span>
        );
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

    // Show access denied page if user doesn't have JLTM Junkie
    if (!canAccessPage) {
        return (
            <section className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
                <BidderSidebar />
                <div className="w-full relative">
                    <BidderHeader />
                    <BidderContainer>
                        <AccountInactiveBanner />
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center max-w-2xl mx-auto">
                            <AlertCircle size={48} className="text-yellow-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {accessTitle}
                            </h2>
                            <p className="text-gray-600 mb-4">
                                {accessMessage}
                            </p>
                            <button
                                onClick={() => navigate('/bidder/subscriptions')}
                                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                            >
                                <Zap size={18} />
                                Upgrade to JLTM Junkie Plan
                            </button>
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

                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Users size={32} className="text-primary" />
                                    <h2 className="text-3xl md:text-4xl font-bold bg-primary bg-clip-text text-transparent">
                                        My Members
                                    </h2>
                                </div>
                                <p className="text-gray-600">
                                    View and manage all members added to your JLTM Junkie subscription
                                </p>
                            </div>
                            {memberStatus && memberStatus.remainingSlots > 0 && (
                                <button
                                    onClick={() => navigate("/bidder/members/add")}
                                    className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    <UserPlus size={18} />
                                    Add Member ({memberStatus.remainingSlots} slots left)
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    {/* {memberStatus && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">Total Members</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">
                                            {memberStatus.totalMembers}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <Users size={24} className="text-blue-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">Remaining Slots</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">
                                            {memberStatus.remainingSlots} / {memberStatus.maxSlots}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <UserPlus size={24} className="text-green-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">Active Members</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">
                                            {members.filter(m => m.status === "active" && (!m.expiresAt || new Date(m.expiresAt) > new Date())).length}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-full">
                                        <UserCheck size={24} className="text-purple-600" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )} */}

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search members by name or phone..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Members List */}
                    {members.length > 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {members.map((member) => {
                                            const daysRemaining = getDaysRemaining(member.expiresAt);
                                            const isExpired = member.status === "expired" || (member.expiresAt && new Date(member.expiresAt) < new Date());

                                            return (
                                                <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                                <User size={18} className="text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900">
                                                                    {member.firstName} {member.lastName}
                                                                </p>
                                                                {/* <p className="text-xs text-gray-500">
                                                                    {member._id}
                                                                </p> */}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Phone size={14} className="text-gray-400" />
                                                            <span className="text-sm text-gray-600">{member.phoneNumber}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            {getStatusBadge(member.status, member.expiresAt)}
                                                            {!isExpired && daysRemaining > 0 && daysRemaining <= 7 && (
                                                                <span className="text-xs text-amber-600 flex items-center gap-1">
                                                                    <Clock size={12} />
                                                                    Expires in {daysRemaining} days
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getDiscountStatusBadge(member.isDiscountAvailed)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={14} className="text-gray-400" />
                                                            <span className="text-sm text-gray-600">
                                                                {formatDate(member.expiresAt)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={14} className="text-gray-400" />
                                                            <span className="text-sm text-gray-600">
                                                                {formatDate(member.createdAt)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer Info */}
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="text-sm text-orange-500">
                                        Showing {members.length} members
                                        {memberStatus && ` (${memberStatus.remainingSlots} slots remaining)`}
                                    </div>
                                    {memberStatus && memberStatus.remainingSlots > 0 && (
                                        <button
                                            onClick={() => navigate("/bidder/members/add")}
                                            className="text-sm text-primary hover:text-primary/80 font-semibold inline-flex items-center gap-1"
                                        >
                                            <UserPlus size={14} />
                                            Add more members
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            {searchTerm ? (
                                <>
                                    <Search size={48} className="mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No members found</h3>
                                    <p className="text-gray-500">No members match your search criteria</p>
                                    <button
                                        onClick={() => {
                                            setSearchTerm("");
                                            fetchMembers("", statusFilter);
                                        }}
                                        className="mt-4 text-primary hover:text-primary/80 font-semibold"
                                    >
                                        Clear search
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No members added yet</h3>
                                    <p className="text-gray-500 mb-6">
                                        You haven't added any members to your JLTM Junkie subscription yet
                                    </p>
                                    {memberStatus && memberStatus.remainingSlots > 0 && (
                                        <button
                                            onClick={() => navigate("/bidder/members/add")}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                        >
                                            <UserPlus size={18} />
                                            Add Your First Member
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </BidderContainer>
            </div>
        </section>
    );
};

export default AllMembers;
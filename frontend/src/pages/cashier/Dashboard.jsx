import { useState, useEffect } from "react";
import {
    CashierContainer,
    CashierHeader,
    CashierSidebar,
} from "../../components";
import { Search, User, Mail, Phone, Calendar, Tag, Shield, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

const Dashboard = () => {
    const [bidders, setBidders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debounceTimer, setDebounceTimer] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalBidders: 0,
    });

    const fetchBidders = async (page = 1, search = "") => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page: page.toString(),
                limit: 100,
            });

            if (search) {
                params.append("search", search);
            }

            const { data } = await axiosInstance.get(`/api/v1/cashier/bidders?${params}`);

            if (data.success) {
                setBidders(data.data.bidders);
                setPagination(data.data.pagination);
            }
        } catch (error) {
            console.error("Error fetching bidders:", error);
            toast.error("Failed to load bidders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBidders(1, searchTerm);
    }, []);

    const handleSearch = (value) => {
        setSearchTerm(value);

        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            fetchBidders(1, value);
        }, 500);

        setDebounceTimer(timer);
    };

    const handleToggleDiscount = async (bidderId, currentStatus) => {
        try {
            const { data } = await axiosInstance.patch(
                `/api/v1/cashier/bidders/${bidderId}/discount`
            );

            if (data.success) {
                toast.success(data.message);
                // Update local state
                setBidders((prev) =>
                    prev.map((bidder) =>
                        bidder._id === bidderId
                            ? { ...bidder, isDiscountAvailed: !currentStatus }
                            : bidder
                    )
                );
            }
        } catch (error) {
            console.error("Error toggling discount:", error);
            toast.error(error?.response?.data?.message || "Failed to update discount status");
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <section className="flex min-h-screen bg-gray-50">
            <CashierSidebar />

            <div className="w-full relative">
                <CashierHeader />

                <CashierContainer>
                    <div className="pt-16 pb-7 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold my-5">
                                    Bidders with Active Subscription
                                </h2>
                                <p className="text-gray-600">
                                    Manage discount availed status for active subscribers
                                </p>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {pagination.totalBidders} active bidders
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by phone number, name, or email..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Bidders Table */}
                    {loading ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        </div>
                    ) : bidders.length > 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-16">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Bidder
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Subscription
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Expiry Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Discount Availed
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {bidders.map((bidder) => (
                                            <tr key={bidder._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <User size={18} className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {bidder.firstName} {bidder.lastName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-gray-600 flex items-center gap-1">
                                                            <Mail size={14} /> {bidder.email}
                                                        </p>
                                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                                            <Phone size={14} /> {bidder.phone}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Tag size={14} className="text-green-500" />
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {bidder.subscriptionTitle}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={14} className="text-gray-400" />
                                                        <span className="text-sm text-gray-600">
                                                            {formatDate(bidder.subscriptionExpiry)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() =>
                                                            handleToggleDiscount(bidder._id, bidder.isDiscountAvailed)
                                                        }
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${bidder.isDiscountAvailed ? "bg-green-600" : "bg-gray-300"
                                                            }`}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${bidder.isDiscountAvailed ? "translate-x-6" : "translate-x-1"
                                                                }`}
                                                        />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                                        <div className="text-sm text-gray-700">
                                            Showing page {pagination.currentPage} of {pagination.totalPages}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => fetchBidders(pagination.currentPage - 1, searchTerm)}
                                                disabled={!pagination.hasPrevPage}
                                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => fetchBidders(pagination.currentPage + 1, searchTerm)}
                                                disabled={!pagination.hasNextPage}
                                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <Shield size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No active subscriptions found</h3>
                            <p className="text-gray-500">
                                {searchTerm
                                    ? "No bidders match your search criteria"
                                    : "There are no bidders with active subscriptions at the moment"}
                            </p>
                            {searchTerm && (
                                <button
                                    onClick={() => {
                                        setSearchTerm("");
                                        fetchBidders(1, "");
                                    }}
                                    className="mt-4 text-blue-600 hover:text-blue-800"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    )}
                </CashierContainer>
            </div>
        </section>
    );
};

export default Dashboard;
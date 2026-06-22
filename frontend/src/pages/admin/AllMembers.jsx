import { useState, useEffect } from "react";
import { AdminContainer, AdminHeader, AdminSidebar } from "../../components";
import {
    Plus,
    Search,
    Trash2,
    User,
    Mail,
    Phone,
    Users,
    UserPlus,
    Calendar,
    AlertCircle,
    CheckCircle,
    XCircle,
    Eye,
    EyeOff,
    UserPen
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";

const AllMembers = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [debounceTimer, setDebounceTimer] = useState(null);
    const navigate = useNavigate();

    const fetchMembers = async (page = 1, search = "", status = "all") => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page: page.toString(),
                limit: 10,
            });

            if (search) {
                params.append("search", search);
            }

            if (status !== "all") {
                params.append("status", status);
            }

            const { data } = await axiosInstance.get(`/api/v1/admin/members?${params}`);

            if (data.success) {
                setMembers(data.data.members);
                setPagination(data.data.pagination);
            }
        } catch (error) {
            console.error("Error fetching members:", error);
            toast.error("Failed to load members");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers(1, searchTerm, statusFilter);
    }, [statusFilter]);

    const handleSearch = (value) => {
        setSearchTerm(value);

        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            fetchMembers(1, value, statusFilter);
        }, 500);

        setDebounceTimer(timer);
    };

    const handleStatusToggle = async (memberId, currentStatus) => {
        try {
            const { data } = await axiosInstance.patch(`/api/v1/admin/members/${memberId}/status`, {
                isActive: !currentStatus,
            });

            if (data.success) {
                toast.success(data.message);
                fetchMembers(1, searchTerm, statusFilter);
            }
        } catch (error) {
            console.error("Error updating member status:", error);
            toast.error("Failed to update member status");
        }
    };

    const handleDelete = async (memberId, memberName) => {
        if (!window.confirm(`Are you sure you want to delete ${memberName}? This action cannot be undone.`)) {
            return;
        }

        try {
            const { data } = await axiosInstance.delete(`/api/v1/admin/members/${memberId}`);

            if (data.success) {
                toast.success("Member deleted successfully");
                fetchMembers(1, searchTerm, statusFilter);
            }
        } catch (error) {
            console.error("Error deleting member:", error);
            toast.error("Failed to delete member");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (isActive, status, expiresAt) => {
        // Check if expired
        if (status === "expired" || (expiresAt && new Date(expiresAt) < new Date())) {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <XCircle size={12} className="mr-1" />
                    Expired
                </span>
            );
        }

        if (!isActive) {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <XCircle size={12} className="mr-1" />
                    Inactive
                </span>
            );
        }

        return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle size={12} className="mr-1" />
                Active
            </span>
        );
    };

    const getDiscountBadge = (isDiscountAvailed) => {
        if (isDiscountAvailed) {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <CheckCircle size={12} className="mr-1" />
                    Availed
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                <AlertCircle size={12} className="mr-1" />
                Not Availed
            </span>
        );
    };

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AdminSidebar />

            <div className="w-full relative">
                <AdminHeader />

                <AdminContainer>
                    <div className="pt-16 md:py-7">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold">Members Management</h1>
                                <p className="text-gray-600 mt-1">Manage all members added to JLTM Junkie subscriptions</p>
                            </div>
                            <div className="mt-4 md:mt-0 flex items-center gap-2">
                                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {pagination?.totalMembers || 0} Total Members
                                </span>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search members by name, phone..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Members Table */}
                        {loading ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            </div>
                        ) : members.length > 0 ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added By</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {members.map((member) => (
                                                <tr key={member._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                                <User size={18} className="text-purple-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900">
                                                                    {member.firstName} {member.lastName}
                                                                </p>
                                                                <p className="text-xs flex items-center gap-1 text-gray-500">
                                                                    <Phone size={12} /> {member.phoneNumber}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {member.mainSubscriber ? (
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {member.mainSubscriber.firstName} {member.mainSubscriber.lastName}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {member.mainSubscriber.email}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">N/A</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getStatusBadge(member.isActive, member.status, member.expiresAt)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getDiscountBadge(member.isDiscountAvailed)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={14} className="text-gray-400" />
                                                            <span className="text-sm text-gray-600">
                                                                {formatDate(member.expiresAt)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <div className="flex items-center gap-2 justify-end">
                                                            <button
                                                                onClick={() => handleStatusToggle(member._id, member.isActive)}
                                                                className={`p-2 rounded-lg transition-colors ${member.isActive
                                                                        ? 'text-amber-600 hover:bg-amber-50'
                                                                        : 'text-green-600 hover:bg-green-50'
                                                                    }`}
                                                                title={member.isActive ? "Deactivate" : "Activate"}
                                                            >
                                                                {member.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/admin/members/edit/${member?._id}`)}
                                                                className="p-2 rounded-lg text-yellow-600 hover:bg-yellow-50 transition-colors"
                                                                title="Edit"
                                                            >
                                                                <UserPen size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(member._id, `${member.firstName} ${member.lastName}`)}
                                                                className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Info */}
                                {pagination && (
                                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div className="text-sm text-gray-500">
                                            Showing {members.length} of {pagination.totalMembers} members
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => fetchMembers(pagination.currentPage - 1, searchTerm, statusFilter)}
                                                disabled={!pagination.hasPrevPage}
                                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            >
                                                Previous
                                            </button>
                                            <span className="px-3 py-1 text-sm text-gray-700">
                                                Page {pagination.currentPage} of {pagination.totalPages}
                                            </span>
                                            <button
                                                onClick={() => fetchMembers(pagination.currentPage + 1, searchTerm, statusFilter)}
                                                disabled={!pagination.hasNextPage}
                                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">No members found</h3>
                                <p className="text-gray-500 mb-6">
                                    {searchTerm
                                        ? "No members match your search criteria"
                                        : "No members have been added to any JLTM Junkie subscriptions yet"}
                                </p>
                            </div>
                        )}
                    </div>
                </AdminContainer>
            </div>
        </section>
    );
};

export default AllMembers;
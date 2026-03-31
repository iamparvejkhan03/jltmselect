import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    X,
    Save,
    Tag,
    CheckCircle,
    AlertCircle,
    Settings,
    DollarSign,
    Clock,
    Star,
    List,
    PlusCircle,
    MinusCircle,
    GripVertical,
    Trash,
    Copy,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { AdminContainer, AdminHeader, AdminSidebar } from "../../components";

function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [subscriptionToDelete, setSubscriptionToDelete] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        search: "",
        status: "all",
        sortBy: "displayOrder",
        sortOrder: "asc",
    });

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        features: [],
        duration: {
            value: 1,
            unit: "month",
        },
        price: {
            amount: 0,
            currency: "USD",
        },
        tag: "",
        isActive: true,
        isPopular: false,
        displayOrder: 0,
    });

    // Feature input
    const [newFeature, setNewFeature] = useState("");

    // Fetch subscriptions
    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get('/api/v1/subscriptions', {
                params: { limit: 1000 }
            });

            if (data.success) {
                setSubscriptions(data.data.subscriptions);
                setFilteredSubscriptions(data.data.subscriptions);
            }
        } catch (error) {
            console.error('Fetch subscriptions error:', error);
            toast.error('Failed to load subscriptions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    useEffect(() => {
        let filtered = [...subscriptions];

        // Search filter
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(sub =>
                sub.title.toLowerCase().includes(searchTerm) ||
                (sub.description && sub.description.toLowerCase().includes(searchTerm)) ||
                (sub.tag && sub.tag.toLowerCase().includes(searchTerm))
            );
        }

        // Status filter
        if (filters.status === 'active') {
            filtered = filtered.filter(sub => sub.isActive === true);
        } else if (filters.status === 'inactive') {
            filtered = filtered.filter(sub => sub.isActive === false);
        }

        // Sort
        filtered.sort((a, b) => {
            const aValue = a[filters.sortBy];
            const bValue = b[filters.sortBy];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return filters.sortOrder === 'desc'
                    ? bValue.localeCompare(aValue)
                    : aValue.localeCompare(bValue);
            }

            return filters.sortOrder === 'desc'
                ? bValue - aValue
                : aValue - bValue;
        });

        setFilteredSubscriptions(filtered);
    }, [subscriptions, filters]);

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({
            search: "",
            status: "all",
            sortBy: "displayOrder",
            sortOrder: "asc",
        });
    };

    // Add feature to list
    const addFeature = () => {
        if (newFeature.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, { text: newFeature.trim(), included: true }]
            }));
            setNewFeature("");
        }
    };

    // Remove feature
    const removeFeature = (index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    // Update feature text
    const updateFeature = (index, text) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.map((feature, i) =>
                i === index ? { ...feature, text } : feature
            )
        }));
    };

    // Toggle feature included status
    const toggleFeatureIncluded = (index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.map((feature, i) =>
                i === index ? { ...feature, included: !feature.included } : feature
            )
        }));
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error('Subscription title is required');
            return;
        }

        if (!formData.duration.value || formData.duration.value < 1) {
            toast.error('Duration value must be at least 1');
            return;
        }

        if (formData.price.amount < 0) {
            toast.error('Price cannot be negative');
            return;
        }

        try {
            setLoading(true);

            const payload = {
                ...formData,
                features: formData.features,
                duration: {
                    value: parseInt(formData.duration.value),
                    unit: formData.duration.unit,
                },
                price: {
                    amount: parseFloat(formData.price.amount),
                    currency: formData.price.currency,
                },
                displayOrder: parseInt(formData.displayOrder) || 0,
            };

            let response;
            if (editingSubscription) {
                response = await axiosInstance.put(
                    `/api/v1/subscriptions/${editingSubscription._id}`,
                    payload
                );
            } else {
                response = await axiosInstance.post(
                    '/api/v1/subscriptions',
                    payload
                );
            }

            if (response.data.success) {
                toast.success(editingSubscription ? 'Subscription updated successfully' : 'Subscription created successfully');
                resetForm();
                fetchSubscriptions();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save subscription');
        } finally {
            setLoading(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            features: [],
            duration: {
                value: 1,
                unit: "month",
            },
            price: {
                amount: 0,
                currency: "USD",
            },
            tag: "",
            isActive: true,
            isPopular: false,
            displayOrder: 0,
        });
        setNewFeature("");
        setEditingSubscription(null);
        setShowForm(false);
    };

    // Edit subscription
    const handleEdit = (subscription) => {
        setFormData({
            title: subscription.title,
            description: subscription.description || "",
            features: subscription.features || [],
            duration: {
                value: subscription.duration.value,
                unit: subscription.duration.unit,
            },
            price: {
                amount: subscription.price.amount,
                currency: subscription.price.currency,
            },
            tag: subscription.tag || "",
            isActive: subscription.isActive,
            isPopular: subscription.isPopular,
            displayOrder: subscription.displayOrder,
        });
        setEditingSubscription(subscription);
        setShowForm(true);
    };

    // Toggle status
    const toggleStatus = async (subscription) => {
        try {
            const { data } = await axiosInstance.patch(
                `/api/v1/subscriptions/${subscription._id}/toggle-status`
            );

            if (data.success) {
                toast.success(`Subscription ${data.data.subscription.isActive ? 'activated' : 'deactivated'}`);
                fetchSubscriptions();
            }
        } catch (error) {
            toast.error('Failed to update subscription status');
        }
    };

    // Toggle popular status
    const togglePopular = async (subscription) => {
        try {
            const { data } = await axiosInstance.patch(
                `/api/v1/subscriptions/${subscription._id}/toggle-popular`
            );

            if (data.success) {
                toast.success(data.message);
                fetchSubscriptions();
            }
        } catch (error) {
            toast.error('Failed to update popular status');
        }
    };

    // Delete subscription
    const handleDelete = async () => {
        if (!subscriptionToDelete) return;

        try {
            const { data } = await axiosInstance.delete(`/api/v1/subscriptions/${subscriptionToDelete._id}`);

            if (data.success) {
                toast.success('Subscription deleted successfully');
                setShowDeleteModal(false);
                setSubscriptionToDelete(null);
                fetchSubscriptions();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete subscription');
        }
    };

    // Format duration for display
    const formatDuration = (duration) => {
        const unitMap = {
            day: 'Day',
            week: 'Week',
            month: 'Month',
            year: 'Year',
        };
        const plural = duration.value > 1 ? 's' : '';
        return `${duration.value} ${unitMap[duration.unit]}${plural}`;
    };

    // Format price for display
    const formatPrice = (price) => {
        const currencySymbols = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            INR: '₹',
        };
        return `${currencySymbols[price.currency] || '$'}${price.amount.toFixed(2)}`;
    };

    if (loading && subscriptions.length === 0) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="w-full relative">
                    <AdminHeader />
                    <AdminContainer>
                        <div className="flex justify-center items-center min-h-96">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                        </div>
                    </AdminContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="w-full relative">
                <AdminHeader />
                <AdminContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold my-5 text-gray-800">
                                    Subscription Plans
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    Create and manage subscription plans for your users
                                </p>
                            </div>
                            <button
                                onClick={() => setShowForm(true)}
                                className="mt-4 md:mt-0 flex items-center gap-2 bg-primary text-white hover:bg-primary/90 px-4 py-3 rounded-lg transition-colors"
                            >
                                <Plus size={20} />
                                Add New Plan
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="lg:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search subscriptions..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            {/* Sort By */}
                            <div>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                >
                                    <option value="displayOrder">Sort by Order</option>
                                    <option value="title">Sort by Title</option>
                                    <option value="price.amount">Sort by Price</option>
                                    <option value="createdAt">Sort by Date</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <div className="text-sm text-gray-500">
                                Showing {filteredSubscriptions.length} subscription{filteredSubscriptions.length !== 1 ? 's' : ''}
                            </div>
                            <button
                                onClick={clearFilters}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Clear filters
                            </button>
                        </div>
                    </div>

                    {/* Subscriptions List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <Tag size={16} />
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Title / Tag
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Duration
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Features
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredSubscriptions.map((subscription) => (
                                        <tr key={subscription._id} className="hover:bg-gray-50">
                                            <td className="py-4 px-6">
                                                {subscription.isPopular ? (
                                                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                                                ) : (
                                                    <Star className="h-5 w-5 text-gray-500" />
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div>
                                                    <div className="font-medium text-gray-900 flex items-center gap-2">
                                                        {subscription.title}
                                                        {subscription.tag && (
                                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                                                {subscription.tag}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {subscription.description && (
                                                        <div className="text-xs text-gray-500 mt-1 max-w-md truncate">
                                                            {subscription.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <Clock size={14} />
                                                    {formatDuration(subscription.duration)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-semibold text-gray-900">
                                                    {formatPrice(subscription.price)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    per {subscription.duration.unit}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-1">
                                                    <List size={14} className="text-gray-400" />
                                                    <span className="text-sm text-gray-600">
                                                        {subscription.features?.length || 0} features
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${subscription.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {subscription.isActive ? (
                                                            <>
                                                                <CheckCircle size={12} />
                                                                Active
                                                            </>
                                                        ) : (
                                                            <>
                                                                <EyeOff size={12} />
                                                                Inactive
                                                            </>
                                                        )}
                                                    </span>
                                                    {subscription.isPopular && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                            <Star size={12} />
                                                            Popular
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => togglePopular(subscription)}
                                                        className="p-2 text-gray-400 hover:text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors"
                                                        title={subscription.isPopular ? 'Remove from popular' : 'Mark as popular'}
                                                    >
                                                        <Star size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(subscription)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                                        title="Edit Plan"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleStatus(subscription)}
                                                        className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                                                        title={subscription.isActive ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {subscription.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSubscriptionToDelete(subscription);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                                        title="Delete Plan"
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

                        {filteredSubscriptions.length === 0 && (
                            <div className="text-center py-12">
                                <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">No subscriptions found</h3>
                                <p className="text-gray-500 mb-6">
                                    {filters.search || filters.status !== "all"
                                        ? "No subscriptions match your current filters"
                                        : "Get started by creating your first subscription plan"}
                                </p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="inline-flex items-center gap-2 bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Plus size={18} />
                                    Create Subscription Plan
                                </button>
                            </div>
                        )}
                    </div>
                </AdminContainer>
            </div>

            {/* Subscription Form Modal */}
            {showForm && (
                <SubscriptionFormModal
                    formData={formData}
                    setFormData={setFormData}
                    editingSubscription={editingSubscription}
                    newFeature={newFeature}
                    setNewFeature={setNewFeature}
                    addFeature={addFeature}
                    removeFeature={removeFeature}
                    updateFeature={updateFeature}
                    toggleFeatureIncluded={toggleFeatureIncluded}
                    handleSubmit={handleSubmit}
                    resetForm={resetForm}
                    loading={loading}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && subscriptionToDelete && (
                <DeleteConfirmationModal
                    subscription={subscriptionToDelete}
                    onConfirm={handleDelete}
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setSubscriptionToDelete(null);
                    }}
                />
            )}
        </section>
    );
}

// Subscription Form Modal Component
const SubscriptionFormModal = ({
    formData,
    setFormData,
    editingSubscription,
    newFeature,
    setNewFeature,
    addFeature,
    removeFeature,
    updateFeature,
    toggleFeatureIncluded,
    handleSubmit,
    resetForm,
    loading
}) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl my-8">
            <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-900">
                        {editingSubscription ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
                    </h3>
                    <button
                        onClick={resetForm}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-700 flex items-center gap-2">
                                <Tag size={18} />
                                Basic Information
                            </h4>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Plan Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="e.g., Basic, Pro, Premium"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="Brief description of this subscription plan..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tag (e.g., Most Popular, Best Value)
                                </label>
                                <input
                                    type="text"
                                    value={formData.tag}
                                    onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="Optional tag for highlighting"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.displayOrder}
                                        onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-6">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                        className="h-4 w-4 text-orange-500 rounded focus:ring-orange-500"
                                    />
                                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                                        Active Plan
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isPopular"
                                        checked={formData.isPopular}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
                                        className="h-4 w-4 text-orange-500 rounded focus:ring-orange-500"
                                    />
                                    <label htmlFor="isPopular" className="ml-2 text-sm text-gray-700">
                                        Mark as Popular
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Pricing */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-700 flex items-center gap-2">
                                <DollarSign size={18} />
                                Pricing & Duration
                            </h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Amount *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                            $
                                        </span>
                                        <input
                                            type="number"
                                            value={formData.price.amount}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                price: { ...prev.price, amount: parseFloat(e.target.value) || 0 }
                                            }))}
                                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Currency
                                    </label>
                                    <select
                                        value={formData.price.currency}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            price: { ...prev.price, currency: e.target.value }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="INR">INR (₹)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Duration Value *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.duration.value}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            duration: { ...prev.duration, value: parseInt(e.target.value) || 1 }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Duration Unit *
                                    </label>
                                    <select
                                        value={formData.duration.unit}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            duration: { ...prev.duration, unit: e.target.value }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        <option value="day">Day(s)</option>
                                        <option value="week">Week(s)</option>
                                        <option value="month">Month(s)</option>
                                        <option value="year">Year(s)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-700 flex items-center gap-2">
                                <List size={18} />
                                Features
                            </h4>

                            <div className="space-y-3">
                                {formData.features.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => toggleFeatureIncluded(index)}
                                            className={`p-1 rounded ${feature.included ? 'text-green-600' : 'text-gray-400'}`}
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                        <input
                                            type="text"
                                            value={feature.text}
                                            onChange={(e) => updateFeature(index, e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="Feature description"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={newFeature}
                                    onChange={(e) => setNewFeature(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="Add a new feature..."
                                />
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg"
                                >
                                    <PlusCircle size={18} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500">
                                Features with a checkmark indicate included benefits
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={resetForm}
                        disabled={loading}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-primary text-white hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                        ) : (
                            <>
                                <Save size={18} />
                                {editingSubscription ? 'Update Plan' : 'Create Plan'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    </div>
);

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ subscription, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Delete Subscription Plan</h3>
            </div>

            <div className="mb-6">
                <p className="text-gray-600 mb-2">
                    Are you sure you want to delete the subscription plan <strong>"{subscription.title}"</strong>?
                </p>
                {subscription.subscriberCount > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                        <p className="text-sm text-yellow-700">
                            <strong>Note:</strong> This plan has {subscription.subscriberCount} active subscribers.
                            Deleting it may affect their subscriptions.
                        </p>
                    </div>
                )}
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                    <p className="text-sm text-red-700">
                        <strong>Warning:</strong> This action cannot be undone.
                    </p>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <Trash2 size={16} />
                    Delete Plan
                </button>
            </div>
        </div>
    </div>
);

export default Subscriptions;
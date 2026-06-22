import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
    AdminContainer,
    AdminHeader,
    AdminSidebar,
    LoadingSpinner,
    Modal
} from "../../components";
import {
    User,
    Mail,
    Phone,
    ArrowLeft,
    Save,
    X,
    Key,
    Globe,
    MapPin,
    Home,
    Building,
    Activity,
    CheckCircle,
    XCircle,
    Shield,
    Trash2,
    Eye,
    EyeOff,
    RefreshCw,
    Send,
    Bell,
    Mail as MailIcon,
    Tag,
    Plus,
    Minus
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";

const EditUser = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            firstName: "",
            lastName: "",
            username: "",
            email: "",
            phone: "",
            countryCode: "",
            countryName: "",
            address: {
                buildingNameNo: "",
                street: "",
                city: "",
                county: "",
                state: "",
                postCode: "",
                country: "",
            },
            preferences: {
                emailUpdates: true,
                smsUpdates: true,
                newsletter: true,
                favoriteCategories: [],
            },
            isActive: true,
            isVerified: false,
            isEmailVerified: false,
        },
    });

    const passwordForm = useForm({
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        }
    });

    const favoriteCategories = watch("preferences.favoriteCategories") || [];

    // Fetch user data
    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const { data } = await axiosInstance.get(`/api/v1/admin/users/${id}`);
                if (data.success) {
                    const user = data.data.user;
                    setUserData(user);

                    // Set form values
                    reset({
                        firstName: user.firstName || "",
                        lastName: user.lastName || "",
                        username: user.username || "",
                        email: user.email || "",
                        phone: user.phone || "",
                        countryCode: user.countryCode || "",
                        countryName: user.countryName || "",
                        address: {
                            buildingNameNo: user.address?.buildingNameNo || "",
                            street: user.address?.street || "",
                            city: user.address?.city || "",
                            county: user.address?.county || "",
                            state: user.address?.state || "",
                            postCode: user.address?.postCode || "",
                            country: user.address?.country || "",
                        },
                        preferences: {
                            emailUpdates: user.preferences?.emailUpdates !== undefined ? user.preferences.emailUpdates : true,
                            smsUpdates: user.preferences?.smsUpdates !== undefined ? user.preferences.smsUpdates : true,
                            newsletter: user.preferences?.newsletter !== undefined ? user.preferences.newsletter : true,
                            favoriteCategories: user.preferences?.favoriteCategories || [],
                        },
                        isActive: user.isActive !== undefined ? user.isActive : true,
                        isVerified: user.isVerified || false,
                        isEmailVerified: user.isEmailVerified || false,
                    });
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                toast.error(error?.response?.data?.message || "Failed to load user data");
                navigate("/admin/users");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id, reset, navigate]);

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);

            const payload = {
                firstName: data.firstName,
                lastName: data.lastName,
                username: data.username,
                email: data.email,
                phone: data.phone || "",
                countryCode: data.countryCode || "",
                countryName: data.countryName || "",
                address: {
                    buildingNameNo: data.address.buildingNameNo || "",
                    street: data.address.street || "",
                    city: data.address.city || "",
                    county: data.address.county || "",
                    state: data.address.state || "",
                    postCode: data.address.postCode || "",
                    country: data.address.country || "",
                },
                preferences: {
                    emailUpdates: data.preferences.emailUpdates,
                    smsUpdates: data.preferences.smsUpdates,
                    newsletter: data.preferences.newsletter,
                    favoriteCategories: data.preferences.favoriteCategories || [],
                },
                isActive: data.isActive,
                isVerified: data.isVerified,
                isEmailVerified: data.isEmailVerified,
            };

            const response = await axiosInstance.put(`/api/v1/admin/users/${id}`, payload);

            if (response.data.success) {
                toast.success("User updated successfully!");
                // Refresh user data
                const { data: updatedData } = await axiosInstance.get(`/api/v1/admin/users/${id}`);
                if (updatedData.success) {
                    setUserData(updatedData.data.user);
                }
            }
        } catch (error) {
            console.error("Error updating user:", error);

            // Handle unique constraint errors
            if (error?.response?.data?.message?.includes("email")) {
                toast.error("Email already exists. Please use a different email address.");
            } else if (error?.response?.data?.message?.includes("username")) {
                toast.error("Username already exists. Please use a different username.");
            } else {
                toast.error(error?.response?.data?.message || "Failed to update user");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdatePassword = async (passwordData) => {
        try {
            setIsVerifying(true);
            const response = await axiosInstance.put(`/api/v1/admin/users/${id}/password`, {
                newPassword: passwordData.newPassword,
            });

            if (response.data.success) {
                toast.success("Password updated successfully!");
                setShowPasswordModal(false);
                passwordForm.reset();
            }
        } catch (error) {
            console.error("Error updating password:", error);
            toast.error(error?.response?.data?.message || "Failed to update password");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleToggleStatus = async () => {
        try {
            const newStatus = !watch("isActive");
            const response = await axiosInstance.patch(`/api/v1/admin/users/${id}/status`, {
                isActive: newStatus,
            });

            if (response.data.success) {
                setValue("isActive", newStatus);
                toast.success(`User ${newStatus ? "activated" : "deactivated"} successfully`);
            }
        } catch (error) {
            console.error("Error toggling status:", error);
            toast.error(error?.response?.data?.message || "Failed to update user status");
        }
    };

    const handleVerifyIdentity = async () => {
        try {
            setIsVerifying(true);
            const response = await axiosInstance.patch(
                `/api/v1/admin/users/${id}/identificationDocument/verify`
            );

            if (response.data.success) {
                setValue("isVerified", true);
                toast.success("User identity verified successfully!");
                setShowVerifyModal(false);
            }
        } catch (error) {
            console.error("Error verifying identity:", error);
            toast.error(error?.response?.data?.message || "Failed to verify identity");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleRejectIdentity = async () => {
        if (!rejectionReason.trim()) {
            toast.error("Please provide a rejection reason");
            return;
        }

        try {
            setIsVerifying(true);
            const response = await axiosInstance.patch(
                `/api/v1/admin/users/${id}/identificationDocument/reject`,
                {
                    rejectionReason: rejectionReason.trim(),
                    allowReupload: true,
                }
            );

            if (response.data.success) {
                setValue("isVerified", false);
                toast.success("User identity rejected successfully");
                setShowRejectModal(false);
                setRejectionReason("");
            }
        } catch (error) {
            console.error("Error rejecting identity:", error);
            toast.error(error?.response?.data?.message || "Failed to reject identity");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleDeleteUser = async () => {
        try {
            setIsDeleting(true);
            const response = await axiosInstance.delete(`/api/v1/admin/users/${id}`);

            if (response.data.success) {
                toast.success("User deleted successfully!");
                navigate("/admin/users");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error(error?.response?.data?.message || "Failed to delete user");
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const handleAddCategory = () => {
        const current = watch("preferences.favoriteCategories") || [];
        setValue("preferences.favoriteCategories", [...current, ""]);
    };

    const handleRemoveCategory = (index) => {
        const current = watch("preferences.favoriteCategories") || [];
        const updated = current.filter((_, i) => i !== index);
        setValue("preferences.favoriteCategories", updated);
    };

    const handleCategoryChange = (index, value) => {
        const current = watch("preferences.favoriteCategories") || [];
        const updated = [...current];
        updated[index] = value;
        setValue("preferences.favoriteCategories", updated);
    };

    if (loading) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="w-full relative">
                    <AdminHeader />
                    <AdminContainer>
                        <div className="flex justify-center items-center min-h-96">
                            <LoadingSpinner />
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
                    <div className="pt-16 md:py-7">
                        <div className="flex items-center gap-3 mb-2">
                            <button
                                onClick={() => navigate("/admin/users")}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <h1 className="text-3xl md:text-4xl font-bold">Edit User</h1>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Update user account details, preferences, and manage account status.
                        </p>

                        <div className="max-w-6xl">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Basic Information */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <User size={20} className="text-primary" />
                                        Basic Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* First Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                First Name <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <input
                                                    {...register("firstName", {
                                                        required: "First name is required",
                                                        minLength: { value: 2, message: "Minimum 2 characters" },
                                                    })}
                                                    type="text"
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="Enter first name"
                                                />
                                            </div>
                                            {errors.firstName && (
                                                <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                                            )}
                                        </div>

                                        {/* Last Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Last Name <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <input
                                                    {...register("lastName", {
                                                        required: "Last name is required",
                                                        minLength: { value: 2, message: "Minimum 2 characters" },
                                                    })}
                                                    type="text"
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="Enter last name"
                                                />
                                            </div>
                                            {errors.lastName && (
                                                <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                                            )}
                                        </div>

                                        {/* Username */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Username <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <input
                                                    {...register("username", {
                                                        required: "Username is required",
                                                        minLength: { value: 3, message: "Minimum 3 characters" },
                                                    })}
                                                    type="text"
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="Enter username"
                                                />
                                            </div>
                                            {errors.username && (
                                                <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <input
                                                    {...register("email", {
                                                        required: "Email is required",
                                                        pattern: {
                                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                            message: "Invalid email address",
                                                        },
                                                    })}
                                                    type="email"
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="user@example.com"
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                                            )}
                                        </div>

                                        {/* Phone */}
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone
                                            </label>
                                            <div className="relative">
                                                <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <input
                                                    {...register("phone")}
                                                    type="tel"
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="+1 234 567 8900"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Country Information */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Globe size={20} className="text-primary" />
                                        Country Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Country Code
                                            </label>
                                            <input
                                                {...register("countryCode")}
                                                type="text"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="e.g., US, UK, IN"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Country Name
                                            </label>
                                            <input
                                                {...register("countryName")}
                                                type="text"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="United States"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Address Information */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <MapPin size={20} className="text-primary" />
                                        Address Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Street
                                            </label>
                                            <div className="relative">
                                                <Home size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <input
                                                    {...register("address.street")}
                                                    type="text"
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="Street address"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                City
                                            </label>
                                            <input
                                                {...register("address.city")}
                                                type="text"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="City"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                State
                                            </label>
                                            <input
                                                {...register("address.state")}
                                                type="text"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="State"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Post Code
                                            </label>
                                            <input
                                                {...register("address.postCode")}
                                                type="text"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="Post code"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Country
                                            </label>
                                            <input
                                                {...register("address.country")}
                                                type="text"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="Country"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Preferences */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Bell size={20} className="text-primary" />
                                        User Preferences
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                {...register("preferences.emailUpdates")}
                                                className="w-4 h-4 text-primary rounded focus:ring-primary"
                                            />
                                            <span className="flex items-center gap-2 text-sm text-gray-700">
                                                <MailIcon size={16} />
                                                Email Updates
                                            </span>
                                        </label>

                                        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                {...register("preferences.smsUpdates")}
                                                className="w-4 h-4 text-primary rounded focus:ring-primary"
                                            />
                                            <span className="flex items-center gap-2 text-sm text-gray-700">
                                                <Phone size={16} />
                                                SMS Updates
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Activity size={20} className="text-primary" />
                                        Account Actions
                                    </h2>
                                    <div className="flex flex-wrap gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswordModal(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                                        >
                                            <Key size={18} />
                                            Reset Password
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowDeleteModal(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                            Delete User
                                        </button>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => navigate("/admin/users")}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <X size={18} />
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                Update User
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </AdminContainer>
            </div>

            {/* Password Reset Modal */}
            <Modal
                isOpen={showPasswordModal}
                onClose={() => {
                    setShowPasswordModal(false);
                    passwordForm.reset();
                }}
                title="Reset Password"
            >
                <form
                    onSubmit={passwordForm.handleSubmit(async (data) => {
                        if (data.newPassword !== data.confirmPassword) {
                            toast.error("Passwords do not match");
                            return;
                        }
                        if (data.newPassword.length < 8) {
                            toast.error("Password must be at least 8 characters");
                            return;
                        }
                        await handleUpdatePassword(data);
                    }, (errors) => {
                        console.log("Password validation errors:", errors);
                        toast.error("Please fix all password validation errors");
                    })}
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                New Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    {...passwordForm.register("newPassword", {
                                        required: "Password is required",
                                        minLength: { value: 8, message: "Minimum 8 characters" },
                                    })}
                                    type={showPassword ? "text" : "password"}
                                    className="w-full pr-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {passwordForm.formState.errors.newPassword && (
                                <p className="text-red-500 text-sm mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    {...passwordForm.register("confirmPassword", {
                                        required: "Please confirm your password",
                                    })}
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="w-full pr-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Confirm new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {passwordForm.formState.errors.confirmPassword && (
                                <p className="text-red-500 text-sm mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => {
                                setShowPasswordModal(false);
                                passwordForm.reset();
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isVerifying}
                            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isVerifying ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                            ) : (
                                "Update Password"
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Verify Identity Modal */}
            <Modal
                isOpen={showVerifyModal}
                onClose={() => setShowVerifyModal(false)}
                title="Verify Identity"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Are you sure you want to verify this user's identity? This action will mark the user as verified.
                    </p>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setShowVerifyModal(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleVerifyIdentity}
                            disabled={isVerifying}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {isVerifying ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                            ) : (
                                "Verify Identity"
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Reject Identity Modal */}
            <Modal
                isOpen={showRejectModal}
                onClose={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                }}
                title="Reject Identity Verification"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Please provide a reason for rejecting this user's identity verification.
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rejection Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            rows="4"
                            placeholder="Enter reason for rejection..."
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setShowRejectModal(false);
                                setRejectionReason("");
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleRejectIdentity}
                            disabled={isVerifying || !rejectionReason.trim()}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {isVerifying ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                            ) : (
                                "Reject Identity"
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete User Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete User"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-red-700 font-medium">Warning: This action cannot be undone!</p>
                        <p className="text-red-600 text-sm mt-2">
                            Deleting this user will permanently remove their account and all associated data including:
                        </p>
                        <ul className="list-disc list-inside text-sm text-red-600 mt-2 space-y-1">
                            <li>All personal information</li>
                            <li>Account history and activity</li>
                            <li>Associated bids and offers</li>
                            <li>Watchlist items</li>
                            <li>Comments and reviews</li>
                        </ul>
                    </div>
                    <p className="text-gray-600">
                        Are you sure you want to delete the user <strong>{userData?.firstName} {userData?.lastName}</strong>?
                    </p>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteUser}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {isDeleting ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                            ) : (
                                "Delete User"
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </section>
    );
};

export default EditUser;
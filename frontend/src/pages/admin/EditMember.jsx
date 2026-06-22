import { useState, useEffect } from "react";
import { AdminContainer, AdminHeader, AdminSidebar } from "../../components";
import { User, Phone, Save, X, ArrowLeft, UserPen, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";

const EditMember = () => {
    const { memberId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [member, setMember] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: "",
    });
    const [originalData, setOriginalData] = useState({});
    const [errors, setErrors] = useState({});

    const fetchMember = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(`/api/v1/admin/members/${memberId}`);

            if (data.success) {
                setMember(data.data.member);
                setOriginalData({
                    firstName: data.data.member.firstName,
                    lastName: data.data.member.lastName,
                    phoneNumber: data.data.member.phoneNumber,
                });
            }
        } catch (error) {
            console.error("Error fetching member:", error);
            toast.error(error?.response?.data?.message || "Failed to load member details");
            navigate("/admin/members/all");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (memberId) {
            fetchMember();
        }
    }, [memberId]);

    const validateForm = () => {
        const newErrors = {};

        if (!member.firstName || member.firstName.trim() === "") {
            newErrors.firstName = "First name is required";
        } else if (member.firstName.length < 2) {
            newErrors.firstName = "First name must be at least 2 characters";
        }

        if (!member.lastName || member.lastName.trim() === "") {
            newErrors.lastName = "Last name is required";
        } else if (member.lastName.length < 2) {
            newErrors.lastName = "Last name must be at least 2 characters";
        }

        if (!member.phoneNumber || member.phoneNumber.trim() === "") {
            newErrors.phoneNumber = "Phone number is required";
        } else if (!/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(member.phoneNumber)) {
            newErrors.phoneNumber = "Please enter a valid phone number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix the errors before submitting");
            return;
        }

        // Check if any changes were made
        const hasChanges =
            member.firstName !== originalData.firstName ||
            member.lastName !== originalData.lastName ||
            member.phoneNumber !== originalData.phoneNumber;

        if (!hasChanges) {
            toast.info("No changes to save");
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                firstName: member.firstName.trim(),
                lastName: member.lastName.trim(),
                phoneNumber: member.phoneNumber.trim(),
            };

            const { data } = await axiosInstance.patch(`/api/v1/admin/members/${memberId}`, payload);

            if (data.success) {
                toast.success("Member updated successfully");
                navigate("/admin/members/all");
            }
        } catch (error) {
            console.error("Error updating member:", error);
            toast.error(error?.response?.data?.message || "Failed to update member");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMember((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    if (loading) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="w-full relative">
                    <AdminHeader />
                    <AdminContainer>
                        <div className="pt-16 md:py-7">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            </div>
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
                        <div className="flex items-center gap-3 mb-5">
                            <button
                                onClick={() => navigate("/admin/members/all")}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <h1 className="text-3xl md:text-4xl font-bold">Edit Member</h1>
                        </div>

                        <div className="max-w-full">
                            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="space-y-5">
                                    {/* Member Info Card */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle size={20} className="text-blue-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-blue-800 font-medium">
                                                    Member Information
                                                </p>
                                                <p className="text-sm text-blue-600 mt-1">
                                                    Member ID: {memberId}
                                                </p>
                                                {member.mainSubscriber && (
                                                    <p className="text-sm text-blue-600">
                                                        Added by: {member.mainSubscriber.firstName} {member.mainSubscriber.lastName}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* First Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                First Name <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <input
                                                    name="firstName"
                                                    value={member.firstName || ""}
                                                    onChange={handleChange}
                                                    type="text"
                                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.firstName ? "border-red-500" : "border-gray-300"
                                                        }`}
                                                    placeholder="Enter first name"
                                                />
                                            </div>
                                            {errors.firstName && (
                                                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
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
                                                    name="lastName"
                                                    value={member.lastName || ""}
                                                    onChange={handleChange}
                                                    type="text"
                                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.lastName ? "border-red-500" : "border-gray-300"
                                                        }`}
                                                    placeholder="Enter last name"
                                                />
                                            </div>
                                            {errors.lastName && (
                                                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                name="phoneNumber"
                                                value={member.phoneNumber || ""}
                                                onChange={handleChange}
                                                type="tel"
                                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phoneNumber ? "border-red-500" : "border-gray-300"
                                                    }`}
                                                placeholder="+1 234 567 8900"
                                            />
                                        </div>
                                        {errors.phoneNumber && (
                                            <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => navigate("/admin/members/all")}
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
                                                Update Member
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </AdminContainer>
            </div>
        </section>
    );
};

export default EditMember;
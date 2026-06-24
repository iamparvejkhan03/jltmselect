import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
    BidderContainer,
    BidderHeader,
    BidderSidebar,
    LoadingSpinner,
    AccountInactiveBanner
} from "../../components";
import {
    UserPlus,
    Phone,
    User,
    CreditCard,
    AlertCircle,
    CheckCircle,
    XCircle,
    Trash2,
    Plus,
    Zap
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AddMember = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [memberStatus, setMemberStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [canAddMembers, setCanAddMembers] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            members: [
                { firstName: "", lastName: "", phoneNumber: "" },
                // { firstName: "", lastName: "", phoneNumber: "" },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "members",
    });

    // Watch members to check if any have data
    const watchedMembers = watch("members");

    useEffect(() => {
        fetchMemberStatus();
    }, []);

    const fetchMemberStatus = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get("/api/v1/members/status");
            if (data.success) {
                setMemberStatus(data.data);
                setCanAddMembers(data.data.canAddMembers);

                // If cannot add members, show appropriate message
                if (!data.data.canAddMembers && !data.data.hasJLTMJunkie) {
                    toast.error("You need a JLTM Junkie subscription to add members");
                } else if (!data.data.canAddMembers && data.data.remainingSlots === 0) {
                    toast.error("You have reached the maximum of 2 members");
                }
            }
        } catch (err) {
            console.error("Fetch member status error:", err);
            toast.error("Failed to load member status");
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        // Filter out empty members
        const validMembers = data.members.filter(
            member => member.firstName.trim() && member.lastName.trim() && member.phoneNumber.trim()
        );

        if (validMembers.length === 0) {
            toast.error("Please fill in at least one member's details");
            return;
        }

        // Check against remaining slots
        if (validMembers.length > memberStatus?.remainingSlots) {
            toast.error(`You can only add ${memberStatus?.remainingSlots} more member(s)`);
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await axiosInstance.post("/api/v1/members/add", {
                members: validMembers
            });

            if (response.data.success) {
                toast.success(response.data.message);
                navigate("/bidder/members/all");
            }
        } catch (error) {
            console.error("Add members error:", error);
            toast.error(error?.response?.data?.message || "Failed to add members");
        } finally {
            setIsSubmitting(false);
        }
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

    if (!canAddMembers) {
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
                                {!memberStatus?.hasJLTMJunkie
                                    ? "JLTM Junkie Subscription Required"
                                    : "Member Limit Reached"}
                            </h2>
                            <p className="text-gray-600 mb-4">
                                {!memberStatus?.hasJLTMJunkie
                                    ? "You need an active JLTM Junkie subscription to add members. Upgrade your plan to unlock this feature."
                                    : `You have already added the maximum of 2 members. Each member gets in-store discount benefits.`}
                            </p>
                            {!memberStatus?.hasJLTMJunkie && (
                                <button
                                    onClick={() => navigate("/subscriptions")}
                                    className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                                >
                                    <Zap size={18} />
                                    Upgrade to JLTM Junkie
                                </button>
                            )}
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

                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <UserPlus size={32} className="text-primary" />
                                    <h2 className="text-3xl md:text-4xl font-bold bg-primary bg-clip-text text-transparent">
                                        Add Members
                                    </h2>
                                </div>
                                <p className="text-gray-600">
                                    For $20 each, you can add up to 2 members to your JLTM Junkie subscription
                                </p>
                            </div>
                            <div className="mt-4 md:mt-0 bg-gray-100 rounded-xl px-4 py-2">
                                <p className="text-sm text-gray-600">
                                    Remaining Slots: <span className="font-bold text-primary">{memberStatus?.remainingSlots}</span> / 2
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="space-y-6">
                            {fields.map((field, index) => (
                                <div key={field.id} className="border border-gray-200 rounded-xl p-4 relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <User size={18} className="text-primary" />
                                            Member {index + 1}: In-store Discount & In-Store Item Pickup Access Only
                                        </h3>
                                        {index >= 1 && (
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
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
                                                    {...register(`members.${index}.firstName`, {
                                                        required: "First name is required",
                                                        minLength: { value: 2, message: "Minimum 2 characters" },
                                                    })}
                                                    type="text"
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter first name"
                                                />
                                            </div>
                                            {errors.members?.[index]?.firstName && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {errors.members[index].firstName.message}
                                                </p>
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
                                                    {...register(`members.${index}.lastName`, {
                                                        required: "Last name is required",
                                                        minLength: { value: 2, message: "Minimum 2 characters" },
                                                    })}
                                                    type="text"
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter last name"
                                                />
                                            </div>
                                            {errors.members?.[index]?.lastName && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {errors.members[index].lastName.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Phone Number */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <input
                                                    {...register(`members.${index}.phoneNumber`, {
                                                        required: "Phone number is required",
                                                        pattern: {
                                                            value: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
                                                            message: "Please enter a valid phone number",
                                                        },
                                                    })}
                                                    type="tel"
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="+1 234 567 8900"
                                                />
                                            </div>
                                            {errors.members?.[index]?.phoneNumber && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {errors.members[index].phoneNumber.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add More Member Button */}
                            {fields.length < 2 && memberStatus?.remainingSlots > fields.length && (
                                <button
                                    type="button"
                                    onClick={() => append({ firstName: "", lastName: "", phoneNumber: "" })}
                                    className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus size={20} />
                                    Add Another Member
                                </button>
                            )}
                        </div>

                        {/* Form Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => navigate("/bidder/members/all")}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
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
                                        <CreditCard size={18} />
                                        Pay & Add Member
                                    </>
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 my-2 text-center">Note: Your saved card will be charged.</p>
                    </form>
                </BidderContainer>
            </div>
        </section>
    );
};

export default AddMember;
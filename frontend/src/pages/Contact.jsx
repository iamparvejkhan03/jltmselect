import { Container, FAQs } from "../components";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { useState, useRef, useEffect } from "react";
import { Turnstile } from "@marsidev/react-turnstile"; // Add this import
import {
    Clock,
    Mail,
    MapPin,
    MessageCircleQuestion,
    Phone,
    User,
} from "lucide-react";
import { contactUs, logo, otherData } from "../assets";
import axiosInstance from "../utils/axiosInstance";

function Contact() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        watch,
    } = useForm({
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            userType: "bidder",
            message: "",
        },
    });

    // Add ref for Turnstile
    const turnstileRef = useRef(null);
    const [turnstileToken, setTurnstileToken] = useState(null);
    const [turnstileReady, setTurnstileReady] = useState(false);
    const [visible, setVisible] = useState(false);
    const [sending, setSending] = useState(false);
    const userType = watch("userType");

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    const submitHandler = async (contactData) => {
        // Check if Turnstile is completed
        if (!turnstileToken) {
            toast.error("Please complete the verification to prove you're human");
            return;
        }

        try {
            setSending(true);

            // Include the Turnstile token with your form data
            const { data } = await axiosInstance.post(
                "/api/v1/contact/submit",
                {
                    ...contactData,
                    turnstileToken: turnstileToken  // Add this
                }
            );

            if (data?.success) {
                toast.success(data.message);
                reset();
                // Reset Turnstile after successful submission
                turnstileRef.current?.reset();
                setTurnstileToken(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                toast.error(data.message || "Failed to submit your query");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to submit your query. Please try again."
            );
        } finally {
            setSending(false);
        }
    };

    return (
        <section className="pt-10 md:pt-16 bg-bg-secondary dark:bg-bg-primary overflow-hidden">
            {/* Hero section - keep as is */}
            <div className="max-w-full mx-auto text-center px-6 py-16 bg-primary">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="h-px w-8 bg-secondary"></div>
                    <span className="text-secondary text-xs font-medium uppercase tracking-[0.2em]">Get In Touch</span>
                    <div className="h-px w-8 bg-secondary"></div>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-pure-white dark:text-text-primary-dark leading-tight">
                    Contact
                </h1>
            </div>

            <Container className="bg-bg-secondary-dark">
                <section className={`relative ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
                    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-y-8 py-6 md:py-16 items-center">
                        {/* LEFT INFO - keep as is */}
                        <div className="text-text-primary dark:text-text-primary-dark max-w-md">
                            <h2 className="text-2xl md:text-4xl font-bold mb-6">Contact Us</h2>
                            <div className="space-y-4 text-base">
                                <div className="flex items-center gap-4 text-secondary dark:text-text-primary-dark">
                                    <MapPin size={18} />
                                    <div className="flex flex-col items-start justify-center gap-1">
                                        <p className="font-medium text-primary">Address</p>
                                        <p className="text-text-secondary">{otherData?.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-secondary dark:text-text-primary-dark">
                                    <Mail size={18} />
                                    <div className="flex flex-col items-start justify-center gap-1">
                                        <p className="font-medium text-primary">Email</p>
                                        <Link to={`mailto:${otherData?.email}`} className="hover:underline text-text-secondary">{otherData.email}</Link>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-secondary dark:text-text-primary-dark">
                                    <Phone size={18} />
                                    <div className="flex flex-col items-start justify-center gap-1">
                                        <p className="font-medium text-primary">Phone</p>
                                        <Link to={`tel:${otherData?.phone}`} className="hover:underline text-text-secondary">{otherData?.phoneCode} {otherData?.formatPhone(otherData?.phone)}</Link>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-secondary dark:text-text-primary-dark">
                                    <Clock size={18} />
                                    <div className="flex flex-col items-start justify-center gap-1">
                                        <p className="font-medium text-primary">Hours</p>
                                        <div className="text-text-secondary">
                                            {otherData?.hours?.map((h, index) => (
                                                <p key={index}>{h?.days}: {h?.time}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FORM CARD - Add Turnstile widget */}
                        <div className="bg-bg-secondary dark:bg-bg-primary rounded-2xl shadow-2xl p-6 md:p-10 border border-gray-200 dark:border-bg-primary-light">
                            <h3 className="text-xl font-semibold text-primary dark:text-text-primary-dark mb-6">
                                We'd love to hear from you!
                            </h3>

                            <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark flex gap-2 items-center">
                                        <User size={18} /> Name *
                                    </label>
                                    <input
                                        className="w-full border border-gray-300 dark:border-bg-primary-light bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark rounded-md px-3 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
                                        placeholder="Nathan"
                                        {...register("name", { required: true })}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-orange-500">Name is required</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark flex gap-2 items-center">
                                        <Mail size={18} /> Email *
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full border border-gray-300 dark:border-bg-primary-light bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark rounded-md px-3 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
                                        placeholder="name@example.com"
                                        {...register("email", { required: true })}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-orange-500">Email is required</p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark flex gap-2 items-center">
                                        <Phone size={18} /> Phone
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder={`${otherData?.phoneCode} xxx xxxxx`}
                                        className="w-full border border-gray-300 dark:border-bg-primary-light bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark rounded-md px-3 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
                                        {...register("phone")}
                                    />
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark flex gap-2 items-center">
                                        <MessageCircleQuestion size={18} /> Message *
                                    </label>
                                    <textarea
                                        className="w-full border border-gray-300 dark:border-bg-primary-light bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark rounded-md px-3 py-2 mt-2 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
                                        placeholder="Tell us how we can help you..."
                                        {...register("message", { required: true })}
                                    />
                                    {errors.message && (
                                        <p className="text-sm text-orange-500">Message is required</p>
                                    )}
                                </div>

                                {/* Add Turnstile Widget - Place it just above the submit button */}
                                <div className="flex justify-center">
                                    <Turnstile
                                        ref={turnstileRef}
                                        siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY} 
                                        onSuccess={(token) => {
                                            setTurnstileToken(token);
                                        }}
                                        onError={() => {
                                            toast.error("Verification failed. Please try again.");
                                            setTurnstileToken(null);
                                        }}
                                        onExpire={() => {
                                            setTurnstileToken(null);
                                            toast.error("Verification expired. Please complete again.");
                                        }}
                                        options={{
                                            theme: "light",  // or "dark" to match your site
                                            size: "normal",
                                        }}
                                    />
                                </div>

                                {/* Submit button - disable until Turnstile is completed */}
                                <button
                                    type="submit"
                                    disabled={!turnstileToken || sending}
                                    className={`w-full h-11 rounded-md bg-secondary dark:bg-bg-secondary text-pure-white dark:text-text-primary hover:opacity-90 font-semibold transition ${(!turnstileToken || sending) ? "opacity-50 cursor-not-allowed" : ""
                                        }`}
                                >
                                    {sending ? "Sending..." : "Send Message"}
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </Container>
        </section>
    );
}

export default Contact;
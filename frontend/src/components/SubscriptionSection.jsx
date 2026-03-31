"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Container from "./Container";
import { Star, X, Check } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";

function SubscriptionSection() {
    const sectionRef = useRef(null);
    const [visible, setVisible] = useState(false);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setVisible(entry.isIntersecting),
            { threshold: 0.10 }
        );

        if (sectionRef.current) observer.observe(sectionRef.current);

        return () => observer.disconnect();
    }, []);

    // Fetch subscriptions
    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/api/v1/subscriptions/public/active');
                
                if (response.data.success) {
                    const formattedPlans = response.data.data.map(sub => ({
                        name: sub.title,
                        duration: formatDuration(sub.duration),
                        durationRaw: sub.duration,
                        price: formatPrice(sub.price),
                        priceRaw: sub.price,
                        popular: sub.isPopular,
                        features: sub.features?.map(f => ({ text: f.text, included: f.included })) || [],
                        tag: sub.tag,
                        description: sub.description,
                        slug: sub.slug,
                        _id: sub._id
                    }));
                    setPlans(formattedPlans);
                }
            } catch (err) {
                console.error('Error fetching subscriptions:', err);
                setError('Failed to load subscription plans');
                setPlans([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptions();
    }, []);

    const formatDuration = (duration) => {
        const unitMap = {
            day: 'Day',
            week: 'Week',
            month: 'Month',
            year: 'Year'
        };
        const plural = duration.value > 1 ? 's' : '';
        return `${duration.value} ${unitMap[duration.unit]}${plural}`;
    };

    const formatPrice = (price) => {
        const currencySymbols = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            INR: '₹'
        };
        const symbol = currencySymbols[price.currency] || '$';
        return `${symbol}${price.amount.toFixed(2)}`;
    };

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
        setShowModal(true);
    };

    const handleCheckout = async () => {
        // Implement your checkout logic here
        console.log('Proceeding to checkout with plan:', selectedPlan);
        // Example: window.location.href = `/checkout?plan=${selectedPlan.slug}`;
        setShowModal(false);
    };

    if (loading) {
        return (
            <section ref={sectionRef} className="py-14 bg-bg-secondary-dark overflow-hidden">
                <Container>
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
                        <p className="mt-4 text-text-secondary dark:text-text-secondary-dark">
                            Loading membership plans...
                        </p>
                    </div>
                </Container>
            </section>
        );
    }

    if (error) {
        return (
            <section ref={sectionRef} className="py-14 bg-bg-secondary-dark overflow-hidden">
                <Container>
                    <div className="text-center">
                        <p className="text-red-500 dark:text-red-400">{error}</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="mt-4 text-secondary hover:text-secondary/80 underline"
                        >
                            Try again
                        </button>
                    </div>
                </Container>
            </section>
        );
    }

    if (plans.length === 0) {
        return null;
    }

    return (
        <>
            <section ref={sectionRef} className="py-14 bg-bg-secondary-dark overflow-hidden">
                <Container>
                    <div className="w-full max-w-full mx-auto">
                        {/* Header */}
                        <div
                            className={`text-center transition-all mb-16 duration-700 ${
                                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                            }`}
                        >
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="h-px w-8 bg-secondary"></div>
                                <span className="text-secondary text-xs font-medium uppercase tracking-[0.2em]">
                                    Choose Your Plan
                                </span>
                                <div className="h-px w-8 bg-secondary"></div>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-pure-white mb-8">
                                Membership Plans
                            </h2>
                        </div>

                        {/* Plans Grid */}
                        <div
                            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-full mx-auto transition-all duration-700 delay-200 ${
                                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                            }`}
                        >
                            {plans.map((plan) => (
                                <div
                                    key={plan._id}
                                    className={`relative bg-white dark:bg-bg-primary-light rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                                        plan.popular 
                                            ? "border border-secondary dark:border-secondary/90" 
                                            : "border border-gray-200 dark:border-gray-700"
                                    }`}
                                >
                                    {/* Tag Badge */}
                                    {plan.tag && (
                                        <div className="absolute top-0 right-0">
                                            <div className={`text-xs font-semibold px-3 py-1 rounded-bl-lg ${
                                                plan.popular 
                                                    ? "bg-secondary dark:bg-secondary/90 text-pure-white dark:text-black" 
                                                    : "bg-gray-800 text-white dark:bg-gray-700 dark:text-gray-200"
                                            }`}>
                                                {plan.tag}
                                            </div>
                                        </div>
                                    )}

                                    {/* Most Popular Badge */}
                                    {!plan.tag && plan.popular && (
                                        <div className="absolute top-0 right-0">
                                            <div className="bg-secondary dark:bg-secondary/90 text-pure-white dark:text-black text-xs font-semibold px-3 py-1 rounded-bl-lg">
                                                MOST POPULAR
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-6 md:p-8">
                                        {/* Plan Name */}
                                        <h3 className="text-2xl font-bold text-black dark:text-pure-white mb-1">
                                            {plan.name}
                                        </h3>

                                        {/* Duration */}
                                        <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-4">
                                            {plan.duration}
                                        </p>

                                        {/* Price */}
                                        <div className="mb-6">
                                            <span className="text-4xl font-bold text-black dark:text-pure-white">
                                                {plan.price}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        {plan.description && (
                                            <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-4 line-clamp-2">
                                                {plan.description}
                                            </p>
                                        )}

                                        {/* Features List */}
                                        <ul className="space-y-3 mb-8">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-center gap-2">
                                                    {feature.included !== false ? (
                                                        <Star 
                                                            size={14} 
                                                            className={plan.popular ? 'text-secondary' : 'text-primary'} 
                                                            fill={plan.popular ? "currentColor" : "none"}
                                                        />
                                                    ) : (
                                                        <div className="w-3.5" />
                                                    )}
                                                    <span className={`text-sm ${
                                                        feature.included !== false 
                                                            ? "text-text-secondary dark:text-text-secondary-dark" 
                                                            : "text-gray-400 dark:text-gray-500 line-through"
                                                    }`}>
                                                        {feature.text}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Select Plan Button */}
                                        <button
                                            onClick={() => handleSelectPlan(plan)}
                                            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                                                plan.popular
                                                    ? "bg-secondary hover:bg-secondary/90 text-pure-white dark:bg-amber-500 dark:hover:bg-amber-600"
                                                    : "bg-gray-900 hover:bg-gray-800 text-white dark:bg-bg-primary dark:hover:bg-bg-primary-light/80"
                                            }`}
                                        >
                                            SELECT PLAN
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>

            {/* Plan Details Modal */}
            {showModal && selectedPlan && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 py-4 px-6">
                    <div className="bg-white dark:bg-bg-primary-light rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-bg-primary-light border-b border-gray-200 dark:border-gray-700 py-4 px-6 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-black dark:text-pure-white">
                                {selectedPlan.name} Plan
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-3xl font-bold text-black dark:text-pure-white">
                                    {selectedPlan.price}
                                </p>
                                <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                                    for {selectedPlan.duration}
                                </p>
                            </div>

                            {selectedPlan.description && (
                                <p className="text-text-secondary dark:text-text-secondary-dark">
                                    {selectedPlan.description}
                                </p>
                            )}

                            <div className="space-y-2">
                                <h4 className="font-semibold text-black dark:text-pure-white">
                                    What's included:
                                </h4>
                                <ul className="space-y-2">
                                    {selectedPlan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-2">
                                            <Check 
                                                size={16} 
                                                className={feature.included !== false ? "text-green-500" : "text-gray-400"} 
                                            />
                                            <span className={`text-sm ${
                                                feature.included !== false 
                                                    ? "text-text-secondary dark:text-text-secondary-dark" 
                                                    : "text-gray-400 dark:text-gray-500 line-through"
                                            }`}>
                                                {feature.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white dark:bg-bg-primary-light border-t border-gray-200 dark:border-gray-700 py-4 px-6">
                            <button
                                onClick={handleCheckout}
                                className="w-full bg-secondary hover:bg-secondary/90 text-pure-white dark:text-black font-semibold py-3 rounded-lg transition-colors"
                            >
                                Continue to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default SubscriptionSection;
import { Verified, Gavel, BadgeCheck, UserPlus, Clock, Heart, Shield, Users, Calendar, Cpu, CheckCircle, TrendingUp, Search, ShieldCheck, Wallet, Globe, BarChart3, Smile, Handshake, BadgeDollarSign, HandHelping, PackageCheck, UserCheck, Award, Percent, Video, PackageCheckIcon, DollarSign, Mail, Warehouse } from "lucide-react";
import { Link } from "react-router-dom";
import { Container, HowItWorksCard } from "../components";
import { useEffect, useRef, useState } from "react";
import { about, about2, otherData } from "../assets";

const features = [
    {
        number: "01",
        icon: Percent,
        title: "15% Instant Discounts",
        desc: "Get 15% off every time you shop in-store.",
    },
    {
        number: "02",
        icon: Gavel,
        title: "Auctions",
        desc: "Experience the thrill of real-time bidding. Each item bidding starts at 85% off MSRP or more. The highest bidder wins. Winning bid pays as soon as the auction is over. Preview and pick up winning bid items at our Costa Mesa showroom.",
    },
    // {
    //     number: "03",
    //     icon: Video,
    //     title: "Exclusive Showroom Videos",
    //     desc: "Exclusive online weekly video updates. See exactly what is on the floor in our showroom each week with exclusive access to our showroom floor inventory video.",
    // },
    {
        number: "03",
        icon: Warehouse,
        title: "7 Days Free Storage",
        desc: "Get 7 days of free storage on items purchased or won during an auction.",
    },
    // {
    //     number: "05",
    //     icon: DollarSign,
    //     title: "$5 Storage Fees",
    //     desc: "After your 7 days of free storage get $5 storage fee per item per day.",
    // },
    // {
    //     number: "06",
    //     icon: Mail,
    //     title: "Special Delivery",
    //     desc: "Get special, exclusive insight into some of JLTM's deliveries sent to your email.",
    // },
];

function About() {
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const highlightsRef = useRef(null);

    const [heroVisible, setHeroVisible] = useState(false);
    const [featuresVisible, setFeaturesVisible] = useState(false);
    const [highlightsVisible, setHighlightsVisible] = useState(false);

    const section1Ref = useRef(null);
    const section2Ref = useRef(null);

    const [section1Visible, setSection1Visible] = useState(false);
    const [section2Visible, setSection2Visible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.target === heroRef.current && entry.isIntersecting) {
                        setHeroVisible(true);
                    }
                    if (entry.target === featuresRef.current && entry.isIntersecting) {
                        setFeaturesVisible(true);
                    }
                    if (entry.target === highlightsRef.current && entry.isIntersecting) {
                        setHighlightsVisible(true);
                    }
                });
            },
            { threshold: 0.2 }
        );

        if (heroRef.current) observer.observe(heroRef.current);
        if (featuresRef.current) observer.observe(featuresRef.current);
        if (highlightsRef.current) observer.observe(highlightsRef.current);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.target === heroRef.current && entry.isIntersecting) {
                        setHeroVisible(true);
                    }
                    if (entry.target === featuresRef.current && entry.isIntersecting) {
                        setFeaturesVisible(true);
                    }
                    if (entry.target === highlightsRef.current && entry.isIntersecting) {
                        setHighlightsVisible(true);
                    }
                    // Add these two new conditions
                    if (entry.target === section1Ref.current && entry.isIntersecting) {
                        setSection1Visible(true);
                    }
                    if (entry.target === section2Ref.current && entry.isIntersecting) {
                        setSection2Visible(true);
                    }
                });
            },
            { threshold: 0.2 }
        );

        if (heroRef.current) observer.observe(heroRef.current);
        if (featuresRef.current) observer.observe(featuresRef.current);
        if (highlightsRef.current) observer.observe(highlightsRef.current);
        // Add these two new observers
        if (section1Ref.current) observer.observe(section1Ref.current);
        if (section2Ref.current) observer.observe(section2Ref.current);

        return () => observer.disconnect();
    }, []);

    return (
        <section className="pt-10 md:pt-10 max-w-full bg-bg-secondary dark:bg-bg-primary">
            <div className="bg-gray-50 dark:bg-bg-primary">
                <section
                    ref={heroRef}
                    className={`relative overflow-hidden bg-bg-secondary dark:bg-bg-primary py-8 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                        }`}
                >
                    <div className="max-w-full mx-auto text-center px-6 py-16 bg-primary">

                        <div className="flex items-center justify-center gap-3 mb-4"><div className="h-px w-8 bg-secondary"></div><span className="text-secondary text-xs font-medium uppercase tracking-[0.2em]">Who We Are</span><div className="h-px w-8 bg-secondary"></div></div>

                        {/* headline */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-pure-white dark:text-text-primary-dark leading-tight">
                            About {otherData?.brandName}
                        </h1>
                    </div>
                </section>
            </div>

            {/* Section 1: The Luxury Furniture Experience - Text Left, Image Right */}
            <Container className="bg-bg-secondary dark:bg-bg-primary">
                <div
                    ref={section1Ref}
                    className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-4 md:py-16 transition-all duration-700 ${section1Visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                        }`}
                >
                    {/* Left Side - Text Content */}
                    <div className="space-y-6">
                        {/* Badge */}
                        <div className="flex items-center gap-3">
                            <div className="h-px w-8 bg-secondary dark:bg-text-primary-dark"></div>
                            <span className="text-secondary dark:text-text-secondary-dark text-xs font-medium uppercase tracking-[0.2em]">
                                The Experience
                            </span>
                            <div className="h-px w-8 bg-secondary dark:bg-text-primary-dark"></div>
                        </div>

                        {/* Heading */}
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-text-primary dark:text-text-primary-dark leading-tight">
                            The Luxury Furniture Experience, <span className="text-secondary">Reimagined</span>
                        </h2>

                        {/* Description */}
                        <p className="text-text-secondary dark:text-text-secondary-dark leading-relaxed">
                            {otherData?.brandName || "Just Like the Model"} is more than a furniture store, it's a destination for those who appreciate exceptional design and craftsmanship. Our {otherData?.brandName} Select subscription membership brings our luxury experience into an exclusive community.
                        </p>

                        <p className="text-text-secondary dark:text-text-secondary-dark leading-relaxed">
                            As a member, you gain access to exclusive auctions featuring premium pieces, 15% in-store discounts, and 7 days of free storage.
                        </p>
                    </div>

                    {/* Right Side - Image */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-text-primary/5 to-transparent rounded-2xl"></div>
                        <div className="relative overflow-hidden rounded-2xl shadow-xl">
                            <img
                                src={about}
                                alt="Luxury furniture showroom"
                                className="w-full h-auto object-cover aspect-[6/4] hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        {/* Decorative element */}
                        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-text-primary/5 rounded-full blur-2xl"></div>
                        <div className="absolute -top-4 -right-4 w-32 h-32 bg-text-primary/5 rounded-full blur-2xl"></div>
                    </div>
                </div>
            </Container>

            {/* Section 2: How Auctions Work - Image Left, Text Right */}
            <Container className="bg-bg-secondary dark:bg-bg-secondary">
                <div
                    ref={section2Ref}
                    className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-5 pb-16 transition-all duration-700 delay-200 ${section2Visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                        }`}
                >
                    {/* Left Side - Image */}
                    <div className="relative order-2 lg:order-1">
                        <div className="absolute inset-0 bg-gradient-to-tr from-text-primary/5 to-transparent rounded-2xl"></div>
                        <div className="relative overflow-hidden rounded-2xl shadow-xl">
                            <img
                                src={about2}
                                alt="Auction process"
                                className="w-full h-auto object-cover aspect-[6/4] hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-text-primary/5 rounded-full blur-2xl"></div>
                        <div className="absolute -top-4 -left-4 w-32 h-32 bg-text-primary/5 rounded-full blur-2xl"></div>
                    </div>

                    {/* Right Side - Text Content */}
                    <div className="space-y-6 order-1 lg:order-2">
                        {/* Badge */}
                        <div className="flex items-center gap-3">
                            <div className="h-px w-8 bg-secondary dark:bg-text-primary-dark"></div>
                            <span className="text-secondary dark:text-text-secondary-dark text-xs font-medium uppercase tracking-[0.2em]">
                                How It Works
                            </span>
                            <div className="h-px w-8 bg-secondary dark:bg-text-primary-dark"></div>
                        </div>

                        {/* Heading */}
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-text-primary dark:text-text-primary-dark leading-tight">
                            How Auctions <span className="text-secondary">Work</span>
                        </h2>

                        {/* Description */}
                        <p className="text-text-secondary dark:text-text-secondary-dark leading-relaxed">
                            We curate unique auction pieces and list it for auction exclusively for our {otherData?.brandName || "Just Like the Model"} Select members. Bidding generally starts at $1 - $100.
                        </p>

                        <p className="text-text-secondary dark:text-text-secondary-dark leading-relaxed">
                            Winners pay online and pick up their items in store at our Costa Mesa showroom located at 1585 Sunland Lane.
                        </p>
                    </div>
                </div>
            </Container>

            {/* Why choose us */}
            <Container className="bg-bg-secondary dark:bg-bg-primary">
                <section
                    ref={featuresRef}
                    className={`bg-bg-secondary pb-16 dark:bg-bg-primary ${featuresVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                        }`}
                >
                    <div className="max-w-full mx-auto">
                        {/* Heading */}
                        <div className="text-left mb-8">
                            {/* <p className="text-text-secondary dark:text-text-secondary-dark font-semibold tracking-widest uppercase text-sm">
                                Why Choose Us
                            </p> */}
                            <h2 className="text-3xl md:text-4xl font-bold text-text-primary dark:text-text-primary-dark mt-2">
                                {otherData?.brandName || "Just Like the Model"} Select
                            </h2>
                        </div>

                        {/* Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={i}
                                        className="group bg-gradient-to-b from-secondary/[0.05] to-transparent dark:from-white/[0.03] dark:to-transparent rounded-2xl p-8 shadow-sm hover:shado relative overflow-hidden border border-gray-200 dark:border-bg-primary-light"
                                    >
                                        {/* top accent line */}
                                        <div className="absolute left-0 top-0 h-1 w-0 bg-text-primary dark:bg-text-primary-dark group-hover:w-full"></div>

                                        {/* Number */}
                                        <span className="absolute right-5 top-12 text-5xl font-extrabold text-transparent stroke-text group-hover:text-gray-200 dark:group-hover:text-gra">
                                            {item.number}
                                        </span>

                                        {/* Icon */}
                                        <div className="mt-4 w-12 h-12 flex items-center justify-center rounded-xl bg-bg-primary dark:bg-bg-secondary text-text-primary-dark dark:text-text-primary hover:bg-gray-800 dark:hover:bg-gray-200 transition">
                                            <Icon size={24} />
                                        </div>

                                        {/* Title */}
                                        <h3 className="mt-5 text-xl font-semibold text-text-primary dark:text-text-primary-dark">
                                            {item.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="mt-3 text-text-secondary dark:text-text-secondary-dark leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </Container>
        </section>
    );
}

export default About;

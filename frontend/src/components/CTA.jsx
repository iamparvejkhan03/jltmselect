import { useNavigate } from "react-router";
import { Sparkles, ArrowRight, Crown } from "lucide-react";
import Container from "./Container";
import { useRef, useEffect, useState } from "react";

function CTA() {
    const navigate = useNavigate();

    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setVisible(entry.isIntersecting),
            { threshold: 0.25 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section ref={ref} className="relative py-14 bg-bg-primary border-b border-gray-800 overflow-hidden">

            {/* Subtle texture - white dots */}
            <div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                    backgroundSize: "32px 32px",
                }}
            />

            {/* Grid overlay - white lines */}
            <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path
                                d="M 40 0 L 0 0 0 40"
                                fill="none"
                                stroke="rgba(255,255,255,0.08)"
                                strokeWidth="1"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            <Container>
                <div className="relative z-10 max-w-3xl mx-auto text-center">

                    {/* Badge */}
                    <span
                        className={`inline-flex items-center transition-all duration-700 text-secondary mb-5 ${
                            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                        }`}
                    >
                        <Crown size={40} />
                    </span>

                    {/* Heading */}
                    <h2
                        className={`text-3xl md:text-4xl font-semibold text-white leading-tight transition-all duration-700 delay-100 ${
                            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                        }`}
                    >
                        Daily Auctions, Extraordinary Finds
                    </h2>

                    {/* Subtext */}
                    <p
                        className={`text-base text-pure-white/80 mt-5 mb-10 max-w-2xl mx-auto transition-all duration-700 delay-200 ${
                            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                        }`}
                    >
                        Every day, a new luxury furniture piece goes up for auction — exclusively for JLTM members. Starting bids from just $1.
                    </p>

                    {/* CTA Button */}
                    <button
                        onClick={() => navigate("/register")}
                        className={`group relative overflow-hidden bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-white/10 transition-all duration-500 ${
                            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                        }`}
                    >
                        <span className="relative z-10 flex items-center gap-2 justify-center">
                            Become a Member
                            <ArrowRight
                                size={20}
                                className="group-hover:translate-x-1 transition-transform"
                            />
                        </span>

                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                </div>
            </Container>
        </section>
    );
}

export default CTA;
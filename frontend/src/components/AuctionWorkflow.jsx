import { Tag, Gavel, Timer, HandCoins, Percent, Video, Shield } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Container from "./Container";
import { otherData } from "../assets";

const steps = [
    {
        icon: Gavel,
        title: "Daily Auctions",
        description:
            "Exclusive members-only auction every day on luxury furniture pieces at incredible starting prices.",
    },
    {
        icon: Percent,
        title: "20% In-Store Discount",
        description:
            "One-time 20% discount on any in-store purchase. Valid for 30 days from membership activation.",
    },
    {
        icon: Video,
        title: "In The Store Access",
        description:
            "Members-only video gallery with behind-the-scenes looks at our finest luxury furniture collections.",
    },
    {
        icon: Shield,
        title: "Member ID",
        description:
            `Your unique ${otherData?.brandName} member ID unlocks exclusive in-store experiences and VIP treatment.`,
    },
];

function AuctionWorkflow() {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setVisible(entry.isIntersecting),
            { threshold: 0.15 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section ref={ref} className="relative pb-16 bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark overflow-hidden">
            <Container>
                <div className="container mx-auto">

                    {/* Heading */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="flex items-center justify-center gap-3 mb-4"><div className="h-px w-8 bg-secondary"></div><span className="text-secondary text-xs font-medium uppercase tracking-[0.2em]">Why Join</span><div className="h-px w-8 bg-secondary"></div></div>

                        <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-pure-white">
                            Membership Benefits
                        </h2>

                        {/* <p className="text-sm md:text-base text-text-secondary dark:text-text-secondary-dark mt-3">
                            A seamless path from listing to fulfillment—automated, transparent, and built for confidence at every turn. We handle the automation. You handle the wins.
                        </p> */}
                    </div>

                    {/* Workflow */}
                    <div className="relative">

                        <div className="grid gap-12 lg:grid-cols-4">

                            {steps.map((step, index) => {
                                const Icon = step.icon;

                                return (
                                    <div
                                        key={index}
                                        className={`relative text-center group transition-all duration-700 ${
                                            visible
                                                ? "opacity-100 translate-y-0"
                                                : "opacity-0 translate-y-10"
                                        }`}
                                        style={{ animationDelay: `${index * 120}s` }}
                                    >
                                        {/* circle icon */}
                                        <div className="relative mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-bg-secondary-dark dark:bg-bg-primary-light border border-bg-secondary-dark dark:border-bg-primary-light backdrop-blur-md transition-all duration-300 group-hover:bg-secondary dark:group-hover:bg-bg-border-bg-primary-light group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:group-hover:shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                                            <Icon size={30} className="text-secondary group-hover:text-pure-white dark:text-text-primary-dark" />
                                        </div>

                                        {/* text */}
                                        <div className="mt-8">
                                            <h3 className="text-xl font-medium mb-3 text-text-primary dark:text-text-primary-dark">
                                                {step.title}
                                            </h3>

                                            <p className="text-text-secondary dark:text-text-secondary-dark text-sm font-light leading-relaxed max-w-xs mx-auto">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}

export default AuctionWorkflow;
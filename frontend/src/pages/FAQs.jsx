import { Container } from "../components";
import { Verified, Gavel, Shield, Wallet, Globe, Handshake, Smile, Award,
    CreditCard, Truck, Store, Clock, BadgeDollarSign, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { otherData } from "../assets";

const { phone, email, address } = otherData;

const faqs = [
    {
        category: "Membership",
        icon: <Award size={20} />,
        questions: [
            {
                question: "How does JLTM Membership work?",
                answer: "JLTM Membership gives you access to exclusive daily auctions on luxury furniture, a one-time 20% in-store discount, and our members-only 'In The Store' video gallery. Choose a 6-month or 12-month plan to get started."
            },
            {
                question: "What membership plans are available?",
                answer: "We offer three plans: Basic (1 month for $50), Standard (3 months for $125), and Premium (6 months for $250). All plans include access to all mentioned benefits."
            },
            {
                question: "Can I cancel my membership?",
                answer: "Memberships are non-refundable and will remain active until the end of your current paid term."
            },
            {
                question: "What happens when my membership expires?",
                answer: "When your membership expires, you immediately lose access to auctions, In The Store gallery, and other member benefits. You can log in to purchase a new membership at any time to regain access."
            }
        ]
    },
    {
        category: "Billing",
        icon: <CreditCard size={20} />,
        questions: [
            {
                question: "How does billing work?",
                answer: "You'll be charged at signup for your selected plan duration. All payments are processed securely through Stripe."
            }
        ]
    },
    {
        category: "Auctions",
        icon: <Gavel size={20} />,
        questions: [
            {
                question: "How do auctions work?",
                answer: "Each day, one luxury furniture piece is listed for auction exclusively for members. Bidding starts at $1 with $1 minimum increments. The highest bidder when the auction closes wins the item."
            },
            {
                question: "Can I bid multiple times?",
                answer: "Yes! You can place as many bids as you'd like on any auction. Each new bid must be at least $1 more than the current highest bid."
            },
            {
                question: "What happens if I'm outbid?",
                answer: "You'll receive an email notification immediately when someone outbids you, so you can come back and bid again."
            },
            {
                question: "How is payment handled after winning?",
                answer: "The winning bidder will be notified to make payment within 8 hours. If payment is not received within this timeframe, you will lose the auction and this may lead to account suspension."
            }
        ]
    },
    {
        category: "Pickup & Storage",
        icon: <Truck size={20} />,
        questions: [
            {
                question: "How do I pick up my won items?",
                answer: "Winners have 5 days to pick up their items in-store. You'll need to bring a valid ID. Our staff will coordinate the pickup schedule with you."
            },
            {
                question: "What are storage fees?",
                answer: "If you don't pick up your item within 5 days, a $5 per day storage fee applies until the item is collected. Storage fees are paid in person at pickup."
            }
        ]
    },
    {
        category: "Discount",
        icon: <BadgeDollarSign size={20} />,
        questions: [
            {
                question: "How does the 20% discount work?",
                answer: "Every new member gets a one-time 20% discount valid on any in-store purchase. Simply show your Member ID at checkout. The discount is valid for 30 days from your signup date and has no exclusions. It is not valid for online purchases."
            }
        ]
    }
];

function FAQsPage() {
    const [openIndex, setOpenIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("Membership");

    const filteredFaqs = faqs.flatMap(category =>
        category.questions.filter(q =>
            (activeCategory === "all" || category.category === activeCategory) &&
            (q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.answer.toLowerCase().includes(searchTerm.toLowerCase()))
        ).map(q => ({ ...q, category: category.category }))
    );

    return (
        <section className="pt-10 md:pt-20 bg-bg-secondary dark:bg-bg-primary max-w-full">
            {/* Hero Section */}
            <div className="">
                    <div className="max-w-full mx-auto text-center">
                        <div className="max-w-full mx-auto text-center px-6 py-16 bg-primary">

                            <div className="flex items-center justify-center gap-3 mb-4"><div className="h-px w-8 bg-secondary"></div><span className="text-secondary text-xs font-medium uppercase tracking-[0.2em]">Help Center</span><div className="h-px w-8 bg-secondary"></div></div>

                            {/* headline */}
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-pure-white dark:text-text-primary-dark leading-tight">
                                Frequently Asked Questions
                            </h1>
                        </div>
                    </div>
            </div>

            <Container className="py-16">
                <div className="grid lg:grid-cols-[320px,1fr] gap-10">

                    {/* LEFT SIDEBAR */}
                    <div className="space-y-6 animate-[slideLeft_0.7s_ease_forwards] opacity-0">

                        {/* Category Box */}
                        <div className="bg-gradient-to-b from-secondary/[0.05] to-transparent dark:from-white/[0.03] dark:to-transparent rounded-2xl p-6 space-y-2 border border-gray-200 dark:border-bg-primary-light">
                            {faqs.map((cat) => (
                                <button
                                    key={cat.category}
                                    onClick={() => setActiveCategory(cat.category)}
                                    className={`w-full text-left px-5 py-4 rounded-xl border-b border-gray-200 dark:border-bg-primary-light transition font-medium
                                        ${activeCategory === cat.category
                                            ? "bg-secondary dark:bg-bg-secondary text-pure-white dark:text-text-primary shadow"
                                            : "text-text-primary dark:text-text-primary-dark hover:bg-bg-secondary-dark dark:hover:bg-gray-800"}`}
                                >
                                    {cat.category}
                                </button>
                            ))}
                        </div>

                        {/* Help Card */}
                        <div className="bg-gradient-to-b from-secondary/[0.05] to-transparent dark:from-white/[0.03] dark:to-transparent rounded-2xl p-6 text-center border border-gray-200 dark:border-bg-primary-light">
                            <h3 className="font-semibold text-lg mb-4 text-text-primary dark:text-text-primary-dark">
                                Didn't find your answer? Ask directly!
                            </h3>

                            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center border rounded-full text-text-primary dark:text-text-primary-dark border-gray-300 dark:border-bg-primary-light">
                                <Mail size={22} />
                            </div>

                            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">To Send Mail</p>
                            <Link to={`mailto:${otherData.email}`} className="font-semibold hover:underline hover:text-secondary text-primary dark:text-text-primary-dark">{otherData?.email}</Link>
                        </div>

                    </div>

                    {/* RIGHT SIDE QUESTIONS */}
                    <div className="space-y-5">

                        {faqs
                            .filter(cat => activeCategory === "all" || cat.category === activeCategory)
                            .flatMap(cat =>
                                cat.questions.map(q => ({
                                    ...q,
                                    category: cat.category
                                }))
                            )
                            .filter(faq =>
                                faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((faq, index) => (

                                <div
                                    key={index}
                                    className="bg-bg-secondary dark:bg-bg-primary border border-gray-200 dark:border-bg-primary-light rounded-2xl overflow-hidden opacity-0 animate-[fadeUp_0.6s_ease_forwards]"
                                    style={{ animationDelay: `${index * 0.08}s` }}
                                >
                                    <button
                                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                        className="w-full flex items-center justify-between px-6 py-5 text-left"
                                    >
                                        <span className="font-semibold text-primary dark:text-text-primary-dark">
                                            {faq.question}
                                        </span>

                                        <span className={`w-9 h-9 flex items-center justify-center rounded-full transition
                                            ${openIndex === index
                                                ? "bg-bg-primary dark:bg-bg-secondary-dark rotate-45"
                                                : "bg-secondary dark:bg-bg-secondary hover:bg-bg-primary dark:hover:bg-bg-secondary-dark"}`}
                                        >
                                            <span className="text-xl font-bold text-text-primary-dark dark:text-text-primary">+</span>
                                        </span>
                                    </button>

                                    <div className={`transition-all duration-300 overflow-hidden
                                        ${openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                                    >
                                        <p className="px-6 pb-6 text-text-secondary dark:text-text-secondary-dark leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </Container>

        </section>
    );
}

export default FAQsPage;
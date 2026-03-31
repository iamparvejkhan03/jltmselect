import { Link } from "react-router-dom";
import { Container } from "../components";
import { otherData } from "../assets";

const { phone, email, address } = otherData;

const TermsOfUse = () => {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <section className="pt-10 md:pt-20 bg-bg-secondary dark:bg-primary">
            <div className="max-w-full mx-auto text-center px-6 py-16 bg-primary">

                <div className="flex items-center justify-center gap-3 mb-4"><div className="h-px w-8 bg-secondary"></div><span className="text-secondary text-xs font-medium uppercase tracking-[0.2em]">Legal Policy</span><div className="h-px w-8 bg-secondary"></div></div>

                {/* headline */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-pure-white dark:text-text-primary-dark leading-tight">
                    Terms & Conditions
                </h1>
            </div>
            <Container className={`my-14`}>
                {/* Header */}
                <div className="max-w-full mx-auto my-10">
                    <p className="text-text-secondary dark:text-text-secondary-dark mb-6">{otherData?.brandName} | Last Updated: {formattedDate}</p>

                    <div className="bg-primary dark:bg-bg-secondary border-l-4 border-text-primary dark:border-text-primary-dark p-4 mb-6">
                        <p className="text-text-primary-dark dark:text-text-primary font-semibold mb-2">IMPORTANT – PLEASE READ</p>
                        <p className="text-text-primary-dark/80 dark:text-text-primary/80 text-sm">
                            These Terms govern your use of {otherData?.brandName}. By purchasing a membership or participating in our auctions,
                            you confirm your agreement to these Terms. All furniture items are sold on an "as-is" basis without warranties.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-full mx-auto">
                    <div className="space-y-8">
                        {/* Introduction */}
                        <div className="mb-8">
                            <p className="text-text-primary dark:text-text-primary-dark mb-4">
                                <strong>{otherData?.brandName}</strong> ("we", "our", "us") operates an exclusive furniture auction platform for members. 
                                We offer luxury furniture pieces through daily auctions available only to {otherData?.brandName} Members. These Terms of Use ("Terms") 
                                govern your access to and use of our website, platform, and services.
                            </p>
                            <p className="text-text-primary dark:text-text-primary-dark">
                                By purchasing a membership, registering for, accessing, or using the Platform, you agree to be bound by these Terms.
                            </p>
                        </div>

                        {/* Section 1 - Membership Agreement */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">1. Membership Agreement</h2>
                            <p className="text-text-secondary dark:text-text-secondary-dark mb-3">
                                By purchasing a {otherData?.brandName} Membership, you agree to the terms outlined herein. Memberships are non-refundable and non-transferable. 
                                Access to member benefits is contingent upon active membership status.
                            </p>
                            <ul className="text-text-secondary dark:text-text-secondary-dark space-y-2 list-disc pl-5">
                                <li>Memberships cannot be canceled for a refund</li>
                                <li>Membership benefits are for the named member only and cannot be shared</li>
                                <li>Active membership is required to participate in auctions and access member-only content</li>
                                <li>We reserve the right to terminate memberships for violation of these Terms</li>
                            </ul>
                        </div>

                        {/* Section 2 - Eligibility */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">2. Eligibility</h2>
                            <ul className="text-text-secondary dark:text-text-secondary-dark space-y-2 list-disc pl-5">
                                <li>Membership is restricted to individuals aged 18 and older</li>
                                <li>You must provide accurate and complete personal information during registration</li>
                                <li>Duplicate accounts are not permitted</li>
                                <li>We reserve the right to verify identity and eligibility</li>
                                <li>False information may result in immediate membership termination</li>
                            </ul>
                        </div>

                        {/* Section 3 - Membership Plans & Billing */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">3. Membership Plans & Billing</h2>
                            <p className="text-text-secondary dark:text-text-secondary-dark mb-3">
                                We offer two membership plans: Classic (6 months for $120) and Premium (12 months for $200). 
                                Membership fees are charged at signup and are non-refundable.
                            </p>
                            <ul className="text-text-secondary dark:text-text-secondary-dark space-y-2 list-disc pl-5">
                                <li>Memberships do not auto-renew. You will be notified when your membership expires</li>
                                <li>To continue membership benefits, you must purchase a new membership plan</li>
                                <li>All payments are processed securely through Stripe</li>
                                <li>Membership fees are subject to change with prior notice</li>
                            </ul>
                        </div>

                        {/* Section 4 - Auctions */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">4. Auctions</h2>
                            <div className="bg-primary dark:bg-bg-secondary p-4 rounded mb-3">
                                <p className="text-text-primary-dark dark:text-text-primary font-semibold mb-2">LEGALLY BINDING COMMITMENTS</p>
                                <ul className="text-text-primary-dark/90 dark:text-text-primary/90 space-y-1 list-disc pl-5">
                                    <li>Auctions are available to active members only</li>
                                    <li>All bids are legally binding and cannot be retracted</li>
                                    <li>Each auction runs for a specified duration with the highest bidder winning at close</li>
                                    <li>Bidding starts at $1 with $1 minimum increments</li>
                                    <li>Outbid notifications are sent via email</li>
                                </ul>
                            </div>
                            <div className="bg-primary dark:bg-bg-secondary p-4 rounded mt-3">
                                <p className="text-text-primary-dark dark:text-text-primary font-semibold mb-2">PAYMENT REQUIREMENT</p>
                                <ul className="text-text-primary-dark/90 dark:text-text-primary/90 space-y-1 list-disc pl-5">
                                    <li>Winning bidders have 6-8 hours to complete payment</li>
                                    <li>Failure to pay within the required timeframe will result in:</li>
                                    <ul className="list-disc pl-5 mt-1">
                                        <li>Loss of the auction win</li>
                                        <li>Account suspension</li>
                                        <li>Potential permanent account termination for repeat violations</li>
                                    </ul>
                                </ul>
                            </div>
                        </div>

                        {/* Section 5 - In-Store Pickup */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">5. In-Store Pickup</h2>
                            <ul className="text-text-secondary dark:text-text-secondary-dark space-y-2 list-disc pl-5">
                                <li>All won items must be picked up in-store at {address}</li>
                                <li>Winners have 5 days to pick up their items after winning the auction</li>
                                <li>A valid ID is required at pickup</li>
                                <li>Our staff will coordinate pickup scheduling with you</li>
                                <li>We do not offer shipping or delivery services</li>
                                <li>Storage fees of $5 per day apply after the 5-day pickup deadline</li>
                                <li>Items not picked up within 30 days may be forfeited and resold</li>
                            </ul>
                        </div>

                        {/* Section 6 - Discount Benefit */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">6. Discount Benefit</h2>
                            <ul className="text-text-secondary dark:text-text-secondary-dark space-y-2 list-disc pl-5">
                                <li>Every new member receives a one-time 20% in-store discount</li>
                                <li>Discount is valid for 30 days from membership activation date</li>
                                <li>Must present Member ID at checkout to receive discount</li>
                                <li>Discount is non-transferable and cannot be combined with other offers</li>
                                <li>Not valid for online or auction purchases</li>
                                <li>No exclusions apply to eligible in-store items</li>
                            </ul>
                        </div>

                        {/* Section 7 - Sold As Is – No Returns */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">7. Sold As Is – No Returns</h2>
                            <div className="bg-primary dark:bg-bg-secondary p-4 rounded mb-3">
                                <p className="text-text-primary-dark dark:text-text-primary font-bold text-center mb-2">ALL ITEMS ARE SOLD:</p>
                                <div className="text-center space-y-1">
                                    <p className="text-text-primary-dark dark:text-text-primary">As-is / "Final Sale"</p>
                                    <p className="text-text-primary-dark dark:text-text-primary">Without any warranty</p>
                                    <p className="text-text-primary-dark dark:text-text-primary">No returns or exchanges accepted</p>
                                </div>
                            </div>
                            <p className="text-text-secondary dark:text-text-secondary-dark">
                                All furniture pieces are described accurately with photos before auction. Members are encouraged to review all details carefully before bidding. All sales are final upon payment.
                            </p>
                        </div>

                        {/* Section 8 - Account Suspension & Termination */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">8. Account Suspension & Termination</h2>
                            <ul className="text-text-secondary dark:text-text-secondary-dark space-y-2 list-disc pl-5">
                                <li>Failure to pay for won auctions may result in account suspension</li>
                                <li>Multiple violations may lead to permanent account termination</li>
                                <li>Violation of these Terms may result in immediate membership termination without refund</li>
                                <li>We reserve the right to suspend accounts suspected of fraudulent activity</li>
                                <li>Suspended accounts lose access to all member benefits and active auctions</li>
                            </ul>
                        </div>

                        {/* Section 9 - Platform Access & Account Security */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">9. Platform Access & Account Security</h2>
                            <ul className="text-text-secondary dark:text-text-secondary-dark space-y-2 list-disc pl-5">
                                <li>You are responsible for maintaining the security of your account credentials</li>
                                <li>Notify us immediately of any unauthorized account access</li>
                                <li>Account sharing is prohibited</li>
                                <li>We reserve the right to refuse or terminate access at our discretion</li>
                                <li>Users must comply with all applicable US federal and state laws</li>
                            </ul>
                        </div>

                        {/* Section 10 - Inspections */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">10. Inspections</h2>
                            <ul className="text-text-secondary dark:text-text-secondary-dark space-y-2 list-disc pl-5">
                                <li>Items are displayed in-store and through detailed photos online</li>
                                <li>Members are encouraged to inspect items in person before bidding</li>
                                <li>Contact us to schedule an in-store viewing appointment</li>
                                <li>All items are sold based on described condition with no additional warranties</li>
                            </ul>
                        </div>

                        {/* Section 11 - Limitation of Liability */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">11. Limitation of Liability</h2>
                            <p className="text-text-secondary dark:text-text-secondary-dark mb-3">
                                To the extent permitted by law, {otherData?.brandName} is not liable for any indirect, incidental, or consequential damages 
                                arising from the use of the {otherData?.brandName} Membership platform or participation in auctions.
                            </p>
                            <ul className="text-text-secondary dark:text-text-secondary-dark space-y-2 list-disc pl-5">
                                <li>All items sold through auctions are sold as-is without warranties</li>
                                <li>Our total liability is limited to the purchase price of the item in question</li>
                                <li>We are not responsible for damages during pickup or transport</li>
                                <li>This does not limit liability for fraud, death, or personal injury caused by negligence</li>
                            </ul>
                        </div>

                        {/* Section 12 - Governing Law */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">12. Governing Law & Disputes</h2>
                            <ul className="text-text-secondary dark:text-text-secondary-dark space-y-2 list-disc pl-5">
                                <li>These Terms are governed by the laws of the United States</li>
                                <li>Disputes shall be resolved by the courts of the United States</li>
                                <li>{otherData?.brandName} is located at {address}</li>
                                <li>You agree to submit to the exclusive jurisdiction of these courts</li>
                            </ul>
                        </div>

                        {/* Section 13 - Changes to Terms */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">13. Changes to These Terms</h2>
                            <p className="text-text-secondary dark:text-text-secondary-dark">
                                We may update these Terms from time to time. The "Last Updated" date indicates the most recent version. 
                                Material changes will be communicated via email or platform notice. Continued use after changes constitutes acceptance.
                            </p>
                        </div>

                        {/* Contact */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4">Contact Information</h2>
                            <div className="bg-primary dark:bg-bg-secondary p-4 rounded">
                                <p className="font-semibold text-text-primary-dark dark:text-text-primary mb-2">{otherData?.brandName}</p>
                                <p className="text-text-primary-dark dark:text-text-primary text-sm mb-1 whitespace-pre-line">{address}</p>
                                <p className="text-text-primary-dark dark:text-text-primary text-sm mb-1">
                                    Email: <a href={`mailto:${email}`} className="text-blue-600 dark:text-blue-400 hover:underline break-all">{email}</a>
                                </p>
                                <p className="text-text-primary-dark dark:text-text-primary text-sm">
                                    Phone: <a href={`tel:${phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">{otherData?.phoneCode} {otherData?.formatPhone(phone)}</a>
                                </p>
                            </div>
                        </div>

                        {/* Footer Note */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-8">
                            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">
                                These Terms were last updated on {formattedDate}. If you have questions about these Terms,
                                please contact us at <a href={`mailto:${email}`} className="text-text-primary dark:text-text-primary-dark hover:underline">{email}</a>.
                            </p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex flex-wrap gap-3">
                            <Link
                                to="/privacy-policy"
                                className="px-4 py-2 bg-secondary dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 hover:bg-gray-800 dark:hover:bg-gray-200 text-text-primary-dark dark:text-text-primary rounded text-sm font-medium transition-colors"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                to="/buyer-agreement"
                                className="px-4 py-2 bg-secondary dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 hover:bg-gray-800 dark:hover:bg-gray-200 text-text-primary-dark dark:text-text-primary rounded text-sm font-medium transition-colors"
                            >
                                Buyer Agreement
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default TermsOfUse;
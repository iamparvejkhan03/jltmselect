import { Link } from "react-router";
import { Container } from "../components";
import { otherData } from "../assets";

const { phone, email, address } = otherData;

const BuyerAgreement = () => {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <section className="pt-10 md:pt-20 bg-bg-secondary dark:bg-primary">
                {/* Header */}
            <div className="max-w-full mx-auto text-center px-6 py-16 bg-primary">

                <div className="flex items-center justify-center gap-3 mb-4"><div className="h-px w-8 bg-secondary"></div><span className="text-secondary text-xs font-medium uppercase tracking-[0.2em]">Legal Policy</span><div className="h-px w-8 bg-secondary"></div></div>

                {/* headline */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-pure-white dark:text-text-primary-dark leading-tight">
                    Buyer Agreement
                </h1>
            </div>

                <Container className={`my-14`}>
                    {/* Main Content */}
                <div className="max-w-full mx-auto">
                    <div className="space-y-8">
                        {/* Introduction */}
                        <div className="mb-8">
                            <p className="text-text-primary dark:text-text-primary-dark mb-4">
                                <strong>{otherData?.brandName}</strong> ("we", "our", "us") and you, the member/buyer ("Member", "Buyer"),
                                enter into this Membership & Auction Agreement governing all purchases made through our exclusive furniture auction platform.
                            </p>
                            <p className="text-text-primary dark:text-text-primary-dark">
                                By purchasing a membership or placing a bid, you agree to be bound by this Agreement. We use buyer's email and phone number to send transactional emails and SMS updates. User can always opt out of emails and SMS updates in their account settings.
                            </p>
                        </div>

                        {/* Section 1 - Membership Requirement */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">1. Membership Requirement</h2>
                            <ul className="text-text-secondary dark:text-text-secondary-dark space-y-2 list-disc pl-5">
                                <li>An active {otherData?.brandName} Membership is required to participate in all auctions</li>
                                <li>Membership plans: Basic (1 month for $50), Standard (3 months for $125), and Premium (6 months for $250).</li>
                                <li>Memberships are non-refundable and non-transferable</li>
                                <li>Membership benefits are available only during active membership status</li>
                                <li>We do not offer auto-renewal. You will be notified when your membership expires and must purchase a new plan to continue</li>
                            </ul>
                        </div>

                        {/* Section 2 - Eligibility */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">2. Eligibility</h2>
                            <ul className="text-text-secondary dark:text-text-secondary-dark space-y-2 list-disc pl-5">
                                <li>Membership is restricted to individuals aged 18 and older</li>
                                <li>All members must provide accurate and complete registration information</li>
                                <li>We reserve the right to verify identity and eligibility</li>
                                <li>Duplicate accounts are not permitted</li>
                                <li>False information may result in immediate membership termination</li>
                            </ul>
                        </div>

                        {/* Section 3 - Binding Contract */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">3. Binding Contract</h2>
                            <p className="text-text-primary dark:text-text-primary-dark mb-3">A legally binding contract is formed when:</p>
                            <ul className="text-text-secondary dark:text-text-secondary-dark space-y-2 list-disc pl-5 mb-3">
                                <li>You win an auction as the highest bidder at closing time</li>
                                <li>Each auction is conducted fairly with the highest bidder declared the winner</li>
                            </ul>
                            <div className="bg-primary dark:bg-bg-secondary p-4 rounded">
                                <p className="text-text-primary-dark dark:text-text-primary font-semibold text-sm">
                                    All bids are legally binding and cannot be retracted. By placing a bid, you commit to purchasing the item if you win.
                                </p>
                            </div>
                        </div>

                        {/* Section 4 - Auction Process */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">4. Auction Process</h2>
                            <ul className="text-text-secondary dark:text-text-secondary-dark space-y-2 list-disc pl-5">
                                <li>Each day, one luxury furniture piece is listed for auction exclusively for members</li>
                                <li>Bidding starts at $1 with $1 minimum increments</li>
                                <li>You can place as many bids as you'd like on any auction</li>
                                <li>You'll receive email notifications when someone outbids you</li>
                                <li>The highest bidder when the auction closes wins the item</li>
                            </ul>
                        </div>

                        {/* Section 5 - Payment Requirement */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">5. Payment Requirement</h2>
                            <div className="bg-primary dark:bg-bg-secondary p-4 rounded mb-3">
                                <p className="text-text-primary-dark dark:text-text-primary font-semibold mb-2">PAYMENT DEADLINE</p>
                                <ul className="text-text-primary-dark/90 dark:text-text-primary/90 space-y-1 list-disc pl-5">
                                    <li>Winning bidders have 6-8 hours to complete payment</li>
                                    <li>Payment must be made in full through our secure payment processor (Stripe)</li>
                                    <li>Failure to pay within the required timeframe will result in:</li>
                                    <ul className="list-disc pl-5 mt-1">
                                        <li>Immediate loss of the auction win</li>
                                        <li>Account suspension</li>
                                        <li>Potential permanent account termination for repeat violations</li>
                                    </ul>
                                </ul>
                            </div>
                            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">
                                All payments are processed in USD. We do not automatically charge winning bidders; you must initiate payment within the required timeframe.
                            </p>
                        </div>

                        {/* Section 6 - In-Store Pickup */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">6. In-Store Pickup</h2>
                            <ul className="text-text-secondary dark:text-text-secondary-dark space-y-2 list-disc pl-5">
                                <li>All won items must be picked up in-store at {address}</li>
                                <li>Winners have 5 days to pick up their items after payment is confirmed</li>
                                <li>A valid ID is required at pickup</li>
                                <li>Our staff will coordinate pickup scheduling with you</li>
                                <li>We do not offer shipping or delivery services under any circumstances</li>
                                <li>Storage fees of $5 per day apply after the 5-day pickup deadline</li>
                                <li>Items not picked up within 30 days may be forfeited and resold without refund</li>
                            </ul>
                        </div>

                        {/* Section 7 - Item Condition */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">7. Item Condition</h2>
                            <p className="text-text-primary dark:text-text-primary-dark mb-3">All furniture items are sold:</p>
                            <ul className="text-text-secondary dark:text-text-secondary-dark space-y-2 list-disc pl-5 mb-3">
                                <li>As-is / "Final Sale"</li>
                                <li>Without any warranty, express or implied</li>
                                <li>No returns, exchanges, or refunds accepted</li>
                            </ul>
                            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">
                                Descriptions, photographs, and specifications are provided for guidance only. Members are encouraged to inspect items in person before bidding by scheduling an in-store viewing appointment.
                            </p>
                        </div>

                        {/* Section 8 - Inspections */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">8. Inspections</h2>
                            <ul className="text-text-secondary dark:text-text-secondary-dark space-y-2 list-disc pl-5">
                                <li>Members are welcome to inspect items in person before bidding</li>
                                <li>Contact us to schedule an in-store viewing appointment</li>
                                <li>Items are displayed in-store and through detailed photos online</li>
                                <li>Failure to inspect before bidding is at the member's sole risk</li>
                                <li>All sales are final regardless of inspection status</li>
                            </ul>
                        </div>

                        {/* Section 9 - Discount Benefit */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">9. Discount Benefit</h2>
                            <ul className="text-text-secondary dark:text-text-secondary-dark space-y-2 list-disc pl-5">
                                <li>Every new member receives a one-time 20% in-store discount</li>
                                <li>Discount is valid for 30 days from membership activation date</li>
                                <li>Must present Member ID at checkout to receive discount</li>
                                <li>Discount is non-transferable and cannot be combined with other offers</li>
                                <li>Not valid for auction purchases or online purchases</li>
                                <li>No exclusions apply to eligible in-store items</li>
                            </ul>
                        </div>

                        {/* Section 10 - Account Suspension & Termination */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">10. Account Suspension & Termination</h2>
                            <ul className="text-text-secondary dark:text-text-secondary-dark space-y-2 list-disc pl-5">
                                <li>Failure to pay for won auctions within the 6-8 hour window may result in account suspension</li>
                                <li>Multiple violations may lead to permanent account termination</li>
                                <li>Violation of this Agreement may result in immediate membership termination without refund</li>
                                <li>We reserve the right to suspend accounts suspected of fraudulent activity</li>
                                <li>Suspended accounts lose access to all member benefits and active auctions</li>
                            </ul>
                        </div>

                        {/* Section 11 - Default & Enforcement */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">11. Default & Enforcement</h2>
                            <p className="text-text-primary dark:text-text-primary-dark mb-2">If payment is not completed within the required timeframe, we may:</p>
                            <ul className="text-text-secondary dark:text-text-secondary-dark space-y-2 list-disc pl-5">
                                <li>Cancel the sale and relist the item for auction</li>
                                <li>Suspend or permanently terminate the member's account</li>
                                <li>Seek recovery of any losses or costs incurred</li>
                                <li>Report to relevant authorities if fraud is suspected</li>
                            </ul>
                        </div>

                        {/* Section 12 - Limitation of Liability */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">12. Limitation of Liability</h2>
                            <p className="text-text-secondary dark:text-text-secondary-dark">
                                To the extent permitted by US law, {otherData?.brandName}'s total liability is limited to the
                                purchase price of the item in question. We are not liable for any indirect, incidental, or consequential
                                damages arising from the use of our platform, participation in auctions, or in-store pickup experience.
                                This does not limit liability for fraud, death, or personal injury caused by negligence.
                            </p>
                        </div>

                        {/* Section 13 - Governing Law */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">13. Governing Law & Disputes</h2>
                            <ul className="text-text-secondary dark:text-text-secondary-dark space-y-2 list-disc pl-5">
                                <li>This Agreement is governed by the laws of the United States</li>
                                <li>Any disputes shall be resolved by the courts of the United States</li>
                                <li>{otherData?.brandName} is located at {address}</li>
                                <li>You agree to submit to the exclusive jurisdiction of these courts</li>
                            </ul>
                        </div>

                        {/* Section 14 - Entire Agreement */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">14. Entire Agreement</h2>
                            <p className="text-text-secondary dark:text-text-secondary-dark">
                                This Membership & Auction Agreement, together with our Terms of Use and Privacy Policy, constitutes the
                                entire agreement between you and {otherData?.brandName} regarding your membership and purchases on our platform.
                            </p>
                        </div>

                        {/* Acceptance & Contact */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4">Acceptance & Contact</h2>
                            <p className="text-text-primary dark:text-text-primary-dark mb-4">
                                By purchasing a {otherData?.brandName} Membership and participating in our auctions, you acknowledge that you have read, understood, and agree to this Membership & Auction Agreement.
                            </p>
                            <div className="bg-primary dark:bg-bg-secondary p-4 rounded">
                                <p className="font-semibold text-text-primary-dark dark:text-text-primary mb-2">{otherData?.brandName}</p>
                                <p className="text-text-primary-dark dark:text-text-primary text-sm mb-1 whitespace-pre-line">{address}</p>
                                <p className="text-text-primary-dark dark:text-text-primary text-sm mb-1">
                                    Email: <a href={`mailto:${email}`} className="text-blue-600 dark:text-blue-400 hover:underline">{email}</a>
                                </p>
                                <p className="text-text-primary-dark dark:text-text-primary text-sm">
                                    Phone: <a href={`tel:${phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">{otherData?.phoneCode} {otherData?.formatPhone(phone)}</a>
                                </p>
                            </div>
                        </div>

                        {/* Footer Note */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-8">
                            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">
                                This Membership & Auction Agreement was last updated on {formattedDate}. It forms an integral part of
                                the contract for every furniture purchase made through {otherData?.brandName}.
                            </p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex flex-wrap gap-3">
                            <Link
                                to="/terms-of-use"
                                className="px-4 py-2 bg-primary dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 hover:bg-gray-800 dark:hover:bg-gray-200 text-text-primary-dark dark:text-text-primary rounded text-sm font-medium transition-colors"
                            >
                                Terms of Use
                            </Link>
                            <Link
                                to="/privacy-policy"
                                className="px-4 py-2 bg-primary dark:bg-bg-secondary border border-gray-200 dark:border-gray-700 hover:bg-gray-800 dark:hover:bg-gray-200 text-text-primary-dark dark:text-text-primary rounded text-sm font-medium transition-colors"
                            >
                                Privacy Policy
                            </Link>
                        </div>
                    </div>
                </div>
                </Container>
        </section>
    );
};

export default BuyerAgreement;
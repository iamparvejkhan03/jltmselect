import { Link } from "react-router-dom";
import { Container } from "../components";
import { otherData } from "../assets";

const { phone, email, address } = otherData;

const PrivacyPolicy = () => {
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
                    Privacy Policy
                </h1>
            </div>

            <Container className={`my-14`}>
                {/* Main Content */}
                <div className="max-w-full mx-auto">
                    <div className="space-y-8">
                        {/* Introduction */}
                        <div className="mb-8">
                            <p className="text-text-primary dark:text-text-primary-dark mb-4">
                                <strong>{otherData?.brandName}</strong> ("we", "our", "us") is committed to protecting
                                your privacy. This Privacy Policy explains how we collect, use, and
                                safeguard your information when you use our furniture auction platform as a {otherData?.brandName} Member.
                            </p>
                            <p className="text-text-primary dark:text-text-primary-dark">
                                By purchasing a membership, registering for, accessing, or using the Platform, you agree to this Privacy Policy.
                            </p>
                        </div>

                        {/* Section 1 - Information We Collect */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">1. Information We Collect</h2>
                            <p className="text-text-secondary dark:text-text-secondary-dark mb-3">
                                We collect personal information you provide during registration including name, email, phone number, address, and payment information.
                                Payment data is processed and stored securely by Stripe.
                            </p>
                        </div>

                        {/* Section 2 - How We Use Your Information */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">2. How We Use Your Information</h2>
                            <p className="text-text-secondary dark:text-text-secondary-dark">
                                Your information is used to manage your membership, process payments, send transactional emails
                                (bid notifications, pickup reminders, receipts), and improve our services.
                            </p>
                        </div>

                        {/* Section 3 - Data Security */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">3. Data Security</h2>
                            <p className="text-text-secondary dark:text-text-secondary-dark">
                                We implement industry-standard security measures to protect your personal information.
                                Payment processing is handled by Stripe, a PCI-DSS compliant payment processor.
                            </p>
                            <div className="bg-primary dark:bg-bg-secondary p-4 rounded mt-3">
                                <p className="text-text-primary-dark dark:text-text-primary/80 text-sm">
                                    While we strive to protect your information, no method of transmission over the Internet is 100% secure.
                                    We cannot guarantee absolute security.
                                </p>
                            </div>
                        </div>

                        {/* Section 4 - Third-Party Services */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">4. Third-Party Services</h2>
                            <p className="text-text-secondary dark:text-text-secondary-dark">
                                We use Stripe for payment processing, Google Analytics for site analytics, and Google Workspace for email communications.
                                These services have their own privacy policies.
                            </p>
                            <ul className="text-text-secondary dark:text-text-secondary-dark space-y-2 list-disc pl-5 mt-3">
                                <li><strong>Stripe:</strong> Processes all membership and auction payments securely</li>
                                <li><strong>Google Analytics:</strong> Helps us understand how users interact with our platform</li>
                                <li><strong>Google Workspace:</strong> Manages our email communications with members</li>
                            </ul>
                            <p className="text-text-secondary/80 dark:text-text-secondary-dark/80 text-sm mt-3 font-semibold">
                                We do not sell your personal data to third parties.
                            </p>
                        </div>

                        {/* Section 5 - Your Rights */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">5. Your Rights</h2>
                            <p className="text-text-secondary dark:text-text-secondary-dark mb-3">
                                You may request access to, correction of, or deletion of your personal data by contacting us.
                                Note that some data may be retained for legal and operational purposes.
                            </p>

                            <h3 className="font-semibold text-text-primary dark:text-text-primary-dark mb-2 mt-4">California Residents (CCPA)</h3>
                            <p className="text-text-secondary dark:text-text-secondary-dark mb-3">
                                If you are a California resident, you have the right to:
                            </p>
                            <ul className="text-text-secondary dark:text-text-secondary-dark space-y-2 list-disc pl-5 mb-4">
                                <li>Know what personal information we collect and share</li>
                                <li>Request deletion of your personal information</li>
                                <li>Opt-out of the sale of your personal information (we do not sell data)</li>
                                <li>Non-discrimination for exercising your rights</li>
                            </ul>

                            <h3 className="font-semibold text-text-primary dark:text-text-primary-dark mb-2 mt-4">EU/EEA Residents (GDPR)</h3>
                            <p className="text-text-secondary dark:text-text-secondary-dark mb-3">
                                If you are located in the European Union, you have the right to:
                            </p>
                            <ul className="text-text-secondary dark:text-text-secondary-dark space-y-2 list-disc pl-5 mb-4">
                                <li>Access your personal data</li>
                                <li>Request correction of inaccurate data</li>
                                <li>Request deletion under certain conditions</li>
                                <li>Restrict or object to processing</li>
                                <li>Data portability</li>
                                <li>Withdraw consent at any time</li>
                            </ul>

                            <p className="text-text-secondary dark:text-text-secondary-dark text-sm mt-3">
                                To exercise your rights, contact us at <a href={`mailto:${email}`} className="text-text-primary dark:text-text-primary-dark hover:underline">{email}</a>.
                                We may need to verify your identity before processing your request.
                            </p>
                        </div>

                        {/* Section 6 - Cookies */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">6. Cookies</h2>
                            <p className="text-text-secondary dark:text-text-secondary-dark">
                                We use cookies and similar tracking technologies to enhance platform functionality, analyze usage, and improve your experience.
                                You can manage cookies through your browser settings. Continued use of {otherData?.brandName} constitutes acceptance of our cookie practices.
                            </p>
                        </div>

                        {/* Section 7 - Data Retention */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">7. Data Retention</h2>
                            <p className="text-text-secondary dark:text-text-secondary-dark">
                                We retain your information as long as necessary for:
                            </p>
                            <ul className="text-text-secondary dark:text-text-secondary-dark space-y-2 list-disc pl-5 mt-3">
                                <li>The duration of your active membership</li>
                                <li>Legal and regulatory requirements (including tax and accounting records)</li>
                                <li>Fraud prevention and security purposes</li>
                                <li>Dispute resolution and enforcement of our agreements</li>
                            </ul>
                        </div>

                        {/* Section 8 - International Transfers */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">8. International Transfers</h2>
                            <p className="text-text-secondary dark:text-text-secondary-dark">
                                {otherData?.brandName} is based in the United States. If you access our platform from outside the US,
                                your information will be transferred to and processed in the United States. By using {otherData?.brandName},
                                you consent to this transfer. For EU users, we ensure appropriate safeguards are in place.
                            </p>
                        </div>

                        {/* Section 9 - Children's Privacy */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">9. Children's Privacy</h2>
                            <p className="text-text-secondary dark:text-text-secondary-dark">
                                {otherData?.brandName} is not intended for individuals under the age of 18. We do not knowingly collect
                                personal information from minors. If you believe a minor has provided us with information, please contact us immediately.
                            </p>
                        </div>

                        {/* Section 10 - Policy Changes */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-3">10. Policy Changes</h2>
                            <p className="text-text-secondary dark:text-text-secondary-dark">
                                We may update this Privacy Policy periodically. The "Last Updated" date indicates when revisions were made.
                                Material changes will be communicated via email or platform notice. Your continued use of {otherData?.brandName}
                                constitutes acceptance of the updated policy.
                            </p>
                        </div>

                        {/* Section 11 - Contact */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4">11. Contact</h2>
                            <p className="text-text-primary dark:text-text-primary-dark mb-4">
                                For privacy-related inquiries or to exercise your privacy rights:
                            </p>
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
                            <p className="text-text-secondary dark:text-text-secondary-dark text-sm mt-4">
                                If you have concerns about our privacy practices, you may also contact your local data protection authority
                                (for EU users) or the Federal Trade Commission (for US users).
                            </p>
                        </div>

                        {/* Footer Note */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-8">
                            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">
                                This Privacy Policy is governed by the laws of the United States. Any disputes
                                will be subject to the exclusive jurisdiction of the courts of the United States.
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

export default PrivacyPolicy;
// Register.jsx - Updated version
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Gavel, Store, Phone, ChevronDown, Upload, AlertCircle, FileText, X, ArrowLeft, CreditCard, Calendar, Clock, Check } from 'lucide-react';
import { darkLogo, logoWithBg, otherData } from '../assets';
import { loadStripe } from '@stripe/stripe-js';
import { useStripe, useElements, CardElement, Elements } from '@stripe/react-stripe-js';
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from '../contexts/AuthContext';
import useCountryStates from '../hooks/useCountryStates';
import { OTP } from '../components';

// countryCodes.js
const countryCodes = [
    // North America
    { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
    // { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
    // { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },

    // UK & Europe
    // { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
    // { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
    // { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
    // { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
    // { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
    // { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
    // { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭' },
    // { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪' },
    // { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴' },
    // { code: 'DK', name: 'Denmark', dialCode: '+45', flag: '🇩🇰' },
    // { code: 'FI', name: 'Finland', dialCode: '+358', flag: '🇫🇮' },
    // { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪' },
    // { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '🇧🇪' },
    // { code: 'AT', name: 'Austria', dialCode: '+43', flag: '🇦🇹' },
    // { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹' },
    // { code: 'GR', name: 'Greece', dialCode: '+30', flag: '🇬🇷' },
    // { code: 'PL', name: 'Poland', dialCode: '+48', flag: '🇵🇱' },
    // { code: 'CZ', name: 'Czech Republic', dialCode: '+420', flag: '🇨🇿' },
    // { code: 'HU', name: 'Hungary', dialCode: '+36', flag: '🇭🇺' },
    // { code: 'RO', name: 'Romania', dialCode: '+40', flag: '🇷🇴' },

    // Asia Pacific
    // { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
    // { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
    // { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
    // { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
    // { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
    // { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾' },
    // { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭' },
    // { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳' },
    // { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭' },
    // { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩' },
    // { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰' },
    // { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩' },
    // { code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰' },
    // { code: 'NP', name: 'Nepal', dialCode: '+977', flag: '🇳🇵' },

    // Middle East
    // { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪' },
    // { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
    // { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼' },
    // { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦' },
    // { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭' },
    // { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲' },
    // { code: 'JO', name: 'Jordan', dialCode: '+962', flag: '🇯🇴' },
    // { code: 'LB', name: 'Lebanon', dialCode: '+961', flag: '🇱🇧' },
    // { code: 'IL', name: 'Israel', dialCode: '+972', flag: '🇮🇱' },
    // { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷' },

    // Africa
    // { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
    // { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
    // { code: 'MA', name: 'Morocco', dialCode: '+212', flag: '🇲🇦' },
    // { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
    // { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
    // { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },

    // Oceania
    // { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
    // { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿' },

    // South America
    // { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
    // { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
    // { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴' },
    // { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱' },
    // { code: 'PE', name: 'Peru', dialCode: '+51', flag: '🇵🇪' },
    // { code: 'VE', name: 'Venezuela', dialCode: '+58', flag: '🇻🇪' },

    // Caribbean
    // { code: 'CU', name: 'Cuba', dialCode: '+53', flag: '🇨🇺' },
    // { code: 'DO', name: 'Dominican Republic', dialCode: '+1-809', flag: '🇩🇴' },
    // { code: 'PR', name: 'Puerto Rico', dialCode: '+1-787', flag: '🇵🇷' },
    // { code: 'JM', name: 'Jamaica', dialCode: '+1-876', flag: '🇯🇲' },
].sort((a, b) => a.name.localeCompare(b.name));

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Plan Selection Component
const PlanSelectionStep = ({ selectedPlan, onPlanSelect, isLoading }) => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_DOMAIN_URL}/api/v1/subscriptions/public/active`);
            if (data.success) {
                setPlans(data.data);
                scrollTo({ top: 0, behavior: 'smooth' });
                if(data.data.length > 0) {
                    onPlanSelect(data.data[1]);
                }
            }
        } catch (err) {
            setError('Failed to load subscription plans');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-text-secondary dark:text-text-secondary-dark">Loading plans...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">Choose Your Plan</h3>
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-2">
                    Select a subscription plan to access auctions
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan) => (
                    <div
                        key={plan._id}
                        className={`relative border rounded-lg p-6 cursor-pointer transition-all ${selectedPlan?._id === plan._id
                            ? 'border-primary bg-primary/5 ring-2 ring-primary'
                            : 'border-gray-200 dark:border-bg-primary-light hover:border-primary/50'
                            }`}
                        onClick={() => onPlanSelect(plan)}
                    >
                        {plan.isPopular && (
                            <div className="absolute -top-3 right-4">
                                <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                                    Popular
                                </span>
                            </div>
                        )}

                        <div className="text-center">
                            <h4 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
                                {plan.title}
                            </h4>
                            {plan.tag && (
                                <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1">
                                    {plan.tag}
                                </p>
                            )}
                            <div className="mt-4">
                                <span className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
                                    ${plan.price.amount}
                                </span>
                                <span className="text-text-secondary dark:text-text-secondary-dark">
                                    /{plan.duration.value} {plan.duration.unit}{plan.duration.value > 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        <ul className="mt-6 space-y-3">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                    <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-text-secondary dark:text-text-secondary-dark">
                                        {feature.text}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        {selectedPlan?._id === plan._id && (
                            <div className="absolute bottom-4 right-4">
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                    <Check size={14} className="text-white" />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Updated Card Section with Plan Details
const CardSectionWithPlan = ({ selectedPlan }) => {
    const stripe = useStripe();
    const elements = useElements();

    if (!selectedPlan) return null;

    return (
        <div className="space-y-4 border-t border-gray-200 dark:border-bg-primary-light pt-6 mt-6">
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">
                Payment Information <span className='text-red-600'>*</span>
            </h3>

            <div className="bg-gray-50 dark:bg-bg-primary-light p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-text-primary dark:text-text-primary-dark">
                            {selectedPlan.title}
                        </p>
                        <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                            {selectedPlan.duration.value} {selectedPlan.duration.unit}{selectedPlan.duration.value > 1 ? 's' : ''} access
                        </p>
                    </div>
                    <p className="text-xl font-bold text-primary">
                        ${selectedPlan.price.amount}
                    </p>
                </div>
            </div>

            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                {otherData?.brandName} requires a credit card to register. Your card will be charged immediately for the selected plan.
            </p>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                        Credit Card Information
                    </label>
                    <div className="p-4 border border-gray-300 dark:border-bg-primary-light rounded-lg bg-gray-50 dark:bg-bg-primary-light">
                        <CardElement
                            options={{
                                style: {
                                    base: {
                                        fontSize: '16px',
                                        color: '#008000',
                                        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                                        '::placeholder': {
                                            color: '#aab7c4',
                                        },
                                    },
                                    invalid: {
                                        color: '#fa755a',
                                        iconColor: '#fa755a',
                                    },
                                },
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Phone Verification Step Component (unchanged)
const PhoneVerificationStep = ({ onVerified, initialPhone }) => {
    const [step, setStep] = useState('phone');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(countryCodes.find(c => c.code === 'US') || countryCodes[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowCountryDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredCountries = countryCodes.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.dialCode.includes(searchTerm)
    );

    const handleSendOTP = async () => {
        if (!phoneNumber) {
            toast.error('Please enter phone number');
            return;
        }

        const cleanedPhone = phoneNumber.replace(/\D/g, '');
        if (cleanedPhone.length < 4) {
            toast.error('Please enter a valid phone number');
            return;
        }

        const fullPhoneNumber = `${selectedCountry.dialCode}${cleanedPhone}`;

        setIsLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_DOMAIN_URL}/api/v1/otp/send`, { phone: fullPhoneNumber });
            setStep('otp');
            toast.success('OTP sent successfully');
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (otp) => {
        const cleanedPhone = phoneNumber.replace(/\D/g, '');
        const fullPhoneNumber = `${selectedCountry.dialCode}${cleanedPhone}`;

        setIsLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_DOMAIN_URL}/api/v1/otp/verify`, { phone: fullPhoneNumber, otp });
            toast.success('Phone verified successfully');
            onVerified(fullPhoneNumber);
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

    if (step === 'phone') {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">Verify Your Phone</h3>
                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-2">
                        We'll send a verification code to your phone
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                        Phone Number
                    </label>
                    <div className="flex gap-2">
                        <div className="relative w-32" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                className="w-full p-3 border border-gray-300 dark:border-bg-primary-light bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark rounded-lg focus:ring-2 focus:ring-secondary-dark focus:border-transparent flex items-center justify-between"
                            >
                                <span>{selectedCountry.flag} {selectedCountry.dialCode}</span>
                                <ChevronDown size={20} className="text-bg-secondary-dark dark:text-gray-600" />
                            </button>

                            {showCountryDropdown && (
                                <div className="absolute z-50 w-64 mt-1 bg-bg-secondary dark:bg-bg-primary border border-gray-300 dark:border-bg-primary-light rounded-lg shadow-lg max-h-80 overflow-y-auto">
                                    <div className="p-2 sticky top-0 bg-bg-secondary dark:bg-bg-primary border-b border-gray-300 dark:border-bg-primary-light">
                                        <input
                                            type="text"
                                            placeholder="Search country..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full p-2 border border-gray-300 dark:border-bg-primary-light bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark rounded focus:ring-1 focus:ring-secondary-dark"
                                        />
                                    </div>
                                    {filteredCountries.map((country) => (
                                        <button
                                            key={country.code}
                                            type="button"
                                            onClick={() => {
                                                setSelectedCountry(country);
                                                setShowCountryDropdown(false);
                                                setSearchTerm('');
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-bg-primary-light flex items-center gap-2 text-text-primary dark:text-text-primary-dark"
                                        >
                                            <span className="text-lg">{country.flag || country.code}</span>
                                            <span className="flex-1">{country.name}</span>
                                            <span className="text-text-secondary dark:text-text-secondary-dark text-sm">{country.dialCode}</span>
                                        </button>
                                    ))}
                                    {filteredCountries.length === 0 && (
                                        <div className="p-4 text-center text-text-secondary dark:text-text-secondary-dark">
                                            No countries found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => {
                                    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 15);
                                    setPhoneNumber(cleaned);
                                }}
                                placeholder="Phone number"
                                maxLength={15}
                                className="w-full p-3 border border-gray-300 dark:border-bg-primary-light bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark rounded-lg focus:ring-2 focus:ring-secondary-dark focus:border-transparent"
                            />
                            {phoneNumber && phoneNumber.length < 4 && (
                                <p className="text-red-500 text-xs mt-1">Phone number must be at least 4 digits</p>
                            )}
                        </div>
                    </div>
                </div>

                <p className='text-xs font-light text-primary'>Note: By putting my phone number, I agree to receive SMS notifications.</p>

                <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={isLoading}
                    className="w-full bg-bg-primary dark:bg-bg-secondary text-text-primary-dark dark:text-text-primary hover:opacity-90 py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Sending...' : 'Send Verification Code'}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <button
                onClick={() => setStep('phone')}
                className="flex items-center text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back
            </button>
            <OTP
                phone={`${selectedCountry.dialCode}${phoneNumber.replace(/\D/g, '')}`}
                onVerify={handleVerifyOTP}
                isLoading={isLoading}
            />
        </div>
    );
};

// Main Register component
const Register = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [verifiedPhone, setVerifiedPhone] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userType, setUserType] = useState('bidder');
    const [selectedPlan, setSelectedPlan] = useState(null);
    const navigate = useNavigate();
    const { setUser, user } = useAuth();
    const { useCountries, useStatesByCountry } = useCountryStates();
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState('US');

    const [identificationDocument, setIdentificationDocument] = useState(null);
    const [identificationDocumentPreview, setIdentificationDocumentPreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [idVerificationError, setIdVerificationError] = useState('');

    useEffect(() => {
        const fetchCountries = async () => {
            setCountries(await useCountries());
        };
        fetchCountries();
    }, []);

    useEffect(() => {
        if (user) {
            navigate(`/${user.userType}/profile`);
        }
    }, [user, navigate]);

    const stripe = useStripe();
    const elements = useElements();

    const { register, handleSubmit, watch, trigger, formState: { errors }, setValue } = useForm({
        defaultValues: {
            email: '',
            password: '',
            username: '',
            firstName: '',
            referredBy: '',
            lastName: '',
            country: '',
            userType: 'bidder',
            street: '',
            city: '',
            state: '',
            postCode: '',
            country: '',
        }
    });

    const password = watch('password');

    const handleUserTypeChange = (type) => {
        setUserType(type);
        setValue('userType', type);
    };

    const handlePhoneVerified = (phone) => {
        setVerifiedPhone(phone);
        setValue('phone', phone);
        setCurrentStep(2);
    };

    const handleCountryChange = async (e) => {
        const countryCode = e.target.value;
        setSelectedCountry(countryCode);
        setValue('country', countryCode);
        setValue('state', '');
        setStates([]);

        if (countryCode) {
            try {
                const statesList = await useStatesByCountry(countryCode);
                setStates(statesList);
            } catch (error) {
                console.error('Error fetching states:', error);
                toast.error('Failed to load states');
            }
        }
    };

    useEffect(() => {
        handleCountryChange({ target: { value: selectedCountry } });
    }, [selectedCountry]);

    const handleIdentificationDocumentChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size should be less than 5MB');
                return;
            }

            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Please upload JPG, PNG, or PDF files only');
                return;
            }

            setIdentificationDocument(file);

            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setIdentificationDocumentPreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setIdentificationDocumentPreview(null);
            }
        }
    };

    const removeIdentificationDocument = () => {
        setIdentificationDocument(null);
        setIdentificationDocumentPreview(null);
        document.getElementById('identificationDocument').value = '';
    };

    const validateStep2 = async () => {
        const isValid = await trigger([
            'email',
            'password',
            'firstName',
            'lastName',
            'username',
            'referredBy',
            'country',
            'street',
            'city',
            'state',
            'postCode',
            'termsConditions',
            'preferences'
        ]);

        if (isValid) {
            setCurrentStep(3);
        } else {
            toast.error('Please fill all required fields correctly');
        }
    };

    const handleNextStep = () => {
        if (currentStep === 2) {
            validateStep2();
        }
    };

    const onSubmit = async (registrationData) => {
        if (!verifiedPhone) {
            toast.error('Please verify your phone number first');
            setCurrentStep(1);
            return;
        }

        if (!selectedPlan) {
            toast.error('Please select a subscription plan');
            return;
        }

        setIdVerificationError('');
        setIsLoading(true);

        try {
            let paymentMethodId = null;

            // Create payment method with Stripe
            if (!stripe || !elements) {
                toast.error('Stripe not initialized properly');
                setIsLoading(false);
                return;
            }

            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                toast.error('Please enter your card details');
                setIsLoading(false);
                return;
            }

            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                    name: `${registrationData.firstName} ${registrationData.lastName}`,
                    email: registrationData.email,
                    phone: verifiedPhone,
                    address: {
                        country: registrationData.country,
                    }
                }
            });

            if (error) {
                toast.error(`Payment error: ${error.message}`);
                setIsLoading(false);
                return;
            }

            paymentMethodId = paymentMethod.id;

            const formData = new FormData();

            // Append all form data
            formData.append('firstName', registrationData.firstName);
            formData.append('lastName', registrationData.lastName);
            formData.append('email', registrationData.email);
            formData.append('phone', verifiedPhone);
            formData.append('referredBy', registrationData.referredBy || '');
            formData.append('password', registrationData.password);
            formData.append('username', registrationData.username);
            formData.append('countryCode', registrationData.country);
            formData.append('countryName', countries.find(c => c.code === registrationData.country)?.name || registrationData.country);
            formData.append('userType', registrationData.userType);
            formData.append('preferences', registrationData.preferences);
            formData.append('street', registrationData.street);
            formData.append('city', registrationData.city);
            formData.append('postCode', registrationData.postCode);
            formData.append('state', registrationData.state);
            formData.append('country', countries.find(c => c.code === registrationData.country)?.name || registrationData.country);
            formData.append('paymentMethodId', paymentMethodId);
            formData.append('subscriptionPlanId', selectedPlan._id);

            if (identificationDocument) {
                formData.append('identificationDocument', identificationDocument);
            }

            const { data } = await axios.post(
                `${import.meta.env.VITE_DOMAIN_URL}/api/v1/users/register`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percentCompleted);
                    },
                }
            );

            if (data.success) {
                const accessToken = data.data.accessToken;
                const refreshToken = data.data.refreshToken;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('user', JSON.stringify(data.data.user));

                setUser(data.data.user);

                const redirectPath = data.data.user.userType === 'seller'
                    ? '/seller/dashboard'
                    : '/bidder/auctions/active';

                navigate(redirectPath);
                toast.success(data.message);
            }

        } catch (error) {
            toast.error(error?.response?.data?.message || 'Registration failed');
            console.error('Registration error:', error);
        } finally {
            setIsLoading(false);
            setUploadProgress(0);
        }
    };

    const renderStepIndicator = () => {
        return (
            <div className="flex items-center justify-center my-5">
                <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-bg-primary dark:bg-bg-secondary text-text-primary-dark dark:text-text-primary' : 'bg-gray-200 dark:bg-bg-primary-light text-gray-600 dark:text-bg-secondary-dark'
                        }`}>
                        1
                    </div>
                    <div className={`w-16 sm:w-32 h-1 ${currentStep >= 2 ? 'bg-bg-primary dark:bg-bg-secondary' : 'bg-gray-200 dark:bg-bg-primary-light'
                        }`} />
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-bg-primary dark:bg-bg-secondary text-text-primary-dark dark:text-text-primary' : 'bg-gray-200 dark:bg-bg-primary-light text-gray-600 dark:text-bg-secondary-dark'
                        }`}>
                        2
                    </div>
                    <div className={`w-16 sm:w-32 h-1 ${currentStep >= 3 ? 'bg-bg-primary dark:bg-bg-secondary' : 'bg-gray-200 dark:bg-bg-primary-light'
                        }`} />
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-bg-primary dark:bg-bg-secondary text-text-primary-dark dark:text-text-primary' : 'bg-gray-200 dark:bg-bg-primary-light text-gray-600 dark:text-bg-secondary-dark'
                        }`}>
                        3
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen pt-32 pb-16 bg-bg-secondary-dark dark:bg-bg-primary flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-secondary/[0.03] to-transparent dark:from-white/[0.03] dark:to-transparent rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden border border-gray-200 dark:border-bg-primary-light">
                <div className="pt-8 text-center flex flex-col items-center justify-center gap-3">
                    <Link to='/' className="mb-4 flex items-center gap-2">
                        <img src={logoWithBg} alt="logo" className="h-8 md:h-8" />
                        {/* <span className={`text-xl font-bold text-primary`}>JLTM</span> */}
                    </Link>
                    <p className="text-text-primary dark:text-text-primary-dark text-lg">Create your account</p>
                </div>

                {renderStepIndicator()}

                <div className="p-5 sm:p-8">
                    {currentStep === 1 && (
                        <PhoneVerificationStep
                            onVerified={handlePhoneVerified}
                            initialPhone={verifiedPhone}
                        />
                    )}

                    {currentStep === 2 && (
                        <form className="space-y-6">
                            {/* Account Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">Account Information</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                                            Email <span className='text-red-600'>*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail size={20} className="text-bg-primary-light dark:text-bg-secondary-dark" />
                                            </div>
                                            <input
                                                type="email"
                                                {...register('email', {
                                                    required: 'Email is required',
                                                    pattern: {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                        message: 'Invalid email address'
                                                    }
                                                })}
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-bg-primary-light bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark rounded-lg focus:ring-2 focus:ring-secondary-darktext-bg-secondary-dark dark:focus:ring-gray-500 focus:border-transparent"
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                                                Password <span className='text-red-600'>*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Lock size={20} className="text-bg-primary-light dark:text-bg-secondary-dark" />
                                                </div>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    {...register('password', {
                                                        required: 'Password is required',
                                                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                                                    })}
                                                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-bg-primary-light bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark rounded-lg focus:ring-2 focus:ring-secondary-darktext-bg-secondary-dark dark:focus:ring-gray-500 focus:border-transparent"
                                                    placeholder="Enter your password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                >
                                                    {showPassword ? <EyeOff size={20} className="text-bg-primary-light dark:text-bg-secondary-dark" /> : <Eye size={20} className="text-bg-primary-light dark:text-bg-secondary-dark" />}
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div className="space-y-4 border-t border-gray-200 dark:border-bg-primary-light pt-6">
                                <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">Personal Information</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                                            First name <span className='text-red-600'>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            {...register('firstName', {
                                                required: 'First name is required',
                                                minLength: { value: 2, message: 'First name must be at least 2 characters' }
                                            })}
                                            className="w-full p-3 border border-gray-300 dark:border-bg-primary-light bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark rounded-lg focus:ring-2 focus:ring-secondary-darktext-bg-secondary-dark dark:focus:ring-gray-500 focus:border-transparent"
                                            placeholder="First name"
                                        />
                                        {errors.firstName && (
                                            <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                                            Last name <span className='text-red-600'>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            {...register('lastName', {
                                                required: 'Last name is required',
                                                minLength: { value: 2, message: 'Last name must be at least 2 characters' }
                                            })}
                                            className="w-full p-3 border border-gray-300 dark:border-bg-primary-light bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark rounded-lg focus:ring-2 focus:ring-secondary-darktext-bg-secondary-dark dark:focus:ring-gray-500 focus:border-transparent"
                                            placeholder="Last name"
                                        />
                                        {errors.lastName && (
                                            <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                </div>

                                {/* Add new address fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                                            Public Auction Display Name <span className='text-red-600'>*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User size={20} className="text-bg-primary-light dark:text-bg-secondary-dark" />
                                            </div>
                                            <input
                                                type="text"
                                                {...register('username', {
                                                    required: 'Username is required',
                                                    minLength: { value: 3, message: 'Username must be at least 3 characters' },
                                                    pattern: {
                                                        value: /^[a-zA-Z0-9_]+$/,
                                                        message: 'Username can only contain letters, numbers, and underscores'
                                                    }
                                                })}
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-bg-primary-light bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark rounded-lg focus:ring-2 focus:ring-secondary-darktext-bg-secondary-dark dark:focus:ring-gray-500 focus:border-transparent"
                                                placeholder="What others see when you bid"
                                            />
                                        </div>
                                        {errors.username && (
                                            <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                                        )}
                                    </div>

                                    {/* Country field */}
                                    <div className="md:col-span-1">
                                        <div className={`${errors.country && 'mb-3'}`}>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Country <span className='text-red-600'>*</span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    {...register('country', { required: 'Country is required' })}
                                                    onChange={handleCountryChange}
                                                    value={selectedCountry}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                                                >
                                                    <option value="">Select country</option>
                                                    {countries.map(country => (
                                                        <option key={country.code} value={country.code}>
                                                            {country.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={20} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                                                {errors.country && (
                                                    <p className="text-red-500 text-sm mt-1 absolute">{errors.country.message}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* State field */}
                                    <div className={`${errors.state && 'mb-3'}`}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            State <span className='text-red-600'>*</span>
                                        </label>
                                        <div className="relative">
                                            {states.length > 0 ? (
                                                <select
                                                    {...register('state', {
                                                        required: selectedCountry ? 'State is required' : false
                                                    })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                                                    disabled={!selectedCountry}
                                                >
                                                    <option value="">Select state</option>
                                                    {states.map(state => (
                                                        <option key={state.id || state.code} value={state.name}>
                                                            {state.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    {...register('state', {
                                                        required: selectedCountry ? 'State is required' : false
                                                    })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder={selectedCountry ? "Enter state" : "Select a country first"}
                                                    disabled={!selectedCountry}
                                                />
                                            )}
                                            <ChevronDown size={20} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                                            {errors.state && (
                                                <p className="text-red-500 text-sm mt-1 absolute">{errors.state.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Street field */}
                                    <div className="md:col-span-1">
                                        <div className={`${errors.street && 'mb-3'}`}>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Street <span className='text-red-600'>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                {...register('street', {
                                                    required: 'Street is required'
                                                })}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="Street address"
                                            />
                                            {errors.street && (
                                                <p className="text-red-500 text-sm mt-1 absolute">{errors.street.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* City field */}
                                    <div className={`${errors.city && 'mb-3'}`}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            City <span className='text-red-600'>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            {...register('city', {
                                                required: 'City is required'
                                            })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="City"
                                        />
                                        {errors.city && (
                                            <p className="text-red-500 text-sm mt-1 absolute">{errors.city.message}</p>
                                        )}
                                    </div>

                                    {/* Post Code field */}
                                    <div className={`${errors.postCode && 'mb-3'}`}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Post Code <span className='text-red-600'>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            {...register('postCode', {
                                                required: 'Post code is required'
                                            })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Postal code"
                                        />
                                        {errors.postCode && (
                                            <p className="text-red-500 text-sm mt-1 absolute">{errors.postCode.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Referred By Information */}
                            <div className="space-y-4 border-t border-gray-200 dark:border-bg-primary-light pt-6">
                                <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">Referred By</h3>

                                <div className="grid grid-cols-1">
                                        <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                                            Full name
                                        </label>
                                        <input
                                            type="text"
                                            {...register('referredBy', {
                                                minLength: { value: 2, message: 'Referred by name must be at least 2 characters' }
                                            })}
                                            className="w-full p-3 border border-gray-300 dark:border-bg-primary-light bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark rounded-lg focus:ring-2 focus:ring-secondary-darktext-bg-secondary-dark dark:focus:ring-gray-500 focus:border-transparent"
                                            placeholder="Full name"
                                        />
                                        {errors.referredBy && (
                                            <p className="text-red-500 text-sm mt-1">{errors.referredBy.message}</p>
                                        )}
                                </div>
                            </div>

                            {/* User Type Selection - Commented */}
                            {/* <div className="border-t border-gray-200 dark:border-bg-primary-light pt-6">
                                <label className="text-sm font-medium leading-none text-text-secondary dark:text-text-secondary-dark flex items-center gap-2 mb-4">
                                    <User size={20} />
                                    <span>User Type</span>
                                    <span className='text-red-600'>*</span>
                                </label>

                                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch gap-3 my-2">
                                    <label
                                        className={`flex items-center gap-5 border py-3 px-5 rounded cursor-pointer transition-colors ${userType === 'bidder' ? 'border-primary dark:border-primary-dark bg-blue-50 dark:bg-bg-primary-light' : 'border-gray-200 dark:border-bg-primary-light hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            value="bidder"
                                            {...register('userType', { required: 'Please select user type' })}
                                            className="hidden"
                                            onChange={() => handleUserTypeChange('bidder')}
                                        />
                                        <Gavel size={40} className={`flex-shrink-0 p-2 rounded ${userType === 'bidder' ? 'bg-bg-primary dark:bg-bg-secondary text-text-primary-dark dark:text-text-primary' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-bg-secondary-dark'
                                            }`} />
                                        <div>
                                            <p className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">I'm a buyer</p>
                                            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">I want to buy on the listings on the platform.</p>
                                        </div>
                                    </label>

                                    <label
                                        className={`flex items-center gap-5 border py-3 px-5 rounded cursor-pointer transition-colors ${userType === 'seller' ? 'border-primary dark:border-primary-dark bg-blue-50 dark:bg-bg-primary-light' : 'border-gray-200 dark:border-bg-primary-light hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            value="seller"
                                            {...register('userType', { required: 'Please select user type' })}
                                            className="hidden"
                                            onChange={() => handleUserTypeChange('seller')}
                                        />
                                        <Store size={40} className={`flex-shrink-0 p-2 rounded ${userType === 'seller' ? 'bg-bg-primary dark:bg-bg-secondary text-text-primary-dark dark:text-text-primary' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-bg-secondary-dark'
                                            }`} />
                                        <div>
                                            <p className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">I'm a seller</p>
                                            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">I want to list things on the platform.</p>
                                        </div>
                                    </label>
                                </div>
                                {errors.userType && (
                                    <p className="text-red-500 text-sm mt-1">{errors.userType.message}</p>
                                )}
                            </div> */}

                            {/* ID Verification Section - Commented */}
                            {/* <div id="id-verification-section" className="border-t border-gray-200 dark:border-bg-primary-light pt-6">
                                <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-4">Identity Verification <span className='text-red-600'>*</span></h3>
                                <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-4">
                                    Please upload a valid government-issued ID (Driver's License, Passport, or National ID Card)
                                </p>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="identificationDocument"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            onChange={handleIdentificationDocumentChange}
                                            className="hidden"
                                        />

                                        {!identificationDocument ? (
                                            <label
                                                htmlFor="identificationDocument"
                                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-bg-primary-light rounded-lg cursor-pointer hover:border-primary dark:hover:border-primary-dark hover:bg-blue-50 dark:hover:bg-bg-primary-light transition-colors"
                                            >
                                                <Upload size={24} className="text-bg-secondary-dark dark:text-gray-600 mb-2" />
                                                <span className="text-sm text-text-secondary dark:text-text-secondary-dark">Click to upload or drag and drop</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">JPG, PNG, or PDF (Max 5MB)</span>
                                            </label>
                                        ) : (
                                            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-bg-primary-light rounded-lg bg-gray-50 dark:bg-bg-primary-light">
                                                <div className="flex items-center gap-3">
                                                    {identificationDocument.type.startsWith('image/') && identificationDocumentPreview ? (
                                                        <img
                                                            src={identificationDocumentPreview}
                                                            alt="ID Preview"
                                                            className="w-12 h-12 object-cover rounded"
                                                        />
                                                    ) : (
                                                        <FileText size={24} className="text-primary dark:text-primary-dark" />
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark">{identificationDocument.name}</p>
                                                        <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                                                            {(identificationDocument.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={removeIdentificationDocument}
                                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                                                >
                                                    <X size={20} className="text-gray-500 dark:text-bg-secondary-dark" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {uploadProgress > 0 && uploadProgress < 100 && (
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                            <div
                                                className="bg-primary dark:bg-primary-dark h-2.5 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-bg-primary-light rounded-lg">
                                        <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-blue-700 dark:text-blue-300">
                                            Your ID will be securely stored and verified. We use this to prevent fraud and ensure platform safety.
                                            {userType === 'seller' && ' Sellers require ID verification to list items.'}
                                        </p>
                                    </div>
                                </div>
                            </div> */}

                            <div>
                                <label className='flex items-center gap-2'>
                                    <input
                                        type="checkbox"
                                        {...register('preferences', { required: 'Accepting email and SMS updates is required for registration.' })}
                                        className="accent-primary dark:accent-primary-dark"
                                    />
                                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                                        By checking this box, I agree to receive Email and SMS updates from {otherData?.brandName}.
                                    </p>
                                </label>
                                {errors.preferences && (
                                    <p className="text-red-500 text-sm mt-1">{errors.preferences.message}</p>
                                )}
                            </div>

                            <div>
                                <label className='flex items-center gap-2'>
                                    <input
                                        type="checkbox"
                                        {...register('termsConditions', { required: 'Accepting terms of use is required for registration.' })}
                                        className="accent-primary dark:accent-primary-dark"
                                    />
                                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                                        By registering, I agree to {otherData?.brandName}'s <Link className='text-blue-600 dark:text-blue-400 underline' to='/terms-of-use'>Terms of Use</Link>.
                                        My information will be used as described in the <Link to='/privacy-policy' className='text-blue-600 dark:text-blue-400 underline'>Privacy Policy</Link>.
                                    </p>
                                </label>
                                {errors.termsConditions && (
                                    <p className="text-red-500 text-sm mt-1">{errors.termsConditions.message}</p>
                                )}
                            </div>

                            {/* Next Step Button */}
                            <button
                                type="button"
                                onClick={handleNextStep}
                                className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                            >
                                Next: Choose Plan
                            </button>
                        </form>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <PlanSelectionStep
                                selectedPlan={selectedPlan}
                                onPlanSelect={setSelectedPlan}
                                isLoading={isLoading}
                            />

                            {selectedPlan && (
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <CardSectionWithPlan selectedPlan={selectedPlan} />

                                    <button
                                        type="submit"
                                        disabled={isLoading || !stripe}
                                        className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Processing Payment...' : `Pay $${selectedPlan.price.amount} & Register`}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Already have account */}
                    <div className="text-center mt-6">
                        <p className="text-text-secondary dark:text-text-secondary-dark text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-text-primary dark:text-text-primary-dark font-semibold underline hover:text-opacity-80">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="dark:bg-bg-primary px-4 pb-4 text-center">
                    <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                        © {new Date().getFullYear()} {otherData?.brandName}. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

// Wrap the main component with Stripe Elements provider
const RegisterWithStripe = () => (
    <Elements stripe={stripePromise}>
        <Register />
    </Elements>
);

export default RegisterWithStripe;
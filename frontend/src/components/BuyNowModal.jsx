// components/BuyNowModal.jsx
import { useEffect, useState } from "react";
import {
    CheckCircle,
    XCircle,
    Package,
    Gift,
    CreditCard,
    Loader,
    AlertCircle
} from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const BuyNowModal = ({ isOpen, onClose, auction, loading: externalLoading, isGiveaway }) => {
    const [serviceFee, setServiceFee] = useState(0);
    const [commissionType, setCommissionType] = useState("percentage");
    const [commissionValue, setCommissionValue] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        // Don't fetch commission for giveaways
        if (isGiveaway) {
            setServiceFee(0);
            return;
        }

        if (!isOpen || !auction?.buyNowPrice) return;

        const getCommission = async () => {
            try {
                const { data } = await axiosInstance.get("/api/v1/commissions");
                const commission = data?.data?.commission;

                if (!commission) return;

                setCommissionType(commission.commissionType);
                setCommissionValue(commission.commissionValue);

                const price = Number(auction.buyNowPrice);

                if (commission.commissionType === "fixed") {
                    setServiceFee(Number(commission.commissionValue));
                } else {
                    setServiceFee(
                        (price * Number(commission.commissionValue)) / 100
                    );
                }
            } catch (error) {
                console.error("Error fetching commission:", error);
            }
        };

        getCommission();
    }, [isOpen, auction?.buyNowPrice, isGiveaway]);

    const handleClaim = async () => {
        if (isGiveaway) {
            // Handle giveaway directly (no payment)
            onConfirm();
            return;
        }

        setProcessing(true);

        // Show loading toast
        const loadingToast = toast.loading('Processing your claim...');

        try {
            const response = await axiosInstance.post("/api/v1/buy-now-payment/claim", {
                auctionId: auction._id
            });

            toast.dismiss(loadingToast);

            if (response.data.success) {
                setPaymentStatus('success');

                // Show success toast
                toast.success(
                    <div className="flex items-center gap-2">
                        <CheckCircle size={20} className="text-green-600" />
                        <div>
                            <p className="font-semibold">Auction Claimed!</p>
                            <p className="text-sm text-gray-600">
                                You've successfully claimed "{auction.title}". Proceeding to checkout...
                            </p>
                        </div>
                    </div>,
                    {
                        duration: 3000,
                        position: 'top-center',
                    }
                );

                // Redirect to checkout after delay
                setTimeout(() => {
                    onClose();
                    navigate(`/checkout/${auction._id}`);
                }, 1500);
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            setPaymentStatus('failed');

            // Show error toast
            toast.error(
                <div className="flex items-center gap-2">
                    <XCircle size={20} className="text-red-600" />
                    <div>
                        <p className="font-semibold">Claim Failed</p>
                        <p className="text-sm text-gray-600">
                            {error.response?.data?.message || "Something went wrong. Please try again."}
                        </p>
                    </div>
                </div>,
                {
                    duration: 5000,
                    position: 'top-center',
                }
            );
        } finally {
            setProcessing(false);
        }
    };

    if (!isOpen) return null;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // const total = isGiveaway
    //     ? 0
    //     : Number(auction?.buyNowPrice || 0) + Number(serviceFee);
    
    const total = isGiveaway
        ? 0
        : Number(auction?.buyNowPrice || 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                <div className="p-6">

                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isGiveaway ? 'bg-purple-100' : 'bg-green-100'}`}>
                            {isGiveaway ? (
                                <Gift className="h-6 w-6 text-purple-600" />
                            ) : (
                                <Package className="h-6 w-6 text-green-600" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {isGiveaway ? '🎁 Claim Free Item' : 'Buy Now'}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {isGiveaway ? 'Instant claim - completely free' : 'Claim this item and proceed to checkout'}
                            </p>
                        </div>
                    </div>

                    {/* Payment Status Messages */}
                    {paymentStatus === 'success' && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-700 font-medium">✅ Auction claimed! Redirecting to checkout...</p>
                        </div>
                    )}

                    {paymentStatus === 'failed' && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 font-medium">❌ Claim failed. Please try again.</p>
                        </div>
                    )}

                    {/* Special Giveaway Message */}
                    {isGiveaway && (
                        <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <p className="text-purple-700 text-sm">
                                This item is completely free! The first person to claim it wins.
                                No payment or fees required.
                            </p>
                        </div>
                    )}

                    {/* Price Breakdown - Only show for non-giveaway */}
                    {!isGiveaway && (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                            <div className="flex justify-between text-gray-700 text-sm">
                                <span>Buy Now Price</span>
                                <span className="font-semibold">
                                    {formatCurrency(auction?.buyNowPrice)}
                                </span>
                            </div>

                            {/* <div className="flex justify-between text-gray-700 text-sm">
                                <span>Sales Tax</span>
                                <span className="font-semibold">
                                    {formatCurrency(serviceFee)}
                                </span>
                            </div> */}

                            <div className="border-t pt-2 flex justify-between text-base font-bold text-green-600">
                                <span>Total to Pay</span>
                                <span>{formatCurrency(total)}</span>
                            </div>

                            <div className="mt-3 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                                <CreditCard size={16} className="text-blue-600" />
                                <p className="text-xs text-blue-700">
                                    You'll be redirected to checkout to complete payment and select shipping
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action List */}
                    <div className="mb-6">
                        <p className="font-medium text-gray-700 mb-2">
                            {isGiveaway ? 'This will:' : 'This will:'}
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                {isGiveaway ? 'Claim the item immediately' : 'Reserve this item for you'}
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                {isGiveaway ? 'Mark you as the winner' : 'Mark the auction as sold'}
                            </li>
                            {!isGiveaway && (
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    Redirect to checkout for payment and shipping
                                </li>
                            )}
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                {isGiveaway ? 'Item marked as claimed' : 'Reject all pending offers'}
                            </li>
                        </ul>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={processing || externalLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <XCircle className="h-5 w-5" />
                            Cancel
                        </button>

                        <button
                            onClick={handleClaim}
                            disabled={processing || externalLoading || paymentStatus === 'success'}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg transition-colors disabled:opacity-50 ${isGiveaway
                                    ? 'bg-purple-600 hover:bg-purple-700'
                                    : 'bg-green-600 hover:bg-green-700'
                                }`}
                        >
                            {(processing || externalLoading) ? (
                                <>
                                    <Loader size={16} className="animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {isGiveaway ? (
                                        <>
                                            <Gift className="h-5 w-5" />
                                            Claim for Free
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="h-5 w-5" />
                                            Proceed
                                        </>
                                    )}
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BuyNowModal;
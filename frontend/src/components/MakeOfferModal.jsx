import React, { useEffect, useState } from "react";
import { X, Banknote, MessageSquare, Shield } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import useAuctionDeposit from "../hooks/useDeposit";
import { toast } from "react-hot-toast";

const MakeOfferModal = ({
    isOpen,
    onClose,
    onSubmit,
    offerAmount,
    setOfferAmount,
    offerMessage,
    setOfferMessage,
    loading,
    auction
}) => {
    const [serviceFee, setServiceFee] = useState(0);
    const [commissionType, setCommissionType] = useState("percentage");
    const [commissionValue, setCommissionValue] = useState(0);
    const [depositInfo, setDepositInfo] = useState(null);
    const [processingAction, setProcessingAction] = useState(false);

    const { checkAndProcessDeposit, processingDeposit } = useAuctionDeposit();

    useEffect(() => {
        if (!isOpen || !auction?._id) return;

        const fetchData = async () => {
            try {
                // Fetch commission settings
                const commissionRes = await axiosInstance.get("/api/v1/commissions");
                const commission = commissionRes?.data?.data?.commission;
                if (commission) {
                    setCommissionType(commission.commissionType);
                    setCommissionValue(commission.commissionValue);
                }

                // Fetch deposit settings and check if user has deposit
                const depositRes = await axiosInstance.get(`/api/v1/bid-deposit/check/${auction._id}`);
                setDepositInfo(depositRes.data.data);

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [isOpen, auction?._id]);

    useEffect(() => {
        if (!offerAmount) return;

        const amount = Number(offerAmount);

        if (commissionType === "fixed") {
            setServiceFee(Number(commissionValue));
        } else {
            setServiceFee((amount * Number(commissionValue)) / 100);
        }
    }, [offerAmount, commissionType, commissionValue]);

    if (!isOpen) return null;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // const total = Number(offerAmount || 0) + Number(serviceFee);
    const total = Number(offerAmount || 0);
    const isInvalidOffer = !offerAmount || parseFloat(offerAmount) < auction?.startPrice;

    // Calculate deposit amount if needed
    const getDepositAmount = () => {
        if (!depositInfo?.settings?.isActive) return 0;

        const settings = depositInfo.settings;
        if (settings.depositType === 'fixed') {
            return settings.depositValue;
        } else {
            // Percentage
            let deposit = (parseFloat(offerAmount || 0) * settings.depositValue) / 100;
            if (settings.minDepositAmount && deposit < settings.minDepositAmount) {
                deposit = settings.minDepositAmount;
            }
            if (settings.maxDepositAmount && deposit > settings.maxDepositAmount) {
                deposit = settings.maxDepositAmount;
            }
            return deposit;
        }
    };

    const needsDeposit = depositInfo?.settings?.isActive && !depositInfo?.hasDeposit;
    const depositAmount = getDepositAmount();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isInvalidOffer) {
            toast.error(`Minimum offer is ${formatCurrency(auction?.startPrice)}`);
            return;
        }

        setProcessingAction(true);

        try {
            // Step 1: Handle deposit if needed - PASS 'offer' as action type
            if (needsDeposit) {
                const depositResult = await checkAndProcessDeposit(
                    auction._id,
                    offerAmount,
                    'offer'  // <-- Add this parameter
                );

                if (!depositResult.success) {
                    setProcessingAction(false);
                    return; // Stop if deposit failed
                }
            }

            // Step 2: Submit the offer
            await onSubmit(e);

        } catch (error) {
            console.error('Offer submission error:', error);
            toast.error('Failed to submit offer');
        } finally {
            setProcessingAction(false);
        }
    };

    const isLoading = loading || processingDeposit || processingAction;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">
                        Make an Offer
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                        disabled={isLoading}
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Deposit Warning - Show if needed */}
                    {/* {needsDeposit && (
                        <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-purple-800">One-time Deposit Required</p>
                                    <p className="text-sm text-purple-700 mt-1">
                                        {depositInfo?.settings?.depositType === 'fixed'
                                            ? `A deposit of $${depositInfo.settings.depositValue} is required for your first action on this auction.`
                                            : `A deposit of ${depositInfo.settings.depositValue}% of your offer amount will be charged.`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {depositInfo?.hasDeposit && (
                        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-green-600" />
                                <p className="text-sm text-green-700">
                                    ✅ Deposit already paid for this auction. No additional deposit needed.
                                </p>
                            </div>
                        </div>
                    )} */}

                    {/* Offer Amount */}
                    <div className="mb-4">
                        <label className="flex items-center gap-2 justify-start text-lg font-medium text-gray-700 mb-2">
                            Offer Amount
                        </label>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Banknote className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="number"
                                value={offerAmount}
                                onChange={(e) => setOfferAmount(e.target.value)}
                                className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your offer amount"
                                min={auction?.startPrice}
                                step="0.01"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {/* {auction?.startPrice && auction?.startPrice > 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                                Minimum offer: {formatCurrency(auction?.startPrice)}
                            </p>
                        )} */}
                    </div>

                    {/* Fee Breakdown */}
                    {offerAmount && !isInvalidOffer && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                            <div className="flex justify-between text-gray-700">
                                <span>Offer Amount</span>
                                <span>{formatCurrency(offerAmount)}</span>
                            </div>

                            {/* <div className="flex justify-between text-gray-700">
                                <span>Sales Tax</span>
                                <span>{formatCurrency(serviceFee)}</span>
                            </div> */}

                            {needsDeposit && depositAmount > 0 && (
                                <div className="flex justify-between text-purple-700">
                                    <span>Deposit (one-time)</span>
                                    <span>{formatCurrency(depositAmount)}</span>
                                </div>
                            )}

                            <div className="border-t pt-2 flex justify-between font-semibold text-green-600">
                                <span>Total Payable Now</span>
                                <span>
                                    {formatCurrency(
                                        needsDeposit ? total + depositAmount : total
                                    )}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Message */}
                    {/* <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Message to Seller (Optional)
                        </label>

                        <div className="relative">
                            <div className="absolute top-3 left-3">
                                <MessageSquare className="h-5 w-5 text-gray-400" />
                            </div>
                            <textarea
                                value={offerMessage}
                                onChange={(e) => setOfferMessage(e.target.value)}
                                className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Add a message to the seller..."
                                rows="2"
                                disabled={isLoading}
                            />
                        </div>

                        <p className="text-sm text-gray-500 mt-1">
                            Your offer will expire in 48 hours if not responded to.
                        </p>
                    </div> */}

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isLoading || isInvalidOffer}
                            className="flex-1 bg-[#edcd1f] text-black py-3 px-4 rounded-lg hover:bg-[#edcd1f]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                                    {processingDeposit ? "Processing Deposit..." : "Submitting..."}
                                </span>
                            ) : (
                                needsDeposit ? "Pay Deposit" : "Submit Offer"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MakeOfferModal;
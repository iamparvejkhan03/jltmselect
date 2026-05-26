import { forwardRef, useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const BidConfirmationModal = forwardRef((props, ref) => {
    const {
        isOpen,
        onClose,
        onConfirm,
        auction,
        bidAmount
    } = props;

    const [commissionType, setCommissionType] = useState("percentage");
    const [commissionValue, setCommissionValue] = useState(0);
    const [serviceFee, setServiceFee] = useState(0);
    const [depositInfo, setDepositInfo] = useState(null);
    const [userHasDeposit, setUserHasDeposit] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const getCommission = async () => {
            try {
                const { data } = await axiosInstance.get("/api/v1/commissions");
                const commission = data?.data?.commission;

                if (!commission) return;

                setCommissionType(commission.commissionType);
                setCommissionValue(commission.commissionValue);

                if (commission.commissionType === "fixed") {
                    setServiceFee(Number(commission.commissionValue));
                } else {
                    setServiceFee(
                        (Number(bidAmount) * Number(commission.commissionValue)) / 100
                    );
                }
            } catch (error) {
                console.error("Error fetching commission:", error);
            }
        };

        getCommission();
    }, [bidAmount, isOpen]);

    // ===== NEW: Check deposit status =====
    useEffect(() => {
        const checkDepositStatus = async () => {
            if (isOpen && auction?._id) {
                setLoading(true);
                try {
                    // Check if user has ANY deposit for this auction
                    const { data } = await axiosInstance.get(`/api/v1/bid-deposit/check/${auction._id}`);

                    if (data.success) {
                        setUserHasDeposit(data.data.hasDeposit);
                        setDepositInfo(data.data.settings);
                    }
                } catch (error) {
                    console.error('Error checking deposit:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        checkDepositStatus();
    }, [isOpen, auction?._id]);

    if (!isOpen) return null;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // const total = Number(bidAmount) + Number(serviceFee);
    const total = Number(bidAmount);

    // Calculate deposit amount if needed
    const getDepositAmount = () => {
        if (!depositInfo?.isActive || userHasDeposit) return 0;

        if (depositInfo.depositType === 'fixed') {
            return depositInfo.depositValue;
        } else {
            // Percentage
            let deposit = (Number(bidAmount) * depositInfo.depositValue) / 100;
            if (depositInfo.minDepositAmount && deposit < depositInfo.minDepositAmount) {
                deposit = depositInfo.minDepositAmount;
            }
            if (depositInfo.maxDepositAmount && deposit > depositInfo.maxDepositAmount) {
                deposit = depositInfo.maxDepositAmount;
            }
            return deposit;
        }
    };

    const depositAmount = getDepositAmount();
    const needsDeposit = depositInfo?.isActive && !userHasDeposit && depositAmount > 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center py-3 px-6 md:p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Confirm your bid
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-light"
                    >
                        ×
                    </button>
                </div>

                {/* Vehicle Info */}
                <div className="py-3 px-6 md:p-6 border-b border-gray-200">
                    <strong className="text-gray-900">
                        {auction?.auctionType === "standard" ? "No Reserve" : "Reserve"}:{" "}
                        {auction?.title || ""}
                    </strong>
                </div>

                {/* Bid Details */}
                <div className="py-3 px-6 md:p-6 border-b border-gray-200">
                    <table className="w-full">
                        <tbody>
                            <tr>
                                <td className="text-gray-600">Bid Amount:</td>
                                <td className="text-right text-gray-900">
                                    {formatCurrency(bidAmount)}
                                </td>
                            </tr>
                            {/* <tr>
                                <td className="py-2 text-gray-600">Sales Tax:</td>
                                <td className="py-2 text-right text-gray-900">
                                    {formatCurrency(serviceFee)}
                                </td>
                            </tr> */}

                            {/* ===== NEW: Show deposit row if needed ===== */}
                            {needsDeposit && (
                                <tr>
                                    <td className="py-2 text-purple-600 font-medium">Deposit (one-time):</td>
                                    <td className="py-2 text-right text-purple-600 font-medium">
                                        {formatCurrency(depositAmount)}
                                    </td>
                                </tr>
                            )}

                            <tr className="border-t border-gray-200">
                                <td className="py-3 font-semibold text-gray-900">Total:</td>
                                <td className="py-3 text-right font-semibold text-gray-900">
                                    {formatCurrency(needsDeposit ? total + depositAmount : total)}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* ===== UPDATED: Deposit warning section ===== */}
                    {/* {depositInfo?.isActive && !loading && (
                        <div className={`mt-4 rounded-lg p-4 ${userHasDeposit
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-purple-50 border border-purple-200'
                            }`}>
                            {userHasDeposit ? (
                                // Case 1: User already paid deposit (from bid or offer)
                                <div className="flex items-start gap-3">
                                    <div className="text-green-600 text-lg">✅</div>
                                    <div>
                                        <p className="text-sm font-medium text-green-700">
                                            Deposit already paid
                                        </p>
                                        <p className="text-xs text-green-600 mt-1">
                                            You've already paid the deposit for this auction. No additional deposit needed.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                // Case 2: User needs to pay deposit
                                <div className="flex items-start gap-3">
                                    <div className="text-purple-600 text-lg">💰</div>
                                    <div>
                                        <p className="text-sm font-medium text-purple-700">
                                            One-time Deposit Required
                                        </p>
                                        <p className="text-xs text-purple-600 mt-1">
                                            {depositInfo.depositType === 'fixed'
                                                ? `A one-time deposit of $${depositInfo.depositValue} will be charged on your first action (bid or offer) for this auction.`
                                                : `A deposit of ${depositInfo.depositValue}% of your bid amount will be charged.`
                                            }
                                            {depositInfo.depositType === 'percentage' && (
                                                <>
                                                    {depositInfo.minDepositAmount && ` Min: $${depositInfo.minDepositAmount}`}
                                                    {depositInfo.maxDepositAmount && `, Max: $${depositInfo.maxDepositAmount}`}
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )} */}
                </div>

                {/* Action Buttons */}
                <div className="py-3 px-6 md:p-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 px-4 md:py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        ref={ref}
                        onClick={onConfirm}
                        type="submit"
                        className="flex-1 py-2 px-4 md:py-3 bg-black text-white rounded-md hover:bg-gray-900 font-medium transition-colors"
                    >
                        {needsDeposit ? `Pay Deposit` : "Place Bid"}
                    </button>
                </div>

            </div>
        </div>
    );
});

export default BidConfirmationModal;
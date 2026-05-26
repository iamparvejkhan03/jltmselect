// Simple status-based timer display
const TimerDisplay = ({ countdown, auction }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    };
    // ALWAYS AVAILABLE AUCTIONS (Buy Now & Giveaway)
    if (auction?.auctionType === 'buy_now' || auction?.auctionType === 'giveaway') {
        if (auction.winner) {
            return (
                <div className="text-center py-8">
                    <div className={`text-lg font-semibold mb-2 ${
                        auction.auctionType === 'buy_now' ? 'text-green-600 dark:text-green-400' : 'text-purple-600 dark:text-purple-400'
                    }`}>
                        {auction.auctionType === 'buy_now' ? '💰 Item Purchased' : '🎁 Giveaway Claimed'}
                    </div>
                    <div className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
                        {auction.auctionType === 'buy_now' 
                            ? `Sold for ${formatCurrency(auction.finalPrice) || formatCurrency(auction.buyNowPrice)}`
                            : `Claimed by: ${auction.winner.username}`
                        }
                    </div>
                </div>
            );
        }
        
        // Active - show appropriate message
        return (
            <div className="text-center py-8">
                <div className={`text-lg font-semibold mb-2 ${
                    auction.auctionType === 'buy_now' ? 'text-green-600 dark:text-green-400' : 'text-purple-600 dark:text-purple-400'
                }`}>
                    {auction.auctionType === 'buy_now' ? '💰 Buy Now Available' : '🎁 Free Giveaway'}
                </div>
                <div className="text-md text-text-secondary dark:text-text-secondary-dark">
                    {auction.auctionType === 'buy_now' 
                        ? `Available until purchased`
                        : 'Available until claimed'
                    }
                </div>
            </div>
        );
    }

    // TIMED AUCTIONS (Standard & Reserve)
    if (countdown.status === 'approved') {
        return (
            <div className="text-center py-8">
                <div className="text-lg font-semibold text-text-secondary dark:text-text-secondary-dark mb-4">Auction Starts In</div>
                <div className="grid grid-cols-4 gap-2 text-xl sm:text-2xl text-text-primary dark:text-text-primary-dark">
                    <p className="flex flex-col items-center gap-2 border-r-2 border-gray-200 dark:border-gray-700 px-2">
                        <span>{countdown.days}</span>
                        <span className="text-sm sm:text-base font-light">Days</span>
                    </p>
                    <p className="flex flex-col items-center gap-2 border-r-2 border-gray-200 dark:border-gray-700">
                        <span>{countdown.hours}</span>
                        <span className="text-sm sm:text-base font-light">Hours</span>
                    </p>
                    <p className="flex flex-col items-center gap-2 border-r-2 border-gray-200 dark:border-gray-700">
                        <span>{countdown.minutes}</span>
                        <span className="text-sm sm:text-base font-light">Minutes</span>
                    </p>
                    <p className="flex flex-col items-center gap-2">
                        <span>{countdown.seconds}</span>
                        <span className="text-sm sm:text-base font-light">Seconds</span>
                    </p>
                </div>
            </div>
        );
    } 

    if (countdown.status === 'counting-down') {
        return (
            <div className="text-center py-8">
                <div className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">Auction Ends In</div>
                <div className="grid grid-cols-4 gap-2 text-2xl text-text-primary dark:text-text-primary-dark">
                    <p className="flex flex-col items-center gap-2 border-r-2 border-gray-200 dark:border-gray-700 px-2">
                        <span>{countdown.days}</span>
                        <span className="text-sm sm:text-base font-light">Days</span>
                    </p>
                    <p className="flex flex-col items-center gap-2 border-r-2 border-gray-200 dark:border-gray-700">
                        <span>{countdown.hours}</span>
                        <span className="text-sm sm:text-base font-light">Hours</span>
                    </p>
                    <p className="flex flex-col items-center gap-2 border-r-2 border-gray-200 dark:border-gray-700">
                        <span>{countdown.minutes}</span>
                        <span className="text-sm sm:text-base font-light">Minutes</span>
                    </p>
                    <p className="flex flex-col items-center gap-2">
                        <span>{countdown.seconds}</span>
                        <span className="text-sm sm:text-base font-light">Seconds</span>
                    </p>
                </div>
            </div>
        );
    }

    // Rest of your existing status displays for ended/draft/cancelled...
    if (countdown.status === 'ended') {
        return (
            <div className="text-center py-8">
                <div className="text-lg font-semibold text-text-secondary dark:text-text-secondary-dark">Auction Ended</div>
                {auction?.finalPrice ? (
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                        Sold for {formatCurrency(auction.finalPrice)}
                    </div>
                ) : auction?.status == 'reserve_not_met' ? (
                    <div className="text-lg text-orange-600 dark:text-orange-400 mt-2">
                        Reserve price not met
                    </div>
                ) : (
                    <div className="text-lg text-text-secondary dark:text-text-secondary-dark mt-2">
                        No winning bidder
                    </div>
                )}
            </div>
        );
    }

    if (countdown.status === 'draft') {
        return (
            <div className="text-center py-8">
                <div className="text-lg font-semibold text-text-secondary dark:text-text-secondary-dark">Auction Pending</div>
                {auction?.finalPrice ? (
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                        Sold for {formatCurrency(auction.finalPrice)}
                    </div>
                ) : auction?.status === 'reserve_not_met' ? (
                    <div className="text-lg text-orange-600 dark:text-orange-400 mt-2">
                        Reserve price not met
                    </div>
                ) : auction?.status === 'approved' ? (
                    <div className="text-lg text-orange-600 dark:text-orange-400 mt-2">
                        Coming Soon
                    </div>
                ) : (
                    <div className="text-lg text-text-secondary dark:text-text-secondary-dark mt-2">
                        Needs Admin Approval
                    </div>
                )}
            </div>
        );
    }

    if (countdown.status === 'cancelled') {
        return (
            <div className="text-center py-8">
                <div className="text-lg font-semibold text-red-600 dark:text-red-400">Auction Cancelled</div>
                {auction?.finalPrice ? (
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                        Sold for {formatCurrency(auction.finalPrice)}
                    </div>
                ) : auction?.status === 'reserve_not_met' ? (
                    <div className="text-lg text-orange-600 dark:text-orange-400 mt-2">
                        Reserve price not met
                    </div>
                ) : (
                    <div className="text-lg text-text-secondary dark:text-text-secondary-dark mt-2">
                        No winning bid
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="text-center py-8">
            <div className="text-lg text-text-secondary dark:text-text-secondary-dark">Loading auction timer...</div>
        </div>
    );
};

export default TimerDisplay;
import { Heart, Eye, Clock, Shield, Zap, File, Gauge, Settings, MapPin, Users, Gavel, ShoppingCart, HandHelping, HandGrab } from "lucide-react";
import { heroImg } from "../assets";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuctionCountdown from "../hooks/useAuctionCountDown";
import { useWatchlist } from "../hooks/useWatchlist";
import { getTimeRemaining } from "../utils/getTimeRemaining";

function AuctionListItem({ auction }) {
    const navigate = useNavigate();
    const [isLiked, setIsLiked] = useState(false);

    const auctionTime = useAuctionCountdown(auction);
    const { isWatchlisted, watchlistCount, loading, toggleWatchlist } = useWatchlist(auction._id);
    const [timeLeft, setTimeLeft] = useState(getTimeRemaining(auction?.endDate));

    // Update time left every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(getTimeRemaining(auction?.endDate));
        }, 60000);

        return () => clearInterval(timer);
    }, [auction?.endDate]);

    const handleWatchlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await toggleWatchlist();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Check if reserve is met
    const isReserveMet = auction.currentPrice >= auction.reservePrice;
    const isAuctionActive = auction.status === 'active' && auctionTime?.status === 'counting-down';

    // Calculate discount percentage if it's a bargain deal
    const getDiscountBadge = () => {
        if (auction.discountPercentage && auction.discountPercentage >= 80) {
            return {
                label: `${Math.round(auction.discountPercentage)}% OFF`,
                icon: Zap,
                color: 'bg-red-100 text-red-700 border-red-200'
            };
        }
        return null;
    };

    const discountBadge = getDiscountBadge();

    // Calculate status badges
    const getStatusBadges = () => {
        const badges = [];

        if (auction.auctionType === 'reserve' && isReserveMet) {
            badges.push({
                label: 'Reserve Met',
                icon: Shield,
                color: 'bg-green-100 text-green-700 border-green-200'
            });
        } else if (auction.auctionType === 'reserve') {
            badges.push({
                label: 'Reserve',
                icon: Shield,
                color: 'bg-orange-100 text-orange-700 border-orange-200'
            });
        }

        if (auction.auctionType === 'standard') {
            badges.push({
                label: 'No Reserve',
                icon: Shield,
                color: 'bg-green-100 text-green-700 border-green-200'
            });
        }

        if (auction.auctionType === 'buy_now') {
            badges.push({
                label: 'Buy Now',
                icon: ShoppingCart,
                color: 'bg-blue-100 text-blue-700 border-blue-200'
            });
        }

        if (auction.auctionType === 'giveaway') {
            badges.push({
                label: 'Giveaway',
                icon: HandHelping,
                color: 'bg-purple-100 text-purple-700 border-purple-200'
            });
        }

        if (auction.status === 'active') {
            badges.push({
                label: 'Live',
                icon: Clock,
                color: 'bg-green-100 text-green-700 border-green-200'
            });
        }

        if (auction.status === 'approved') {
            badges.push({
                label: 'Starting Soon',
                icon: Clock,
                color: 'bg-orange-100 text-orange-700 border-orange-200'
            });
        }

        if (auction.status === 'ended') {
            badges.push({
                label: 'Ended',
                icon: Clock,
                color: 'bg-red-100 text-red-700 border-red-200'
            });
        }

        if (auction.status === 'sold') {
            badges.push({
                label: 'Sold',
                icon: Clock,
                color: 'bg-green-100 text-green-700 border-green-200'
            });
        }

        return badges;
    };

    const statusBadges = getStatusBadges();

    // Format auction time remaining
    const formatTimeRemaining = () => {
        if (!auctionTime) return 'Loading...';

        if (auction.auctionType === 'buy_now' || auction.auctionType === 'giveaway') {
            return auction.winner ? 'Claimed' : 'Available';
        }

        if (auctionTime.status === 'ended' || auction.status === 'ended' || auction.status === 'sold') {
            return 'Ended';
        }

        if (auctionTime.status === 'approved') {
            return 'Starting Soon';
        }

        if (auctionTime.status === 'draft') {
            return 'Pending';
        }

        if (auctionTime.status === 'counting-down') {
            if (auctionTime.days > 0) {
                return `${auctionTime.days}d ${auctionTime.hours}h`;
            } else if (auctionTime.hours > 0) {
                return `${auctionTime.hours}h ${auctionTime.minutes}m`;
            } else {
                return `${auctionTime.minutes}m ${auctionTime.seconds}s`;
            }
        }

        return 'Ended';
    };

    // Calculate pending offers
    const pendingOffers = auction?.offers?.filter(o => o.status === 'pending').length || 0;

    if (!auctionTime) return null;

    // Determine button text based on auction type
    const getButtonText = () => {
        if (!isAuctionActive) return 'View Details';
        if (auction.auctionType === 'buy_now') return 'Buy Now';
        if (auction.auctionType === 'giveaway') return 'Claim Now';
        return 'Place Bid';
    };

    // Determine button icon
    const getButtonIcon = () => {
        if (auction.auctionType === 'buy_now') return <ShoppingCart size={18} className="text-white" />;
        if (auction.auctionType === 'giveaway') return <HandGrab size={18} className="text-white" />;
        return <Gavel size={18} className="text-white" />;
    };

    return (
        <div
            className="bg-white border border-gray-200 hover:bg-gray-50 transition-colors duration-150 cursor-pointer group rounded-lg shadow-sm hover:shadow-md"
            onClick={() => navigate(`/auction/${auction._id}`)}
        >
            <div className="p-5">
                {/* Main Row */}
                <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                    {/* Image Section - Larger */}
                    <div className="lg:w-48 lg:h-36 w-full h-48 lg:flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-100">
                        <img
                            src={auction.photos?.[0]?.url || heroImg}
                            alt={auction.title}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />

                        {/* Discount Badge */}
                        {discountBadge && (
                            <div className="absolute top-2 left-2">
                                <span
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${discountBadge.color}`}
                                >
                                    <discountBadge.icon size={12} />
                                    {discountBadge.label}
                                </span>
                            </div>
                        )}

                        {/* Views counter - Mobile */}
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1 lg:hidden">
                            <Eye size={12} />
                            {auction.views?.toLocaleString() || 0}
                        </div>
                    </div>

                    {/* Content Section - Enhanced */}
                    <div className="flex-1 min-w-0">
                        {/* Brand Name */}
                        {auction?.specifications?.brand && (
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                {auction.specifications.brand}
                            </div>
                        )}

                        {/* Title - Larger */}
                        <Link
                            to={`/auction/${auction._id}`}
                            className="font-semibold text-xl text-gray-900 hover:text-primary transition-colors line-clamp-2 mb-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {auction.title}
                        </Link>

                        {/* Category */}
                        <div className="mb-3">
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md inline-block">
                                {auction.categories?.[1] || auction.categories?.[0] || 'General'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <MapPin size={14} />
                            <span >{auction.location || 'Location N/A'}</span>
                        </div>

                        {/* Info Grid - More details */}
                        <div className="flex flex-wrap gap-5 mb-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users size={14} />
                                <span>{auction.bidCount || 0} bids</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Eye size={14} />
                                <span>{auction.views?.toLocaleString() || 0} views</span>
                            </div>
                            {/* {auction?.specifications?.condition && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Gauge size={14} />
                                    <span>{auction.specifications.condition}</span>
                                </div>
                            )}
                            {auction?.specifications?.material && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Settings size={14} />
                                    <span>{auction.specifications.material}</span>
                                </div>
                            )} */}
                        </div>

                        {/* Status Badges - Desktop */}
                        <div className="hidden lg:flex items-center gap-2 flex-wrap">
                            {statusBadges.slice(0, 4).map((badge, index) => {
                                const IconComponent = badge.icon;
                                return (
                                    <span
                                        key={index}
                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badge.color}`}
                                    >
                                        <IconComponent size={12} />
                                        {badge.label}
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    {/* Price & Timer Section - Enhanced */}
                    <div className="lg:w-72 flex-shrink-0">
                        {/* Price Card */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-3">
                            <div className="text-xs text-gray-500 mb-1">
                                {auction.status === 'sold' ? 'Final Price' :
                                    auction.auctionType === 'buy_now' ? 'Buy Now Price' :
                                        auction.auctionType === 'giveaway' ? 'Giveaway' : 'Current Price'}
                            </div>
                            <div className="text-2xl font-bold text-green-600">
                                {auction.auctionType === 'buy_now' && auction.buyNowPrice
                                    ? formatCurrency(auction.buyNowPrice)
                                    : formatCurrency(auction.currentPrice || auction.startPrice)}
                            </div>
                            {auction.auctionType === 'standard' && auction.startPrice && (
                                <div className="text-xs text-gray-400 mt-1">
                                    Started at {formatCurrency(auction.startPrice)}
                                </div>
                            )}
                        </div>

                        {/* Timer Card - Running timer like AuctionCard */}
                        {(auction.auctionType !== 'buy_now' && auction.auctionType !== 'giveaway') && (
                            <div className="bg-gray-50 rounded-lg p-4 mb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-gray-500">Time Remaining</span>
                                    {auctionTime?.status === 'counting-down' && (
                                        <span className="text-xs text-green-600 font-medium">Live Now</span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <Clock size={20} className="text-gray-400" />
                                    <div className="font-mono text-lg font-bold text-gray-900">
                                        {auctionTime?.status === 'counting-down' && !auctionTime.completed ? (
                                            <div className="flex gap-1">
                                                {auctionTime.days > 0 && (
                                                    <span>{auctionTime.days}d</span>
                                                )}
                                                {(auctionTime.hours > 0 || auctionTime.days > 0) && (
                                                    <span>{auctionTime.hours}h</span>
                                                )}
                                                <span>{auctionTime.minutes}m</span>
                                                <span>{auctionTime.seconds}s</span>
                                            </div>
                                        ) : (
                                            <span className="text-red-600">{formatTimeRemaining()}</span>
                                        )}
                                    </div>
                                </div>
                                {/* Alternative running timer display */}
                                {/* {auctionTime?.status === 'counting-down' && !auctionTime.completed && (
                                    <div className="mt-2 text-xs text-gray-400 text-center">
                                        Ends {new Date(auction.endDate).toLocaleString()}
                                    </div>
                                )} */}
                            </div>
                        )}

                        {/* Buy Now/Giveaway alternative */}
                        {(auction.auctionType === 'buy_now' || auction.auctionType === 'giveaway') && (
                            <div className="bg-gray-50 rounded-lg p-4 mb-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    {auction.auctionType === 'buy_now' ? <ShoppingCart size={16} /> : <HandHelping size={16} />}
                                    <span>{auction.auctionType === 'buy_now' ? 'Buy Now Offer' : 'Giveaway'}</span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {pendingOffers > 0 ? `${pendingOffers} pending ${auction.auctionType === 'buy_now' ? 'offers' : 'entries'}` : 'No offers yet'}
                                </div>
                            </div>
                        )}

                        {/* Status Badges - Mobile */}
                        <div className="flex lg:hidden items-center gap-2 flex-wrap mb-3">
                            {statusBadges.slice(0, 3).map((badge, index) => {
                                const IconComponent = badge.icon;
                                return (
                                    <span
                                        key={index}
                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badge.color}`}
                                    >
                                        <IconComponent size={12} />
                                        {badge.label}
                                    </span>
                                );
                            })}
                        </div>

                    </div>
                </div>
                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/auction/${auction._id}`);
                        }}
                        className="flex-1 py-3 px-4 bg-secondary rounded-lg text-pure-white transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                        {getButtonIcon()}
                        {getButtonText()}
                    </button>
                    {/* <button
                                onClick={handleWatchlist}
                                className={`p-3 rounded-lg transition-colors ${
                                    isWatchlisted
                                        ? 'text-red-500 bg-red-50 hover:bg-red-100'
                                        : 'text-gray-500 bg-gray-50 hover:text-red-500 hover:bg-red-50'
                                }`}
                                title={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
                            >
                                <Heart size={20} fill={isWatchlisted ? 'currentColor' : 'none'} />
                            </button> */}
                </div>
            </div>
        </div>
    );
}

export default AuctionListItem;
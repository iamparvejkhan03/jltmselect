import { Gavel, Heart, MapPin, Eye, Users, Shield, Clock, Zap, File, Gauge, Settings, ShoppingCart, HandHelping, HandGrab } from "lucide-react";
import { heroImg } from "../assets";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuctionCountdown from "../hooks/useAuctionCountDown";
import { useWatchlist } from "../hooks/useWatchlist";
import { getTimeRemaining } from "../utils/getTimeRemaining";

function AuctionCard({ auction }) {
    const navigate = useNavigate();
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [isLiked, setIsLiked] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const threshold = 5;

    const handleMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        setTilt({ x: y * -threshold, y: x * threshold });
    };

    // Calculate discount percentage if it's a bargain deal
    const getDiscountBadge = () => {
        if (auction.discountPercentage && auction.discountPercentage >= 80) {
            return {
                label: `${Math.round(auction.discountPercentage)}% OFF`,
                icon: Zap,
                color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
            };
        }
        return null;
    };

    const discountBadge = getDiscountBadge();

    const [auctionEndDate] = useState(() => new Date(auction.endDate));
    const auctionTime = useAuctionCountdown(auction);
    const { isWatchlisted, watchlistCount, loading, toggleWatchlist } = useWatchlist(auction._id);
    const [timeLeft, setTimeLeft] = useState(getTimeRemaining(auction?.endDate));

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(getTimeRemaining(auction?.endDate));
        }, 60000); // update every minute

        return () => clearInterval(timer);
    }, [auction?.endDate]);

    const handleWatchlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await toggleWatchlist();
    };

    // Check if reserve is met
    const isReserveMet = auction.currentPrice >= auction.reservePrice;
    const isAuctionActive = auction.status === 'active' && !auctionTime.completed;

    // Calculate status badges
    const getStatusBadges = () => {
        const badges = [];

        if (auction.auctionType === 'reserve' && isReserveMet) {
            badges.push({
                label: 'Reserve Met',
                icon: Shield,
                color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
            });
        } else if (auction.auctionType === 'reserve') {
            badges.push({
                label: 'Reserve',
                icon: Shield,
                color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800'
            });
        }

        if (auction.auctionType === 'standard') {
            badges.push({
                label: 'No Reserve',
                icon: Shield,
                color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
            });
        }

        if (auction.auctionType === 'buy_now') {
            badges.push({
                label: 'Buy Now',
                icon: ShoppingCart,
                color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
            });
        }

        if (auction.auctionType === 'giveaway') {
            badges.push({
                label: 'Giveaway',
                icon: HandHelping,
                color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800'
            });
        }

        return badges;
    };

    const statusBadges = getStatusBadges();

    if (!auctionTime) return (
        <div className="border border-gray-200 dark:border-gray-700 p-4 h-full bg-bg-secondary dark:bg-bg-primary rounded-xl shadow-lg animate-pulse">
            <div className="w-full h-56 bg-gray-200 dark:bg-gray-700 rounded-tr-3xl rounded-bl-3xl mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="flex gap-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
        </div>
    );

    return (
        <div
            className="h-full bg-bg-secondary dark:bg-bg-primary rounded-xl shadow-lg ease-out flex flex-col hover:shadow-xl cursor-pointer group border border-gray-200 dark:border-gray-700"
            onMouseMove={handleMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            style={{ transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
            onClick={() => navigate(`/auction/${auction._id}`)}
        >
            {/* Image Section */}
            <div
                className="relative overflow-hidden rounded-t-xl transform-gpu"
                style={{
                    borderRadius: '0.75rem 0.75rem 0 0',
                    WebkitMaskImage: 'radial-gradient(white, black)' // forces GPU layer in Safari/Chrome
                }}
            >
                <img
                    src={auction.photos?.[0]?.url || heroImg}
                    alt={auction.title}
                    className="w-full h-52 object-cover transition-transform duration-200 group-hover:scale-105 rounded-t-xl"
                />

                {/* Status Badges */}
                <div className="absolute w-full top-3 px-4 flex items-center justify-between gap-3 flex-wrap">
                    {/* <div className="flex gap-2">
                        {statusBadges.map((badge, index) => {
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
                    </div> */}

                    {/* Status Badges */}
                    <div className="flex gap-2">
                        {discountBadge && (
                            <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${discountBadge.color}`}
                            >
                                <discountBadge.icon size={12} />
                                {discountBadge.label}
                            </span>
                        )}
                        {statusBadges.map((badge, index) => {
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

                    {/* Watchlist Button */}
                    {/* <button
                        onClick={handleWatchlist}
                        className={`p-2 relative rounded-full cursor-pointer transition-all ${isWatchlisted
                            ? 'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800 shadow-md hover:bg-red-100 dark:hover:bg-red-900/50'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        title={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
                    >
                        <Heart
                            size={20}
                            fill={isWatchlisted ? 'currentColor' : 'none'}
                        />
                    </button> */}
                </div>

                {/* Countdown Timer */}
                {auction.auctionType !== 'buy_now' && auction.auctionType !== 'giveaway' && (
                    <div className="bg-bg-secondary/90 dark:bg-bg-primary/90 absolute bottom-3 left-3 right-3 py-2 px-4 rounded-lg flex items-center justify-center gap-1 text-sm text-text-primary dark:text-text-primary-dark backdrop-blur-sm">
                        {!auctionTime.completed ? (
                            <>
                                <Clock size={14} />
                                {!auctionTime.completed ? (
                                    <>
                                        <span>{auctionTime.days}D</span>
                                        <span>:</span>
                                        <span>{auctionTime.hours}H</span>
                                        <span>:</span>
                                        <span>{auctionTime.minutes}M</span>
                                        <span>:</span>
                                        <span>{auctionTime.seconds}S</span>
                                    </>
                                ) : (
                                    <span>Auction Ended!</span>
                                )}
                            </>
                        ) : (
                            <span className="font-medium text-red-600 dark:text-red-400">Auction Ended</span>
                        )}
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="my-4 flex flex-col flex-1 px-4">
                {/* Brand Name */}
                <div className="flex items-center gap-1 text-sm text-text-secondary dark:text-text-secondary-dark mb-3">
                    <span className="truncate uppercase">{auction?.specifications?.brand}</span>
                </div>

                {/* Title */}
                <Link
                    to={`/auction/${auction._id}`}
                    className="font-semibold text-lg leading-tight mb-2 line-clamp-2 text-text-primary dark:text-text-primary-dark hover:text-primary dark:hover:text-primary-dark transition-colors"
                    onClick={(e) => e.stopPropagation()}
                >
                    {auction.title}
                </Link>

                {/* Auction Info Grid */}
                <div className="grid grid-cols-2 items-center justify-between gap-3">
                    {/* Current Bid */}
                    {auction.auctionType !== 'buy_now' && (
                        <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <div className="text-xs text-text-secondary dark:text-text-secondary-dark mb-1">
                                {auction.status === 'sold' ? 'Final Price' : 'Starting Price'}
                            </div>
                            <div className="font-bold text-lg text-green-600 dark:text-green-400">
                                {formatCurrency(auction.finalPrice || auction.currentPrice)}
                            </div>
                        </div>
                    )}

                    {auction.auctionType === 'buy_now' && (
                        <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <div className="text-xs text-text-secondary dark:text-text-secondary-dark mb-1">Buy Now</div>
                            <div className="font-bold text-lg text-green-600 dark:text-green-400 flex items-center justify-start gap-1">
                                {formatCurrency(auction?.buyNowPrice)}
                            </div>
                        </div>
                    )}

                    <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg justify-self-end">
                        <div className="text-xs text-text-secondary dark:text-text-secondary-dark mb-1 justify-self-end">Ends In</div>
                        <div className="text-base flex items-center justify-start gap-1 text-text-primary dark:text-text-primary-dark">
                            <Clock size={18} />
                            {timeLeft}
                        </div>
                    </div>
                </div>
            </div>

            {/* Button Section */}
            <div className="flex gap-2 items-center justify-between mt-auto p-4 border-t-2 border-gray-200 dark:border-gray-700">
                {/* Bid Count */}
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-sm font-light text-text-secondary dark:text-text-secondary-dark">
                        {auction.bidCount || 0} Bids
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/auction/${auction._id}`);
                    }}
                    className="py-3 px-6 cursor-pointer text-pure-white dark:text-pure-black rounded-lg flex justify-center items-center bg-bg-primary hover:bg-bg-primary-light dark:bg-bg-secondary dark:hover:bg-bg-secondary-dark transition-colors shadow-md hover:shadow-lg"
                >
                    <span className="font-medium text-pure-white dark:text-pure-black text-sm">
                        {!isAuctionActive ? 'View Auction' : auction?.auctionType === 'buy_now' ? 'Buy Now' : auction?.auctionType === 'giveaway' ? 'Claim Now' : 'Place Bid'}
                    </span>
                </button>
            </div>
        </div>
    );
}

export default AuctionCard;
import { CalendarDays, CheckSquare, Clock, Download, File, Fuel, Gauge, Gavel, Heart, Loader, MapPin, MessageCircle, PaintBucket, Plane, ShieldCheck, Tag, User, Users, Weight, Zap, Banknote, MessageSquare } from "lucide-react";
import { BidConfirmationModal, BundleManifest, BuyNowModal, Container, LoadingSpinner, MobileBidStickyBar, SpecificationsSection, TabSection, TimerDisplay, WatchlistButton } from "../components";
import { Link, useNavigate, useParams } from "react-router-dom";
import { lazy, Suspense, useRef, useState, useEffect } from "react";
import useAuctionCountdown from "../hooks/useAuctionCountDown";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { useComments } from "../hooks/useComments";
import { useWatchlist } from "../hooks/useWatchlist";
import { useAuth } from "../contexts/AuthContext";
import useAuctionDeposit from "../hooks/useDeposit";
import { useSubscriptionGuard } from "../hooks/useSubscriptionGuard";
import SubscriptionModal from "../components/SubscriptionModal";

const YouTubeEmbed = lazy(() => import('../components/YouTubeEmbed'));
const ImageLightBox = lazy(() => import('../components/ImageLightBox'));
const MakeOfferModal = lazy(() => import('../components/MakeOfferModal'));

function SingleAuction() {
    const { id } = useParams();
    const [auction, setAuction] = useState(null);
    const [isSoldAuction, setIsSoldAuction] = useState(false);
    const [loading, setLoading] = useState(true);
    const [bidding, setBidding] = useState(false);
    const [buying, setBuying] = useState(false);
    const [makingOffer, setMakingOffer] = useState(false);
    const [bidAmount, setBidAmount] = useState('');
    const [offerAmount, setOfferAmount] = useState('');
    const [offerMessage, setOfferMessage] = useState('');
    const [isMakeOfferModalOpen, setIsMakeOfferModalOpen] = useState(false);
    const bidSectionRef = useRef(null);
    const commentSectionRef = useRef(null);
    const offerSectionRef = useRef(null);
    const auctionTime = useAuctionCountdown(auction);
    const countdown = useAuctionCountdown(auction);
    const [activeTab, setActiveTab] = useState('description');
    const { pagination } = useComments(id);
    const { isWatchlisted, toggleWatchlist, watchlistCount } = useWatchlist(id);
    const hasFetchedRef = useRef(false);
    const [isBidModalOpen, setIsBidModalOpen] = useState(false);
    const formRef = useRef();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showBuyNowModal, setShowBuyNowModal] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [categoryFields, setCategoryFields] = useState([]);
    const [loadingFields, setLoadingFields] = useState(false);
    const { checkAndProcessDeposit, processingDeposit } = useAuctionDeposit();

    const {
        hasActiveSubscription,
        checking: checkingSubscription,
        showSubscriptionModal,
        setShowSubscriptionModal,
        guardAction,
        checkSubscription
    } = useSubscriptionGuard();

    const [hasCheckedAccess, setHasCheckedAccess] = useState(false);

    const updateAuctionState = (updatedAuction) => {
        setAuction(updatedAuction);
    };

    const handleOpenBidModal = () => {
        setIsBidModalOpen(true);
    };

    const handleConfirmBid = async (e) => {
        e?.preventDefault?.();

        try {
            setBidding(true);
            setIsBidModalOpen(false);

            // Check and process deposit if needed - PASS 'bid' as action type
            const depositResult = await checkAndProcessDeposit(
                id,
                bidAmount,
                'bid'  // <-- Add this parameter
            );

            if (!depositResult.success) {
                setBidding(false);
                return; // Stop if deposit failed
            }

            // Place the bid (deposit handled)
            const { data } = await axiosInstance.post(`/api/v1/auctions/bid/${id}`, {
                amount: parseFloat(bidAmount)
            });

            if (data.success) {
                setAuction(data.data.auction);
                setBidAmount('');
                toast.success('Bid placed successfully!');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to place bid');
            console.error('Bid error:', error);
        } finally {
            setBidding(false);
        }
    };

    const handleCloseBidModal = () => {
        setIsBidModalOpen(false);
    };

    const handleOpenMakeOfferModal = () => {
        setIsMakeOfferModalOpen(true);
    };

    const handleCloseMakeOfferModal = () => {
        setIsMakeOfferModalOpen(false);
        setOfferAmount('');
        setOfferMessage('');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    useEffect(() => {
        if (!checkingSubscription && !hasCheckedAccess && auction && !isSoldAuction) {
            if (!hasActiveSubscription) {
                guardAction();
            }
            setHasCheckedAccess(true);
        }
    }, [checkingSubscription, hasActiveSubscription, guardAction, hasCheckedAccess, auction, isSoldAuction]);

    useEffect(() => {
        const fetchAuction = async () => {
            try {
                setLoading(true);
                const { data } = await axiosInstance.get(`/api/v1/auctions/${id}`);
                if (data.success) {
                    setAuction(data.data.auction);
                    if (data.data.auction.status === 'sold') {
                        setIsSoldAuction(true);
                    }
                }
            } catch (error) {
                toast.error(error?.response?.data?.message || 'Failed to fetch auction');
                console.error('Fetch auction error:', error);
                setCategoryFields([]);
            } finally {
                setLoading(false);
            }
        };

        if (countdown?.status === 'ended') {
            const timer = setTimeout(() => {
                fetchAuction();
            }, 2000);
            return () => clearTimeout(timer);
        } else if (!hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchAuction();
        }
    }, [id, countdown?.status]);

    // Fetch fields when subcategory is selected
    useEffect(() => {
        if (auction) {
            fetchCategoryFields(auction?.categories[1]);
        } else {
            setCategoryFields([]);
        }
    }, [auction]);

    // Fetch category fields by slug
    const fetchCategoryFields = async (slug) => {
        try {
            setLoadingFields(true);
            const { data } = await axiosInstance.get(`/api/v1/categories/public/by-slug/${slug}/fields`);
            if (data.success) {
                setCategoryFields(data.data.fields || []);
            }
        } catch (error) {
            console.error('Error fetching category fields:', error);
            toast.error('Failed to load category fields');
            setCategoryFields([]);
        } finally {
            setLoadingFields(false);
        }
    };

    const scrollToBidSection = () => {
        bidSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    const scrollToCommentSection = () => {
        commentSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    const scrollToOfferSection = () => {
        offerSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        if (tabId === 'comments' || tabId === 'bids' || tabId === 'offers') {
            scrollToCommentSection();
        }
    };

    // ============= BID HANDLER =============
    const handleBid = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error('You must login to bid.');
            navigate('/login');
            return;
        }

        if (user._id?.toString() === auction?.seller?._id?.toString()) {
            toast.error(`You can't bid on your own auction.`);
            return;
        }

        if (!bidAmount || (parseFloat(bidAmount) <= auction.currentPrice && auction.bidCount > 0)) {
            toast.error(`Bid must be higher than current price: ${formatCurrency(auction.currentPrice)}`);
            return;
        }

        try {
            setBidding(true);

            // Place the bid after payment is handled
            const { data } = await axiosInstance.post(`/api/v1/auctions/bid/${id}`, {
                amount: parseFloat(bidAmount)
            });

            if (data.success) {
                setAuction(data.data.auction);
                setBidAmount('');
                toast.success('Bid placed successfully!');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to place bid');
            console.error('Bid error:', error);
        } finally {
            setBidding(false);
        }
    };

    // ============= BUY NOW HANDLER =============
    const handleBuyNow = async () => {
        if (!user) {
            toast.error('You must login to buy now.');
            navigate('/login');
            return;
        }

        if (user._id?.toString() === auction?.seller?._id?.toString()) {
            toast.error(`You can't buy your own auction.`);
            return;
        }

        if (!auction.buyNowPrice) {
            toast.error('Buy Now is not available for this auction.');
            return;
        }

        if (countdown.status !== 'always-available') {
            toast.error('Auction is not active.');
            return;
        }

        // setBuying(true);

        setShowBuyNowModal(true)
    };

    const handleClaimNow = async () => {
        if (!user) {
            toast.error('You must login to claim this item.');
            navigate('/login');
            return;
        }

        if (user._id?.toString() === auction?.seller?._id?.toString()) {
            toast.error(`You can't claim your own giveaway.`);
            return;
        }

        if (auction.winner) {
            toast.error('This item has already been claimed.');
            return;
        }

        try {
            setClaiming(true);

            const { data } = await axiosInstance.post(`/api/v1/buy-now/${id}`);

            if (data.success) {
                setAuction(data.data.auction);
                toast.success('🎉 Congratulations! You have claimed this item for free!');
                setShowBuyNowModal(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to claim item');
            console.error('Claim error:', error);
        } finally {
            setClaiming(false);
        }
    };

    // ============= MAKE OFFER HANDLER =============
    const handleMakeOffer = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error('You must login to make an offer.');
            navigate('/login');
            return;
        }

        if (user._id?.toString() === auction?.seller?._id?.toString()) {
            toast.error(`You can't make an offer on your own auction.`);
            return;
        }

        if (!auction.allowOffers) {
            toast.error('Offers are not allowed for this auction.');
            return;
        }

        if (!offerAmount || parseFloat(offerAmount) <= 0) {
            toast.error('Please enter a valid offer amount.');
            return;
        }

        if (parseFloat(offerAmount) < auction.startPrice) {
            toast.error(`Offer must be at least ${formatCurrency(auction.startPrice)}`);
            return;
        }

        if (auction.buyNowPrice && parseFloat(offerAmount) >= auction.buyNowPrice) {
            toast.error(`Offer is higher than Buy Now price. Consider using Buy Now instead.`);
            return;
        }

        try {
            setMakingOffer(true);

            const { data } = await axiosInstance.post(`/api/v1/offers/auction/${id}`, {
                amount: parseFloat(offerAmount),
                message: offerMessage
            });

            if (data.success) {
                // Update auction state
                setAuction(data.data.auction);

                handleCloseMakeOfferModal();
                toast.success('Your offer has been submitted successfully!');

                // Switch to offers tab
                setActiveTab('offers');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to submit offer');
        } finally {
            setMakingOffer(false);
        }
    };

    // Handle document download
    const handleDocumentDownload = (documentUrl, filename) => {
        const link = document.createElement('a');
        link.href = documentUrl;
        link.download = filename;
        link.target = '_blank';
        link.click();
    };

    // Extract YouTube ID from URL
    const getYouTubeId = (url) => {
        if (!url) return null;
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const youtubeVideoId = getYouTubeId(auction?.videoLink);
    const minBidAmount = auction?.bidCount > 0 ? auction?.currentPrice + auction?.bidIncrement : auction?.currentPrice;

    // Check if Buy Now is available - remove timer check for buy_now
    const isBuyNowAvailable = auction?.buyNowPrice &&
        auction?.auctionType === 'buy_now' &&
        !auction?.winner &&
        auction?.status === 'active'; // Only check status, not timer

    // Check if Make Offer is available - updated for all auction types
    const isMakeOfferAvailable = auction?.allowOffers &&
        !auction?.winner &&
        auction?.status === 'active' && // Check status instead of countdown
        (auction.auctionType === 'standard' ||
            auction.auctionType === 'reserve' ||
            auction.auctionType === 'buy_now'); // Include buy_now

    // Calculate discount percentage if it's a bargain deal
    const getDiscountBadge = () => {
        if (isSoldAuction && auction?.finalPrice && auction?.retailPrice) {
            const discountPercentage = ((auction.retailPrice - auction.finalPrice) / auction.retailPrice) * 100;
            return {
                label: `${Math.round(discountPercentage)}% OFF`,
                icon: Zap,
                color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
            };
        }
        return null;
    };

    const discountBadge = getDiscountBadge();

    if (loading) {
        return (
            <Container className="py-32 min-h-[70vh] flex items-center justify-center">
                <LoadingSpinner size="large" />
            </Container>
        );
    }

    if (checkingSubscription) {
        return (
            <Container className="py-32 min-h-[70vh] flex items-center justify-center">
                <LoadingSpinner size="large" />
            </Container>
        );
    }

    if (!hasActiveSubscription && !checkingSubscription && hasCheckedAccess) {
        return (
            <>
                <Container className="py-32 min-h-[70vh] flex flex-col items-center justify-center">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-4">
                        <Gavel size={48} className="text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-semibold text-text-primary dark:text-text-primary-dark mb-2">
                        Subscription Required
                    </h2>
                    <p className="text-text-secondary dark:text-text-secondary-dark mb-6 text-center max-w-md">
                        You need an active subscription to view and bid on this auction.
                    </p>
                    <button
                        onClick={() => setShowSubscriptionModal(true)}
                        className="bg-primary text-white hover:bg-primary/90 px-6 py-2 rounded-lg transition-colors"
                    >
                        View Plans
                    </button>
                    <Link to="/auctions" className="mt-4 text-primary hover:underline">
                        ← Back to Auctions
                    </Link>
                </Container>
                <SubscriptionModal
                    isOpen={showSubscriptionModal}
                    onClose={() => {
                        setShowSubscriptionModal(false);
                        navigate("/auctions");
                    }}
                    onSuccess={() => {
                        checkSubscription();
                        setHasCheckedAccess(false);
                    }}
                />
            </>
        );
    }

    if (!auction) {
        return (
            <Container className="py-32 min-h-[70vh] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-text-primary dark:text-text-primary-dark">Auction not found</h2>
                    <Link to="/auctions" className="text-orange-500 hover:underline mt-4 inline-block">
                        Back to Auctions
                    </Link>
                </div>
            </Container>
        );
    }

    return (
        <Container className={`pt-32 pb-16 min-h-[70vh] grid grid-cols-1 lg:grid-cols-3 items-start gap-10 bg-bg-secondary dark:bg-bg-primary`}>
            <section className="col-span-1 lg:col-span-2">
                {/* Title and top section */}
                <div className="flex flex-wrap gap-2 capitalize justify-between items-center text-text-secondary dark:text-text-secondary-dark">
                    <div className="flex text-text-primary dark:text-text-primary-dark flex-wrap gap-2">
                        Category: {auction.categories?.map((category, index) => (
                            <Link
                                key={index}
                                to={`/auctions?category=${category}`}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-bg-primary dark:bg-bg-secondary text-text-primary-dark dark:text-text-primary hover:bg-opacity-80 transition-colors"
                            >
                                {category}
                            </Link>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        {/* <button
                            onClick={toggleWatchlist}
                            className={`flex items-center gap-2 text-text-primary dark:text-text-primary-dark py-1 px-3 border border-gray-300 dark:border-bg-primary-light rounded-full transition-colors ${isWatchlisted
                                ? 'bg-bg-primary dark:bg-bg-secondary text-text-primary-dark dark:text-text-primary'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                } disabled:opacity-50`}
                        >
                            <Heart size={18} fill={isWatchlisted ? 'currentColor' : 'none'} />
                            <span>{watchlistCount || auction?.watchlistCount || 0}</span>
                        </button> */}

                        {/* <button
                            onClick={() => handleTabClick('comments')}
                            className="flex items-center gap-2 border border-gray-300 dark:border-bg-primary-light text-text-primary dark:text-text-primary-dark py-1 px-3 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <MessageSquare size={18} />
                            <span>{pagination?.totalComments || 0}</span>
                        </button> */}

                        {
                            (auction.auctionType === 'standard' || auction.auctionType === 'reserve') && (
                                <button
                                    onClick={() => handleTabClick('bids')}
                                    className="flex items-center text-text-primary dark:text-text-primary-dark gap-2 border border-gray-300 dark:border-bg-primary-light py-1 px-3 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <Gavel size={20} />
                                    <span>{auction.bids?.length || 0}</span>
                                </button>
                            )
                        }

                        {/* Offers Count */}
                        {auction?.allowOffers && (
                            <button
                                onClick={() => handleTabClick('offers')}
                                className="flex items-center gap-2 text-text-primary dark:text-text-primary-dark border border-gray-300 dark:border-bg-primary-light py-1 px-3 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <Banknote size={18} />
                                <span>{auction.offers?.length}</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="my-5">
                    <MobileBidStickyBar
                        currentBid={auction.currentPrice}
                        timeRemaining={countdown}
                        onBidClick={() => scrollToBidSection()}
                        buyNowPrice={auction.buyNowPrice}
                        onBuyNowClick={isBuyNowAvailable ? handleBuyNow : null}
                        onMakeOfferClick={isMakeOfferAvailable ? handleOpenMakeOfferModal : null}
                        allowOffers={auction.allowOffers}
                        auctionType={auction.auctionType}
                        status={countdown.status}
                        auction={auction}
                    />
                </div>

                <h2 className="text-2xl md:text-3xl font-semibold my-6 text-text-primary dark:text-text-primary-dark">{auction.title}</h2>

                {/* Image section */}
                <ImageLightBox images={auction.photos} auctionType={auction?.auctionType} isReserveMet={auction.currentPrice >= auction.reservePrice} discountBadge={discountBadge} />

                <hr className="my-8 border-gray-200 dark:border-bg-primary-light" />

                {/* Info section */}
                <div>
                    <h3 className="my-5 text-text-primary dark:text-text-primary-dark text-xl font-semibold">Auction Overview</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-10 text-text-primary dark:text-text-primary-dark">
                        <div className="flex items-center gap-3">
                            <Tag className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 text-text-secondary dark:text-text-secondary-dark" strokeWidth={1} />
                            <div>
                                <p className="text-text-secondary dark:text-text-secondary-dark text-sm">Category</p>
                                <p className="text-base capitalize">{auction?.categories[1]}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <MapPin className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 text-text-secondary dark:text-text-secondary-dark" strokeWidth={1} />
                            <div>
                                <p className="text-text-secondary dark:text-text-secondary-dark text-sm">Location</p>
                                <p className="text-base">{auction.location || 'Not specified'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <CalendarDays className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 text-text-secondary dark:text-text-secondary-dark" strokeWidth={1} />
                            <div>
                                <p className="text-text-secondary dark:text-text-secondary-dark text-sm">Start Date</p>
                                <p className="text-base">
                                    {new Date(auction.startDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Clock className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 text-text-secondary dark:text-text-secondary-dark" strokeWidth={1} />
                            <div>
                                <p className="text-text-secondary dark:text-text-secondary-dark text-sm">End Date</p>
                                <p className="text-base">
                                    {new Date(auction.endDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <User className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 text-text-secondary dark:text-text-secondary-dark" strokeWidth={1} />
                            <div>
                                <p className="text-text-secondary dark:text-text-secondary-dark text-sm">Seller</p>
                                <p className="text-base break-all">{auction.sellerUsername}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Gavel className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 text-text-secondary dark:text-text-secondary-dark" strokeWidth={1} />
                            <div>
                                <p className="text-text-secondary dark:text-text-secondary-dark text-sm">Auction Type</p>
                                <p className="text-base capitalize">
                                    {auction.auctionType === 'reserve' ? 'Reserve Price' : 'Standard'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <hr className="my-8 border-gray-200 dark:border-bg-primary-light" />
                    {/* Dynamic Specifications Section */}
                    <SpecificationsSection auction={auction} />
                </div>

                {/* Features Section */}
                {auction.features && (
                    <>
                        <div>
                            <hr className="my-8 border-gray-200 dark:border-bg-primary-light" />
                            <h3 className="my-5 text-text-primary dark:text-text-primary-dark text-xl font-semibold">Features & Options</h3>
                            <div className="prose prose-lg max-w-none border border-gray-200 dark:border-bg-primary-light rounded-lg px-6 py-3 bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark">
                                {auction.features ? (
                                    <div dangerouslySetInnerHTML={{ __html: auction.features }} />
                                ) : (
                                    <p className="text-text-secondary dark:text-text-secondary-dark">No Features provided.</p>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Document section */}
                {auction.documents && auction.documents.length > 0 && (
                    <div>
                        <hr className="my-8 border-gray-200 dark:border-bg-primary-light" />
                        <h3 className="my-5 text-text-primary dark:text-text-primary-dark text-xl font-semibold">Document(s)</h3>
                        <div className="flex gap-5 max-w-full flex-wrap">
                            {auction.documents.map((doc, index) => (
                                <div key={index} className="flex flex-col items-center">
                                    <button
                                        onClick={() => handleDocumentDownload(doc.url, doc.originalName || doc.filename)}
                                        className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer border border-gray-200 dark:border-bg-primary-light py-3 px-5 rounded-md text-text-primary dark:text-text-primary-dark group"
                                    >
                                        <File size={20} className="flex-shrink-0" />
                                        <span className="group-hover:underline max-w-[125px] truncate">
                                            {doc.originalName || doc.filename}
                                        </span>
                                        <Download size={20} className="flex-shrink-0" />
                                    </button>
                                    {/* Add caption display for documents */}
                                    {doc.caption && (
                                        <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1 max-w-[150px] text-center truncate" title={doc.caption}>
                                            {doc.caption}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Video section */}
                {youtubeVideoId && (
                    <>
                        <div className="my-8" />
                        <div>
                            <h3 className="my-5 text-text-primary dark:text-text-primary-dark text-xl font-semibold">Video Look</h3>
                            <Suspense fallback={<LoadingSpinner />}>
                                <YouTubeEmbed videoId={youtubeVideoId} title={auction.title} />
                            </Suspense>
                        </div>
                    </>
                )}

                <hr className="my-8 border-gray-200 dark:border-bg-primary-light" />

                <Suspense fallback={<LoadingSpinner />}>
                    <TabSection
                        ref={commentSectionRef}
                        description={auction.description}
                        bids={auction.bids}
                        offers={auction.offers}
                        auction={auction}
                        activatedTab={activeTab}
                        onAuctionUpdate={updateAuctionState}
                    />
                </Suspense>

            </section>

            {/* Bid Section */}
            <section ref={bidSectionRef} className="col-span-1 lg:col-span-1 bg-gradient-to-b from-bg-primary/[0.03] to-transparent dark:from-white/[0.03] dark:to-transparent rounded-lg sticky top-24 border border-gray-200 dark:border-bg-primary-light">
                {/* Timer section */}
                <TimerDisplay countdown={countdown} auction={auction} />

                <hr className="mx-6 border-gray-200 dark:border-bg-primary-light" />

                {/* Current bid section */}
                <div className="p-4 flex flex-col gap-3">
                    {
                        (auction.auctionType === 'standard' || auction.auctionType === 'reserve') && (
                            <>
                                <div className="flex flex-col gap-2">
                                    <p className="font-light text-text-secondary dark:text-text-secondary-dark">{auction.bidCount > 0 ? 'Current Bid' : 'Start Bidding At'}</p>
                                    <p className="flex items-center gap-1 text-3xl sm:text-4xl font-medium text-text-primary dark:text-text-primary-dark">
                                        <span> {formatCurrency(auction.currentPrice)}</span>
                                    </p>
                                </div>

                                <p className="flex w-full justify-between border-b border-gray-200 dark:border-bg-primary-light pb-2">
                                    <span className="text-text-secondary dark:text-text-secondary-dark">Starting Bid</span>
                                    <span className="font-medium text-text-primary dark:text-text-primary-dark">{formatCurrency(auction.startPrice)}</span>
                                </p>

                                <p className="flex w-full justify-between border-b border-gray-200 dark:border-bg-primary-light pb-2">
                                    <span className="text-text-secondary dark:text-text-secondary-dark">No. of Bids</span>
                                    <span className="font-medium text-text-primary dark:text-text-primary-dark">{auction?.bidCount}</span>
                                </p>
                            </>
                        )
                    }

                    {
                        auction.allowOffers && (auction.auctionType === 'buy_now' || auction.auctionType === 'giveaway') && (
                            <>
                                <div className="flex flex-col gap-2">
                                    {auction.status === 'sold' || auction.winner ? (
                                        <>
                                            <p className="font-light text-text-secondary dark:text-text-secondary-dark">Sold For</p>
                                            <p className="flex items-center gap-1 text-3xl sm:text-4xl font-medium text-text-primary dark:text-text-primary-dark">
                                                <span>{formatCurrency(auction.finalPrice || auction.currentPrice)}</span>
                                            </p>
                                        </>
                                    ) : (
                                        auction.startPrice > 0 ? (
                                            <>
                                                <p className="font-light text-text-secondary dark:text-text-secondary-dark">Offer Starting At</p>
                                                <p className="flex items-center gap-1 text-3xl sm:text-4xl font-medium text-text-primary dark:text-text-primary-dark">
                                                    <span>{formatCurrency(auction.startPrice)}</span>
                                                </p>
                                            </>
                                        ) : (
                                            ''
                                        )
                                    )}
                                </div>
                            </>
                        )
                    }

                    {
                        auction.allowOffers && (
                            <p className="flex w-full justify-between border-b border-gray-200 dark:border-bg-primary-light pb-2">
                                <span className="text-text-secondary dark:text-text-secondary-dark">No. of Offers</span>
                                <span className="font-medium text-text-primary dark:text-text-primary-dark">{auction?.offers?.length}</span>
                            </p>
                        )
                    }

                    {
                        (auction.auctionType === 'reserve' || auction.auctionType === 'standard') && (
                            <p className="flex w-full justify-between border-b border-gray-200 dark:border-bg-primary-light pb-2">
                                <span className="text-text-secondary dark:text-text-secondary-dark">Min. Bid Increment</span>
                                <span className="font-medium text-text-primary dark:text-text-primary-dark">{formatCurrency(auction?.bidIncrement)}</span>
                            </p>
                        )
                    }

                    {auction.auctionType === 'reserve' && (
                        <p className={`${auction.currentPrice >= auction.reservePrice ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                            {auction.currentPrice >= auction.reservePrice ? 'Reserve Met' : 'Reserve Not Met'}
                        </p>
                    )}

                    {/* Buy Now Price Display */}
                    {(auction.auctionType === 'buy_now' && auction.buyNowPrice) && (
                        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-2">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-green-700 dark:text-green-400 text-sm">Buy Now Price</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(auction.buyNowPrice)}</p>
                                </div>
                                <Zap className="text-green-500 dark:text-green-400" size={24} />
                            </div>
                        </div>
                    )}

                    {/* Giveaway Display */}
                    {auction.auctionType === 'giveaway' && (
                        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-2">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-text-secondary dark:text-text-secondary-dark text-sm">Free Giveaway</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">FREE</p>
                                    {auction.winner && (
                                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                            Claimed by: {auction.winner.username}
                                        </p>
                                    )}
                                </div>
                                <span className="text-4xl">🎁</span>
                            </div>
                        </div>
                    )}

                    {/* Conditional Action Buttons based on auction status */}

                    {/* GIVEAWAY HANDLING - This should be first */}
                    {auction.auctionType === 'giveaway' && !auction.winner && countdown?.status === 'always-available' && (
                        <>
                            <button
                                onClick={() => setShowBuyNowModal(true)}
                                disabled={claiming}
                                className="flex items-center justify-center gap-2 w-full bg-purple-600 text-white py-3 px-6 cursor-pointer rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors text-lg font-semibold"
                            >
                                {claiming ? (
                                    <Loader size={20} className="animate-spin-slow" />
                                ) : (
                                    <>
                                        <span>🎁</span>
                                        <span>Claim for Free</span>
                                    </>
                                )}
                            </button>

                            <BuyNowModal
                                isOpen={showBuyNowModal}
                                onClose={() => setShowBuyNowModal(false)}
                                onConfirm={handleClaimNow}
                                auction={auction}
                                loading={claiming}
                                isGiveaway={true}
                            />
                        </>
                    )}

                    {/* Show claimed status for won giveaways */}
                    {auction.auctionType === 'giveaway' && auction.winner && (
                        <div className="text-center py-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                            <p className="font-medium text-purple-700 dark:text-purple-400">🎁 Item Claimed</p>
                            <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                                Claimed by: {auction.winner.username}
                            </p>
                        </div>
                    )}

                    {/* REGULAR AUCTION HANDLING - For non-giveaway auctions */}
                    {auction.auctionType !== 'giveaway' && (
                        <>
                            {/* ACTIVE STATES - Show for both counting-down and always-available */}
                            {(countdown.status === 'counting-down' || countdown.status === 'always-available') && (
                                <>
                                    {/* Bid Form for standard/reserve - only show for timed auctions */}
                                    {(auction.auctionType === 'standard' || auction.auctionType === 'reserve') && (
                                        <form ref={formRef} onSubmit={handleBid} className="flex flex-col gap-4">
                                            <input
                                                type="number"
                                                value={bidAmount}
                                                onChange={(e) => setBidAmount(e.target.value)}
                                                className="py-3 px-5 w-full rounded-lg focus:outline-2 focus:outline-gray-400 dark:focus:outline-gray-500 border border-gray-200 dark:border-bg-primary-light bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark"
                                                placeholder={`Bid ${auction.bidCount > 0 ? formatCurrency(minBidAmount) : formatCurrency(auction.startPrice)} or higher`}
                                                min={minBidAmount}
                                            />
                                            <button
                                                type="button"
                                                disabled={bidding}
                                                onClick={() => handleOpenBidModal(bidAmount)}
                                                className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-3 px-6 cursor-pointer rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
                                            >
                                                {bidding ? (
                                                    <Loader size={16} className="animate-spin-slow" />
                                                ) : (
                                                    <>
                                                        <Gavel />
                                                        <span>Place Bid</span>
                                                    </>
                                                )}
                                            </button>

                                            <BidConfirmationModal
                                                isOpen={isBidModalOpen}
                                                onClose={handleCloseBidModal}
                                                onConfirm={handleConfirmBid}
                                                bidAmount={bidAmount}
                                                auction={auction}
                                                ref={formRef}
                                            />
                                        </form>
                                    )}

                                    {/* Buy Now Button - Show for buy_now auctions */}
                                    {auction.auctionType === 'buy_now' && isBuyNowAvailable && (
                                        <>
                                            <button
                                                onClick={() => setShowBuyNowModal(true)}
                                                disabled={buying || !isBuyNowAvailable}
                                                className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-3 px-6 cursor-pointer rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
                                            >
                                                {buying ? (
                                                    <Loader size={16} className="animate-spin-slow" />
                                                ) : (
                                                    <>
                                                        <Zap />
                                                        <span>Buy Now {formatCurrency(auction.buyNowPrice)}</span>
                                                    </>
                                                )}
                                            </button>

                                            <BuyNowModal
                                                isOpen={showBuyNowModal}
                                                onClose={() => {
                                                    setShowBuyNowModal(false);
                                                    // Refresh auction data after modal closes
                                                    if (auction.winner) {
                                                        window.location.reload();
                                                    }
                                                }}
                                                onConfirm={handleBuyNow}
                                                auction={auction}
                                                loading={buying}
                                                isGiveaway={false}
                                            />
                                        </>
                                    )}

                                    {/* Make Offer Button - Show for any auction type that allows offers and is active */}
                                    {isMakeOfferAvailable && (
                                        <button
                                            onClick={handleOpenMakeOfferModal}
                                            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-white hover:from-orange-500 hover:via-orange-600 hover:to-orange-700 py-3 px-6 cursor-pointer rounded-lg transition-colors"
                                        >
                                            <Banknote />
                                            <span>Make an Offer</span>
                                        </button>
                                    )}

                                    {/* Make Offer Modal */}
                                    <Suspense fallback={null}>
                                        <MakeOfferModal
                                            isOpen={isMakeOfferModalOpen}
                                            onClose={handleCloseMakeOfferModal}
                                            onSubmit={handleMakeOffer}
                                            offerAmount={offerAmount}
                                            setOfferAmount={setOfferAmount}
                                            offerMessage={offerMessage}
                                            setOfferMessage={setOfferMessage}
                                            loading={makingOffer}
                                            auction={auction}
                                        />
                                    </Suspense>
                                </>
                            )}

                            {/* Non-active states for regular auctions */}
                            {countdown.status === 'approved' && (
                                <div className="text-center py-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <p className="font-medium text-blue-700 dark:text-blue-400">Auction Not Started</p>
                                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Bidding will begin when the auction starts</p>
                                </div>
                            )}

                            {countdown.status === 'ended' && (
                                <div className="text-center py-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                    <p className="font-medium text-yellow-700 dark:text-yellow-400">Auction Ended</p>
                                    {auction.winner ? (
                                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">Winner: {auction.winner.username}</p>
                                    ) : auction.status === 'sold' ? (
                                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">Item Sold</p>
                                    ) : auction.status === 'reserve_not_met' ? (
                                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">Reserve Not Met</p>
                                    ) : auction.status === 'sold_buy_now' ? (
                                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">Sold via Buy Now</p>
                                    ) : (
                                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">No winning bidder</p>
                                    )}
                                </div>
                            )}

                            {countdown.status === 'cancelled' && (
                                <div className="text-center py-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                    <p className="font-medium text-yellow-700 dark:text-yellow-400">Auction Cancelled</p>
                                    {auction.winner ? (
                                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">Winner: {auction.winner.username}</p>
                                    ) : auction.status === 'sold' ? (
                                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">Item Sold</p>
                                    ) : (
                                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">No winning bidder</p>
                                    )}
                                </div>
                            )}

                            {countdown.status === 'draft' && (
                                <div className="text-center py-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                    <p className="font-medium text-yellow-700 dark:text-yellow-400">Auction Pending</p>
                                    {auction.winner ? (
                                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">Winner: {auction.winner.username}</p>
                                    ) : auction.status === 'sold' ? (
                                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">Item Sold</p>
                                    ) : (
                                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">Needs Admin Approval</p>
                                    )}
                                </div>
                            )}

                            {countdown.status === 'loading' && (
                                <div className="text-center py-4 bg-bg-secondary dark:bg-bg-primary rounded-lg">
                                    <p className="font-medium text-text-secondary dark:text-text-secondary-dark">Loading auction status...</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* Watchlist Count */}
                    {auction.watchlistCount > 0 && (
                        <p className="text-center bg-bg-secondary dark:bg-bg-primary p-3 text-text-primary dark:text-text-primary-dark text-sm flex items-center justify-center gap-2 border border-gray-200 dark:border-bg-primary-light rounded-lg">
                            <Users className="w-4 h-4" />
                            <span>{auction.watchlistCount} user{auction.watchlistCount !== 1 ? 's' : ''} watching</span>
                        </p>
                    )}

                    <p className="text-center bg-bg-secondary dark:bg-bg-primary p-3 text-text-primary dark:text-text-primary-dark text-sm flex items-center justify-center gap-2 border border-gray-200 dark:border-bg-primary-light rounded-lg">
                        <ShieldCheck className="w-4 h-4" />
                        <span>{auction.views} views</span>
                    </p>

                    {/* Pending Offers Count */}
                    {auction.offers && auction.offers.filter(o => o.status === 'pending').length > 0 && (
                        <p className="text-center bg-bg-secondary dark:bg-bg-primary p-3 text-text-primary dark:text-text-primary-dark text-sm flex items-center justify-center gap-2 border border-gray-200 dark:border-bg-primary-light rounded-lg">
                            <Banknote className="w-4 h-4" />
                            <span>{auction.offers.filter(o => o.status === 'pending').length} pending offer{auction.offers.filter(o => o.status === 'pending').length !== 1 ? 's' : ''}</span>
                        </p>
                    )}
                </div>
            </section>

            <SubscriptionModal
                isOpen={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
                onSuccess={() => {
                    checkSubscription();
                    setHasCheckedAccess(false);
                }}
            />
        </Container>
    );
}

export default SingleAuction;
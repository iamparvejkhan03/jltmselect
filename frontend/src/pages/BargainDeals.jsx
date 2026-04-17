import { useState, useEffect, useCallback } from "react";
import { Filter, Search, SlidersHorizontal, X, Loader, Grid, List, TrendingDown, DollarSign, Percent, Tag, Zap } from "lucide-react";
import { AuctionListItem, Container } from "../components";
import AuctionCard from "../components/AuctionCard";
import { useBargainDeals } from "../hooks/useBargainDeals";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

// FiltersSection Component for Bargain Deals
const BargainFiltersSection = ({
    uiFilters,
    setUiFilters,
    loadingCategories,
    handleFilterChange,
    resetFilters,
    setShowMobileFilters,
    parentCategories,
    subCategories,
    selectedParent,
    setSelectedParent,
    updateFilters,
    location
}) => {
    // Handle parent category selection
    const handleParentChange = (e) => {
        const parentSlug = e.target.value;
        setSelectedParent(parentSlug);

        const newFilters = {
            ...uiFilters,
            categories: parentSlug ? [parentSlug] : [],
            category: ''
        };

        setUiFilters(newFilters);
        updateFilters(newFilters);

        const searchParams = new URLSearchParams(location.search);
        if (parentSlug) {
            searchParams.set('category', parentSlug);
            searchParams.delete('subcategory');
        } else {
            searchParams.delete('category');
            searchParams.delete('subcategory');
        }
        const newUrl = `${location.pathname}?${searchParams.toString()}`;
        window.history.replaceState(null, '', newUrl);
    };

    // Handle subcategory selection
    const handleSubcategoryChange = (e) => {
        const subcategorySlug = e.target.value;

        const newFilters = {
            ...uiFilters,
            categories: subcategorySlug ?
                [selectedParent, subcategorySlug] :
                (selectedParent ? [selectedParent] : []),
            category: subcategorySlug
        };

        setUiFilters(newFilters);
        updateFilters(newFilters);

        const searchParams = new URLSearchParams(location.search);
        if (selectedParent) {
            searchParams.set('category', selectedParent);
            if (subcategorySlug) {
                searchParams.set('subcategory', subcategorySlug);
            } else {
                searchParams.delete('subcategory');
            }
        }
        const newUrl = `${location.pathname}?${searchParams.toString()}`;
        window.history.replaceState(null, '', newUrl);
    };

    const discountOptions = [
        { value: 80, label: "80% OFF & above" },
        { value: 85, label: "85% OFF & above" },
        { value: 90, label: "90% OFF & above" },
        { value: 95, label: "95% OFF & above" }
    ];

    return (
        <div className="bg-bg-secondary dark:bg-bg-primary px-4 py-6 rounded-lg shadow-md h-fit border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6 lg:hidden">
                <h2 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark">Filters</h2>
                <button onClick={() => setShowMobileFilters(false)} className="text-text-primary dark:text-text-primary-dark">
                    <X size={24} />
                </button>
            </div>

            <div className="space-y-6">
                {/* Search */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">Search</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary dark:text-text-secondary-dark" size={20} />
                        <input
                            type="text"
                            placeholder="Search bargain deals..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark rounded-lg focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent"
                            value={uiFilters.search}
                            onChange={handleFilterChange}
                            name="search"
                        />
                    </div>
                </div>

                {/* Category Filter */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">Category</label>
                    <select
                        name="parentCategory"
                        value={selectedParent}
                        onChange={handleParentChange}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark rounded-lg focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent mb-2"
                        disabled={loadingCategories}
                    >
                        <option value="">Select Category</option>
                        {parentCategories.map(parent => (
                            <option key={parent.slug} value={parent.slug}>
                                {parent.name}
                            </option>
                        ))}
                    </select>

                    <select
                        name="category"
                        value={uiFilters.category}
                        onChange={handleSubcategoryChange}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark rounded-lg focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent"
                        disabled={!selectedParent || loadingCategories}
                    >
                        <option value="">All Subcategories</option>
                        {subCategories.map(sub => (
                            <option key={sub.slug} value={sub.slug}>
                                {sub.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Minimum Discount Filter */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">Minimum Discount</label>
                    <select
                        name="discountMin"
                        value={uiFilters.discountMin}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark rounded-lg focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent"
                    >
                        {discountOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>

                {/* Price Range - Based on Final Sale Price */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">Sale Price ($)</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Min"
                            min="0"
                            name="priceMin"
                            value={uiFilters.priceMin}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark rounded-lg focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent"
                        />
                        <span className="self-center text-text-secondary dark:text-text-secondary-dark">-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            min="0"
                            name="priceMax"
                            value={uiFilters.priceMax}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark rounded-lg focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Location */}
                {/* <div>
                    <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">Location</label>
                    <input
                        type="text"
                        placeholder="City, State or Country"
                        name="location"
                        value={uiFilters.location}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark rounded-lg focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent"
                    />
                </div> */}

                {/* Auction Type Filter */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
                        Auction Type
                    </label>
                    <select
                        name="auctionType"
                        value={uiFilters.auctionType || ''}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark rounded-lg focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent"
                    >
                        <option value="">All Types</option>
                        <option value="standard">Standard Auction</option>
                        <option value="reserve">Reserve Auction</option>
                        {/* <option value="buy_now">Buy Now Auction</option> */}
                    </select>
                </div>
            </div>

            {/* Filter Actions */}
            <div className="flex flex-col gap-3 mt-8">
                <button
                    onClick={resetFilters}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-text-primary dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    Reset All Filters
                </button>
            </div>
        </div>
    );
};

function BargainDeals() {
    const {
        auctions,
        loading,
        loadingMore,
        pagination,
        filters: apiFilters,
        loadMoreDeals,
        updateFilters
    } = useBargainDeals();

    const [uiFilters, setUiFilters] = useState({
        categories: [],
        search: "",
        priceMin: "",
        priceMax: "",
        location: "",
        sortBy: "discountPercentage",
        sortOrder: "desc",
        discountMin: 80,
        auctionType: "",
        allowOffers: "",
    });

    const location = useLocation();
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState(null);
    const [viewMode, setViewMode] = useState("grid");
    const [parentCategories, setParentCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedParent, setSelectedParent] = useState('');
    const [loadingCategories, setLoadingCategories] = useState(false);
    const navigate = useNavigate();

    // Fetch parent categories on mount
    useEffect(() => {
        const fetchParentCategories = async () => {
            try {
                setLoadingCategories(true);
                const { data } = await axiosInstance.get('/api/v1/categories/public/parents');
                if (data.success) {
                    setParentCategories(data.data);
                }
            } catch (error) {
                console.error('Error fetching parent categories:', error);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchParentCategories();
    }, []);

    useEffect(() => {
        const fetchSubCategories = async () => {
            if (!selectedParent) {
                setSubCategories([]);
                return;
            }

            try {
                setLoadingCategories(true);
                const { data } = await axiosInstance.get(`/api/v1/categories/public/${selectedParent}/children`);
                if (data.success) {
                    setSubCategories(data.data.subcategories);
                }
            } catch (error) {
                console.error('Error fetching subcategories:', error);
                setSubCategories([]);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchSubCategories();
    }, [selectedParent]);

    // Read URL parameters on page load
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const categoryParam = searchParams.get('category');
        const subcategoryParam = searchParams.get('subcategory');
        const discountMinParam = searchParams.get('discountMin');

        const newFilters = { ...uiFilters };

        if (categoryParam || subcategoryParam) {
            const categorySlugs = [];
            if (categoryParam) {
                categorySlugs.push(categoryParam);
                setSelectedParent(categoryParam);
            }
            if (subcategoryParam) {
                categorySlugs.push(subcategoryParam);
                newFilters.category = subcategoryParam;
            }
            newFilters.categories = categorySlugs;
        }

        if (discountMinParam) {
            newFilters.discountMin = parseInt(discountMinParam);
        }

        setUiFilters(newFilters);
        updateFilters(newFilters);
    }, [location.search]);

    // Sync UI filters with API filters
    useEffect(() => {
        setUiFilters(prev => ({
            ...prev,
            ...apiFilters
        }));
    }, [apiFilters]);

    const debouncedUpdateFilters = useCallback((newFilters) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            updateFilters(newFilters);
        }, 500);

        setDebounceTimer(timer);
    }, [debounceTimer, updateFilters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const newFilters = {
            ...uiFilters,
            [name]: value
        };

        setUiFilters(newFilters);

        // Update URL
        const searchParams = new URLSearchParams(location.search);
        if (value) {
            searchParams.set(name, value);
        } else {
            searchParams.delete(name);
        }
        const newUrl = `${location.pathname}?${searchParams.toString()}`;
        window.history.replaceState(null, '', newUrl);

        // Use debounce for text inputs
        if (['search', 'location'].includes(name)) {
            debouncedUpdateFilters(newFilters);
        } else {
            updateFilters(newFilters);
        }
    };

    const resetFilters = () => {
        const resetFiltersState = {
            categories: [],
            search: "",
            priceMin: "",
            priceMax: "",
            location: "",
            sortBy: "discountPercentage",
            sortOrder: "desc",
            discountMin: 80,
            auctionType: "",
            allowOffers: "",
        };
        setUiFilters(resetFiltersState);
        updateFilters(resetFiltersState);
        setShowMobileFilters(false);
        setSelectedParent('');
        window.history.replaceState(null, '', location.pathname);
    };

    const handleLoadMore = () => {
        loadMoreDeals();
    };

    const sortOptions = [
        { value: "discountPercentage-desc", label: "Biggest Discount First" },
        // { value: "savingsAmount-desc", label: "Highest Savings First" },
        { value: "finalPrice-asc", label: "Price: Low to High" },
        { value: "finalPrice-desc", label: "Price: High to Low" },
        // { value: "endDate-desc", label: "Recently Sold" },
        { value: "retailPrice-desc", label: "Highest Retail Value" }
    ];

    const handleSortChange = (e) => {
        const [sortBy, sortOrder] = e.target.value.split('-');
        const newFilters = {
            ...uiFilters,
            sortBy,
            sortOrder
        };
        setUiFilters(newFilters);
        updateFilters(newFilters);

        const searchParams = new URLSearchParams(location.search);
        searchParams.set('sortBy', sortBy);
        searchParams.set('sortOrder', sortOrder);
        const newUrl = `${location.pathname}?${searchParams.toString()}`;
        window.history.replaceState(null, '', newUrl);
    };

    return (
        <Container className="bg-bg-secondary dark:bg-bg-primary">
            <div className="min-h-screen pt-16 md:pt-32 pb-16 bg-bg-secondary dark:bg-bg-primary">
                {/* Header */}
                <div className="py-8">
                    <div className="container mx-auto">
                        <h1 className="text-3xl font-bold text-pure-black dark:text-pure-white">🔥 Bargain Deals</h1>
                        <p className="text-bg-primary-light dark:text-bg-secondary-dark mt-2">Incredible savings up to 95% OFF retail prices. All-time best offers!</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Filters Sidebar */}
                        <div className="hidden lg:block lg:w-1/4 xl:w-1/5">
                            <BargainFiltersSection
                                uiFilters={uiFilters}
                                setUiFilters={setUiFilters}
                                loadingCategories={loadingCategories}
                                handleFilterChange={handleFilterChange}
                                resetFilters={resetFilters}
                                setShowMobileFilters={setShowMobileFilters}
                                parentCategories={parentCategories}
                                subCategories={subCategories}
                                selectedParent={selectedParent}
                                setSelectedParent={setSelectedParent}
                                updateFilters={updateFilters}
                                location={location}
                            />
                        </div>

                        {/* Content Area */}
                        <div className="w-full lg:w-3/4 xl:w-4/5">
                            {/* Mobile Filter Toggle and View Toggle */}
                            <div className="flex flex-col md:flex-row gap-4 mb-8 lg:hidden">
                                <div className="relative flex-grow">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary dark:text-text-secondary-dark" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search bargain deals..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark rounded-lg focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent"
                                        value={uiFilters.search}
                                        onChange={handleFilterChange}
                                        name="search"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowMobileFilters(true)}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-bg-secondary dark:bg-bg-primary border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium text-text-primary dark:text-text-primary-dark"
                                    >
                                        <SlidersHorizontal size={20} />
                                        <span>Filters</span>
                                    </button>
                                </div>
                            </div>

                            {/* Desktop View Toggle and Sort */}
                            <div className="hidden lg:flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3">
                                <p className="text-text-secondary dark:text-text-secondary-dark">
                                    {loading ? "Loading bargain deals..." : `Showing ${auctions.length} of ${pagination?.totalAuctions || 0} amazing deals`}
                                </p>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-text-secondary dark:text-text-secondary-dark text-sm">Sort by:</span>
                                        <select
                                            className="border border-gray-200 dark:border-gray-700 bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent"
                                            value={`${uiFilters.sortBy}-${uiFilters.sortOrder}`}
                                            onChange={handleSortChange}
                                        >
                                            {sortOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Results Count */}
                            <div className="lg:hidden mb-4">
                                <p className="text-text-secondary dark:text-text-secondary-dark text-sm">
                                    {loading ? "Loading..." : `${auctions.length} of ${pagination?.totalAuctions || 0} deals`}
                                </p>
                            </div>

                            {/* Auction Grid/List */}
                            {loading && auctions.length === 0 ? (
                                viewMode === "grid" ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-8 md:gap-y-12">
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i} className="border border-gray-200 dark:border-gray-700 p-4 bg-bg-secondary dark:bg-bg-primary rounded-xl shadow-sm h-96 animate-pulse">
                                                <div className="bg-gray-200 dark:bg-gray-700 h-56 rounded-tr-3xl rounded-bl-3xl"></div>
                                                <div className="my-3 h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                                <div className="my-2 h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                                <div className="my-2 h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                                                <div className="flex gap-3 items-center mt-4">
                                                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex-grow"></div>
                                                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {Array.from({ length: 3 }).map((_, index) => (
                                            <div key={index} className="bg-bg-secondary dark:bg-bg-primary rounded-xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse">
                                                <div className="flex flex-col lg:flex-row gap-5">
                                                    <div className="lg:w-64">
                                                        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                            {Array.from({ length: 4 }).map((_, i) => (
                                                                <div key={i} className="space-y-2">
                                                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                                                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : auctions.length > 0 ? (
                                <>
                                    {viewMode === "grid" ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-8 md:gap-y-12">
                                            {auctions.map(auction => (
                                                <AuctionCard
                                                    key={auction._id}
                                                    auction={auction}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {auctions.map((auction) => (
                                                <AuctionListItem
                                                    key={auction._id}
                                                    auction={auction}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Load More Button */}
                                    {pagination?.currentPage < pagination?.totalPages && (
                                        <div className="flex justify-center mt-12">
                                            <button
                                                onClick={handleLoadMore}
                                                disabled={loadingMore}
                                                className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                            >
                                                {loadingMore ? (
                                                    <>
                                                        <Loader size={16} className="animate-spin" />
                                                        Loading more deals...
                                                    </>
                                                ) : (
                                                    <>
                                                        Load More Bargains
                                                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                                                            {pagination.totalAuctions - auctions.length} more
                                                        </span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {/* End of Auctions Message */}
                                    {pagination?.currentPage >= pagination?.totalPages && auctions.length > 0 && (
                                        <div className="text-center py-8 text-text-secondary dark:text-text-secondary-dark">
                                            <p>You've seen all {pagination.totalAuctions} bargain deals!</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <Zap size={48} className="mx-auto text-text-secondary dark:text-text-secondary-dark mb-4" />
                                    <h3 className="text-xl font-medium text-text-primary dark:text-text-primary-dark mb-2">No bargain deals found</h3>
                                    <p className="text-text-secondary dark:text-text-secondary-dark">Try adjusting your filters to find more amazing deals.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Filters Overlay */}
                {showMobileFilters && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-pure-black/50 dark:bg-pure-black/70" onClick={() => setShowMobileFilters(false)}></div>
                        <div className="absolute left-0 top-0 h-full w-4/5 max-w-sm bg-bg-secondary dark:bg-bg-primary overflow-y-auto p-6">
                            <BargainFiltersSection
                                uiFilters={uiFilters}
                                setUiFilters={setUiFilters}
                                loadingCategories={loadingCategories}
                                handleFilterChange={handleFilterChange}
                                resetFilters={resetFilters}
                                setShowMobileFilters={setShowMobileFilters}
                                parentCategories={parentCategories}
                                subCategories={subCategories}
                                selectedParent={selectedParent}
                                setSelectedParent={setSelectedParent}
                                updateFilters={updateFilters}
                                location={location}
                            />
                        </div>
                    </div>
                )}
            </div>
        </Container>
    );
}

export default BargainDeals;
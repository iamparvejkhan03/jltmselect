import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';
import { useLocation } from "react-router-dom";

export const useBargainDeals = () => {
    const location = useLocation();
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [pagination, setPagination] = useState(null);
    const [filters, setFilters] = useState({
        categories: [],
        search: '',
        priceMin: '',
        priceMax: '',
        location: '',
        // sortBy: 'discountPercentage',
        sortBy: 'endDate',
        sortOrder: 'desc',
        // discountMin: 80,
        auctionType: '',
        allowOffers: ''
    });

    // Clean filters - remove empty values
    const cleanFilters = (currentFilters) => {
        return Object.fromEntries(
            Object.entries(currentFilters).filter(([key, value]) => {
                if (key === 'categories') {
                    return Array.isArray(value) && value.length > 0;
                }
                return value !== '' && value !== null && value !== undefined;
            })
        );
    };

    // Fetch bargain deals with pagination and filters
    const fetchBargainDeals = async (page = 1, limit = 12, currentFilters = {}) => {
        const loadingState = page > 1 ? setLoadingMore : setLoading;
        loadingState(true);

        try {
            const clean = cleanFilters(currentFilters);

            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...Object.fromEntries(
                    Object.entries(clean).filter(([key]) => key !== 'categories')
                )
            });

            if (clean.categories && Array.isArray(clean.categories) && clean.categories.length > 0) {
                clean.categories.forEach(cat => {
                    params.append('categories', cat);
                });
            }

            const queryString = params.toString();
            const { data } = await axiosInstance.get(`/api/v1/auctions/bargain-deals?${queryString}`);

            if (data.success) {
                if (page > 1) {
                    setAuctions(prev => [...prev, ...data.data.auctions]);
                } else {
                    setAuctions(data.data.auctions);
                }
                setPagination(data.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching bargain deals:', error);
            toast.error('Failed to load bargain deals');
        } finally {
            loadingState(false);
        }
    };

    // Load more auctions
    const loadMoreDeals = async () => {
        if (pagination?.currentPage < pagination?.totalPages) {
            const nextPage = pagination.currentPage + 1;
            await fetchBargainDeals(nextPage, 12, filters);
        }
    };

    // Update filters and refresh deals
    const updateFilters = (newFilters) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);
        fetchBargainDeals(1, 12, updatedFilters);
    };

    // Handle URL parameters on initial load
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);

        let categories = [];
        const categoriesParam = searchParams.get('categories');
        if (categoriesParam) {
            categories = categoriesParam.split(',').filter(cat => cat.trim() !== '');
        }

        const urlFilters = {
            categories: categories,
            search: searchParams.get('search') || '',
            priceMin: searchParams.get('priceMin') || '',
            priceMax: searchParams.get('priceMax') || '',
            location: searchParams.get('location') || '',
            discountMin: searchParams.get('discountMin') ? parseInt(searchParams.get('discountMin')) : 80,
            auctionType: searchParams.get('auctionType') || '',
            allowOffers: searchParams.get('allowOffers') || '',
            sortBy: searchParams.get('sortBy') || 'discountPercentage',
            sortOrder: searchParams.get('sortOrder') || 'desc'
        };

        const cleanUrlFilters = cleanFilters(urlFilters);

        if (Object.keys(cleanUrlFilters).length > 0) {
            setFilters(urlFilters);
            fetchBargainDeals(1, 12, urlFilters);
        } else {
            fetchBargainDeals(1, 12, filters);
        }
    }, [location.search]);

    return {
        auctions,
        loading,
        loadingMore,
        pagination,
        filters,
        fetchBargainDeals,
        loadMoreDeals,
        updateFilters
    };
};
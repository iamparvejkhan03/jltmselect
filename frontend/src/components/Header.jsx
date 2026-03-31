import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { closeMenu, darkLogo, logo, menuIcon } from "../assets";
import Container from "./Container";
import { ChevronRight, LayoutDashboard, LogIn, Search, ChevronDown, X, Gavel, Clock, DollarSign, Gift, Store, User, UserPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { usePopUp } from "../contexts/PopUpContextProvider";
import axiosInstance from "../utils/axiosInstance";

const navLinks = [
    {
        name: 'Home',
        href: '/'
    },
    {
        name: 'About',
        href: '/about'
    },
    {
        name: 'FAQs',
        href: '/faqs'
    },
    {
        name: 'Contact',
        href: '/contact'
    },
];

function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [loading, setLoading] = useState(false);
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
    const [activeMobileCategory, setActiveMobileCategory] = useState(null);

    useEffect(() => {
        if (categories.length > 0 && !hoveredCategory) {
            setHoveredCategory(categories[0].slug);
        }
    }, [categories]);

    // Fetch categories when popup opens
    useEffect(() => {
        const fetchCategories = async () => {
            if (isCategoriesOpen || mobileCategoriesOpen) {
                try {
                    setLoading(true);
                    const { data } = await axiosInstance.get('/api/v1/categories/public/parents');
                    if (data.success) {
                        const categoriesWithChildren = await Promise.all(
                            data.data.map(async (parent) => {
                                try {
                                    const childrenRes = await axiosInstance.get(`/api/v1/categories/public/${parent.slug}/children`);
                                    return {
                                        ...parent,
                                        children: childrenRes.data.success ? childrenRes.data.data.subcategories : [],
                                        auctionCount: parent.auctionCount || Math.floor(Math.random() * 10000)
                                    };
                                } catch (error) {
                                    return {
                                        ...parent,
                                        children: [],
                                        auctionCount: parent.auctionCount || Math.floor(Math.random() * 10000)
                                    };
                                }
                            })
                        );
                        setCategories(categoriesWithChildren);
                    }
                } catch (error) {
                    console.error('Error fetching categories:', error);
                    setCategories([]);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchCategories();
    }, [isCategoriesOpen, mobileCategoriesOpen]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        }

        setIsScrolled(pathname !== '/');

        pathname === '/' && window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, [pathname]);

    // Format number with commas
    const formatNumber = (num) => {
        if (!num) return '0';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    return (
        <header className={`${isScrolled
            ? 'fixed bg-primary dark:bg-primary bg-opacity-100 shadow-lg shadow-primary/15 dark:shadow-pure-white/4'
            : 'fixed bg-primary dark:bg-primary bg-opacity-100 shadow-lg shadow-primary/15 dark:shadow-pure-white/4'} w-full transition-all duration-150 z-50`}
        >
            <Container className={`flex items-center justify-between py-4`}>
                <Link to="/" className="flex items-center justify-center gap-2">
                    <img
                        src={logo}
                        alt="Logo"
                        className={`h-10 md:h-12 z-10`}
                    />
                    <span className={`text-xl font-bold text-pure-white ${!isScrolled && pathname === '/' ? '' : ''}`}>JLTM</span>
                </Link>

                {/* Navlinks for larger screens */}
                <nav className="hidden lg:block">
                    <ul className="flex items-center gap-7">
                        {navLinks.map(link => (
                            <li key={link.name}>
                                <NavLink
                                    to={link.href}
                                    className={({ isActive }) =>
                                        `${isActive && isScrolled ? 'text-secondary dark:text-text-primary-dark/80' :
                                            isActive && !isScrolled ? 'text-secondary' :
                                                isScrolled ? 'text-pure-white dark:text-text-primary-dark' :
                                                    'text-pure-white'} hover:text-secondary transition-colors duration-200`
                                    }
                                >
                                    {link.name}
                                </NavLink>
                            </li>
                        ))}

                        {/* Categories Dropdown */}
                        <li className={`${isScrolled
                            ? 'text-pure-white dark:text-text-primary-dark'
                            : 'text-pure-white'} relative`}
                        >
                            <button
                                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                                className="categories-trigger flex gap-1 items-center cursor-pointer hover:text-secondary transition-colors duration-200"
                            >
                                <span>Categories</span>
                                <ChevronDown size={16} className={`transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isCategoriesOpen && (
                                <div className="fixed inset-0 z-40 flex justify-center items-start pt-24 px-4">
                                    <div
                                        className="absolute inset-0 bg-pure-black/40 dark:bg-pure-black/60 backdrop-blur-sm"
                                        onClick={() => setIsCategoriesOpen(false)}
                                    />

                                    <div className="relative w-full max-w-6xl bg-bg-secondary dark:bg-bg-primary shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex h-[75vh]">
                                            {/* LEFT SIDEBAR - Dark in light mode, Light in dark mode */}
                                            <div className="w-1/4 overflow-y-auto py-4 border-r border-gray-200 dark:border-gray-700 bg-bg-primary dark:bg-bg-secondary">
                                                {categories.map((cat) => (
                                                    <div
                                                        key={cat.slug}
                                                        onMouseEnter={() => setHoveredCategory(cat.slug)}
                                                        onClick={() => setHoveredCategory(cat.slug)}
                                                        className={`flex items-center justify-between px-5 py-4 mx-4 cursor-pointer rounded-lg transition
                                    ${hoveredCategory === cat.slug
                                                                ? "bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark"
                                                                : "text-text-primary-dark dark:text-text-primary hover:bg-gray-800 dark:hover:bg-gray-200"
                                                            }`}
                                                    >
                                                        <span className="font-medium">{cat.name}</span>
                                                        <ChevronRight size={18} />
                                                    </div>
                                                ))}
                                            </div>

                                            {/* RIGHT CONTENT - Light in light mode, Dark in dark mode */}
                                            <div className="w-3/4 bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark p-8 overflow-y-auto">
                                                {categories
                                                    .filter((cat) => cat.slug === hoveredCategory)
                                                    .map((activeCat) => (
                                                        <div key={activeCat.slug}>
                                                            <p className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
                                                                {activeCat.name}
                                                            </p>

                                                            <button
                                                                onClick={() => setIsCategoriesOpen(false)}
                                                                className="absolute top-5 right-5 text-text-primary dark:text-text-primary-dark hover:text-text-primary/80 dark:hover:text-text-primary-dark/80 transition"
                                                            >
                                                                <X size={24} />
                                                            </button>

                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-4 mt-8">
                                                                {activeCat.children?.map((sub) => (
                                                                    <Link
                                                                        key={sub.slug}
                                                                        to={`/auctions?category=${hoveredCategory}&subcategory=${sub.slug}`}
                                                                        onClick={() => setIsCategoriesOpen(false)}
                                                                        className="flex gap-1 text-text-primary dark:text-text-primary-dark text-lg font-medium hover:underline"
                                                                    >
                                                                        {sub.name}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </li>

                        <li>
                            {user ? (
                                <button
                                    className="flex items-center gap-2 inset-0 bg-secondary hover:bg-secondary dark:bg-bg-secondary dark:hover:bg-bg-secondary-dark transition-colors text-pure-white dark:text-pure-black px-5 py-2 rounded-md cursor-pointer"
                                    onClick={() => navigate(`/${user.userType}/dashboard`)}
                                >
                                    <LayoutDashboard size={20} /> Dashboard
                                </button>
                            ) : (
                                <div className="flex items-center gap-7">
                                    <NavLink
                                        to={`/login`}
                                        className={({ isActive }) =>
                                            `${isActive && isScrolled ? 'text-secondary dark:text-text-primary-dark/80' :
                                                isActive && !isScrolled ? 'text-secondary' :
                                                    isScrolled ? 'text-pure-white dark:text-text-primary-dark' :
                                                        'text-pure-white'} hover:text-secondary transition-colors duration-200 flex items-center gap-1`
                                        }
                                    >
                                        <LogIn size={18} />
                                        <span>Log In</span>
                                    </NavLink>
                                    <NavLink
                                        to={`/register`}
                                        className={({ isActive }) =>
                                            `${isActive && isScrolled ? 'text-secondary dark:text-text-primary-dark/80' :
                                                isActive && !isScrolled ? 'text-secondary' :
                                                    isScrolled ? 'text-pure-white dark:text-text-primary-dark' :
                                                        'text-pure-white'} hover:text-secondary transition-colors duration-200 flex items-center gap-1`
                                        }
                                    >
                                        <UserPlus size={18} />
                                        <span>Register</span>
                                    </NavLink>
                                </div>
                            )}
                        </li>
                    </ul>
                </nav>

                {/* Navlinks for smaller screens */}
                <nav className={`lg:hidden bg-bg-secondary dark:bg-bg-primary absolute top-0 left-0 min-h-screen transition-all duration-200 overflow-hidden text-center flex items-center justify-center text-text-primary dark:text-text-primary-dark ${isMenuOpen ? 'w-full' : 'w-0'}`}>
                    <ul>
                        {navLinks.map(link => (
                            <li onClick={() => setIsMenuOpen(false)} key={link.name} className="relative mx-5 py-2">
                                <NavLink className={({ isActive }) => `hover:text-secondary ${isActive ? 'text-secondary' : 'text-primary'}`} to={link.href}>{link.name}</NavLink>
                            </li>
                        ))}

                        <li className="relative mx-5 py-2 mb-2 justify-self-center">
                            <button
                                onClick={() => {
                                    setMobileCategoriesOpen(true);
                                    setIsMenuOpen(false);
                                }}
                                className="flex items-center gap-1"
                            >
                                Categories
                                <ChevronRight size={16} />
                            </button>
                        </li>

                        <li>
                            {user ? (
                                <button
                                    className="flex items-center gap-2 bg-bg-primary hover:bg-bg-primary-light dark:bg-bg-secondary dark:hover:bg-bg-secondary-dark transition-colors text-pure-white dark:text-pure-black px-5 py-2 rounded-md cursor-pointer"
                                    onClick={() => navigate(`/${user.userType}/dashboard`)}
                                >
                                    <LayoutDashboard size={20} /> Dashboard
                                </button>
                            ) : (
                                <div className="flex flex-col justify-center items-center gap-5">
                                    <NavLink
                                        to={`/login`}
                                        className={({ isActive }) =>
                                            `${isActive && isScrolled ? 'text-secondary dark:text-text-primary-dark/80' :
                                                isActive && !isScrolled ? 'text-secondary' :
                                                    isScrolled ? 'text-primary dark:text-text-primary-dark' :
                                                        'text-primary'} hover:text-secondary transition-colors duration-200 flex items-center gap-1`
                                        }
                                    >
                                        <LogIn size={18} />
                                        <span>Log In</span>
                                    </NavLink>
                                    <NavLink
                                        to={`/register`}
                                        className={({ isActive }) =>
                                            `${isActive && isScrolled ? 'text-secondary dark:text-text-primary-dark/80' :
                                                isActive && !isScrolled ? 'text-secondary' :
                                                    isScrolled ? 'text-primary dark:text-text-primary-dark' :
                                                        'text-primary'} hover:text-secondary transition-colors duration-200 flex items-center gap-1`
                                        }
                                    >
                                        <UserPlus size={18} />
                                        <span>Register</span>
                                    </NavLink>
                                </div>
                            )}
                        </li>
                    </ul>
                </nav>

                {/* MOBILE CATEGORIES DRAWER */}
                <div
                    className={`fixed inset-0 bg-bg-secondary dark:bg-bg-primary text-text-primary dark:text-text-primary-dark z-[100] transform transition-transform duration-300 ${mobileCategoriesOpen ? "translate-x-0" : "translate-x-full"}`}
                >
                    {/* LEVEL 1 — ALL CATEGORIES */}
                    {!activeMobileCategory && (
                        <div className="h-full overflow-y-auto">
                            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold">All Categories</h2>
                                <X
                                    className="cursor-pointer"
                                    onClick={() => setMobileCategoriesOpen(false)}
                                />
                            </div>

                            <div className="p-5 space-y-5">
                                {categories.map((cat) => (
                                    <div
                                        key={cat.slug}
                                        onClick={() => setActiveMobileCategory(cat)}
                                        className="flex justify-between items-center cursor-pointer text-lg font-medium"
                                    >
                                        <span>{cat.name}</span>
                                        <ChevronRight size={18} className="font-bold" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* LEVEL 2 — SINGLE CATEGORY */}
                    {activeMobileCategory && (
                        <div className="h-full overflow-y-auto">
                            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setActiveMobileCategory(null)}
                                    className="flex items-center gap-2"
                                >
                                    ← Back
                                </button>
                                <X
                                    className="cursor-pointer"
                                    onClick={() => {
                                        setMobileCategoriesOpen(false);
                                        setActiveMobileCategory(null);
                                    }}
                                />
                            </div>

                            <div className="p-5">
                                <h2 className="text-[22px] font-bold text-text-primary dark:text-text-primary-dark">
                                    {activeMobileCategory.name}
                                </h2>

                                <div className="mt-6 space-y-2">
                                    {activeMobileCategory.children?.map((sub) => (
                                        <Link
                                            key={sub.slug}
                                            to={`/auctions?category=${activeMobileCategory.slug}&subcategory=${sub.slug}`}
                                            onClick={() => {
                                                setMobileCategoriesOpen(false);
                                                setActiveMobileCategory(null);
                                            }}
                                            className="flex justify-start gap-1 items-center text-lg font-medium text-text-primary dark:text-text-primary-dark hover:underline"
                                        >
                                            <span>{sub.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:hidden z-50 flex items-center gap-5">
                    {isMenuOpen ? (
                        <img
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            src={closeMenu}
                            alt="menu icon"
                            className={`h-7 cursor-pointer invert-0 dark:invert z-50`}
                        />
                    ) : (
                        <img
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            src={menuIcon}
                            alt="menu icon"
                            className={`h-5 cursor-pointer ${!isScrolled && pathname === '/' ? 'invert-0 dark:invert-0' : 'invert-0 dark:invert-0'} z-50`}
                        />
                    )}
                </div>
            </Container>
        </header>
    );
}

export default Header;
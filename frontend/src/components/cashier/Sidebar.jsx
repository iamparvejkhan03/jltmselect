import {
    LayoutDashboard,
    LogOut,
    User,
    X,
    Menu,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { logo } from "../../assets";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

const navigation = [
    { name: 'Dashboard', path: '/cashier/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Profile', path: '/cashier/profile', icon: <User size={20} /> },
];

function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const { logout } = useAuth();

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent body scrolling when sidebar is open on mobile
    useEffect(() => {
        if (isOpen && isMobile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, isMobile]);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    }

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={toggleSidebar}
                className={`md:hidden ${isOpen && isMobile ? 'hidden' : 'fixed'} top-4 left-4 z-30 sm:z-40 p-2 rounded-md bg-primary text-pure-white`}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:relative w-64 bg-bg-primary text-white h-screen md:h-auto md:min-h-screen overflow-y-auto p-4 flex flex-col z-50
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo/Brand */}
                <div className="px-4 mb-8 flex items-center justify-between pb-2">
                    <Link to='/' className="z-50 mb-4 flex items-center gap-2">
                        <img src={logo} alt="logo" className="h-7 md:h-8" />
                        {/* <span className={`text-xl font-bold text-pure-white`}>JLTM</span> */}
                    </Link>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="md:hidden text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1">
                    <ul className="space-y-2">
                        {navigation.map((link, i) => (
                            <li key={i}>
                                <NavLink
                                    to={link.path}
                                    onClick={() => isMobile && setIsOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center p-3 rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-bg-secondary text-pure-black shadow-lg'
                                            : 'text-pure-white hover:bg-bg-secondary hover:text-pure-black'
                                        }`
                                    }
                                >
                                    <span className="mr-3">{link.icon}</span>
                                    <span>{link.name}</span>
                                </NavLink>
                            </li>
                        ))}
                        <li>
                            <button
                                onClick={logout}
                                className="flex items-center w-full p-3 rounded-lg text-white hover:bg-red-600 transition-all duration-200"
                            >
                                <LogOut size={20} className="mr-3" />
                                <span>Log Out</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>
        </>
    );
}

export default Sidebar;
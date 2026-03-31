import { Bell, Home, LayoutDashboard, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function Header() {
    const [notificationsCount] = useState(3);
    const { user } = useAuth();
    const { pathname } = useLocation();
    const dashboardType = pathname.split('/')[1];
    const navigate = useNavigate();

    return (
        <header className="bg-white w-full fixed top-0 md:static shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 z-20">
            {/* Left section with search */}
            <div className="flex-1 max-w-lg flex justify-end md:justify-start px-2">
                <Link to={`/`} className="text-bg-primary-light"><Home size={22} /></Link>
            </div>

            {/* Right section with icons and user */}
            <div className="flex items-center space-x-4 md:space-x-5">

                {/* User profile */}
                <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                    <div className="text-right hidden md:block">
                        <Link to={`/seller/profile`} className="text-sm font-medium text-black">{user?.firstName + ' ' + user?.lastName}</Link>
                        <p className="text-xs text-bg-primary-light">{user.username}</p>
                    </div>
                    {
                        user?.image
                            ?
                            <Link to={`/seller/profile`}><img src={user?.image} alt="userImage" className="h-10 w-10 rounded-full object-cover" /></Link>
                            :
                            <Link to={`/seller/profile`} className="h-10 w-10 rounded-full bg-gradient-to-r from-bg-primary to-bg-primary/80 flex items-center justify-center text-white font-semibold">
                                {user?.firstName[0] + user?.lastName[0]}
                            </Link>
                    }
                </div>
            </div>
        </header >
    );
}

export default Header;
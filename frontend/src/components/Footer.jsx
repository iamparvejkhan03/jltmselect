import { Link, NavLink, useNavigate } from "react-router-dom";
import { Container } from "../components";
import { logo, otherData } from "../assets";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, X, Youtube } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function Footer() {
    const navigate = useNavigate();

    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setVisible(entry.isIntersecting),
            { threshold: 0.15 }
        );

        if (ref.current) observer.observe(ref.current);

        return () => observer.disconnect();
    }, []);

    const quickLinks = [
        { name: 'Home', href: '/' },
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
        { name: 'FAQs', href: '/faqs' },
    ];

    const legalPolicies = [
        { name: 'Privacy Policy', href: '/privacy-policy' },
        { name: 'Terms of Use', href: '/terms-of-use' },
        { name: 'Buyer Agreement', href: '/buyer-agreement' },
        // { name: 'Seller Agreement', href: '/seller-agreement' },
    ];

    const categoryImg = [
        {
            title: 'Live',
            url: '/auctions?status=active'
        },
        {
            title: 'Sold',
            url: '/auctions?status=sold'
        },
        {
            title: 'Upcoming',
            url: '/auctions?status=approved'
        },
        {
            title: 'Explore All',
            url: '/auctions'
        }
    ];

    return (
        <footer
            ref={ref}
            className="bg-bg-primary text-gray-300 font-light py-12 relative overflow-hidden"
        >
            {/* Industrial Background Pattern - Fixed pointer events */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            {/* Industrial Mesh Lines - Fixed pointer events */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            {/* Gradient Orbs - Fixed pointer events */}
            <div className="absolute top-20 left-10 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

            {/* Content with proper z-index */}
            <Container
                className={`relative z-10 px-6 md:px-16 lg:px-24 xl:px-32 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
            >
                <div className='flex flex-wrap justify-between gap-12 md:gap-6'>
                    <div className='max-w-80 relative z-20'>
                        <Link to='/' className="z-50 mb-4 flex items-center gap-2">
                            <img src={logo} alt="logo" className="h-10 md:h-12" />
                            <span className={`text-xl font-bold text-pure-white`}>{otherData?.brandName}</span>
                        </Link>
                        <p className='text-bg-secondary-dark/80'>
                            Premium membership for luxury furniture enthusiasts. Experience exclusive auctions and in-store benefits.
                        </p>
                        <div className='flex items-center gap-3 mt-4'>
                            <Link to="#" target="_blank" className="text-bg-secondary-dark/80 hover:text-white transition-colors">
                                <Instagram strokeWidth={1.25} />
                            </Link>
                            <Link to="#" target="_blank" className="text-bg-secondary-dark/80 hover:text-white transition-colors">
                                <Facebook strokeWidth={1.25} />
                            </Link>
                        </div>
                    </div>

                    <div className="relative z-20">
                        <p className='text-sm text-white font-semibold mb-3 uppercase'>
                            Explore
                        </p>
                        <ul className='mt-3 flex flex-col gap-2'>
                            {quickLinks.map(link => (
                                <li className="relative py-1" key={link.name}>
                                    <NavLink
                                        className={({ isActive }) =>
                                            `text-bg-secondary-dark/80 hover:text-white transition-colors ${isActive ? 'text-secondary' : ''}`
                                        }
                                        to={link.href}
                                    >
                                        {link.name}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="relative z-20">
                        <p className='text-sm uppercase text-white font-semibold mb-3'>
                            Auctions
                        </p>
                        <ul className='mt-3 flex flex-col gap-2'>
                            {categoryImg.map(category => (
                                <li key={category.title}>
                                    <Link
                                        to={category.url}
                                        className="text-bg-secondary-dark/80 hover:text-white transition-colors"
                                    >
                                        {category.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="relative z-20">
                        <p className='text-sm uppercase text-white font-semibold mb-3'>
                            Legal
                        </p>
                        <ul className='mt-3 flex flex-col gap-2'>
                            {legalPolicies.map(service => (
                                <li key={service.name}>
                                    <NavLink
                                        to={service.href}
                                        className={({ isActive }) =>
                                            `text-bg-secondary-dark/80 hover:text-white transition-colors ${isActive ? 'text-secondary' : ''}`
                                        }
                                    >
                                        {service.name}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className='max-w-80 relative z-20'>
                        <p className='text-sm uppercase text-white font-semibold mb-3'>
                            Contact
                        </p>
                        <ul className='mt-3 flex flex-col gap-2'>
                            <li className="flex items-center gap-2">
                                <MapPin size={18} className="text-bg-secondary-dark/80" />
                                <p
                                    className="text-bg-secondary-dark/80 hover:text-white transition-colors"
                                >
                                    {otherData?.address}
                                </p>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone size={18} className="text-bg-secondary-dark/80" />
                                <Link
                                    className="text-bg-secondary-dark/80 hover:text-white transition-colors"
                                    to={`tel:${otherData.phone}`}
                                >
                                    {/* {otherData?.phoneCode} {otherData?.phone} */}
                                    {otherData?.phoneCode} {otherData?.formatPhone(otherData?.phone)}
                                </Link>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail size={18} className="text-bg-secondary-dark/80" />
                                <Link
                                    className="text-bg-secondary-dark/80 hover:text-white transition-colors"
                                    to={`mailto:${otherData.email}`}
                                >
                                    {otherData.email}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <hr className='border-bg-primary-light mt-8' />

                <div className='relative z-20 flex flex-col md:flex-row gap-2 md:items-center justify-between py-5 text-bg-secondary-dark/80'>
                    <p>
                        <span>© {new Date().getFullYear()} &nbsp;</span>
                        <Link to="/" className="text-white underline hover:text-gray-300 transition-colors">
                            {otherData?.brandName}.
                        </Link>
                        &nbsp; All rights reserved. &nbsp;
                    </p>
                    <div className="flex flex-wrap flex-row gap-4 items-center">
                        <Link to={'/terms-of-use'} className="text-bg-secondary-dark/80 hover:text-white transition-colors">
                            Terms of Use
                        </Link>
                        <Link to={'/privacy-policy'} className="text-bg-secondary-dark/80 hover:text-white transition-colors">
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </Container>
        </footer>
    );
}

export default Footer;
import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PopUpContextProvider } from './contexts/PopUpContextProvider';
import { Protected, LoadingSpinner } from './components';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';

const Home = lazy(() => import('./pages/Home'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Auctions = lazy(() => import('./pages/Auctions'));
const Checkout = lazy(() => import('./pages/Checkout'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'));
const PaymentRefundPolicy = lazy(() => import('./pages/PaymentRefundPolicy'));
const SellerAgreement = lazy(() => import('./pages/SellerAgreement'));
const BuyerAgreement = lazy(() => import('./pages/BuyerAgreement'));
const SingleAuction = lazy(() => import('./pages/SingleAuction'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const FAQs = lazy(() => import('./pages/FAQs'));
const BargainDeals = lazy(() => import('./pages/BargainDeals'));

{/* Seller Pages */ }
const SellerLayout = lazy(() => import('./pages/seller/Layout'));
const SellerDashboard = lazy(() => import('./pages/seller/Dashboard'));
const CreateAuctionSeller = lazy(() => import('./pages/seller/CreateAuction'));
const EditAuctionSeller = lazy(() => import('./pages/seller/EditAuction'));
const SellerAllAuctions = lazy(() => import('./pages/seller/AllAuctions'));
const SellerAllOffers = lazy(() => import('./pages/seller/AllOffers'));
const SoldAuctionsSeller = lazy(() => import('./pages/seller/SoldAuctions'));
const BidHistorySeller = lazy(() => import('./pages/seller/BidHistory'));
const SellerProfile = lazy(() => import('./pages/seller/Profile'));
const SellerNotifications = lazy(() => import('./pages/seller/Notifications'));
const SellerBilling = lazy(() => import('./pages/seller/Billing'));
const SellerPayoutMethods = lazy(() => import('./pages/seller/PayoutMethods'));
const SellerPayouts = lazy(() => import('./pages/seller/Payouts'));

{/* Broker Pages */ }
const BrokerLayout = lazy(() => import('./pages/broker/Layout'));
const BrokerDashboard = lazy(() => import('./pages/broker/Dashboard'));
const CreateAuctionBroker = lazy(() => import('./pages/broker/CreateAuction'));
const EditAuctionBroker = lazy(() => import('./pages/broker/EditAuction'));
const BrokerAllAuctions = lazy(() => import('./pages/broker/AllAuctions'));
const BrokerAllOffers = lazy(() => import('./pages/broker/AllOffers'));
const SoldAuctionsBroker = lazy(() => import('./pages/broker/SoldAuctions'));
const BidHistoryBroker = lazy(() => import('./pages/broker/BidHistory'));
const BrokerProfile = lazy(() => import('./pages/broker/Profile'));
const BrokerNotifications = lazy(() => import('./pages/broker/Notifications'));
const BrokerBilling = lazy(() => import('./pages/broker/Billing'));

{/* Cashier Pages */ }
const CashierLayout = lazy(() => import('./pages/cashier/Layout'));
const CashierDashboard = lazy(() => import('./pages/cashier/Dashboard'));
const CashierProfile = lazy(() => import('./pages/cashier/Profile'));

{/* Bidder Pages */ }
const BidderLayout = lazy(() => import('./pages/bidder/Layout'));
const BidderDashboard = lazy(() => import('./pages/bidder/Dashboard'));
const Watchlist = lazy(() => import('./pages/bidder/Watchlist'));
const ActiveAuctions = lazy(() => import('./pages/bidder/ActiveAuctions'));
const UpcomingAuctions = lazy(() => import('./pages/bidder/UpcomingAuctions'));
const MyBids = lazy(() => import('./pages/bidder/MyBids'));
const MyOffers = lazy(() => import('./pages/bidder/MyOffers'));
const WonAuctions = lazy(() => import('./pages/bidder/WonAuctions'));
const BidderProfile = lazy(() => import('./pages/bidder/Profile'));
const BidderNotifications = lazy(() => import('./pages/bidder/Notifications'));
const BidderBilling = lazy(() => import('./pages/bidder/Billing'));
const BidderSubscriptions = lazy(() => import('./pages/bidder/Subscriptions'));
const BidderVideos = lazy(() => import('./pages/bidder/Videos'));
const BidderPastAuctions = lazy(() => import('./pages/bidder/PastAuctions'));
const BidderAddMember = lazy(() => import('./pages/bidder/AddMember'));
const BidderAllMembers = lazy(() => import('./pages/bidder/AllMembers'));

{/* Staff Pages */ }
const StaffLayout = lazy(() => import('./pages/staff/Layout'));
const StaffDashboard = lazy(() => import('./pages/staff/Dashboard'));
const StaffAllUsers = lazy(() => import('./pages/staff/AllUsers'));
const StaffAllCashiers = lazy(() => import('./pages/staff/AllCashiers'));
const StaffAddCashier = lazy(() => import('./pages/staff/AddCashier'));
const StaffAllAuctions = lazy(() => import('./pages/staff/AllAuctions'));
const StaffCreateAuction = lazy(() => import('./pages/staff/CreateAuction'));
const StaffEditAuction = lazy(() => import('./pages/staff/EditAuction'));
const StaffUserQueries = lazy(() => import('./pages/staff/UserQueries'));
const StaffNotifications = lazy(() => import('./pages/staff/Notifications'));
const StaffProfile = lazy(() => import('./pages/staff/Profile'));
const StaffComments = lazy(() => import('./pages/staff/Comments'));
const StaffCommissions = lazy(() => import('./pages/staff/Commissions'));
// const StaffDepositSettings = lazy(() => import('./pages/staff/DepositSettings'));
const StaffBidHistory = lazy(() => import('./pages/staff/BidHistory'));
const StaffAllOffers = lazy(() => import('./pages/staff/AllOffers'));
const StaffTransactions = lazy(() => import('./pages/staff/Transactions'));
const StaffCategories = lazy(() => import('./pages/staff/Categories'));
const StaffSubscriptions = lazy(() => import('./pages/staff/Subscriptions'));
// const StaffPayouts = lazy(() => import('./pages/staff/Payouts'));
// const StaffPayoutMethods = lazy(() => import('./pages/staff/PayoutMethods'));
const StaffVideos = lazy(() => import('./pages/staff/Videos'));
const StaffAddStaff = lazy(() => import('./pages/staff/AddStaff'));
const StaffAllStaff = lazy(() => import('./pages/staff/AllStaff'));
const StaffEditStaff = lazy(() => import('./pages/staff/EditStaff'));

{/* Admin Pages */ }
const AdminLayout = lazy(() => import('./pages/admin/Layout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AllUsers = lazy(() => import('./pages/admin/AllUsers'));
const AdminEditUser = lazy(() => import('./pages/admin/EditUser'));
const AllCashiers = lazy(() => import('./pages/admin/AllCashiers'));
const AddCashier = lazy(() => import('./pages/admin/AddCashier'));
const AdminAllAuctions = lazy(() => import('./pages/admin/AllAuctions'));
const AdminCreateAuction = lazy(() => import('./pages/admin/CreateAuction'));
const AdminEditAuction = lazy(() => import('./pages/admin/EditAuction'));
const UserQueries = lazy(() => import('./pages/admin/UserQueries'));
const AdminNotifications = lazy(() => import('./pages/admin/Notifications'));
const AdminProfile = lazy(() => import('./pages/admin/Profile'));
const AdminComments = lazy(() => import('./pages/admin/Comments'));
const Commissions = lazy(() => import('./pages/admin/Commissions'));
// const DepositSettings = lazy(() => import('./pages/admin/DepositSettings'));
const AdminBidHistory = lazy(() => import('./pages/admin/BidHistory'));
const AdminAllOffers = lazy(() => import('./pages/admin/AllOffers'));
const Transactions = lazy(() => import('./pages/admin/Transactions'));
const Categories = lazy(() => import('./pages/admin/Categories'));
const Subscriptions = lazy(() => import('./pages/admin/Subscriptions'));
// const AdminPayouts = lazy(() => import('./pages/admin/Payouts'));
// const AdminPayoutMethods = lazy(() => import('./pages/admin/PayoutMethods'));
const AdminVideos = lazy(() => import('./pages/admin/Videos'));
const AddStaff = lazy(() => import('./pages/admin/AddStaff'));
const AllStaff = lazy(() => import('./pages/admin/AllStaff'));
const EditStaff = lazy(() => import('./pages/admin/EditStaff'));
const AdminAllMembers = lazy(() => import('./pages/admin/AllMembers'));
const AdminEditMember = lazy(() => import('./pages/admin/EditMember'));

createRoot(document.getElementById('root')).render(
    //<StrictMode>
    <AuthProvider>
        <PopUpContextProvider>
            <ThemeProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path='/' element={<App />}>
                            <Route path='' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><Home /></Suspense>} />

                            <Route path='/contact' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><Contact /></Suspense>} />

                            <Route path='/about' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><About /></Suspense>} />

                            <Route path='/faqs' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><FAQs /></Suspense>} />

                            <Route path='/login' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><Login /></Suspense>} />

                            <Route path='/register' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><Register /></Suspense>} />

                            <Route path='/verify-email/:token' element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><VerifyEmail /></Suspense>} />

                            <Route path='/auctions' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><Auctions /></Suspense>} />

                            <Route path='/checkout/:auctionId' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><Checkout /></Suspense>} />

                            <Route path='/auction/:id' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><SingleAuction /></Suspense>} />

                            <Route path='/privacy-policy' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><PrivacyPolicy /></Suspense>} />

                            <Route path='/terms-of-use' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><TermsOfUse /></Suspense>} />

                            <Route path='/payment-refund-policy' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><PaymentRefundPolicy /></Suspense>} />

                            <Route path='/seller-agreement' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><SellerAgreement /></Suspense>} />

                            <Route path='/buyer-agreement' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><BuyerAgreement /></Suspense>} />

                            <Route path='/reset-password' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><ResetPassword /></Suspense>} />

                            <Route path='/past-auctions' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><BargainDeals /></Suspense>} />
                        </Route>

                        {/* Seller Layout */}
                        <Route path='/seller' element={<Protected authetication={true} userType='seller'><SellerLayout /></Protected>}>
                            {/* Seller Dashboard */}
                            <Route
                                path='/seller/dashboard'
                                index={true}
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <SellerDashboard />
                                    </Suspense>
                                }
                            />
                            {/* Seller Create Auction */}
                            <Route
                                path='/seller/auctions/create'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <CreateAuctionSeller />
                                    </Suspense>
                                }
                            />
                            {/* Seller Edit Auction */}
                            <Route
                                path='/seller/auctions/edit/:auctionId'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <EditAuctionSeller />
                                    </Suspense>
                                }
                            />
                            {/* Seller Live Auctions */}
                            <Route
                                path='/seller/auctions/all'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <SellerAllAuctions />
                                    </Suspense>
                                }
                            />
                            {/* Seller All Offers */}
                            <Route
                                path='/seller/offers/all'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <SellerAllOffers />
                                    </Suspense>
                                }
                            />
                            {/* Seller Won Auctions */}
                            <Route
                                path='/seller/auctions/sold'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <SoldAuctionsSeller />
                                    </Suspense>
                                }
                            />
                            {/* Seller Auctions Bid History */}
                            <Route
                                path='/seller/bids/history'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <BidHistorySeller />
                                    </Suspense>
                                }
                            />
                            {/* Seller Profile */}
                            <Route
                                path='/seller/profile'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <SellerProfile />
                                    </Suspense>
                                }
                            />
                            {/* Seller Notifications */}
                            {/* <Route
                                path='/seller/notifications'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <SellerNotifications />
                                    </Suspense>
                                }
                            /> */}

                            {/* Seller Billing */}
                            {/* <Route
                                path='/seller/billing'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <SellerBilling />
                                    </Suspense>
                                }
                            /> */}

                            {/* Seller Payout methods */}
                            <Route
                                path='/seller/payout-methods'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <SellerPayoutMethods />
                                    </Suspense>
                                }
                            />

                            {/* Seller Payouts */}
                            <Route
                                path='/seller/payouts'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <SellerPayouts />
                                    </Suspense>
                                }
                            />
                        </Route>

                        {/* Broker Layout */}
                        <Route path='/broker' element={<Protected authetication={true} userType='broker'><BrokerLayout /></Protected>}>
                            {/* Broker Dashboard */}
                            <Route
                                path='/broker/dashboard'
                                index={true}
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <BrokerDashboard />
                                    </Suspense>
                                }
                            />
                            {/* Broker Create Auction */}
                            <Route
                                path='/broker/auctions/create'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <CreateAuctionBroker />
                                    </Suspense>
                                }
                            />
                            {/* Broker Edit Auction */}
                            <Route
                                path='/broker/auctions/edit/:auctionId'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <EditAuctionBroker />
                                    </Suspense>
                                }
                            />
                            {/* Broker Live Auctions */}
                            <Route
                                path='/broker/auctions/all'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <BrokerAllAuctions />
                                    </Suspense>
                                }
                            />
                            {/* Broker All Offers */}
                            <Route
                                path='/broker/offers/all'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <BrokerAllOffers />
                                    </Suspense>
                                }
                            />
                            {/* Broker Won Auctions */}
                            <Route
                                path='/broker/auctions/sold'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <SoldAuctionsBroker />
                                    </Suspense>
                                }
                            />
                            {/* Broker Auctions Bid History */}
                            <Route
                                path='/broker/bids/history'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <BidHistoryBroker />
                                    </Suspense>
                                }
                            />
                            {/* Broker Profile */}
                            <Route
                                path='/broker/profile'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <BrokerProfile />
                                    </Suspense>
                                }
                            />
                            {/* Broker Notifications */}
                            {/* <Route
                                path='/broker/notifications'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <BrokerNotifications />
                                    </Suspense>
                                }
                            /> */}

                            {/* Broker Billing */}
                            {/* <Route
                                path='/broker/billing'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <BrokerBilling />
                                    </Suspense>
                                }
                            /> */}
                        </Route>

                        {/* Bidder Layout */}
                        <Route path='/bidder' element={<Protected authetication={true} userType='bidder'><BidderLayout /></Protected>}>
                            {/* Bidder Dashboard */}
                            <Route
                                path='/bidder/dashboard'
                                index={true}
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <BidderDashboard />
                                    </Suspense>
                                }
                            />

                            {/* Bidder Watchlist */}
                            <Route
                                path='/bidder/watchlist'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <Watchlist />
                                    </Suspense>
                                }
                            />

                            {/* Bidder Active Auctions */}
                            <Route
                                path='/bidder/auctions/active'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <ActiveAuctions />
                                    </Suspense>
                                }
                            />

                            {/* Bidder Upcoming Auctions */}
                            <Route
                                path='/bidder/auctions/upcoming'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <UpcomingAuctions />
                                    </Suspense>
                                }
                            />

                            {/* Bidder My Bids */}
                            <Route
                                path='/bidder/bids'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <MyBids />
                                    </Suspense>
                                }
                            />

                            {/* Bidder My Offers */}
                            <Route
                                path='/bidder/offers'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <MyOffers />
                                    </Suspense>
                                }
                            />

                            {/* Bidder My Bids */}
                            <Route
                                path='/bidder/auctions/won'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <WonAuctions />
                                    </Suspense>
                                }
                            />

                            {/* Bidder Past Auctions */}
                            <Route
                                path='/bidder/auctions/past'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <BidderPastAuctions />
                                    </Suspense>
                                }
                            />

                            {/* Bidder Profile */}
                            <Route
                                path='/bidder/profile'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <BidderProfile />
                                    </Suspense>
                                }
                            />
                            {/* Bidder Subscriptions */}
                            <Route
                                path='/bidder/subscriptions'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <BidderSubscriptions />
                                    </Suspense>
                                }
                            />

                            {/* Bidder All Members */}
                            <Route
                                path='/bidder/members/all'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <BidderAllMembers />
                                    </Suspense>
                                }
                            />

                            {/* Bidder Add Members */}
                            <Route
                                path='/bidder/members/add'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <BidderAddMember />
                                    </Suspense>
                                }
                            />

                            {/* Bidder Notifications */}
                            {/* <Route
                                path='/bidder/notifications'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <BidderNotifications />
                                    </Suspense>
                                }
                            /> */}

                            {/* Bidder Billing */}
                            <Route
                                path='/bidder/billing'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <BidderBilling />
                                    </Suspense>
                                }
                            />

                            {/* Bidder Videos */}
                            {/* <Route
                                path='/bidder/videos'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <BidderVideos />
                                    </Suspense>
                                }
                            /> */}
                        </Route>

                        {/* Cashier Layout */}
                        <Route path='/cashier' element={<Protected authetication={true} userType='cashier'><CashierLayout /></Protected>}>
                            {/* Cashier Dashboard */}
                            <Route
                                path='/cashier/dashboard'
                                index={true}
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <CashierDashboard />
                                    </Suspense>
                                }
                            />
                            {/* Cashier Profile */}
                            <Route
                                path='/cashier/profile'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <CashierProfile />
                                    </Suspense>
                                }
                            />
                        </Route>

                        {/* Admin Layout */}
                        <Route path='/admin' element={<Protected authetication={true} userType='admin'><AdminLayout /></Protected>} >
                            {/* Admin Dashboard */}
                            <Route
                                path='/admin/dashboard'
                                index={true}
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AdminDashboard />
                                    </Suspense>
                                }
                            />

                            {/* Admin All Users */}
                            <Route
                                path='/admin/users'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AllUsers />
                                    </Suspense>
                                }
                            />

                            {/* Admin Edit User */}
                            <Route
                                path='/admin/users/edit/:id'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AdminEditUser />
                                    </Suspense>
                                }
                            />

                            {/* Admin All Cashiers */}
                            <Route
                                path='/admin/cashiers'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AllCashiers />
                                    </Suspense>
                                }
                            />

                            {/* Admin Add Cashier */}
                            <Route
                                path='/admin/cashiers/add'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AddCashier />
                                    </Suspense>
                                }
                            />

                            {/* Admin All Staff */}
                            <Route
                                path='/admin/staff'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AllStaff />
                                    </Suspense>
                                }
                            />

                            {/* Admin Add Staff */}
                            <Route
                                path='/admin/staff/add'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AddStaff />
                                    </Suspense>
                                }
                            />

                            {/* Admin Edit Staff */}
                            <Route
                                path='/admin/staff/edit/:id'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <EditStaff />
                                    </Suspense>
                                }
                            />

                            {/* Admin Subscriptions */}
                            <Route
                                path='/admin/subscriptions'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <Subscriptions />
                                    </Suspense>
                                }
                            />

                            {/* Admin All Members */}
                            <Route
                                path='/admin/members/all'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AdminAllMembers />
                                    </Suspense>
                                }
                            />

                            {/* Admin Edit Member */}
                            <Route
                                path='/admin/members/edit/:memberId'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AdminEditMember />
                                    </Suspense>
                                }
                            />

                            {/* Admin All Auctions */}
                            <Route
                                path='/admin/auctions/all'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AdminAllAuctions />
                                    </Suspense>
                                }
                            />

                            {/* Admin All Auctions */}
                            <Route
                                path='/admin/auctions/create'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AdminCreateAuction />
                                    </Suspense>
                                }
                            />

                            {/* Admin Edit Auction */}
                            <Route
                                path='/admin/auctions/edit/:auctionId'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AdminEditAuction />
                                    </Suspense>
                                }
                            />

                            {/* Admin Categories */}
                            <Route
                                path='/admin/categories'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <Categories />
                                    </Suspense>
                                }
                            />

                            {/* Admin Support */}
                            <Route
                                path='/admin/support/inquiries'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <UserQueries />
                                    </Suspense>
                                }
                            />

                            {/* Admin Notifications */}
                            {/* <Route
                                path='/admin/notifications'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AdminNotifications />
                                    </Suspense>
                                }
                            /> */}

                            {/* Admin Profile */}
                            <Route
                                path='/admin/profile'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AdminProfile />
                                    </Suspense>
                                }
                            />

                            {/* Admin Comments */}
                            <Route
                                path='/admin/comments'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AdminComments />
                                    </Suspense>
                                }
                            />

                            {/* Admin Commissions */}
                            <Route
                                path='/admin/commissions'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <Commissions />
                                    </Suspense>
                                }
                            />

                            {/* Admin Deposit Settings */}
                            {/* <Route
                                path='/admin/deposit-settings'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <DepositSettings />
                                    </Suspense>
                                }
                            /> */}

                            {/* Admin Bids */}
                            <Route
                                path='/admin/bids'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AdminBidHistory />
                                    </Suspense>
                                }
                            />

                            {/* Admin Offers */}
                            <Route
                                path='/admin/offers'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AdminAllOffers />
                                    </Suspense>
                                }
                            />

                            {/* Admin Transactions */}
                            <Route
                                path='/admin/transactions'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <Transactions />
                                    </Suspense>
                                }
                            />

                            {/* Admin Payouts */}
                            {/* <Route
                                path='/admin/payouts'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AdminPayouts />
                                    </Suspense>
                                }
                            /> */}

                            {/* Admin Payout Methods */}
                            {/* <Route
                                path='/admin/payout-methods'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AdminPayoutMethods />
                                    </Suspense>
                                }
                            /> */}

                            {/* Admin Videos */}
                            <Route
                                path='/admin/videos'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AdminVideos />
                                    </Suspense>
                                }
                            />
                        </Route>

                        {/* Staff Layout */}
                        <Route path='/staff' element={<Protected authetication={true} userType='staff'><StaffLayout /></Protected>} >
                            {/* Staff Dashboard */}
                            <Route
                                path='/staff/dashboard'
                                index={true}
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <StaffDashboard />
                                    </Suspense>
                                }
                            />

                            {/* Staff All Users */}
                            <Route
                                path='/staff/users'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <StaffAllUsers />
                                    </Suspense>
                                }
                            />

                            {/* Staff All Cashiers */}
                            <Route
                                path='/staff/cashiers'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <StaffAllCashiers />
                                    </Suspense>
                                }
                            />

                            {/* Staff Add Cashier */}
                            <Route
                                path='/staff/cashiers/add'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <StaffAddCashier />
                                    </Suspense>
                                }
                            />

                            {/* Staff All Staff */}
                            <Route
                                path='/staff/staff'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <StaffAllStaff />
                                    </Suspense>
                                }
                            />

                            {/* Staff Add Staff */}
                            <Route
                                path='/staff/staff/add'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <StaffAddStaff />
                                    </Suspense>
                                }
                            />

                            {/* Staff Edit Staff */}
                            <Route
                                path='/staff/staff/edit/:id'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <StaffEditStaff />
                                    </Suspense>
                                }
                            />

                            {/* Staff Subscriptions */}
                            <Route
                                path='/staff/subscriptions'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <StaffSubscriptions />
                                    </Suspense>
                                }
                            />

                            {/* Staff All Auctions */}
                            <Route
                                path='/staff/auctions/all'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <StaffAllAuctions />
                                    </Suspense>
                                }
                            />

                            {/* Staff Create Auction */}
                            <Route
                                path='/staff/auctions/create'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <StaffCreateAuction />
                                    </Suspense>
                                }
                            />

                            {/* Staff Edit Auction */}
                            <Route
                                path='/staff/auctions/edit/:auctionId'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <StaffEditAuction />
                                    </Suspense>
                                }
                            />

                            {/* Staff Categories */}
                            <Route
                                path='/staff/categories'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <StaffCategories />
                                    </Suspense>
                                }
                            />

                            {/* Staff Support */}
                            <Route
                                path='/staff/support/inquiries'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <StaffUserQueries />
                                    </Suspense>
                                }
                            />

                            {/* Staff Notifications */}
                            {/* <Route
                                path='/staff/notifications'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <StaffNotifications />
                                    </Suspense>
                                }
                            /> */}

                            {/* Staff Profile */}
                            <Route
                                path='/staff/profile'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <StaffProfile />
                                    </Suspense>
                                }
                            />

                            {/* Staff Comments */}
                            <Route
                                path='/staff/comments'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <StaffComments />
                                    </Suspense>
                                }
                            />

                            {/* Staff Commissions */}
                            <Route
                                path='/staff/commissions'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <StaffCommissions />
                                    </Suspense>
                                }
                            />

                            {/* Staff Deposit Settings */}
                            {/* <Route
                                path='/staff/deposit-settings'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <StaffDepositSettings />
                                    </Suspense>
                                }
                            /> */}

                            {/* Staff Bids */}
                            <Route
                                path='/staff/bids'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <StaffBidHistory />
                                    </Suspense>
                                }
                            />

                            {/* Staff Offers */}
                            <Route
                                path='/staff/offers'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <StaffAllOffers />
                                    </Suspense>
                                }
                            />

                            {/* Staff Transactions */}
                            <Route
                                path='/staff/transactions'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <StaffTransactions />
                                    </Suspense>
                                }
                            />

                            {/* Staff Payouts */}
                            {/* <Route
                                path='/staff/payouts'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <StaffPayouts />
                                    </Suspense>
                                }
                            /> */}

                            {/* Staff Payout Methods */}
                            {/* <Route
                                path='/staff/payout-methods'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <StaffPayoutMethods />
                                    </Suspense>
                                }
                            /> */}

                            {/* Staff Videos */}
                            <Route
                                path='/staff/videos'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <StaffVideos />
                                    </Suspense>
                                }
                            />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </ThemeProvider>
        </PopUpContextProvider>
    </AuthProvider>
    //</StrictMode>,
)

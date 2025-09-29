import Layout from "./Layout.jsx";

import Home from "./Home";

import Listings from "./Listings";

import Listing from "./Listing";

import CreateListing from "./CreateListing";

import Profile from "./Profile";

import Support from "./Support";

import AdminDashboard from "./AdminDashboard";

import Messages from "./Messages";

import Reservations from "./Reservations";
import Login from "./Login";

import HostDashboard from "./HostDashboard";

import UserDashboard from "./UserDashboard";

import PaymentGuide from "./PaymentGuide";

import UserProfile from "./UserProfile";

import Admin from "./Admin";

import Dashboard from "./Dashboard";

import PaymentSuccess from "./PaymentSuccess";

import ConnectDemoOnboarding from "./ConnectDemoOnboarding";

import ConnectDemoStorefront from "./ConnectDemoStorefront";

import ConnectDemoSuccess from "./ConnectDemoSuccess";

import EditListing from "./EditListing";

import Notifications from "./Notifications";

import Payment from "./Payment";

import Terms from "./Terms";

import Privacy from "./Privacy";

import HostGuide from "./HostGuide";

import Safety from "./Safety";

import PaymentAudit from "./PaymentAudit";

import ReservationAction from "./ReservationAction";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Listings: Listings,
    
    Listing: Listing,
    
    CreateListing: CreateListing,
    
    Profile: Profile,
    
    Support: Support,
    
    AdminDashboard: AdminDashboard,
    
    Messages: Messages,
    
    Reservations: Reservations,
    
    HostDashboard: HostDashboard,
    
    UserDashboard: UserDashboard,
    
    PaymentGuide: PaymentGuide,
    
    UserProfile: UserProfile,
    
    Admin: Admin,
    
    Dashboard: Dashboard,
    
    PaymentSuccess: PaymentSuccess,
    
    ConnectDemoOnboarding: ConnectDemoOnboarding,
    
    ConnectDemoStorefront: ConnectDemoStorefront,
    
    ConnectDemoSuccess: ConnectDemoSuccess,
    
    EditListing: EditListing,
    
    Notifications: Notifications,
    
    Payment: Payment,
    
    Terms: Terms,
    
    Privacy: Privacy,
    
    HostGuide: HostGuide,
    
    Safety: Safety,
    
    PaymentAudit: PaymentAudit,
    
    ReservationAction: ReservationAction,
    Login: Login,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Listings" element={<Listings />} />
                
                <Route path="/Listing" element={<Listing />} />
                
                <Route path="/CreateListing" element={<CreateListing />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Support" element={<Support />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/Messages" element={<Messages />} />
                
                <Route path="/Reservations" element={<Reservations />} />
                
                <Route path="/HostDashboard" element={<HostDashboard />} />
                
                <Route path="/UserDashboard" element={<UserDashboard />} />
                
                <Route path="/PaymentGuide" element={<PaymentGuide />} />
                
                <Route path="/UserProfile" element={<UserProfile />} />
                
                <Route path="/Admin" element={<Admin />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/PaymentSuccess" element={<PaymentSuccess />} />
                
                <Route path="/ConnectDemoOnboarding" element={<ConnectDemoOnboarding />} />
                
                <Route path="/ConnectDemoStorefront" element={<ConnectDemoStorefront />} />
                
                <Route path="/ConnectDemoSuccess" element={<ConnectDemoSuccess />} />
                
                <Route path="/EditListing" element={<EditListing />} />
                
                <Route path="/Notifications" element={<Notifications />} />
                <Route path="/login" element={<Login />} />
                
                <Route path="/Payment" element={<Payment />} />
                
                <Route path="/Terms" element={<Terms />} />
                
                <Route path="/Privacy" element={<Privacy />} />
                
                <Route path="/HostGuide" element={<HostGuide />} />
                
                <Route path="/Safety" element={<Safety />} />
                
                <Route path="/PaymentAudit" element={<PaymentAudit />} />
                
                <Route path="/ReservationAction" element={<ReservationAction />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}
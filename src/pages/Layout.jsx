

import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import {
  MessageSquare,
  User as UserIcon,
  LogOut,
  Shield,
  Menu,
  Globe,
  X,
  LayoutGrid
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import LanguageModal from "@/components/ui/LanguageModal";
import { LocalizationProvider, LocalizationContext } from "@/components/ui/LocalizationProvider";
import NotificationBell from "@/components/ui/NotificationBell";
import DebugPanel from "@/components/ui/DebugPanel";

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.split(' ');
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
  return `${first}${last}`.toUpperCase();
};

const generateBgColor = (id) => {
  if (!id) return "#cccccc";
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
};

const AppLayout = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useContext(LocalizationContext);

  const ADMIN_USER_EMAILS = ["gideon@base44.ai", "lawrencemurry@yahoo.com"];

  useEffect(() => {
    loadUser();

    const handleProfileUpdate = (event) => {
      setUser(event.detail);
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);

    // **FIX: Always redirect root path to Home page without authentication check**
    if (location.pathname === '/' || location.pathname === '') {
      navigate(createPageUrl("Home"), { replace: true });
    }

    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, [location.pathname, navigate]);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      console.log('User loaded in layout:', userData.email);
    } catch (error) {
      console.error('Error loading user in layout:', error);
      // **FIX: Don't redirect to login for unauthenticated users, just set user to null**
      setUser(null);
      
      // Only log the error if it's not a simple "not authenticated" case
      if (error.response?.status !== 401 && !error.message?.includes('not authenticated')) {
        console.warn('Unexpected error loading user:', error);
      }
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      setUser(null);
      navigate(createPageUrl("Home"), { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      navigate(createPageUrl("Home"), { replace: true });
    }
  };

  const handleLogin = async () => {
    await User.loginWithRedirect(window.location.href);
  };

  const isAdmin = () => {
    return user && ADMIN_USER_EMAILS.includes(user.email);
  };

  const displayName = user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User';

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to={createPageUrl("Home")} className="flex items-center hover:opacity-80 transition-opacity">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/799ff5fbb_bouncie-house-logo.png" alt="BouncieHouse Logo" className="h-12" />
            </Link>
            <div className="flex items-center space-x-4">
              <Link to={createPageUrl("Listings")} className="hidden md:block text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors">
                {t('find_a_bounce_house') || 'Find Bounce Houses'}
              </Link>
              <Link to={createPageUrl("CreateListing")} className="hidden md:block text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full px-4 py-2 transition-colors">
                List Your Bounce House
              </Link>
              <button onClick={() => setLanguageModalOpen(true)} className="p-2 text-gray-400 hover:text-gray-500">
                <Globe className="h-5 w-5" />
              </button>

              {!isLoading && user && <NotificationBell />}

              {!isLoading && (
                user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.profile_image} />
                          <AvatarFallback style={{ backgroundColor: generateBgColor(user.id) }} className="text-white font-bold">
                            {getInitials(displayName)}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isAdmin() && (
                          <DropdownMenuItem onSelect={() => navigate(createPageUrl("Admin"))}>
                              <Shield className="w-4 h-4 mr-2" />
                              Admin Panel
                          </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onSelect={() => navigate(createPageUrl("Messages"))}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Messages
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => navigate(createPageUrl("Dashboard"))}>
                        <LayoutGrid className="w-4 h-4 mr-2" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => navigate(createPageUrl("Profile"))}>
                        <UserIcon className="w-4 h-4 mr-2" />
                        Profile & Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button onClick={handleLogin}>Log in</Button>
                )
              )}
              <button
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              <Link to={createPageUrl("Listings")} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                {t('find_a_bounce_house') || 'Find Bounce Houses'}
              </Link>
              <Link to={createPageUrl("CreateListing")} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                List Your Bounce House
              </Link>
            </div>
          </div>
        )}
      </header>
      <main>{children}</main>
      <LanguageModal isOpen={languageModalOpen} onClose={() => setLanguageModalOpen(false)} />
      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link to={createPageUrl("Home")} className="flex items-center mb-4">
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/799ff5fbb_bouncie-house-logo.png" alt="BouncieHouse" className="h-8" />
              </Link>
              <p className="text-gray-600 mb-4">
                Making every celebration unforgettable with safe, fun, and reliable bounce house rentals.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link to={createPageUrl("Support")} className="hover:text-gray-900">Support</Link></li>
                <li><Link to={createPageUrl("Terms")} className="hover:text-gray-900">Terms of Service</Link></li>
                <li><Link to={createPageUrl("Privacy")} className="hover:text-gray-900">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Hosting</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link to={createPageUrl("CreateListing")} className="hover:text-gray-900">List Your Bounce House</Link></li>
                <li><Link to={createPageUrl("HostGuide")} className="hover:text-gray-900">Host Guide</Link></li>
                <li><Link to={createPageUrl("Safety")} className="hover:text-gray-900">Safety Standards</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
            <p className="text-sm text-gray-500 md:mt-0 md:order-1">
              &copy; 2024 BouncieHouse, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Layout(props) {
  return (
    <LocalizationProvider>
      <AppLayout {...props} />
      <DebugPanel />
    </LocalizationProvider>
  );
}


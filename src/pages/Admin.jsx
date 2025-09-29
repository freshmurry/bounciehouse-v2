
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/api/entities';
import { Listing } from '@/api/entities';
import { Review } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Users, Home, Star, Search, Edit, Trash2, Plus, AlertTriangle, BarChart3, Pause, Play, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UserAvatar from '../components/ui/UserAvatar';
import EditUserModal from '../components/admin/EditUserModal';

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isCheckingAccess, setIsCheckingAccess] = useState(true); // For initial access check
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data states
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [usersById, setUsersById] = useState({});
  
  // Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [hostCreationStatus, setHostCreationStatus] = useState(null);

  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    try {
      const [usersData, listingsData, reviewsData] = await Promise.all([
        User.list(),
        Listing.list(),
        Review.list()
      ]);
      
      setUsers(usersData);
      setListings(listingsData);
      setReviews(reviewsData);

      const usersMap = usersData.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});
      setUsersById(usersMap);

    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  }, []);

  const checkAdminAccess = useCallback(async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      // SECURITY FIX: Use database role instead of hardcoded emails
      if (!user.role || (user.role !== 'admin' && (user.admin_level || 0) < 2)) {
        navigate(createPageUrl("Home"));
        return;
      }

      await loadData();
    } catch {
      navigate(createPageUrl("Home"));
    } finally {
      setIsCheckingAccess(false);
    }
  }, [loadData, navigate]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  const deleteItem = async (entity, id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) return;
    
    try {
      await entity.delete(id);
      loadData();
      alert(`${type} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      alert(`Failed to delete ${type}`);
    }
  };
  
  const toggleListingStatus = async (listing) => {
    try {
        await Listing.update(listing.id, { is_active: !listing.is_active });
        loadData();
    } catch (error) {
        console.error('Error updating listing status:', error);
        alert('Failed to update listing status.');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
  };
  
  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = () => {
    handleCloseUserModal();
    loadData();
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsUserModalOpen(true);
  };

  const handleCreateHostUsers = async () => {
    try {
      setHostCreationStatus('loading');
      const { createHostUsers } = await import('@/api/functions');
      const response = await createHostUsers();
      setHostCreationStatus('success');
      console.log('Host users created:', response.data);
    } catch (error) {
      console.error('Error creating host users:', error);
      setHostCreationStatus('error');
    }
  };

  if (isCheckingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // SECURITY FIX: Use database role check instead of hardcoded emails
  if (!currentUser || (!currentUser.role || (currentUser.role !== 'admin' && (currentUser.admin_level || 0) < 2))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, color = "blue" }) => {
    const colorClasses = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
      green: { bg: 'bg-green-100', text: 'text-green-600' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    };
    const selectedColor = colorClasses[color] || colorClasses.blue;

    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center">
          <div className={`p-3 ${selectedColor.bg} rounded-lg mr-4`}>
            <Icon className={`w-6 h-6 ${selectedColor.text}`} />
          </div>
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard icon={Users} title="Total Users" value={users.length} color="blue" />
        <StatCard icon={Home} title="Total Listings" value={listings.length} color="green" />
        <StatCard icon={Star} title="Total Reviews" value={reviews.length} color="yellow" />
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {users.slice(-5).map(user => (
            <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span>New user: {user.first_name} {user.last_name}</span>
              <span className="text-sm text-gray-500">
                {new Date(user.created_date).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => {
    const filteredUsers = users.filter(user => 
      `${user.first_name || ''} ${user.last_name || ''} ${user.email || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">Users ({filteredUsers.length})</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
          <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <UserAvatar user={user} size="sm" />
                        <div className="ml-3 text-sm font-medium text-gray-900">
                            {user.first_name || user.full_name} {user.last_name}
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <div className="group relative">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => navigate(createPageUrl(`CreateListing?host_id=${user.id}`))}
                        >
                          <PlusCircle className="w-4 h-4 text-green-600" />
                        </Button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Create listing for user
                        </div>
                      </div>
                      
                      <div className="group relative">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Edit user
                        </div>
                      </div>
                      
                      <div className="group relative">
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => deleteItem(User, user.id, 'user')}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Delete user
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderListings = () => {
    const filteredListings = listings.filter(listing => 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">Listings ({filteredListings.length})</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
           <table className="w-full min-w-max">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Host</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredListings.map((listing) => {
                const host = usersById[listing.host_id];
                const price = listing.pricing_model === 'daily' ? listing.price_per_day : listing.price_per_hour;
                const priceUnit = listing.pricing_model === 'daily' ? 'day' : 'hour';

                return (
                  <tr key={listing.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <img src={listing.images?.[0] || '/api/placeholder/40/40'} alt={listing.title} className="w-10 h-10 rounded-md object-cover" />
                            <div className="ml-3 text-sm font-medium text-gray-900">{listing.title}</div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        {host ? (
                            <div className="flex items-center">
                                <UserAvatar user={host} size="sm" />
                                <div className="ml-3 text-sm text-gray-700">{host.first_name} {host.last_name}</div>
                            </div>
                        ) : (
                            <span className="text-sm text-gray-500">Unknown Host</span>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {listing.location?.city}, {listing.location?.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${price}/{priceUnit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${listing.is_active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {listing.is_active ? 'Active' : 'Paused'}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="group relative">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => navigate(createPageUrl(`CreateListing?id=${listing.id}`))}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              Edit listing
                            </div>
                          </div>
                          
                          <div className="group relative">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => toggleListingStatus(listing)}
                            >
                              {listing.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </Button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {listing.is_active ? 'Pause listing' : 'Activate listing'}
                            </div>
                          </div>
                          
                          <div className="group relative">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => deleteItem(Listing, listing.id, 'listing')}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              Delete listing
                            </div>
                          </div>
                        </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderReviews = () => {
    const filteredReviews = reviews.filter(review => 
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">Reviews ({filteredReviews.length})</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.created_date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
                <div className="flex space-x-2">
                  <div className="group relative">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Edit review
                    </div>
                  </div>
                  
                  <div className="group relative">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteItem(Review, review.id, 'review')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Delete review
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'listings', label: 'Listings', icon: Home },
    { id: 'reviews', label: 'Reviews', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <EditUserModal 
        isOpen={isUserModalOpen}
        onClose={handleCloseUserModal}
        user={editingUser}
        onSave={handleSaveUser}
      />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your BouncieHouse platform</p>
        </div>

        {/* Host Users Creation Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">System Setup</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Create Host Users</h4>
                <p className="text-sm text-gray-600">Create sample host users for listings</p>
              </div>
              <Button 
                onClick={handleCreateHostUsers}
                disabled={hostCreationStatus === 'loading'}
                variant={hostCreationStatus === 'success' ? 'default' : 'outline'}
              >
                {hostCreationStatus === 'loading' && 'Creating...'}
                {hostCreationStatus === 'success' && 'Created ✓'}
                {hostCreationStatus === 'error' && 'Error - Retry'}
                {!hostCreationStatus && 'Create Hosts'}
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === item.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-2" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'listings' && renderListings()}
          {activeTab === 'reviews' && renderReviews()}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import {
    BarChart3, PackageOpen, Users, ShoppingBag, FileText as FileIcon, Settings, Bell,
    LogOut, Search, Plus, Eye, Edit, Trash2, CheckCircle, XCircle, AlertCircle,
    Star, DollarSign, CreditCard, Activity, Clock, Download,
    // Icons for mock data
    Car, HomeIcon as HomeIcon2, Smartphone, Laptop, Sofa,
    Shirt, Baby, Book, Music, Dumbbell, Gamepad2, Package
} from 'lucide-react';

// --- MOCK DATA (Previously in mockData.js) ---

// Categories with subcategories data
const categories = [
    {
        id: 1,
        name: 'Vehicles',
        icon: <Car className="w-8 h-8" />,
        count: 1250,
        color: 'bg-blue-100 text-blue-600',
        subcategories: [
            { id: 11, name: 'Cars', count: 850 },
            { id: 12, name: 'Motorcycles', count: 300 },
            { id: 13, name: 'Scooters', count: 100 }
        ]
    },
    {
        id: 2,
        name: 'Properties',
        icon: <HomeIcon2 className="w-8 h-8" />,
        count: 890,
        color: 'bg-green-100 text-green-600',
        subcategories: [
            { id: 21, name: 'Apartments', count: 500 },
            { id: 22, name: 'Houses', count: 250 },
            { id: 23, name: 'Commercial', count: 140 }
        ]
    },
    {
        id: 3,
        name: 'Mobiles',
        icon: <Smartphone className="w-8 h-8" />,
        count: 2100,
        color: 'bg-purple-100 text-purple-600',
        subcategories: [
            { id: 31, name: 'Smartphones', count: 1500 },
            { id: 32, name: 'Feature Phones', count: 300 },
            { id: 33, name: 'Accessories', count: 300 }
        ]
    },
    {
        id: 4,
        name: 'Electronics',
        icon: <Laptop className="w-8 h-8" />,
        count: 1560,
        color: 'bg-orange-100 text-orange-600',
        subcategories: [
            { id: 41, name: 'Laptops', count: 600 },
            { id: 42, name: 'TVs', count: 400 },
            { id: 43, name: 'Cameras', count: 300 },
            { id: 44, name: 'Audio', count: 260 }
        ]
    },
    {
        id: 5,
        name: 'Furniture',
        icon: <Sofa className="w-8 h-8" />,
        count: 670,
        color: 'bg-yellow-100 text-yellow-600',
        subcategories: [
            { id: 51, name: 'Sofas', count: 200 },
            { id: 52, name: 'Beds', count: 170 },
            { id: 53, name: 'Tables', count: 150 },
            { id: 54, name: 'Chairs', count: 150 }
        ]
    },
    {
        id: 6,
        name: 'Fashion',
        icon: <Shirt className="w-8 h-8" />,
        count: 1890,
        color: 'bg-pink-100 text-pink-600',
        subcategories: [
            { id: 61, name: "Men's Clothing", count: 800 },
            { id: 62, name: "Women's Clothing", count: 800 },
            { id: 63, name: 'Footwear', count: 290 }
        ]
    },
    {
        id: 7,
        name: 'Kids',
        icon: <Baby className="w-8 h-8" />,
        count: 430,
        color: 'bg-red-100 text-red-600',
        subcategories: [
            { id: 71, name: 'Toys', count: 200 },
            { id: 72, name: 'Clothing', count: 150 },
            { id: 73, name: 'Furniture', count: 80 }
        ]
    },
    {
        id: 8,
        name: 'Books',
        icon: <Book className="w-8 h-8" />,
        count: 320,
        color: 'bg-indigo-100 text-indigo-600',
        subcategories: [
            { id: 81, name: 'Fiction', count: 120 },
            { id: 82, name: 'Non-Fiction', count: 100 },
            { id: 83, name: 'Educational', count: 100 }
        ]
    },
    {
        id: 9,
        name: 'Hobbies',
        icon: <Music className="w-8 h-8" />,
        count: 560,
        color: 'bg-teal-100 text-teal-600',
        subcategories: [
            { id: 91, name: 'Musical Instruments', count: 200 },
            { id: 92, name: 'Art Supplies', count: 180 },
            { id: 93, name: 'Crafts', count: 180 }
        ]
    },
    {
        id: 10,
        name: 'Sports',
        icon: <Dumbbell className="w-8 h-8" />,
        count: 280,
        color: 'bg-cyan-100 text-cyan-600',
        subcategories: [
            { id: 101, name: 'Fitness Equipment', count: 150 },
            { id: 102, name: 'Outdoor Gear', count: 130 }
        ]
    },
    {
        id: 11,
        name: 'Gaming',
        icon: <Gamepad2 className="w-8 h-8" />,
        count: 450,
        color: 'bg-lime-100 text-lime-600',
        subcategories: [
            { id: 111, name: 'Consoles', count: 200 },
            { id: 112, name: 'Games', count: 150 },
            { id: 113, name: 'Accessories', count: 100 }
        ]
    },
    {
        id: 12,
        name: 'More',
        icon: <Package className="w-8 h-8" />,
        count: 1200,
        color: 'bg-gray-100 text-gray-600',
        subcategories: [
            { id: 121, name: 'Other', count: 1200 }
        ]
    }
];

// Mock listings data with detailed specifications and subcategories
const mockListings = [
    {
        id: 1,
        title: 'iPhone 14 Pro Max 256GB',
        price: 95000,
        category: 'Mobiles',
        subcategory: 'Smartphones',
        location: 'Mumbai, Maharashtra',
        date: '2 hours ago',
        status: 'pending',
        images: [
            'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1592286115803-a1c3b552ee43?w=400&h=300&fit=crop'
        ],
        description: 'Brand new iPhone 14 Pro Max, 256GB Deep Purple. Complete box with all accessories. 1 year warranty remaining.',
        seller: {
            name: 'Rahul Sharma',
          
            memberSince: '2021',
            email: 'rahul.sharma@example.com',
            phone: '9876543210'
        },
       
        views: 125,
        specs: {
            'Brand': 'Apple',
            'Model': 'iPhone 14 Pro Max',
            'Storage': '256GB',
            'Color': 'Deep Purple',
            'Display': '6.7" Super Retina XDR',
            'Processor': 'A16 Bionic',
            'Camera': '48MP Triple Camera',
            'Battery': '4323 mAh',
            'Condition': 'Brand New',
            'Warranty': '1 Year',
            'Purchase Date': 'Jan 2024',
            'Original Box': 'Yes',
            'Bill Available': 'Yes'
        }
    },
    {
        id: 2,
        title: '2022 Honda City ZX',
        price: 850000,
        category: 'Vehicles',
        subcategory: 'Cars',
        location: 'Delhi, NCR',
        date: '5 hours ago',
        status: 'active',
        images: [
            'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1617654112368-307921291f42?w=400&h=300&fit=crop'
        ],
        description: 'Excellent condition Honda City ZX, 15000 km driven, single owner, insurance valid till 2024.',
        seller: {
            name: 'Amit Verma',
            rating: 4.9,
            memberSince: '2020',
            email: 'amit.verma@example.com',
            phone: '9876543211'
        },
        featured: true,
        views: 203,
        specs: {
            'Brand': 'Honda',
            'Model': 'City ZX',
            'Year': '2022',
            'Mileage': '15,000 km',
            'Fuel Type': 'Petrol',
            'Transmission': 'Manual',
            'Color': 'Pearl White',
            'Engine': '1498 cc',
            'Power': '119 bhp',
            'Insurance': 'Valid till Dec 2024',
            'Registration': 'DL-08-AB-1234',
            'Owners': '1st Owner',
            'Condition': 'Excellent',
            'Features': 'Sunroof, Touchscreen, ABS, Airbags'
        }
    },
    {
        id: 3,
        title: 'MacBook Pro M2 13"',
        price: 120000,
        category: 'Electronics',
        subcategory: 'Laptops',
        location: 'Bangalore, Karnataka',
        date: '1 day ago',
        status: 'active',
        images: [
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop'
        ],
        description: 'MacBook Pro M2, 8GB RAM, 256GB SSD. Used for 6 months, in excellent condition with warranty.',
        seller: {
            name: 'Priya Nair',
            rating: 4.7,
            memberSince: '2022',
            email: 'priya.nair@example.com',
            phone: '9876543212'
        },
        views: 156,
        specs: {
            'Brand': 'Apple',
            'Model': 'MacBook Pro',
            'Processor': 'Apple M2 Chip',
            'RAM': '8GB Unified',
            'Storage': '256GB SSD',
            'Display': '13.3" Retina Display',
            'Graphics': '8-core GPU',
            'Battery Life': 'Up to 20 hours',
            'Operating System': 'macOS Ventura',
            'Color': 'Space Gray',
            'Condition': 'Like New',
            'Warranty': '6 months remaining',
            'Accessories': 'Charger, Box, Manual'
        }
    },
    {
        id: 4,
        title: '3 BHK Apartment for Rent',
        price: 25000,
        category: 'Properties',
        subcategory: 'Apartments',
        location: 'Pune, Maharashtra',
        date: '3 days ago',
        status: 'active',
        images: [
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'
        ],
        description: 'Spacious 3 BHK apartment in prime location with all amenities. Semi-furnished with parking.',
        seller: {
            name: 'Real Estate Pro',
            rating: 4.6,
            memberSince: '2019',
            email: 'realestate@example.com',
            phone: '9876543213'
        },
        featured: true,
        views: 312,
        specs: {
            'Property Type': 'Apartment',
            'Bedrooms': '3',
            'Bathrooms': '2',
            'Balconies': '2',
            'Area': '1500 sq.ft',
            'Floor': '5th of 10',
            'Furnishing': 'Semi-Furnished',
            'Parking': 'Covered Parking for 2 cars',
            'Age of Property': '5 years',
            'Facing': 'North-East',
            'Water Supply': '24/7 Available',
            'Power Backup': 'Yes',
            'Security': '24/7 Security Guard',
            'Amenities': 'Gym, Swimming Pool, Community Hall'
        }
    },
    {
        id: 5,
        title: 'Samsung 55" 4K Smart TV',
        price: 35000,
        category: 'Electronics',
        subcategory: 'TVs',
        location: 'Hyderabad, Telangana',
        date: '1 week ago',
        status: 'sold',
        images: [
            'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400&h=300&fit=crop'
        ],
        description: 'Samsung 55 inch 4K Smart TV, 1 year old, excellent condition with bill and warranty.',
        seller: {
            name: 'Kiran Reddy',
            rating: 4.5,
            memberSince: '2021',
            email: 'kiran.reddy@example.com',
            phone: '9876543214'
        },
        views: 189,
        specs: {
            'Brand': 'Samsung',
            'Model': '55" Crystal UHD 4K Smart TV',
            'Display Size': '55 inches',
            'Resolution': '4K UHD (3840 x 2160)',
            'Display Technology': 'LED',
            'Smart TV': 'Yes (Tizen OS)',
            'Connectivity': 'WiFi, Bluetooth, HDMI x3, USB x2',
            'Sound': '20W Output',
            'HDR Support': 'HDR10, HLG',
            'Refresh Rate': '60Hz',
            'Condition': 'Excellent',
            'Warranty': '6 months remaining',
            'Purchase Date': 'Jan 2023',
            'Accessories': 'Remote, Stand, User Manual'
        }
    },
    {
        id: 6,
        title: 'Office Chair Ergonomic',
        price: 4500,
        category: 'Furniture',
        subcategory: 'Chairs',
        location: 'Chennai, Tamil Nadu',
        date: '2 weeks ago',
        status: 'pending',
        images: [
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
        ],
        description: 'Premium ergonomic office chair with lumbar support. Used for 6 months, like new condition.',
        seller: {
            name: 'Suresh Kumar',
            rating: 4.4,
            memberSince: '2020',
            email: 'suresh.kumar@example.com',
            phone: '9876543215'
        },
        views: 87,
        specs: {
            'Brand': 'Green Soul',
            'Model': 'Ergonomic Office Chair',
            'Material': 'Mesh Back + Fabric Seat',
            'Color': 'Black',
            'Adjustable Height': 'Yes',
            'Lumbar Support': 'Yes',
            'Armrests': '3D Adjustable Armrests',
            'Wheel Base': '360° Swivel',
            'Weight Capacity': 'Up to 120 kg',
            'Condition': 'Like New',
            'Usage': '6 months',
            'Warranty': 'No',
            'Features': 'Breathable mesh, Neck pillow, Recline lock'
        }
    }
];

// Mock users data for admin panel
const mockUsers = [
    {
        id: 1,
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        phone: '9876543210',
        joinDate: '2021-05-15',
        status: 'active',
        listings: 3,
        rating: 4.8
    },
    {
        id: 2,
        name: 'Amit Verma',
        email: 'amit.verma@example.com',
        phone: '9876543211',
        joinDate: '2020-03-22',
        status: 'active',
        listings: 5,
        rating: 4.9
    },
    {
        id: 3,
        name: 'Priya Nair',
        email: 'priya.nair@example.com',
        phone: '9876543212',
        joinDate: '2022-01-10',
        status: 'active',
        listings: 2,
        rating: 4.7
    },
    {
        id: 4,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '9876543213',
        joinDate: '2023-02-18',
        status: 'suspended',
        listings: 1,
        rating: 3.2
    }
];


// --- COMPONENTS ---

import Dashboard from '../buysell/Dashboard';
import ManageListings from '../buysell/ManageListings';
import ManageUsers from '../buysell/ManageUsers';
import ManageCategories from '../buysell/ManageCategories';


function Buysellpages() {
    const [listings, setListings] = useState(mockListings);
    const [users, setUsers] = useState(mockUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [listingStatusFilter, setListingStatusFilter] = useState('all');
    const [userStatusFilter, setUserStatusFilter] = useState('all');
    const [dashboardTab, setDashboardTab] = useState('overview');

    // Handler functions
    const updateListingStatus = (id, status) => {
        setListings(prevListings =>
            prevListings.map(listing =>
                listing.id === id ? { ...listing, status } : listing
            )
        );
    };

    const updateUserStatus = (id, status) => {
        setUsers(prevUsers =>
            prevUsers.map(user =>
                user.id === id ? { ...user, status } : user
            )
        );
    };

    const deleteListing = (id) => {
        if (window.confirm('Are you sure you want to delete this listing?')) {
            setListings(prevListings => prevListings.filter(listing => listing.id !== id));
        }
    };

    const deleteUser = (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
        }
    };

    // Calculate stats
    const totalListings = listings.length;
    const activeListings = listings.filter(l => l.status === 'active').length;
    const pendingListings = listings.filter(l => l.status === 'pending').length;
    const soldListings = listings.filter(l => l.status === 'sold').length;
    const totalUsersCount = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const totalViews = listings.reduce((sum, l) => sum + l.views, 0);
    const totalRevenue = listings
        .filter(l => l.status === 'sold')
        .reduce((sum, l) => sum + l.price * 0.05, 0);

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return (
                    <Dashboard
                        listings={listings}
                        totalRevenue={totalRevenue}
                        updateListingStatus={updateListingStatus}
                        deleteListing={deleteListing}
                        totalListings={totalListings}
                        activeListings={activeListings}
                        pendingListings={pendingListings}
                        totalUsers={totalUsersCount}
                        dashboardTab={dashboardTab}
                        setDashboardTab={setDashboardTab}
                    />
                );
            case 'listings':
                return (
                    <ManageListings
                        listings={listings}
                        searchTerm={searchTerm}
                        listingStatusFilter={listingStatusFilter}
                        setSearchTerm={setSearchTerm}
                        setListingStatusFilter={setListingStatusFilter}
                        updateListingStatus={updateListingStatus}
                        deleteListing={deleteListing}
                    />
                );
            case 'users':
                return (
                    <ManageUsers
                        users={users}
                        searchTerm={searchTerm}
                        userStatusFilter={userStatusFilter}
                        setSearchTerm={setSearchTerm}
                        setUserStatusFilter={setUserStatusFilter}
                        updateUserStatus={updateUserStatus}
                        deleteUser={deleteUser}
                    />
                );
            case 'categories':
                return <ManageCategories categories={categories} />;
          
        }
    };

    return (
        <div className="min-h-screen bg-gray-200">
            {/* Admin Header */}


            {/* Main Content Area */}
            <div className="max-w-8xl mx-auto px-4 py-6">
                {/* Tab Navigation with Rounded Bar */}
                <div className="mb-6">
                    <div className="bg-white rounded-full p-1 flex justify-center shadow-sm">
                        <div className="bg-white rounded-full p-1 flex space-x-3">
                            <button
                                onClick={() => setCurrentPage('dashboard')}
                                className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 transform hover:scale-105 ${currentPage === 'dashboard'
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <BarChart3 className="w-4 h-4 mr-2 inline" />
                                Dashboard
                            </button>

                            <button
                                onClick={() => setCurrentPage('listings')}
                                className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 transform hover:scale-105 ${currentPage === 'listings'
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <PackageOpen className="w-4 h-4 mr-2 inline" />
                                Listings
                            </button>

                            <button
                                onClick={() => setCurrentPage('users')}
                                className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 transform hover:scale-105 ${currentPage === 'users'
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Users className="w-4 h-4 mr-2 inline" />
                                Users
                            </button>

                            <button
                                onClick={() => setCurrentPage('categories')}
                                className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 transform hover:scale-105 ${currentPage === 'categories'
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <ShoppingBag className="w-4 h-4 mr-2 inline" />
                                Categories
                            </button>


                           
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg shadow p-6">
                    {renderPage()}
                </div>
            </div>
        </div>
    );
}

export default Buysellpages;
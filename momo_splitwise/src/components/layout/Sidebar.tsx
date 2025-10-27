import React from 'react';
import { Home, Users, BarChart3, CreditCard, Settings, Send } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

// In the navigation array, add:
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Groups', href: '/dashboard/groups', icon: Users },
  { name: 'Expenses', href: '/dashboard/expenses', icon: CreditCard },
  { name: 'Payments', href: '/dashboard/payments', icon: Send }, // Add this line
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-linear-to-r from-yellow-700-puryellow-600ry-pink text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer/Bottom Section */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="bg-linear-to-r from-yellow-700 to-yellow-600 rounded-2xl p-4 text-white text-center">
            <h3 className="text-sm font-semibold mb-1">Upgrade to Pro</h3>
            <p className="text-xs opacity-90 mb-3">
              Advanced analytics and more features
            </p>
            <button className="w-full bg-white text-luxury-purple text-xs font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
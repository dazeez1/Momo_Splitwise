import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  CreditCard,
  BarChart3,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Calculator,
  Smartphone,
  Bell,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      current: location.pathname === "/dashboard",
    },
    {
      name: "Groups",
      href: "/dashboard/groups",
      icon: Users,
      current: location.pathname === "/dashboard/groups",
    },
    {
      name: "Expenses",
      href: "/dashboard/expenses",
      icon: CreditCard,
      current: location.pathname.includes("/dashboard/expenses"),
    },
    {
      name: "Balances",
      href: "/dashboard/balances",
      icon: Calculator,
      current: location.pathname === "/dashboard/balances",
    },
    {
      name: "Payments",
      href: "/dashboard/payments",
      icon: Smartphone,
      current: location.pathname === "/dashboard/payments",
    },
    {
      name: "Reports",
      href: "/dashboard/reports",
      icon: BarChart3,
      current: location.pathname === "/dashboard/reports",
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: User,
      current: location.pathname === "/dashboard/profile",
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      current: location.pathname === "/dashboard/settings",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-0 flex z-40 md:hidden ${
          sidebarOpen ? "" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center px-4">
              <Link to="/dashboard" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-linear-to-br   from-yellow-700 to-yellow-700 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-luxury font-bold bg-linear-to-br   from-yellow-700 to-yellow-700 bg-clip-text text-transparent">
                    Momo Splitwise
                  </span>
                </div>
              </Link>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-lg transition-all duration-200 ${
                    item.current
                      ? "bg-linear-to-br   from-yellow-700 to-yellow-700 text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-yellow-700"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`mr-4 h-6 w-6 ${
                      item.current ? "text-white" : "text-gray-400"
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="">
                <div className="w-10 h-10 bg-linear-to-br  from-yellow-700 to-yellow-700 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-base font-medium text-gray-700">
                  {user?.name}
                </p>
                <p className="text-sm font-medium text-gray-500">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center px-4">
              <Link to="/dashboard" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-linear-to-br  from-yellow-700 to-yellow-700 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-luxury font-bold bg-linear-to-br  from-yellow-700 to-yellow-700 bg-clip-text text-transparent">
                    Momo Splitwise
                  </span>
                  <p className="text-xs text-gray-500">
                    Split bills, keep friends
                  </p>
                </div>
              </Link>
            </div>
            <nav className="mt-8 flex-1 px-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    item.current
                      ? "bg-linear-to-br  from-yellow-700 to-yellow-700 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-50 hover:text-yellow-700 hover:shadow-md"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      item.current ? "text-white" : "text-gray-400"
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="">
                <div className="w-10 h-10 bg-linear-to-br  from-yellow-700 to-yellow-700 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-3 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-luxury-yellow"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

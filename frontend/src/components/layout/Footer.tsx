import React from "react";
import { Link } from "react-router-dom";
import { Users, Mail, Phone, MapPin } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-linear-to-br   from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-linear-to-br  from-yellow-700 to-yellow-700 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-luxury font-bold text-white">
                  Momo Splitwise
                </span>
                <p className="text-gray-300 text-sm">
                  Split bills, keep friends
                </p>
              </div>
            </Link>
            <p className="text-gray-300 mb-4 max-w-md">
              The smart way to split expenses with friends, roommates, and
              groups. Track shared costs, calculate debts, and settle payments
              seamlessly with mobile money integration.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="h-4 w-4" />
                <span className="text-sm">+250 780 162 164</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span className="text-sm">hello@momosplitwise.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link
                to="/"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                About Us
              </Link>
              <Link
                to="/faq"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                FAQ
              </Link>
              <Link
                to="/contact"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <div className="space-y-2">
              <span className="block text-gray-300">Expense Splitting</span>
              <span className="block text-gray-300">Group Management</span>
              <span className="block text-gray-300">Mobile Money Payments</span>
              <span className="block text-gray-300">Expense Reports</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">
            © 2025 Momo Splitwise. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="text-gray-300 text-sm">Privacy Policy</span>
            <span className="text-gray-300 text-sm">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

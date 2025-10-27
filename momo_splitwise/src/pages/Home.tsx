import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Calculator,
  CreditCard,
  BarChart3,
  Smartphone,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const Home: React.FC = () => {
  const features = [
    {
      icon: Calculator,
      title: "Smart Expense Splitting",
      description:
        "Split bills equally, by percentage, or custom amounts with automatic calculations.",
    },
    {
      icon: Users,
      title: "Group Management",
      description:
        "Create groups for roommates, trips, or savings groups and manage members easily.",
    },
    {
      icon: CreditCard,
      title: "Mobile Money Integration",
      description:
        "Generate payment links and settle debts seamlessly with mobile money.",
    },
    {
      icon: BarChart3,
      title: "Expense Analytics",
      description:
        "Track spending patterns with detailed reports and visualizations.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description:
        "Your financial data is encrypted and never shared with third parties.",
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description:
        "Get instant notifications when expenses are added or payments made.",
    },
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "50K+", label: "Expenses Tracked" },
    { number: "5K+", label: "Groups Created" },
    { number: "95%", label: "Satisfaction Rate" },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      {/* Hero Section */}
      <section className="bg-linear-to-br   from-yellow-700 via-yellow-700 to-yellow-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-luxury font-bold mb-6 animate-fade-in">
              Split Bills,
              <span className="block bg-linear-to-br  from-gold-200 to-white bg-clip-text text-transparent">
                Keep Friends
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-yellow-100 mb-8 max-w-3xl mx-auto">
              The smart way to manage shared expenses with friends, roommates,
              and groups. Track costs, calculate debts, and settle payments
              seamlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-white text-yellow-700 font-semibold rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/about"
                className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-yellow-700 transition-all duration-200"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-luxury font-bold text-yellow-700 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-luxury font-bold text-gray-700 mb-4">
              Why Choose Momo Splitwise?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Designed for African communities with mobile money at the heart of
              our solution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="w-14 h-14 bg-linear-to-br  from-yellow-700 to-yellow-700 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-luxury font-bold text-gray-700 mb-4">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-linear-to-br  from-yellow-700 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">1. Create a Group</h3>
              <p className="text-gray-600">
                Start a new group and invite your friends, roommates, or chama
                members
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-linear-to-br  from-yellow-600 to-yellow-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">2. Add Expenses</h3>
              <p className="text-gray-600">
                Record shared expenses and choose how to split them among
                members
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-linear-to-br  from-yellow-700 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">3. Settle Up</h3>
              <p className="text-gray-600">
                Use mobile money to pay back friends with one-click payment
                links
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-br  from-yellow-700 to-yellow-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-luxury font-bold mb-6">
            Ready to Simplify Your Group Expenses?
          </h2>
          <p className="text-xl text-yellow-100 mb-8">
            Join thousands of users who trust Momo Splitwise to manage their
            shared finances
          </p>
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-yellow-700 font-semibold rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            <span>Start Splitting Today</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home;

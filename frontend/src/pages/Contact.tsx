import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, Clock } from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { useToast } from "../contexts/ToastContext";

const Contact: React.FC = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    showToast(
      "Thank you for your message! We will get back to you soon.",
      "success"
    );
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us an email anytime",
      value: "hello@momosplitwise.com",
      link: "mailto:danieliryivuze4@gmail.com",
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Mon to Fri from 8am to 5pm",
      value: "+250 780 162 164",
      link: "tel:+250780162164",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      description: "Come say hello at our office",
      value: "Kigali, Rwanda",
      link: "#",
    },
    {
      icon: Clock,
      title: "Support Hours",
      description: "We're here to help",
      value: "24/7 Online Support",
      link: "#",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Hero Section */}
      <section className="bg-linear-to-br   from-yellow-700 to-yellow-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-luxury font-bold mb-6">
            Get In Touch
          </h1>
          <p className="text-xl text-yellow-100 max-w-3xl mx-auto">
            Have questions about Momo Splitwise? We're here to help and would
            love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-luxury font-bold text-gray-700 mb-8">
                Let's talk about how we can help
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Whether you're having trouble with the app, have feature
                suggestions, or just want to say hello - we're always happy to
                connect with our users.
              </p>

              <div className="space-y-6">
                {contactMethods.map((method, index) => (
                  <a
                    key={index}
                    href={method.link}
                    className="flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 bg-linear-to-br  from-yellow-700 to-yellow-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <method.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">
                        {method.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {method.description}
                      </p>
                      <p className="text-yellow-700 font-medium">
                        {method.value}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-700 mb-6">
                Send us a message
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-yellow focus:border-transparent transition-all duration-200"
                      placeholder="Daniel Iryivuze"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-yellow focus:border-transparent transition-all duration-200"
                      placeholder="daniel@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-yellow focus:border-transparent transition-all duration-200"
                    placeholder="How can we help you?"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-yellow focus:border-transparent transition-all duration-200"
                    placeholder="Tell us more about how we can help you..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-linear-to-br  from-yellow-700 to-yellow-700 text-white font-semibold py-4 px-6 rounded-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Send className="h-5 w-5" />
                  <span>Send Message</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Contact;

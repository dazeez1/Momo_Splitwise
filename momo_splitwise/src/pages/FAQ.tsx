import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqs = [
    {
      question: "How does Momo Splitwise work?",
      answer:
        "Momo Splitwise helps you track shared expenses with friends and groups. You create groups, add expenses, specify how to split them, and the app automatically calculates who owes whom. You can then settle up using mobile money payment links.",
    },
    {
      question: "Is Momo Splitwise free to use?",
      answer:
        "Yes! Momo Splitwise is completely free to use. We believe in making expense management accessible to everyone.",
    },
    {
      question: "Which mobile money providers do you support?",
      answer:
        "We support all major mobile money providers including M-Pesa, Airtel Money, MTN Mobile Money, and others. Our payment links work with any provider that supports URL schemes.",
    },
    {
      question: "Can I use Momo Splitwise for my savings group (chama)?",
      answer:
        "Absolutely! Momo Splitwise is perfect for chamas, investment groups, and any other savings groups. You can track contributions, expenses, and generate detailed reports.",
    },
    {
      question: "How secure is my financial data?",
      answer:
        "We take security very seriously. All your data is encrypted, and we never store your mobile money credentials. Your financial information is safe with us.",
    },
    {
      question: "Can I use Momo Splitwise offline?",
      answer:
        "While some features work offline, you'll need an internet connection to sync data across devices and generate mobile money payment links.",
    },
    {
      question: "What currencies do you support?",
      answer:
        "We support all major currencies with special focus on African currencies like KES, UGX, TZS, GHS, NGN, and ZAR. You can choose your preferred currency for each group.",
    },
    {
      question: "How do I invite friends to my group?",
      answer:
        "You can invite friends by sharing a group code or sending them an invitation link. They'll need to create an account to join your group.",
    },
  ];

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Hero Section */}
      <section className="bg-linear-to-br   from-yellow-700 to-yellow-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-luxury font-bold mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-yellow-100">
            Find answers to common questions about Momo Splitwise
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-6 text-left flex justify-between items-center"
                >
                  <span className="text-lg font-semibold text-gray-700">
                    {faq.question}
                  </span>
                  {openItems.includes(index) ? (
                    <ChevronUp className="h-5 w-5 text-yellow-700" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-yellow-700" />
                  )}
                </button>
                {openItems.includes(index) && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-16 text-center">
            <div className="bg-linear-to-br  from-yellow-700 to-yellow-700 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-semibold mb-4">
                Still have questions?
              </h3>
              <p className="text-yellow-100 mb-6">
                Our support team is here to help you get the most out of Momo
                Splitwise.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-white text-yellow-700 font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default FAQ;

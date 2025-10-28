import React from "react";
import { Users, Target, Globe2, Heart } from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const About: React.FC = () => {
  const team = [
    {
      name: "Daniel Iryivuze",
      role: "Frontend Developer",
      description:
        "Passionate about creating beautiful and functional user interfaces.",
    },
    {
      name: "Azeez Damilare Gbenga",
      role: "Backend Developer",
      description: "Expert in building scalable and secure backend systems.",
    },
    {
      name: "Stella Remember",
      role: "DevOps Engineer",
      description: "Ensuring smooth deployment and reliable infrastructure.",
    },
  ];

  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description:
        "To simplify expense sharing and strengthen relationships through transparent financial management.",
    },
    {
      icon: Users,
      title: "Our Vision",
      description:
        "A world where no friendship is strained over shared expenses and financial transparency brings people closer.",
    },
    {
      icon: Globe2,
      title: "African Focus",
      description:
        "Built specifically for African users with mobile money integration and local currency support.",
    },
    {
      icon: Heart,
      title: "Community First",
      description:
        "We prioritize user experience and community feedback in everything we build.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Hero Section */}
      <section className="bg-linear-to-br   from-yellow-700 to-yellow-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-luxury font-bold mb-6">
              About Momo Splitwise
            </h1>
            <p className="text-xl text-yellow-100 max-w-3xl mx-auto">
              We're on a mission to make shared expense management effortless,
              transparent, and accessible for everyone across Africa.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-luxury font-bold text-gray-700 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600 text-lg">
                <p>
                  Momo Splitwise was born from a simple observation: friends,
                  roommates, and community groups across Africa were struggling
                  to track shared expenses and fairly split costs.
                </p>
                <p>
                  We noticed that while mobile money revolutionized personal
                  payments, there was no simple solution for group expense
                  management that integrated seamlessly with these platforms.
                </p>
                <p>
                  Today, we're proud to serve thousands of users who trust us to
                  keep their friendships strong and their finances clear.
                </p>
              </div>
            </div>
            <div className="bg-linear-to-br   from-yellow-700 to-yellow-700 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-semibold mb-4">Why We Exist</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Eliminate financial conflicts in relationships</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Simplify group expense tracking</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Leverage mobile money for seamless payments</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Build financial transparency in communities</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-luxury font-bold text-gray-700 mb-4">
              Our Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 bg-linear-to-br  from-yellow-700 to-yellow-700 rounded-xl flex items-center justify-center mb-6">
                  <value.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-luxury font-bold text-gray-700 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600">
              Passionate individuals working together to revolutionize expense
              management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="text-center bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-24 h-24 bg-linear-to-br  from-yellow-700 to-yellow-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {member.name}
                </h3>
                <p className="text-yellow-700 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default About;

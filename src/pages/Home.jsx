
import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search } from "lucide-react";
import FeaturedListings from "../components/homepage/FeaturedListings";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero Section - UPDATED with a new bounce house image */}
      <section className="relative">
        <div 
          className="h-[70vh] bg-cover bg-center bg-gray-900 flex items-center justify-center"
          style={{
            backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://static.vecteezy.com/system/resources/thumbnails/002/569/019/large/boy-bouncing-in-inflatable-play-house-super-slow-motion-video.jpg')"
          }}
        >
          <div className="text-center text-white max-w-4xl px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Rent Amazing Bounce Houses for Any Event
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Find and book unique bounce houses from local hosts. Safe, fun, and unforgettable experiences for kids and families.
            </p>
            
            {/* Search Bar */}
            <div className="mt-10 max-w-2xl mx-auto">
              <div className="bg-white rounded-full p-2 shadow-2xl flex items-center">
                <input 
                  type="text" 
                  placeholder="Enter your city or zip code to find bounce houses" 
                  className="w-full text-lg text-gray-700 bg-transparent outline-none placeholder-gray-500 px-6 py-3"
                />
                <button 
                  onClick={() => navigate(createPageUrl("Listings"))}
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full transition-colors flex items-center gap-2 font-semibold text-lg whitespace-nowrap"
                >
                  <Search className="w-6 h-6" />
                  Search
                </button>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap justify-center items-center gap-8 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Verified Hosts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Insurance Coverage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {[
              { icon: '🏰', label: 'Castles' },
              { icon: '🌊', label: 'Water Slides' },
              { icon: '🎪', label: 'Themed' },
              { icon: '🏀', label: 'Sports' },
              { icon: '🎯', label: 'Obstacles' },
              { icon: '🎨', label: 'Interactive' },
              { icon: '👑', label: 'Princess' },
              { icon: '🦸', label: 'Superhero' },
            ].map((category, index) => (
              <button
                key={index}
                onClick={() => navigate(createPageUrl("Listings"))}
                className="flex flex-col items-center space-y-3 p-6 hover:bg-gray-50 rounded-xl transition-colors group border border-gray-200 hover:border-red-300 hover:shadow-md"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">{category.icon}</span>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-red-600">{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <FeaturedListings />

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How BouncieHouse Works</h2>
            <p className="text-xl text-gray-600">Rent a bounce house in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="flex items-center justify-center h-20 w-20 rounded-full bg-red-500 text-white mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold">1</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Discover & Browse</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Browse hundreds of unique bounce houses in your area. Filter by size, theme, and features to find the perfect fit.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-20 w-20 rounded-full bg-red-500 text-white mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold">2</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Book & Pay Securely</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Select your date and time, send a booking request, and pay securely once approved. All transactions are protected.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-20 w-20 rounded-full bg-red-500 text-white mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold">3</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Enjoy Your Event</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                We handle delivery and setup. You just focus on having an amazing party that everyone will remember!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Join thousands of satisfied families</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                location: "Austin, TX", 
                text: "The kids had an absolute blast! The bounce house was clean, safe, and the host was incredibly helpful. Will definitely book again!",
                rating: 5
              },
              {
                name: "Mike Chen",
                location: "Portland, OR",
                text: "Super easy booking process and great communication. The superhero themed bounce house made my son's birthday unforgettable!",
                rating: 5
              },
              {
                name: "Lisa Rodriguez", 
                location: "Miami, FL",
                text: "Professional service from start to finish. The water slide was perfect for our summer party. Highly recommended!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8 shadow-sm">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-600">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Try Hosting */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="p-8 lg:p-16">
                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                  Become a Host & Earn Money
                </h2>
                <p className="text-red-100 text-xl mb-8 leading-relaxed">
                  Turn your bounce house into a profitable business. Earn hundreds per weekend while bringing joy to families in your community.
                </p>
                <div className="space-y-3 mb-8 text-red-100">
                  <div className="flex items-center gap-3">
                    <span className="text-green-300">✓</span>
                    <span>Earn $200-500+ per weekend</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-300">✓</span>
                    <span>We handle payments & insurance</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-300">✓</span>
                    <span>Set your own schedule</span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(createPageUrl("CreateListing"))}
                  className="bg-white text-red-600 font-bold px-10 py-4 rounded-xl hover:bg-gray-100 transition-colors text-lg shadow-lg"
                >
                  Start Hosting Today
                </button>
              </div>
              <div className="hidden lg:block">
                <img 
                  src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Happy hosting family"
                  className="w-full h-96 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Safety is Our Priority</h2>
            <p className="text-xl text-gray-600">Industry-leading safety standards and protection</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: '🛡️', title: 'Verified Hosts', desc: 'All hosts undergo background checks and verification' },
              { icon: '💳', title: 'Secure Payments', desc: 'Your payment information is always protected' },
              { icon: '📞', title: '24/7 Support', desc: 'Round-the-clock customer service when you need it' },
              { icon: '🏥', title: 'Insurance Coverage', desc: 'Comprehensive liability coverage for every rental' }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                question: "How do I know the bounce house is safe and clean?",
                answer: "All our hosts must follow strict safety and cleanliness protocols. Each bounce house is inspected and cleaned before every rental. We also require hosts to maintain proper insurance coverage."
              },
              {
                question: "What if I need to cancel my reservation?",
                answer: "You can cancel your reservation according to the host's cancellation policy, which is clearly displayed during booking. Most hosts offer flexible cancellation up to 24-48 hours before your event."
              },
              {
                question: "Is delivery and setup included?",
                answer: "Yes! All rentals include delivery, setup, and pickup by the host. Setup typically takes 15-30 minutes, and hosts will explain all safety features before your event begins."
              },
              {
                question: "What happens if it rains on my event day?",
                answer: "Most bounce houses can be set up indoors if you have adequate space. If not, you can reschedule your event or cancel for a full refund according to the host's weather policy."
              },
              {
                question: "How do I become a host?",
                answer: "Simply click 'Start Hosting' and create your listing! You'll need to provide photos, set your pricing, and complete our verification process. Most hosts are approved within 24-48 hours."
              }
            ].map((faq, index) => (
              <details key={index} className="border border-gray-200 rounded-xl p-6 group hover:border-red-300 transition-colors">
                <summary className="font-semibold text-lg text-gray-900 cursor-pointer group-hover:text-red-600 transition-colors">
                  {faq.question}
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter/CTA */}
      <section className="py-20 bg-gradient-to-r from-red-500 to-red-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Plan Your Perfect Party?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Join thousands of families who've made their events unforgettable with BouncieHouse
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <button 
              onClick={() => navigate(createPageUrl("Listings"))}
              className="bg-white text-red-600 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors text-lg shadow-lg flex-1"
            >
              Find Bounce Houses
            </button>
            <button 
              onClick={() => navigate(createPageUrl("CreateListing"))}
              className="bg-red-700 text-white font-bold px-8 py-4 rounded-xl hover:bg-red-800 transition-colors text-lg shadow-lg flex-1"
            >
              Start Hosting
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

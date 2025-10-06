import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-primary-600 text-white p-2 rounded-lg">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Ziarazetu</h3>
                <p className="text-sm text-gray-400">Discover East Africa</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Your gateway to experiencing the breathtaking beauty and rich culture of East Africa. 
              Based in Mombasa, Kenya, we offer unforgettable tours, comfortable stays, and meaningful volunteer opportunities.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/experiences" className="text-gray-300 hover:text-white transition-colors">Experiences</Link></li>
              <li><Link to="/stays" className="text-gray-300 hover:text-white transition-colors">Stays</Link></li>
              <li><Link to="/volunteers" className="text-gray-300 hover:text-white transition-colors">Volunteers</Link></li>
              <li><Link to="/custom-package" className="text-gray-300 hover:text-white transition-colors">Custom Packages</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>Safari Tours</li>
              <li>Beach Holidays</li>
              <li>Cultural Experiences</li>
              <li>Luxury Lodges</li>
              <li>Community Projects</li>
              <li>Custom Itineraries</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin size={18} className="text-primary-400" />
                <span className="text-gray-300 text-sm">Mombasa, Kenya</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-primary-400" />
                <span className="text-gray-300 text-sm">+254 700 123 456</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-primary-400" />
                <span className="text-gray-300 text-sm">info@ziarazetu.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 Ziarazetu Tourism. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

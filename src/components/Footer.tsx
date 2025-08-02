import { Heart, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xl">🐾</span>
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold">Ivy's Therapy Paws</h3>
                <p className="text-sm opacity-80">Bringing Joy, One Paw at a Time</p>
              </div>
            </div>
            <p className="text-sm opacity-80 leading-relaxed max-w-md">
              A non-profit organization dedicated to providing professional therapy dog services 
              that bring comfort, healing, and joy to those in need throughout our community.
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <Heart className="w-4 h-4 text-primary" fill="currentColor" />
              <span className="opacity-80">Certified therapy dog services since 2021</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm opacity-80 hover:opacity-100 hover:text-primary transition-colors">About Ivy</Link></li>
              <li><Link to="/mission" className="text-sm opacity-80 hover:opacity-100 hover:text-primary transition-colors">Our Mission</Link></li>
              <li><Link to="/schedule" className="text-sm opacity-80 hover:opacity-100 hover:text-primary transition-colors">Schedule Visit</Link></li>
              <li><Link to="/donate" className="text-sm opacity-80 hover:opacity-100 hover:text-primary transition-colors">Donate</Link></li>
              <li><Link to="/shop" className="text-sm opacity-80 hover:opacity-100 hover:text-primary transition-colors">Shop</Link></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Stay Connected</h4>
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:hello@ivystherapypaws.org" className="text-sm opacity-80 hover:opacity-100 hover:text-primary transition-colors">
                  hello@ivystherapypaws.org
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary" />
                <a href="tel:+1234567890" className="text-sm opacity-80 hover:opacity-100 hover:text-primary transition-colors">
                  (123) 456-7890
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm opacity-80">Greater Metro Area</span>
              </div>
            </div>
            
            <div className="mb-3">
              <p className="text-sm opacity-80 mb-2">Follow Ivy's Journey:</p>
              <div className="flex space-x-3">
                <a 
                  href="https://instagram.com/ivystherapypaws" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a 
                  href="https://facebook.com/ivystherapypaws" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a 
                  href="https://twitter.com/ivystherapypaws" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="border-t border-background/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm opacity-60 mb-4 md:mb-0">
            © 2024 Ivy's Therapy Paws. All rights reserved. | A 501(c)(3) non-profit organization.
          </div>
          <div className="flex items-center space-x-4 text-sm opacity-60">
            <a href="#" className="hover:opacity-80 transition-opacity">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:opacity-80 transition-opacity">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
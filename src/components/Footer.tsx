import { Heart, Mail, Phone, MapPin } from "lucide-react";

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
              <li><a href="#about" className="text-sm opacity-80 hover:opacity-100 hover:text-primary transition-colors">About Ivy</a></li>
              <li><a href="#mission" className="text-sm opacity-80 hover:opacity-100 hover:text-primary transition-colors">Our Mission</a></li>
              <li><a href="#schedule" className="text-sm opacity-80 hover:opacity-100 hover:text-primary transition-colors">Schedule Visit</a></li>
              <li><a href="#donate" className="text-sm opacity-80 hover:opacity-100 hover:text-primary transition-colors">Donate</a></li>
              <li><a href="#shop" className="text-sm opacity-80 hover:opacity-100 hover:text-primary transition-colors">Shop</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Contact</h4>
            <div className="space-y-3">
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
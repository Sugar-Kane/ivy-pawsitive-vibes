import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Heart, Calendar, ShoppingBag, DollarSign, Camera, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "About", href: "/about", icon: Heart },
    { name: "Schedule", href: "/schedule", icon: Calendar },
    { name: "Gallery", href: "/gallery", icon: Camera },
    { name: "Shop", href: "/shop", icon: ShoppingBag },
    { name: "Donate", href: "/donate", icon: DollarSign },
    { name: "Contact", href: "/contact", icon: Phone },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-4 group">
            <div className="w-12 h-12 rounded-full bg-gradient-golden flex items-center justify-center shadow-soft animate-gentle-float group-hover:scale-105 transition-transform">
              <span className="text-2xl font-bold text-primary-foreground">🐾</span>
            </div>
            <div className="flex items-center">
              <h1 className="font-heading text-xl font-bold text-foreground">
                Ivy's Therapy Paws
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-foreground hover:text-primary transition-gentle flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-secondary/50"
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-background border-t border-border shadow-soft">
          <div className="px-4 py-3 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-foreground hover:bg-secondary/50 transition-gentle"
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
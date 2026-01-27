import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PackageIcon, HomeIcon, PricingIcon, SendPackageIcon, PartnerIcon, TrackIcon } from "@/components/icons/AppIcons";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "How It Works", path: "/how-it-works" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card backdrop-blur-sm border-b border-border">
      <div className="container-narrow flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center group-hover:bg-primary/90 transition-colors">
            <PackageIcon size={20} className="text-primary-foreground" active />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">
            <span className="text-foreground">Parcel</span>
            <span className="text-primary">Buddy</span>
          </span>
        </Link>

        {/* Desktop Navigation - High Contrast Tabs */}
        <div className="hidden lg:flex items-center gap-0.5">
          {navLinks.slice(0, 4).map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                isActive(link.path)
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
              {isActive(link.path) && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <Link to="/carrier-signup">
            <Button variant="outline" size="sm">
              Join the Community
            </Button>
          </Link>
          <Link to="/freight-estimator">
            <Button variant="coral" size="default">
              Get Quote
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 rounded-lg text-foreground hover:bg-secondary transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-card border-t border-border">
          <div className="container-narrow py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block py-3 px-4 rounded-lg text-sm font-medium transition-colors border-l-2 ${
                  isActive(link.path)
                    ? "text-primary border-primary bg-primary/5 font-semibold"
                    : "text-muted-foreground hover:text-foreground border-transparent hover:border-border"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-border space-y-2">
              <Link to="/carrier-signup" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full">
                  Join the Community
                </Button>
              </Link>
              <Link to="/freight-estimator" onClick={() => setIsOpen(false)}>
                <Button variant="coral" className="w-full">
                  Get Quote
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "How It Works", path: "/how-it-works" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border overflow-hidden"
      style={{ background: 'hsl(var(--card))' }}
    >
      {/* === Animated Background Elements === */}
      
      {/* Floating organic blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Coral blob - left */}
        <svg className="absolute -left-8 -top-6 w-32 h-32 opacity-[0.12]" viewBox="0 0 120 120" style={{ animation: 'blobFloat 6s ease-in-out infinite' }}>
          <ellipse cx="60" cy="60" rx="52" ry="44" fill="hsl(24 90% 55%)" transform="rotate(-15 60 60)" />
        </svg>
        {/* Teal blob - right */}
        <svg className="absolute right-12 -top-4 w-28 h-28 opacity-[0.10]" viewBox="0 0 120 120" style={{ animation: 'blobFloat 7s ease-in-out 1s infinite' }}>
          <ellipse cx="60" cy="60" rx="48" ry="40" fill="hsl(var(--primary))" transform="rotate(20 60 60)" />
        </svg>
        {/* Small coral blob - center-right */}
        <svg className="absolute right-1/3 top-1 w-16 h-16 opacity-[0.08]" viewBox="0 0 60 60" style={{ animation: 'blobFloat 5s ease-in-out 0.5s infinite' }}>
          <circle cx="30" cy="30" r="24" fill="hsl(24 90% 55%)" />
        </svg>

        {/* Tiny parcel icons */}
        <svg className="absolute left-[15%] top-3 w-5 h-5 opacity-[0.18]" viewBox="0 0 24 24" fill="none" stroke="hsl(24 90% 55%)" strokeWidth="1.5" style={{ animation: 'iconPulse 3s ease-in-out infinite' }}>
          <rect x="3" y="7" width="18" height="14" rx="2" />
          <path d="M3 11h18M12 7v14" />
        </svg>
        <svg className="absolute right-[20%] top-4 w-4 h-4 opacity-[0.15]" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" style={{ animation: 'iconPulse 3.5s ease-in-out 0.8s infinite' }}>
          <rect x="3" y="7" width="18" height="14" rx="2" />
          <path d="M3 11h18M12 7v14" />
        </svg>
        <svg className="absolute left-[45%] bottom-1 w-4 h-4 opacity-[0.12]" viewBox="0 0 24 24" fill="none" stroke="hsl(24 90% 55%)" strokeWidth="1.5" style={{ animation: 'iconPulse 4s ease-in-out 1.5s infinite' }}>
          <rect x="3" y="7" width="18" height="14" rx="2" />
          <path d="M3 11h18M12 7v14" />
        </svg>

        {/* Winding dotted path with traveling dot */}
        <svg className="absolute left-[8%] top-0 w-[84%] h-full opacity-[0.10]" viewBox="0 0 800 64" preserveAspectRatio="none">
          <path
            d="M0,40 C100,10 200,55 320,30 C440,5 520,50 640,25 C720,10 780,40 800,32"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />
          {/* Traveling dot */}
          <circle r="3" fill="hsl(24 90% 55%)">
            <animateMotion
              dur="8s"
              repeatCount="indefinite"
              path="M0,40 C100,10 200,55 320,30 C440,5 520,50 640,25 C720,10 780,40 800,32"
            />
          </circle>
        </svg>

        {/* Hand-drawn stars/hearts in corners */}
        {/* Star top-left */}
        <svg className="absolute left-3 top-2 w-3.5 h-3.5 opacity-[0.15]" viewBox="0 0 20 20" fill="hsl(24 90% 55%)" style={{ animation: 'iconPulse 4s ease-in-out 0.3s infinite' }}>
          <path d="M10 1l2.4 5.2L18 7l-4 4.1L15 17l-5-2.8L5 17l1-5.9L2 7l5.6-.8z" />
        </svg>
        {/* Heart top-right */}
        <svg className="absolute right-4 top-2.5 w-3 h-3 opacity-[0.13]" viewBox="0 0 20 20" fill="hsl(var(--primary))" style={{ animation: 'iconPulse 5s ease-in-out 1s infinite' }}>
          <path d="M10 18s-7-5.4-7-10A4 4 0 0110 5.5 4 4 0 0117 8c0 4.6-7 10-7 10z" />
        </svg>
        {/* Star bottom-right */}
        <svg className="absolute right-8 bottom-1.5 w-3 h-3 opacity-[0.12]" viewBox="0 0 20 20" fill="hsl(24 90% 55%)" style={{ animation: 'iconPulse 3.8s ease-in-out 2s infinite' }}>
          <path d="M10 1l2.4 5.2L18 7l-4 4.1L15 17l-5-2.8L5 17l1-5.9L2 7l5.6-.8z" />
        </svg>
      </div>

      {/* === Main Navbar Content === */}
      <div className="container-narrow flex items-center justify-between h-16 relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <div className="flex flex-col leading-none">
            <span className="font-brand font-bold text-xl tracking-tight text-foreground">
              PARCOLO
            </span>
            <span className="text-[9px] font-semibold tracking-widest text-success uppercase">
              We Deliver Together
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 relative rounded-lg ${
                isActive(link.path)
                  ? "text-primary font-semibold bg-primary/8"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
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
          {isAdmin && (
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                <ShieldCheck className="w-4 h-4" />
                Admin
              </Button>
            </Link>
          )}
          <Link to="/carrier-signup">
            <Button variant="outline" size="sm" className="transition-all duration-200 hover:bg-secondary hover:shadow-soft">
              Join the Community
            </Button>
          </Link>
          <Link to="/freight-estimator">
            <Button variant="coral" size="default" className="transition-all duration-200 hover:shadow-coral-hover hover:scale-[1.03]">
              Get Quote
            </Button>
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-sm text-muted-foreground">
                <User className="w-4 h-4 text-primary/60" />
                <span className="max-w-[120px] truncate">{user.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-foreground">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm">
                Log In
              </Button>
            </Link>
          )}
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
        <div className="lg:hidden bg-card border-t border-border relative z-10">
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
              {isAdmin && (
                <Link to="/admin" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
                    <ShieldCheck className="w-4 h-4" />
                    Admin Dashboard
                  </Button>
                </Link>
              )}
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
              {user ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-muted-foreground"
                  onClick={() => { signOut(); setIsOpen(false); }}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              ) : (
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Log In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inline keyframes for navbar-specific animations */}
      <style>{`
        @keyframes blobFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes iconPulse {
          0%, 100% { opacity: 0.12; transform: scale(1); }
          50% { opacity: 0.22; transform: scale(1.15); }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;

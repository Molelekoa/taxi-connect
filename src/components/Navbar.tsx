import { Link, useLocation } from "react-router-dom";
import { Menu, LogOut, User, ShieldCheck, Package, Car, HelpCircle, Info, Truck, BoxIcon } from "lucide-react";
import parcoloLogo from "@/assets/parcolo-logo.png";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import NotificationBell from "@/components/NotificationBell";

const Navbar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card">
      <div className="container-narrow flex items-center justify-between h-14">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={parcoloLogo} alt="Parcolo" className="h-8 w-auto" />
          <div className="flex flex-col leading-none">
            <span className="font-brand font-bold text-xl tracking-tight text-foreground">
              PARCOLO
            </span>
            <span className="text-[9px] font-semibold tracking-widest text-success uppercase">
              We Deliver Together
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          {/* Notification Bell */}
          <NotificationBell />

          {/* Pulsing Hamburger Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="p-2.5 rounded-full text-foreground bg-primary/10 transition-colors hover:bg-primary/20"
                style={{ animation: 'hamburger-pulse 2s ease-in-out infinite' }}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-primary" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0">
              <SheetHeader className="p-6 pb-4 border-b border-border">
                <SheetTitle className="text-left font-brand font-bold text-lg">Menu</SheetTitle>
              </SheetHeader>

              <div className="p-4 space-y-1">
                {/* Primary action */}
                <Link to="/freight-estimator">
                  <Button variant="coral" className="w-full justify-start gap-3 h-12 text-base mb-3">
                    <Package className="w-5 h-5" />
                    Send a Parcel
                  </Button>
                </Link>

                <Link to="/carrier-signup">
                  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/carrier-signup') ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary'
                  }`}>
                    <Car className="w-5 h-5 text-muted-foreground" />
                    I'm Traveling Soon
                  </button>
                </Link>

                {user && (
                  <>
                    <Link to="/traveler-dashboard">
                      <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive('/traveler-dashboard') ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary'
                      }`}>
                        <Truck className="w-5 h-5 text-muted-foreground" />
                        My Trips
                      </button>
                    </Link>

                    <Link to="/sender-dashboard">
                      <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive('/sender-dashboard') ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary'
                      }`}>
                        <Package className="w-5 h-5 text-muted-foreground" />
                        Sent Parcels
                      </button>
                    </Link>
                  </>
                )}

                <Link to="/how-it-works">
                  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/how-it-works') ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary'
                  }`}>
                    <Info className="w-5 h-5 text-muted-foreground" />
                    How It Works
                  </button>
                </Link>

                <Link to="/faq">
                  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/faq') ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary'
                  }`}>
                    <HelpCircle className="w-5 h-5 text-muted-foreground" />
                    FAQ
                  </button>
                </Link>

                {isAdmin && (
                  <Link to="/admin">
                    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive('/admin') ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary'
                    }`}>
                      <ShieldCheck className="w-5 h-5 text-muted-foreground" />
                      Admin Dashboard
                    </button>
                  </Link>
                )}

                {/* Divider */}
                <div className="border-t border-border my-3" />

                {/* Auth */}
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <button
                      onClick={signOut}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                    >
                      <LogOut className="w-5 h-5 text-muted-foreground" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link to="/auth">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                      <User className="w-5 h-5 text-muted-foreground" />
                      Log In
                    </button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <style>{`
        @keyframes hamburger-pulse {
          0%, 100% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0.4); }
          50% { box-shadow: 0 0 0 8px hsl(var(--primary) / 0); }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;

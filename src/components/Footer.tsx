import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-16 border-t border-border bg-secondary/30">
      <div className="container-narrow">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="font-display font-black text-2xl tracking-tight">
                <span className="text-foreground">DYNO</span>
                <span className="text-primary">DASH</span>
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm">
              Your trusted freight brokerage partner. Connecting shippers with reliable carriers for fast, transparent logistics.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/get-quote" className="text-muted-foreground hover:text-primary transition-colors">
                  Get a Quote
                </Link>
              </li>
              <li>
                <Link to="/carrier-signup" className="text-muted-foreground hover:text-primary transition-colors">
                  Carrier Signup
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-3">
              <li>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary block mb-0.5">Email</span>
                <a href="mailto:info@dynodash.com" className="text-muted-foreground hover:text-primary transition-colors">
                  info@dynodash.com
                </a>
              </li>
              <li>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary block mb-0.5">Phone</span>
                <a href="tel:+18005551234" className="text-muted-foreground hover:text-primary transition-colors">
                  (800) 555-1234
                </a>
              </li>
              <li>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary block mb-0.5">Location</span>
                <span className="text-muted-foreground">Dallas, TX</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Dyno Dash. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";

const Footer = forwardRef<HTMLElement>((_, ref) => {
  return (
    <footer ref={ref} className="py-16 border-t border-border bg-secondary/30">
      <div className="container-narrow">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <Package className="h-6 w-6 text-primary" />
              <span className="font-display font-black text-2xl tracking-tight">
                <span className="text-foreground">Courier</span>
                <span className="text-primary">Connect</span>
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm">
              The affordable, smart logistics bridge for Southern Africa. We turn everyday taxi and bus travel into reliable parcel delivery.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/freight-estimator" className="text-muted-foreground hover:text-primary transition-colors">
                  Get Pricing
                </Link>
              </li>
              <li>
                <Link to="/small-parcel" className="text-muted-foreground hover:text-primary transition-colors">
                  Send a Parcel
                </Link>
              </li>
              <li>
                <Link to="/carrier-signup" className="text-muted-foreground hover:text-primary transition-colors">
                  Partner With Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
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
                <a href="mailto:hello@courierconnect.co.za" className="text-muted-foreground hover:text-primary transition-colors">
                  hello@courierconnect.co.za
                </a>
              </li>
              <li>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary block mb-0.5">WhatsApp</span>
                <a href="https://wa.me/27115685343" className="text-muted-foreground hover:text-primary transition-colors">
                  +27 11 568 5343
                </a>
              </li>
              <li>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary block mb-0.5">Coverage</span>
                <span className="text-muted-foreground">South Africa • Lesotho • Zimbabwe</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CourierConnect. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
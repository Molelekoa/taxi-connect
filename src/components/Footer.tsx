import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Package, Mail, Phone, MapPin } from "lucide-react";

const Footer = forwardRef<HTMLElement>((_, ref) => {
  return (
    <footer ref={ref} className="py-16 border-t border-border bg-card">
      <div className="container-narrow">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-card transition-shadow">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight">
                <span className="text-foreground">Courier</span>
                <span className="text-primary">Connect</span>
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
              The affordable, smart logistics bridge for Southern Africa. We turn everyday taxi and bus travel into reliable parcel delivery.
            </p>
            
            {/* Trust badge */}
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-success/10 border border-success/20">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-medium text-success">Trusted by 10,000+ customers</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-5">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors" />
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/freight-estimator" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors" />
                  Get Pricing
                </Link>
              </li>
              <li>
                <Link to="/small-parcel" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors" />
                  Send a Parcel
                </Link>
              </li>
              <li>
                <Link to="/carrier-signup" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors" />
                  Partner With Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors" />
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-5">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">Email</span>
                  <a href="mailto:hello@courierconnect.co.za" className="text-foreground hover:text-primary transition-colors font-medium">
                    hello@courierconnect.co.za
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-success" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">WhatsApp</span>
                  <a href="https://wa.me/27115685343" className="text-foreground hover:text-primary transition-colors font-medium">
                    +27 11 568 5343
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">Coverage</span>
                  <span className="text-foreground font-medium">South Africa • Lesotho • Zimbabwe</span>
                </div>
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

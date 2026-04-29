import { Droplets } from "lucide-react";

const Footer = () => (
  <footer id="contacto" className="gradient-water text-primary-foreground py-12">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-3 gap-8 items-start">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Droplets className="h-6 w-6" />
            <span className="font-heading font-bold text-xl">Agua Natura Otay</span>
          </div>
          <p className="text-primary-foreground/80 text-sm leading-relaxed">
            Pureza que cuida de tu familia. Agua purificada con los más altos estándares de calidad en Tijuana, B.C.
          </p>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-heading font-bold text-lg mb-3">Contacto</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li>📞 (664) 385-0934</li>
            <li>📧 info@aguanaturaotay.com</li>
            <li>📍 Av. Alejandro Von Humboldt 10, Nueva Tijuana, 22435 Tijuana, B.C.</li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="font-heading font-bold text-lg mb-3">Síguenos</h4>
          <div className="flex gap-4">
            <a href="https://m.facebook.com/Agua-Natura-104442842285709/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity text-primary-foreground/80 hover:text-primary-foreground">
              Facebook
            </a>
            <a href="https://wa.me/526643850934" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity text-primary-foreground/80 hover:text-primary-foreground">
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/20 mt-10 pt-6 text-center text-sm text-primary-foreground/60">
        © {new Date().getFullYear()} Agua Natura Otay. Todos los derechos reservados.
      </div>
    </div>
  </footer>
);

export default Footer;

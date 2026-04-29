import { useState } from "react";
import { Menu, X, Droplets } from "lucide-react";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Productos", href: "#productos" },
  { label: "Pedido", href: "#pedido" },
  { label: "Ubicación", href: "#ubicacion" },
  { label: "Contacto", href: "#contacto" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <a href="#inicio" className="flex items-center gap-2">
          <Droplets className="h-8 w-8 text-primary" />
          <span className="font-heading font-bold text-xl text-foreground">
            Agua Natura <span className="text-gradient-water">Otay</span>
          </span>
        </a>

        {/* Desktop */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="font-heading font-medium text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="https://wa.me/526643850934"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex gradient-water text-primary-foreground font-heading font-semibold text-sm px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity"
        >
          WhatsApp
        </a>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-card border-t border-border px-4 pb-4">
          <ul className="flex flex-col gap-3 pt-3">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block font-heading font-medium text-foreground hover:text-primary transition-colors"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="https://wa.me/526643850934"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block text-center gradient-water text-primary-foreground font-heading font-semibold text-sm px-5 py-2.5 rounded-full"
          >
            WhatsApp
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

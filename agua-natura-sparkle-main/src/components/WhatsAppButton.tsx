import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => (
  <a
    href="https://wa.me/526643850934"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Contactar por WhatsApp"
    className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 rounded-full shadow-xl hover:scale-110 transition-transform animate-float"
    style={{ backgroundColor: "#25D366" }}
  >
    <MessageCircle className="h-8 w-8 text-primary-foreground" />
  </a>
);

export default WhatsAppButton;

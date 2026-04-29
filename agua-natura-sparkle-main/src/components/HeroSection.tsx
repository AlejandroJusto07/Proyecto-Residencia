import heroImg from "@/assets/hero-water.jpg";

const HeroSection = () => (
  <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
    <img
      src={heroImg}
      alt="Agua pura y cristalina"
      className="absolute inset-0 w-full h-full object-cover"
      width={1920}
      height={1080}
    />
    <div className="absolute inset-0 gradient-hero-overlay" />
    <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
      <h1 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-primary-foreground leading-tight mb-6">
        Agua Natura Otay
      </h1>
      <p className="text-lg sm:text-xl md:text-2xl text-primary-foreground/90 font-body mb-10 max-w-xl mx-auto">
        Pureza que cuida de tu familia. Agua purificada con los más altos estándares de calidad.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <a
          href="https://wa.me/526643850934"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-primary-foreground text-primary font-heading font-bold px-8 py-4 rounded-full text-lg hover:scale-105 transition-transform shadow-lg"
        >
          Contáctanos por WhatsApp
        </a>
        <a
          href="#productos"
          className="inline-flex items-center gap-2 border-2 border-primary-foreground/60 text-primary-foreground font-heading font-semibold px-8 py-4 rounded-full text-lg hover:bg-primary-foreground/10 transition-colors"
        >
          Ver Productos
        </a>
      </div>
    </div>
  </section>
);

export default HeroSection;

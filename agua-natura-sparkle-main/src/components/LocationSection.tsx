const LocationSection = () => (
  <section id="ubicacion" className="py-20 gradient-water-light">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
          Nuestra <span className="text-gradient-water">Ubicación</span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Visítanos en nuestra purificadora en la zona de Otay, Tijuana, B.C.
        </p>
      </div>

      <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-lg">
        <iframe
          title="Ubicación Agua Natura Otay"
          src="https://www.google.com/maps?q=Av.%20Alejandro%20Von%20Humboldt%2010%2C%20Nueva%20Tijuana%2C%2022435%20Tijuana%2C%20B.C.&output=embed"
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="text-center mt-8">
        <p className="text-foreground font-heading font-semibold">
          📍 Av. Alejandro Von Humboldt 10, Nueva Tijuana, 22435 Tijuana, B.C.
        </p>
        <p className="text-muted-foreground text-sm mt-1">
          Lunes a Sábado: 7:00 AM — 7:00 PM | Domingo: 8:00 AM — 3:00 PM
        </p>
      </div>
    </div>
  </section>
);

export default LocationSection;

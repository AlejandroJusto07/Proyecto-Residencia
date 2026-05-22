import garrafonImg from "@/assets/garrafon.png";
import botellaImg from "@/assets/botella.png";
import hieloImg from "@/assets/hielo.png";
import { useProducts } from "@/hooks/useProducts";

const imageFor = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("garrafón") || n.includes("garrafon")) return garrafonImg;
  if (n.includes("hielo")) return hieloImg;
  return botellaImg;
};

const ProductsSection = () => {
  const { products, loading } = useProducts();

  return (
    <section id="productos" className="py-20 gradient-water-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
            Nuestros <span className="text-gradient-water">Productos</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Ofrecemos agua purificada, bebidas y botanas de la mejor calidad para ti y tu familia.
          </p>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Cargando productos...</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-card rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6 flex flex-col items-center text-center group"
              >
                <div className="w-40 h-40 mb-6 flex items-center justify-center">
                  <img
                    src={p.image_url || imageFor(p.name)}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    loading="lazy"
                    width={512}
                    height={512}
                  />
                </div>
                <h3 className="font-heading font-bold text-xl text-foreground mb-1">{p.name}</h3>
                <span className="text-primary font-heading font-bold text-2xl mb-3">
                  ${Number(p.price)} MXN
                </span>
                <p className="text-muted-foreground text-sm leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;

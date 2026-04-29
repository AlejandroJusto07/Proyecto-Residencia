import garrafon20Img from "@/assets/garrafon.png";
import garrafon10Img from "@/assets/garrafon.png";
import botella1LImg from "@/assets/botella.png";
import botella600Img from "@/assets/botella.png";
import hieloImg from "@/assets/hielo.png";
import hielo10Img from "@/assets/hielo.png";
import cheetosImg from "@/assets/botella.png";
import cocacolaLataImg from "@/assets/botella.png";
import dingdongsImg from "@/assets/botella.png";
import twinkiesImg from "@/assets/botella.png";
import piesnackImg from "@/assets/botella.png";
import poweradeImg from "@/assets/botella.png";

const products = [
  {
    name: "Garrafón 20L",
    price: "$22 MXN",
    description: "Agua purificada de la más alta calidad en presentación de 20 litros. Ideal para el hogar y la oficina.",
    image: garrafon20Img,
  },
  {
    name: "Garrafón 10L",
    price: "$17 MXN",
    description: "Agua purificada en presentación de 10 litros. Práctico y fácil de transportar.",
    image: garrafon10Img,
  },
  {
    name: "Botella 1L",
    price: "$12 MXN",
    description: "Perfecta para llevar a donde vayas. Agua fresca y pura en formato de 1 litro.",
    image: botella1LImg,
  },
  {
    name: "Botella 600ml",
    price: "$10 MXN",
    description: "Agua purificada en presentación práctica de 600ml. Ideal para uso personal.",
    image: botella600Img,
  },
  {
    name: "Hielo 10kg",
    price: "$50 MXN",
    description: "Hielo cristalino hecho con agua purificada. Perfecto para tus reuniones y eventos.",
    image: hielo10Img,
  },
  {
    name: "Powerade 1L",
    price: "$40 MXN",
    description: "Bebida deportiva para reponer electrolitos. Presentación de 1 litro.",
    image: poweradeImg,
  },
  {
    name: "Coca-Cola Lata",
    price: "$20 MXN",
    description: "Refrescante Coca-Cola en lata, bien fría para acompañar tus comidas.",
    image: cocacolaLataImg,
  },
  {
    name: "Cheetos Flamin' Hot Crunchy",
    price: "$20 MXN",
    description: "Botana crujiente con el sabor picante e intenso de Flamin' Hot.",
    image: cheetosImg,
  },
  {
    name: "Ding Dongs",
    price: "$15 MXN",
    description: "Pastelitos de chocolate con relleno cremoso. El snack dulce ideal.",
    image: dingdongsImg,
  },
  {
    name: "Hostess Twinkies",
    price: "$15 MXN",
    description: "Clásicos pastelitos esponjosos con relleno de crema. Dulce e irresistible.",
    image: twinkiesImg,
  },
  {
    name: "PieSnack",
    price: "$30 MXN",
    description: "Delicioso pay individual, perfecto para un antojo dulce en cualquier momento.",
    image: piesnackImg,
  },
];

const ProductsSection = () => (
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {products.map((p) => (
          <div
            key={p.name}
            className="bg-card rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6 flex flex-col items-center text-center group"
          >
            <div className="w-40 h-40 mb-6 flex items-center justify-center">
              <img
                src={p.image}
                alt={p.name}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                loading="lazy"
                width={512}
                height={512}
              />
            </div>
            <h3 className="font-heading font-bold text-xl text-foreground mb-1">{p.name}</h3>
            <span className="text-primary font-heading font-bold text-2xl mb-3">{p.price}</span>
            <p className="text-muted-foreground text-sm leading-relaxed">{p.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ProductsSection;

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Droplets, LogOut, BarChart3, Package, ShoppingBag, UserCog } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import AccountSettings from "@/components/AccountSettings";
import DashboardAdmin from "@/components/admin/DashboardAdmin";
import ProductsAdmin from "@/components/admin/ProductsAdmin";
import OrdersAdmin from "@/components/admin/OrdersAdmin";

type Tab = "dashboard" | "productos" | "pedidos" | "cuenta";

const TABS: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "productos", label: "Productos", icon: Package },
  { id: "pedidos", label: "Pedidos", icon: ShoppingBag },
  { id: "cuenta", label: "Mi cuenta", icon: UserCog },
];

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!isAdmin) toast.error("No tienes permisos de administrador.");
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (user && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
        <h1 className="font-heading font-bold text-2xl text-foreground mb-2">Acceso restringido</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          Tu cuenta no tiene permisos de administrador.
        </p>
        <div className="flex gap-3">
          <button onClick={() => signOut().then(() => navigate("/auth"))}
            className="px-5 py-2.5 rounded-full border border-border font-heading font-semibold text-sm">
            Cerrar sesión
          </button>
          <Link to="/" className="px-5 py-2.5 rounded-full gradient-water text-primary-foreground font-heading font-semibold text-sm">
            Ir al sitio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Droplets className="h-7 w-7 text-primary" />
            <span className="font-heading font-bold text-lg">
              Panel <span className="text-gradient-water">Admin</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-muted-foreground">{user?.email}</span>
            <button onClick={() => signOut().then(() => navigate("/"))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-sm font-heading font-semibold hover:bg-muted transition-colors">
              <LogOut className="h-4 w-4" /> Salir
            </button>
          </div>
        </div>
        <nav className="container mx-auto px-4 flex gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-heading font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {tab === "dashboard" && <DashboardAdmin />}
        {tab === "productos" && <ProductsAdmin />}
        {tab === "pedidos" && <OrdersAdmin />}
        {tab === "cuenta" && <AccountSettings currentEmail={user?.email ?? ""} />}
      </main>
    </div>
  );
};

export default Admin;

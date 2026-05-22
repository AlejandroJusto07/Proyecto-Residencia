import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Droplets } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate("/admin");
  }, [session, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw error;
      toast.success("¡Bienvenido!");
      navigate("/admin");
    } catch (err: any) {
      toast.error(err.message ?? "Error al iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-card px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Droplets className="h-9 w-9 text-primary" />
          <span className="font-heading font-bold text-2xl text-foreground">
            Agua Natura <span className="text-gradient-water">Otay</span>
          </span>
        </Link>

        <div className="bg-card rounded-2xl shadow-lg p-8 space-y-5">
          <div>
            <h1 className="font-heading font-bold text-2xl text-foreground">
              Iniciar sesión
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Acceso exclusivo al panel de administración.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-heading font-semibold text-sm text-foreground mb-1">
                Correo
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="admin@ejemplo.com"
              />
            </div>
            <div>
              <label className="block font-heading font-semibold text-sm text-foreground mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full gradient-water text-primary-foreground font-heading font-bold py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? "Procesando..." : "Entrar"}
            </button>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            El registro está deshabilitado. Solo el administrador tiene acceso.
          </p>
        </div>

        <Link
          to="/"
          className="block text-center text-sm text-muted-foreground hover:text-primary mt-6"
        >
          ← Volver al sitio
        </Link>
      </div>
    </div>
  );
};

export default Auth;

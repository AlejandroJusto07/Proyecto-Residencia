import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Props = { currentEmail: string };

const AccountSettings = ({ currentEmail }: Props) => {
  const [email, setEmail] = useState(currentEmail);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEmail = email.trim().toLowerCase();
    if (newEmail === currentEmail.toLowerCase()) {
      toast.info("Ese ya es tu correo actual");
      return;
    }
    const ok = window.confirm(
      `Se enviarán enlaces de confirmación a:\n\n• ${currentEmail} (correo actual)\n• ${newEmail} (correo nuevo)\n\nDebes confirmar AMBOS para que el cambio tenga efecto. Hasta entonces seguirás accediendo con tu correo actual.\n\n¿Continuar?`
    );
    if (!ok) return;
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser(
      { email: newEmail },
      { emailRedirectTo: `${window.location.origin}/admin` }
    );
    setSavingEmail(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPendingEmail(newEmail);
    toast.success(
      "Te enviamos enlaces de confirmación. Revisa ambos correos para completar el cambio."
    );
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setSavingPwd(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSavingPwd(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Contraseña actualizada");
      setPassword("");
      setConfirm("");
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-6">
      <div>
        <h2 className="font-heading font-bold text-lg text-foreground">
          Mi cuenta
        </h2>
        <p className="text-sm text-muted-foreground">
          Actualiza tu correo o contraseña de administrador.
        </p>
      </div>

      <form onSubmit={handleEmail} className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-heading font-semibold text-foreground">
          <Mail className="h-4 w-4" /> Correo
        </label>
        <div className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={savingEmail}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-heading font-semibold text-sm hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
          >
            {savingEmail ? "..." : "Guardar"}
          </button>
        </div>
        {pendingEmail && (
          <p className="text-xs text-muted-foreground bg-muted/40 border border-border rounded-md px-3 py-2">
            Cambio pendiente de confirmación a <strong>{pendingEmail}</strong>.
            Abre los enlaces enviados a tu correo actual y al nuevo para
            activarlo.
          </p>
        )}
      </form>

      <form onSubmit={handlePassword} className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-heading font-semibold text-foreground">
          <KeyRound className="h-4 w-4" /> Cambiar contraseña
        </label>
        <input
          type="password"
          placeholder="Nueva contraseña (mín. 6)"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        <input
          type="password"
          placeholder="Confirmar nueva contraseña"
          minLength={6}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={savingPwd || !password}
          className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground font-heading font-semibold text-sm hover:opacity-90 disabled:opacity-50"
        >
          {savingPwd ? "Guardando..." : "Actualizar contraseña"}
        </button>
      </form>
    </div>
  );
};

export default AccountSettings;

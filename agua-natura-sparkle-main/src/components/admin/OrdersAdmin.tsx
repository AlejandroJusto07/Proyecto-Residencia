import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Status = "pendiente" | "entregado" | "cancelado";
type DeliveryType = "sitio" | "domicilio";
type Source = "web" | "manual";

type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
};

type Order = {
  id: string;
  customer_name: string;
  phone: string;
  delivery_type: DeliveryType;
  address: string;
  total: number;
  status: Status;
  source: Source;
  notes: string;
  created_at: string;
};

type Product = { id: string; name: string; price: number; available: boolean; stock: number };

type ManualItem = { product_id: string; quantity: number };

const statusColor: Record<Status, string> = {
  pendiente: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  entregado: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
  cancelado: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
};

const OrdersAdmin = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Record<string, OrderItem[]>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [showNew, setShowNew] = useState(false);

  const [newOrder, setNewOrder] = useState({ name: "", phone: "", delivery: "sitio" as DeliveryType, address: "", notes: "" });
  const [newItems, setNewItems] = useState<ManualItem[]>([{ product_id: "", quantity: 1 }]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [{ data: ords, error: e1 }, { data: prods, error: e2 }] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("id, name, price, available, stock").order("sort_order"),
    ]);
    if (e1) toast.error(e1.message);
    if (e2) toast.error(e2.message);
    setOrders((ords ?? []) as Order[]);
    setProducts((prods ?? []) as Product[]);
    setLoading(false);
  };

  const loadItems = async (orderId: string) => {
    if (items[orderId]) return;
    const { data, error } = await supabase.from("order_items").select("*").eq("order_id", orderId);
    if (error) return toast.error(error.message);
    setItems((prev) => ({ ...prev, [orderId]: (data ?? []) as OrderItem[] }));
  };

  const toggleExpand = (id: string) => {
    if (expanded === id) setExpanded(null);
    else {
      setExpanded(id);
      loadItems(id);
    }
  };

  const updateStatus = async (id: string, status: Status) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      toast.success("Estado actualizado");
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("¿Eliminar este pedido?")) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      setOrders((prev) => prev.filter((o) => o.id !== id));
      toast.success("Pedido eliminado");
    }
  };

  const sendConfirmation = async (o: Order) => {
    if (!o.phone) return toast.error("El pedido no tiene teléfono del cliente");
    let orderItems = items[o.id];
    if (!orderItems) {
      const { data, error } = await supabase.from("order_items").select("*").eq("order_id", o.id);
      if (error) return toast.error(error.message);
      orderItems = (data ?? []) as OrderItem[];
      setItems((prev) => ({ ...prev, [o.id]: orderItems! }));
    }
    const detalle = orderItems.map((it) => `• ${it.quantity} × ${it.product_name}`).join("\n");
    const entrega = o.delivery_type === "domicilio"
      ? `🚚 *Entrega a domicilio*${o.address ? ` en: ${o.address}` : ""}. Nuestro repartidor llegará en aproximadamente 30-45 minutos.`
      : `🏪 *Recoger en sitio*. Tu pedido estará listo para recoger en aproximadamente 15 minutos en nuestra sucursal.`;
    const mensaje =
      `¡Hola ${o.customer_name}! 💧\n\n` +
      `Confirmamos que hemos recibido tu pedido en *Agua Natura Otay* y ya estamos trabajando en él. ✅\n\n` +
      `*Resumen de tu pedido:*\n${detalle}\n\n` +
      `*Total:* $${Number(o.total).toFixed(0)} MXN\n\n` +
      `${entrega}\n\n` +
      `¡Gracias por tu preferencia! 🙌`;
    const phone = o.phone.replace(/\D/g, "");
    const fullPhone = phone.length === 10 ? `52${phone}` : phone;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(mensaje)}`, "_blank");
    toast.success("Abriendo WhatsApp para enviar confirmación");
  };

  const filtered = useMemo(
    () => orders.filter((o) => statusFilter === "all" || o.status === statusFilter),
    [orders, statusFilter]
  );

  const newTotal = useMemo(
    () => newItems.reduce((sum, it) => {
      const p = products.find((x) => x.id === it.product_id);
      return sum + (p ? p.price * (it.quantity || 0) : 0);
    }, 0),
    [newItems, products]
  );

  const submitManual = async () => {
    const valid = newItems.filter((it) => it.product_id && it.quantity > 0);
    if (!newOrder.name.trim()) return toast.error("Nombre del cliente requerido");
    if (valid.length === 0) return toast.error("Agrega al menos un producto");

    // Validar stock agregando cantidades por producto
    const aggregated = new Map<string, number>();
    for (const it of valid) {
      aggregated.set(it.product_id, (aggregated.get(it.product_id) ?? 0) + it.quantity);
    }
    for (const [pid, qty] of aggregated) {
      const p = products.find((x) => x.id === pid);
      if (!p) return toast.error("Producto no válido");
      if ((p.stock ?? 0) < qty)
        return toast.error(`Inventario insuficiente para ${p.name}. Disponible: ${p.stock}`);
    }

    const { data: order, error } = await supabase.from("orders").insert({
      customer_name: newOrder.name,
      phone: newOrder.phone,
      delivery_type: newOrder.delivery,
      address: newOrder.delivery === "domicilio" ? newOrder.address : "",
      total: newTotal,
      source: "manual",
      notes: newOrder.notes,
    }).select().single();

    if (error || !order) return toast.error(error?.message ?? "Error");

    const rows = valid.map((it) => {
      const p = products.find((x) => x.id === it.product_id)!;
      return {
        order_id: order.id,
        product_id: p.id,
        product_name: p.name,
        unit_price: p.price,
        quantity: it.quantity,
        subtotal: p.price * it.quantity,
      };
    });
    const { error: e2 } = await supabase.from("order_items").insert(rows);
    if (e2) return toast.error(e2.message);

    for (const [pid, qty] of aggregated) {
      const { error: decErr } = await supabase.rpc("decrement_stock", { _product_id: pid, _qty: qty });
      if (decErr) return toast.error(decErr.message);
    }

    toast.success("Pedido manual registrado");
    setNewOrder({ name: "", phone: "", delivery: "sitio", address: "", notes: "" });
    setNewItems([{ product_id: "", quantity: 1 }]);
    setShowNew(false);
    load();
  };

  const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-heading font-bold text-2xl text-foreground">Pedidos</h2>
          <p className="text-sm text-muted-foreground">Gestiona pedidos del sitio y registra ventas físicas.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as Status | "all")} className={`${inputCls} w-auto`}>
            <option value="all">Todos</option>
            <option value="pendiente">Pendientes</option>
            <option value="entregado">Entregados</option>
            <option value="cancelado">Cancelados</option>
          </select>
          <button onClick={() => setShowNew((v) => !v)} className="flex items-center gap-2 gradient-water text-primary-foreground font-heading font-semibold text-sm px-4 py-2.5 rounded-full hover:opacity-90">
            <Plus className="h-4 w-4" /> Nuevo pedido
          </button>
        </div>
      </div>

      {showNew && (
        <div className="bg-card rounded-xl border border-border p-4 mb-6 space-y-3">
          <h3 className="font-heading font-semibold">Nuevo pedido manual</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <input placeholder="Nombre del cliente" value={newOrder.name} onChange={(e) => setNewOrder({ ...newOrder, name: e.target.value })} className={inputCls} />
            <input placeholder="Teléfono (opcional)" value={newOrder.phone} onChange={(e) => setNewOrder({ ...newOrder, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} className={inputCls} />
            <select value={newOrder.delivery} onChange={(e) => setNewOrder({ ...newOrder, delivery: e.target.value as DeliveryType })} className={inputCls}>
              <option value="sitio">En sitio</option>
              <option value="domicilio">A domicilio</option>
            </select>
            {newOrder.delivery === "domicilio" && (
              <input placeholder="Dirección" value={newOrder.address} onChange={(e) => setNewOrder({ ...newOrder, address: e.target.value })} className={inputCls} />
            )}
          </div>
          <div className="space-y-2">
            {newItems.map((it, idx) => (
              <div key={idx} className="flex gap-2">
                <select value={it.product_id} onChange={(e) => setNewItems((prev) => prev.map((x, i) => i === idx ? { ...x, product_id: e.target.value } : x))} className={`${inputCls} flex-1`}>
                  <option value="">Selecciona producto</option>
                  {products.map((p) => <option key={p.id} value={p.id} disabled={(p.stock ?? 0) <= 0}>{p.name} — ${p.price}{(p.stock ?? 0) <= 0 ? " (Agotado)" : ` · ${p.stock} disp.`}</option>)}
                </select>
                <input type="number" min={1} step={1} value={it.quantity}
                  onKeyDown={(e) => { if (["e","E","+","-",".",","].includes(e.key)) e.preventDefault(); }}
                  onChange={(e) => {
                    const n = Math.max(1, Math.floor(Number(e.target.value) || 1));
                    setNewItems((prev) => prev.map((x, i) => i === idx ? { ...x, quantity: n } : x));
                  }}
                  className={`${inputCls} w-20`} />
                <button onClick={() => setNewItems((prev) => prev.length === 1 ? prev : prev.filter((_, i) => i !== idx))} className="p-2 rounded-lg border border-border text-muted-foreground hover:text-destructive disabled:opacity-40" disabled={newItems.length === 1}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button onClick={() => setNewItems((prev) => [...prev, { product_id: "", quantity: 1 }])} className="flex items-center gap-1.5 text-primary text-sm font-semibold">
              <Plus className="h-3.5 w-3.5" /> Agregar producto
            </button>
          </div>
          <textarea placeholder="Notas (opcional)" value={newOrder.notes} onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })} rows={2} className={`${inputCls} resize-none`} />
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="font-heading font-semibold">Total: <span className="text-primary">${newTotal} MXN</span></span>
            <div className="flex gap-2">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-lg border border-border text-sm">Cancelar</button>
              <button onClick={submitManual} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">Registrar</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground">Cargando pedidos...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No hay pedidos.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((o) => (
            <div key={o.id} className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 flex flex-wrap items-center gap-3">
                <button onClick={() => toggleExpand(o.id)} className="text-muted-foreground hover:text-foreground">
                  {expanded === o.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <div className="flex-1 min-w-[180px]">
                  <p className="font-heading font-semibold text-foreground">{o.customer_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}
                    {o.phone && ` · ${o.phone}`} · {o.delivery_type === "sitio" ? "En sitio" : "Domicilio"}
                    {o.source === "manual" && " · Manual"}
                  </p>
                </div>
                <span className="font-heading font-bold text-primary">${Number(o.total).toFixed(0)}</span>
                <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value as Status)}
                  className={`text-xs px-2 py-1 rounded-full border font-semibold ${statusColor[o.status]}`}>
                  <option value="pendiente">Pendiente</option>
                  <option value="entregado">Entregado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
                <button onClick={() => sendConfirmation(o)} disabled={!o.phone} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/30 text-xs font-heading font-semibold hover:bg-green-500/20 disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Confirmación de pedido" title={o.phone ? "Enviar confirmación por WhatsApp" : "Sin teléfono del cliente"}>
                  <MessageCircle className="h-3.5 w-3.5" /> Confirmación de Pedido
                </button>
                <button onClick={() => deleteOrder(o.id)} className="p-2 text-muted-foreground hover:text-destructive" aria-label="Eliminar">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {expanded === o.id && (
                <div className="border-t border-border p-4 bg-muted/30 text-sm space-y-2">
                  {o.address && <p><span className="font-semibold">Dirección:</span> {o.address}</p>}
                  {o.notes && <p><span className="font-semibold">Notas:</span> {o.notes}</p>}
                  <div>
                    <p className="font-semibold mb-1">Productos:</p>
                    {!items[o.id] ? (
                      <p className="text-muted-foreground">Cargando...</p>
                    ) : (
                      <ul className="space-y-1">
                        {items[o.id].map((it) => (
                          <li key={it.id} className="flex justify-between">
                            <span>{it.quantity} × {it.product_name}</span>
                            <span>${Number(it.subtotal).toFixed(0)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersAdmin;

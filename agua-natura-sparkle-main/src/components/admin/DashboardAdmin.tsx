import { useEffect, useMemo, useState } from "react";
import { TrendingUp, Package, DollarSign, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Order = {
  id: string;
  total: number;
  status: "pendiente" | "entregado" | "cancelado";
  source: "web" | "manual";
  delivery_type: "sitio" | "domicilio";
  created_at: string;
};

type Item = { product_name: string; quantity: number; subtotal: number; order_id: string };

const todayISO = () => new Date().toISOString().slice(0, 10);
const daysAgoISO = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const DashboardAdmin = () => {
  const [from, setFrom] = useState(daysAgoISO(29));
  const [to, setTo] = useState(todayISO());
  const [statusFilter, setStatusFilter] = useState<"all" | Order["status"]>("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | Order["source"]>("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(); }, [from, to]);

  const load = async () => {
    setLoading(true);
    const fromTs = `${from}T00:00:00`;
    const toTs = `${to}T23:59:59`;
    const { data: ords, error } = await supabase
      .from("orders")
      .select("id, total, status, source, delivery_type, created_at")
      .gte("created_at", fromTs)
      .lte("created_at", toTs);
    if (error) toast.error(error.message);
    const ordList = (ords ?? []) as Order[];
    setOrders(ordList);

    if (ordList.length > 0) {
      const ids = ordList.map((o) => o.id);
      const { data: its, error: e2 } = await supabase
        .from("order_items")
        .select("product_name, quantity, subtotal, order_id")
        .in("order_id", ids);
      if (e2) toast.error(e2.message);
      setItems((its ?? []) as Item[]);
    } else {
      setItems([]);
    }
    setLoading(false);
  };

  const filtered = useMemo(() => orders.filter((o) =>
    (statusFilter === "all" || o.status === statusFilter) &&
    (sourceFilter === "all" || o.source === sourceFilter)
  ), [orders, statusFilter, sourceFilter]);

  const filteredIds = useMemo(() => new Set(filtered.map((o) => o.id)), [filtered]);
  const filteredItems = useMemo(() => items.filter((it) => filteredIds.has(it.order_id)), [items, filteredIds]);

  const totalRevenue = filtered.filter((o) => o.status === "entregado").reduce((s, o) => s + Number(o.total), 0);
  const totalOrders = filtered.length;
  const pendingCount = filtered.filter((o) => o.status === "pendiente").length;
  const avgTicket = totalOrders > 0 ? filtered.reduce((s, o) => s + Number(o.total), 0) / totalOrders : 0;

  const topProducts = useMemo(() => {
    const map = new Map<string, { qty: number; revenue: number }>();
    filteredItems.forEach((it) => {
      const cur = map.get(it.product_name) ?? { qty: 0, revenue: 0 };
      cur.qty += it.quantity;
      cur.revenue += Number(it.subtotal);
      map.set(it.product_name, cur);
    });
    return Array.from(map.entries()).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [filteredItems]);

  const dailyData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((o) => {
      const day = o.created_at.slice(0, 10);
      map.set(day, (map.get(day) ?? 0) + Number(o.total));
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const maxDaily = Math.max(1, ...dailyData.map(([, v]) => v));

  const inputCls = "rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  const stats = [
    { icon: DollarSign, label: "Ingresos entregados", value: `$${totalRevenue.toFixed(0)} MXN` },
    { icon: ShoppingBag, label: "Total pedidos", value: totalOrders.toString() },
    { icon: Package, label: "Pendientes", value: pendingCount.toString() },
    { icon: TrendingUp, label: "Ticket promedio", value: `$${avgTicket.toFixed(0)}` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-bold text-2xl text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Reportes y métricas de pedidos.</p>
      </div>

      <div className="flex flex-wrap gap-3 items-end bg-card border border-border rounded-xl p-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Desde</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Hasta</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Estado</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className={inputCls}>
            <option value="all">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="entregado">Entregado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Origen</label>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as typeof sourceFilter)} className={inputCls}>
            <option value="all">Todos</option>
            <option value="web">Web</option>
            <option value="manual">Manual</option>
          </select>
        </div>
        <div className="flex gap-1.5 ml-auto">
          {[
            { l: "Hoy", d: 0 },
            { l: "7 días", d: 6 },
            { l: "30 días", d: 29 },
            { l: "90 días", d: 89 },
          ].map((q) => (
            <button key={q.l} onClick={() => { setFrom(daysAgoISO(q.d)); setTo(todayISO()); }}
              className="text-xs px-3 py-2 rounded-lg border border-border hover:bg-muted">
              {q.l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <s.icon className="h-4 w-4" /> {s.label}
            </div>
            <p className="font-heading font-bold text-2xl text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-heading font-semibold mb-4">Ventas por día</h3>
          {loading ? (
            <p className="text-muted-foreground text-sm">Cargando...</p>
          ) : dailyData.length === 0 ? (
            <p className="text-muted-foreground text-sm">Sin datos en este rango.</p>
          ) : (
            <div className="space-y-2">
              {dailyData.map(([day, val]) => (
                <div key={day} className="flex items-center gap-2 text-xs">
                  <span className="w-20 text-muted-foreground">{day.slice(5)}</span>
                  <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
                    <div className="h-full gradient-water" style={{ width: `${(val / maxDaily) * 100}%` }} />
                  </div>
                  <span className="w-16 text-right font-semibold">${val.toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-heading font-semibold mb-4">Productos más vendidos</h3>
          {topProducts.length === 0 ? (
            <p className="text-muted-foreground text-sm">Sin datos.</p>
          ) : (
            <ul className="space-y-2">
              {topProducts.map((p, i) => (
                <li key={p.name} className="flex items-center justify-between gap-3 text-sm border-b border-border/50 last:border-0 pb-2 last:pb-0">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="font-medium">{p.name}</span>
                  </span>
                  <span className="text-foreground font-semibold">${p.revenue.toFixed(0)} MXN</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;

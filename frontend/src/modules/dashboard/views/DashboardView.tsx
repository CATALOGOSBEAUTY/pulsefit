import { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Boxes,
  DollarSign,
  Image,
  Layers3,
  Package,
  ShoppingBag,
  Tag,
  TrendingUp,
} from 'lucide-react';
import { type CatalogMetrics, type DashboardStats, getDashboardStats } from '../../../services/dashboardService';

const emptyCatalogMetrics: CatalogMetrics = {
  summary: {
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    liveProducts: 0,
    completionScore: 0,
    averagePrice: 0,
    priceMin: 0,
    priceMax: 0,
    featuredProducts: 0,
    promoProducts: 0,
    newProducts: 0,
  },
  statusFunnel: { draft: 0, ready: 0, live: 0 },
  imageCoverage: { total: 0, withImage: 0, withoutImage: 0, percent: 0 },
  stockHealth: { totalUnits: 0, ok: 0, low: 0, zero: 0, variantManaged: 0, lowStockThreshold: 5 },
  sales: { totalOrders: 0, validOrders: 0, cancelledOrders: 0, totalRevenue: 0, averageTicket: 0, unitsSold: 0 },
  audience: [],
  quality: {
    withoutImage: { count: 0, products: [] },
    withoutPrice: { count: 0, products: [] },
    withoutCategory: { count: 0, products: [] },
    withoutSubcategory: { count: 0, products: [] },
    zeroStock: { count: 0, products: [] },
    lowStock: { count: 0, products: [] },
    emptyCategories: { count: 0, categories: [] },
  },
  topProductsByRevenue: [],
  topProductsByUnits: [],
  categoryPerformance: [],
  activity: {
    productsCreatedLast7Days: 0,
    productsCreatedLast30Days: 0,
    ordersLast7Days: 0,
    ordersLast30Days: 0,
    revenueLast7Days: 0,
    revenueLast30Days: 0,
  },
  alerts: [],
};

const emptyDashboard: DashboardStats = {
  totalProducts: 0,
  activeProducts: 0,
  inactiveProducts: 0,
  categories: 0,
  featuredProducts: 0,
  promoProducts: 0,
  orders: 0,
  recentProducts: [],
  catalogMetrics: emptyCatalogMetrics,
};

function currency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function percentBar(value: number, color = 'bg-purple-700') {
  return (
    <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
    </div>
  );
}

function MiniMetric({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
      <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{label}</p>
      <strong className="block mt-1 text-lg font-black text-neutral-900">{value}</strong>
      {detail && <span className="text-[11px] text-neutral-500">{detail}</span>}
    </div>
  );
}

function RankingList({ title, items, valueType }: {
  title: string;
  items: CatalogMetrics['topProductsByRevenue'];
  valueType: 'revenue' | 'units';
}) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
      <h3 className="text-xs font-black text-neutral-600 uppercase tracking-widest mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-400">Sem vendas registradas.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <div key={`${title}-${item.id}`} className="flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="font-bold text-neutral-800 truncate">{index + 1}. {item.title}</p>
                <span className="text-[11px] uppercase tracking-widest text-neutral-400">{item.audience}</span>
              </div>
              <strong className="shrink-0 text-neutral-900">
                {valueType === 'revenue' ? currency(item.revenue) : `${item.unitsSold} un.`}
              </strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DashboardView() {
  const [dashboard, setDashboard] = useState<DashboardStats>(emptyDashboard);

  useEffect(() => {
    getDashboardStats().then((stats) => {
      setDashboard({ ...stats, catalogMetrics: stats.catalogMetrics ?? emptyCatalogMetrics });
    }).catch(() => undefined);
  }, []);

  const metrics = dashboard.catalogMetrics ?? emptyCatalogMetrics;
  const stats = [
    { label: 'Total de Produtos', value: dashboard.totalProducts.toString(), icon: Package, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Produtos Ativos', value: dashboard.activeProducts.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Categorias Ativas', value: dashboard.categories.toString(), icon: Tag, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Destaques/Promocoes', value: (dashboard.featuredProducts + dashboard.promoProducts).toString(), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ];
  const recentProducts = dashboard.recentProducts.slice(0, 4);
  const statusTotal = metrics.statusFunnel.draft + metrics.statusFunnel.ready + metrics.statusFunnel.live;

  return (
    <div className="flex flex-col gap-4 md:gap-8 max-w-7xl mx-auto pb-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-neutral-900">Dashboard</h1>
        <p className="text-xs md:text-sm text-neutral-500 mt-1">Visao geral do sistema de catalogo PulseFit.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-3 md:p-6 rounded-xl md:rounded-2xl border border-neutral-200 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
            <div className={`w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-lg md:text-2xl font-bold text-neutral-900 mt-0.5 md:mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}

        <div className="col-span-2 lg:col-span-4 bg-amber-50 border border-amber-200 rounded-xl md:rounded-2xl p-3 md:p-4 flex items-start md:items-center gap-3 md:gap-4">
          <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-amber-600 shrink-0 mt-0.5 md:mt-0" />
          <p className="text-xs md:text-sm text-amber-800 font-medium">Voce possui <strong>{dashboard.inactiveProducts} produtos inativos</strong> no momento. Eles nao estao visiveis no catalogo principal.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        <div className="xl:col-span-2 bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base md:text-lg font-black text-neutral-900 uppercase tracking-tight">Metricas de Catalogo</h2>
              <p className="text-xs md:text-sm text-neutral-500 mt-1">Qualidade, publicacao, estoque, vendas e cobertura operacional.</p>
            </div>
            <div className="rounded-2xl bg-neutral-900 text-white p-4 min-w-[170px]">
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Score do catalogo</p>
              <strong className="block text-3xl font-black mt-1">{metrics.summary.completionScore}%</strong>
              <div className="mt-3">{percentBar(metrics.summary.completionScore, 'bg-emerald-400')}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <MiniMetric label="Receita valida" value={currency(metrics.sales.totalRevenue)} detail={`${metrics.sales.validOrders} pedidos`} />
            <MiniMetric label="Ticket medio" value={currency(metrics.sales.averageTicket)} detail={`${metrics.sales.unitsSold} itens vendidos`} />
            <MiniMetric label="Preco medio" value={currency(metrics.summary.averagePrice)} detail={`${currency(metrics.summary.priceMin)} - ${currency(metrics.summary.priceMax)}`} />
            <MiniMetric label="Estoque total" value={metrics.stockHealth.totalUnits} detail={`${metrics.stockHealth.variantManaged} com variantes`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl border border-neutral-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black text-neutral-600 uppercase tracking-widest flex items-center gap-2"><Image className="w-4 h-4" /> Cobertura de imagens</h3>
                <strong className="text-sm text-neutral-900">{metrics.imageCoverage.percent}%</strong>
              </div>
              {percentBar(metrics.imageCoverage.percent, 'bg-blue-600')}
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-neutral-500">
                <span>{metrics.imageCoverage.withImage} com imagem</span>
                <span>{metrics.imageCoverage.withoutImage} sem imagem</span>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-100 p-4">
              <h3 className="text-xs font-black text-neutral-600 uppercase tracking-widest flex items-center gap-2 mb-3"><Boxes className="w-4 h-4" /> Saude do estoque</h3>
              <div className="grid grid-cols-3 gap-2">
                <MiniMetric label="OK" value={metrics.stockHealth.ok} />
                <MiniMetric label="Baixo" value={metrics.stockHealth.low} />
                <MiniMetric label="Zerado" value={metrics.stockHealth.zero} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl border border-neutral-100 p-4">
              <h3 className="text-xs font-black text-neutral-600 uppercase tracking-widest flex items-center gap-2 mb-4"><BarChart3 className="w-4 h-4" /> Funil de publicacao</h3>
              {[
                { label: 'Rascunho', value: metrics.statusFunnel.draft, color: 'bg-neutral-400' },
                { label: 'Pronto', value: metrics.statusFunnel.ready, color: 'bg-amber-500' },
                { label: 'Publicado', value: metrics.statusFunnel.live, color: 'bg-emerald-600' },
              ].map((item) => (
                <div key={item.label} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-xs font-bold text-neutral-600 mb-1">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                  {percentBar(percentOf(item.value, statusTotal), item.color)}
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-neutral-100 p-4">
              <h3 className="text-xs font-black text-neutral-600 uppercase tracking-widest flex items-center gap-2 mb-4"><Activity className="w-4 h-4" /> Atividade recente</h3>
              <div className="grid grid-cols-2 gap-2">
                <MiniMetric label="Produtos 7d" value={metrics.activity.productsCreatedLast7Days} />
                <MiniMetric label="Produtos 30d" value={metrics.activity.productsCreatedLast30Days} />
                <MiniMetric label="Pedidos 7d" value={metrics.activity.ordersLast7Days} detail={currency(metrics.activity.revenueLast7Days)} />
                <MiniMetric label="Pedidos 30d" value={metrics.activity.ordersLast30Days} detail={currency(metrics.activity.revenueLast30Days)} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-100 p-4 mb-6">
            <h3 className="text-xs font-black text-neutral-600 uppercase tracking-widest flex items-center gap-2 mb-4"><Layers3 className="w-4 h-4" /> Distribuicao por publico</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {metrics.audience.map((item) => (
                <div key={item.key} className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <strong className="text-sm text-neutral-900">{item.label}</strong>
                    <span className="text-xs font-bold text-neutral-500">{item.total} produtos</span>
                  </div>
                  {percentBar(percentOf(item.live, item.total), item.key === 'masculino' ? 'bg-blue-600' : item.key === 'suplemento' ? 'bg-emerald-600' : 'bg-pink-600')}
                  <div className="grid grid-cols-3 gap-1 mt-3 text-[11px] text-neutral-500">
                    <span>{item.live} live</span>
                    <span>{item.withoutImage} s/ img</span>
                    <span>{item.stockUnits} est.</span>
                  </div>
                  <p className="text-xs font-bold text-neutral-700 mt-2">{currency(item.revenue)} vendidos</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RankingList title="Top por receita" items={metrics.topProductsByRevenue} valueType="revenue" />
            <RankingList title="Top por unidades" items={metrics.topProductsByUnits} valueType="units" />
          </div>
        </div>

        <div className="flex flex-col gap-4 md:gap-6">
          <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm">
            <h2 className="text-base md:text-lg font-black text-neutral-900 mb-4 uppercase tracking-tight">Alertas do Catalogo</h2>
            {metrics.alerts.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-700 font-bold">
                Nenhum alerta critico encontrado.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {metrics.alerts.slice(0, 6).map((alert) => (
                  <div key={alert.label} className={`rounded-xl border p-3 ${alert.severity === 'critical' ? 'bg-red-50 border-red-100 text-red-700' : alert.severity === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <strong className="text-sm">{alert.label}</strong>
                      <span className="text-lg font-black">{alert.count}</span>
                    </div>
                    <p className="text-xs mt-1 opacity-80">{alert.action}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm">
            <h2 className="text-base md:text-lg font-black text-neutral-900 mb-4 uppercase tracking-tight flex items-center gap-2"><DollarSign className="w-5 h-5" /> Categorias</h2>
            {metrics.categoryPerformance.length === 0 ? (
              <p className="text-sm text-neutral-400">Sem categorias com dados.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {metrics.categoryPerformance.slice(0, 6).map((category) => (
                  <div key={category.categoryId} className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-sm text-neutral-900 truncate">{category.name}</strong>
                      <span className="text-xs font-bold text-neutral-500">{category.totalProducts} prod.</span>
                    </div>
                    <div className="mt-2">{percentBar(percentOf(category.liveProducts, category.totalProducts), 'bg-purple-700')}</div>
                    <div className="grid grid-cols-3 gap-1 mt-2 text-[11px] text-neutral-500">
                      <span>{category.liveProducts} live</span>
                      <span>{category.unitsSold} un.</span>
                      <span>{currency(category.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm">
            <h2 className="text-base md:text-lg font-bold text-neutral-900 mb-4 md:mb-6">Ultimos Adicionados</h2>

            {recentProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] md:h-[250px] text-neutral-400 border-2 border-dashed border-neutral-100 rounded-xl">
                <Package className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">Nenhum produto cadastrado</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {recentProducts.map((p) => {
                  const image = p.product_images?.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0]?.url;
                  return (
                    <div key={p.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                      <div className="w-10 h-10 bg-neutral-200 rounded-lg shrink-0 overflow-hidden">
                        {image ? (
                          <img src={image} alt={p.title} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 m-auto text-neutral-400 mt-2.5" />
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-sm font-bold text-neutral-900 truncate">{p.title}</h4>
                        <p className="text-xs text-neutral-500">{currency(Number(p.price))}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function percentOf(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

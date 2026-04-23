import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoginView } from './modules/auth/views/LoginView';
import { AdminLayout } from './modules/layout/views/AdminLayout';
import { DashboardView } from './modules/dashboard/views/DashboardView';
import { ProductsListView } from './modules/products/views/ProductsListView';
import { CategoriesView } from './modules/categories/views/CategoriesView';
import { MediaView } from './modules/media/views/MediaView';
import { HighlightsView } from './modules/highlights/views/HighlightsView';
import { Header } from './components/layout/Header';
import { Hero } from './components/hero/Hero';
import { Catalog } from './components/catalog/Catalog';
import { ProductDetail } from './components/catalog/ProductDetail';
import { CartDrawer } from './components/cart/CartDrawer';
import { useStore } from './store/useStore';

type PublicTab = 'inicio' | 'catalogo' | 'contato';

const publicTabByPath: Record<string, PublicTab> = {
  '/inicio': 'inicio',
  '/catalogo': 'catalogo',
  '/contato': 'contato'
};

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

// Mini componente para a página pública
function PublicStore() {
  const location = useLocation();
  const { activeTab, setActiveTab } = useStore();
  const isProductPage = location.pathname.startsWith('/produto/');
  const routedTab = isProductPage ? 'catalogo' : publicTabByPath[location.pathname] ?? 'catalogo';

  useEffect(() => {
    if (activeTab !== routedTab) {
      setActiveTab(routedTab);
    }
  }, [activeTab, routedTab, setActiveTab]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-neutral-50 text-neutral-900 selection:bg-purple-200">
      <ScrollToTop />
      <Header />
      <main className="flex-1 flex flex-col">
        {routedTab === 'inicio' && <Hero />}
        {isProductPage ? <ProductDetail /> : routedTab === 'catalogo' && <Catalog />}
        {routedTab === 'contato' && (
          <div className="flex-1 flex items-center justify-center p-8 text-neutral-500">
             Módulo de Contato será inserido aqui.
          </div>
        )}
      </main>
      <CartDrawer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rota pública da Loja */}
        <Route path="/" element={<Navigate to="/catalogo" replace />} />
        <Route path="/inicio" element={<PublicStore />} />
        <Route path="/catalogo" element={<PublicStore />} />
        <Route path="/produto/:slug" element={<PublicStore />} />
        <Route path="/contato" element={<PublicStore />} />

        {/* Rota pública de login admin */}
        <Route path="/login" element={<LoginView />} />
        {/* Rotas Privadas (Admin Layout) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardView />} />
          <Route path="products" element={<ProductsListView />} />
          <Route path="categories" element={<CategoriesView />} />
          <Route path="media" element={<MediaView />} />
          <Route path="highlights" element={<HighlightsView />} />
          <Route path="settings" element={<div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm text-neutral-500">Módulo de Configurações em Construção</div>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/catalogo" replace />} />
      </Routes>
    </Router>
  );
}

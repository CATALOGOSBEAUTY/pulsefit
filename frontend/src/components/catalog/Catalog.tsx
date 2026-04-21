import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import { Search, ChevronLeft, ChevronRight, PackageX, Menu, X } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { useStore } from "../../store/useStore";
import { listCategories } from "../../services/categoryService";
import { listPublicProducts } from "../../services/productService";
import { Product } from "../../types";

interface CatalogCategory {
  id: string;
  name: string;
  parent_id?: string | null;
  parentId?: string | null;
}

function getParentId(category: CatalogCategory) {
  return category.parent_id ?? category.parentId ?? null;
}

export function Catalog() {
  const { activeCategory, setActiveCategory } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [storeCategories, setStoreCategories] = useState<CatalogCategory[]>([]);
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const itemsPerPage = 8;

  // Abre o sidebar em desktops por padrão (somente um setup inicial)
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    Promise.all([listCategories(), listPublicProducts()])
      .then(([categoriesResponse, productsResponse]) => {
        setStoreCategories(categoriesResponse.map((category) => ({
          id: category.id,
          name: category.name,
          parent_id: category.parent_id ?? category.parentId ?? null
        })));
        setStoreProducts(productsResponse.map((product) => ({
          id: product.id,
          name: product.title,
          description: product.description,
          price: product.price,
          category: product.subcategoryName || product.categoryName || "Diversos",
          categoryId: product.categoryId,
          subcategoryId: product.subcategoryId ?? null,
          imageUrl: product.images.length > 0 ? product.images[0] : ""
        })));
      })
      .catch(() => {
        setStoreCategories([]);
        setStoreProducts([]);
      });
  }, []);

  const rootCategories = storeCategories.filter((category) => !getParentId(category));
  const activeCategoryData = storeCategories.find((category) => category.id === activeCategory);
  const activeCategoryLabel = activeCategory ? activeCategoryData?.name : "Todos os Itens";

  // Filtro composto: Categoria + Busca (Nome e Descrição) em Produtos Reais (Ativos)
  const filteredProducts = useMemo(() => {
    return storeProducts.filter((p) => {
      const selectedCategory = storeCategories.find((category) => category.id === activeCategory);
      const isSubcategory = selectedCategory ? Boolean(getParentId(selectedCategory)) : false;
      const matchCategory = activeCategory ? (isSubcategory ? p.subcategoryId === activeCategory : p.categoryId === activeCategory) : true;
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = p.name.toLowerCase().includes(searchLower) || p.description.toLowerCase().includes(searchLower);
      return matchCategory && matchSearch;
    });
  }, [storeProducts, storeCategories, activeCategory, searchTerm]);

  // Paginação
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => setCurrentPage(1), [activeCategory, searchTerm]);

  return (
    <div className="relative w-full flex-1 flex overflow-hidden bg-neutral-50/50">
      {/* Background Dot Pattern global da seção */}
      <div className="absolute inset-0 dot-pattern opacity-60 pointer-events-none"></div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-neutral-900/50 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Menu / Sidebar deslizante */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 
        bg-white lg:bg-white/80 lg:backdrop-blur-md 
        border-r border-neutral-200
        transition-all duration-300 ease-in-out shrink-0 overflow-hidden
        ${isSidebarOpen 
          ? 'translate-x-0 w-72 lg:w-64 shadow-2xl lg:shadow-none pointer-events-auto' 
          : '-translate-x-full w-72 border-r-0 opacity-0 pointer-events-none lg:translate-x-0 lg:w-0'}
      `}>
        <div className="w-72 lg:w-64 p-6 flex flex-col h-full overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
              Categorias
            </h3>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-purple-700 bg-neutral-50 hover:bg-purple-50 border border-neutral-200 hover:border-purple-200 rounded-lg transition-colors"
              aria-label="Fechar painel"
            >
              <X className="w-3.5 h-3.5" />
              Fechar
            </button>
          </div>
          
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                setActiveCategory(null);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={`px-4 py-2 text-sm text-left rounded-lg transition-colors whitespace-nowrap ${
                activeCategory === null
                  ? "bg-purple-100 text-purple-800 font-bold shadow-sm"
                  : "text-neutral-600 hover:text-purple-800 hover:bg-purple-50"
              }`}
            >
              Todos os Itens
            </button>
            {rootCategories.map((cat) => (
              <div key={cat.id} className="flex flex-col gap-1">
              <button
                onClick={() => {
                  setActiveCategory(cat.id);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`px-4 py-2 text-sm text-left rounded-lg transition-colors whitespace-nowrap ${
                  activeCategory === cat.id
                    ? "bg-purple-100 text-purple-800 font-bold shadow-sm"
                    : "text-neutral-600 hover:text-purple-800 hover:bg-purple-50"
                }`}
              >
                {cat.name}
              </button>
                {storeCategories
                  .filter((subcategory) => getParentId(subcategory) === cat.id)
                  .map((subcategory) => (
                    <button
                      key={subcategory.id}
                      onClick={() => {
                        setActiveCategory(subcategory.id);
                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                      }}
                      className={`ml-4 px-4 py-2 text-sm text-left rounded-lg transition-colors whitespace-nowrap ${
                        activeCategory === subcategory.id
                          ? "bg-purple-100 text-purple-800 font-bold shadow-sm"
                          : "text-neutral-600 hover:text-purple-800 hover:bg-purple-50"
                      }`}
                    >
                      {subcategory.name}
                    </button>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col p-4 lg:p-12 overflow-y-auto custom-scrollbar h-full">
        <header className="mb-6 lg:mb-10 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            {!isSidebarOpen && (
               <button 
                onClick={() => setIsSidebarOpen(true)}
                className="mt-1 p-2 bg-white border border-neutral-200 rounded-lg text-neutral-600 hover:text-purple-600 transition-colors shadow-sm flex items-center justify-center shrink-0"
                title="Abrir Categorias"
                aria-label="Abrir categorias"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-2xl lg:text-4xl font-bold uppercase tracking-tight text-neutral-900 mb-1 lg:mb-2">
                Catálogo <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-800 to-purple-500">Fitness</span>
              </h2>
              <p className="text-xs lg:text-sm text-neutral-500">
                {activeCategory 
                  ? `Exibindo linha de ${activeCategoryLabel}`
                  : "Navegue por equipamentos, roupas e suplementos de alta performance."}
              </p>
            </div>
          </div>
          
          <div className="w-full lg:w-96 relative mt-2">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
             <input 
               type="text" 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Buscar por nome ou descrição..." 
               className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors shadow-sm"
             />
          </div>
        </header>

        {filteredProducts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-neutral-200 border-dashed rounded-2xl bg-white shadow-sm backdrop-blur-sm"
          >
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center text-purple-400 mb-4">
              <PackageX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 mb-2 uppercase tracking-wide">
              {searchTerm ? "Nenhum resultado encontrado" : (activeCategory ? `Sem produtos em ${activeCategoryLabel}` : "Catálogo Vazio no Momento")}
            </h3>
            <p className="text-sm text-neutral-500 max-w-md">
              {searchTerm 
                ? `Não encontramos nenhum produto que bata com "${searchTerm}". Tente usar termos diferentes.` 
                : "Ainda não temos produtos reais cadastrados nesta seleção. Por favor, adicione seus produtos ao painel para visualizá-los aqui."}
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-6 px-6 py-2 bg-purple-100 text-purple-700 font-bold rounded-lg text-sm hover:bg-purple-200 transition-colors"
              >
                Limpar Busca
              </button>
            )}
          </motion.div>
        ) : (
          <div className="flex flex-col flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 content-start mb-10 border-t border-neutral-200 pt-6">
              {paginatedProducts.map((product) => (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  layout
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="mt-auto flex items-center justify-center gap-4 pt-6 border-t border-neutral-200">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                        currentPage === i + 1 
                          ? 'bg-purple-600 text-white shadow-md' 
                          : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

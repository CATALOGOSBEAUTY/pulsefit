import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Search, ChevronLeft, ChevronRight, PackageX, Menu, X } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { useStore } from "../../store/useStore";
import { getPublicCatalogBootstrap } from "../../services/catalogService";
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

function CatalogSkeleton() {
  return (
    <div className="flex flex-col flex-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 content-start mb-10 border-t border-neutral-200 pt-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <div className="aspect-square animate-pulse bg-neutral-100" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-24 animate-pulse rounded bg-neutral-100" />
              <div className="h-6 w-3/4 animate-pulse rounded bg-neutral-100" />
              <div className="h-3 w-full animate-pulse rounded bg-neutral-100" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-neutral-100" />
              <div className="flex items-end justify-between pt-3">
                <div className="space-y-2">
                  <div className="h-3 w-16 animate-pulse rounded bg-neutral-100" />
                  <div className="h-6 w-24 animate-pulse rounded bg-neutral-100" />
                </div>
                <div className="h-10 w-10 animate-pulse rounded-full bg-neutral-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Catalog() {
  const { activeCategory, setActiveCategory } = useStore();
  const catalogScrollRef = useRef<HTMLDivElement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [storeCategories, setStoreCategories] = useState<CatalogCategory[]>([]);
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const itemsPerPage = 8;

  const scrollCatalogToTop = () => {
    catalogScrollRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  const setCatalogPage = (nextPage: number) => {
    const safePage = Math.min(totalPages, Math.max(1, nextPage));
    if (safePage === currentPage) return;
    setCurrentPage(safePage);
    window.requestAnimationFrame(scrollCatalogToTop);
  };

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setLoadError("");

    getPublicCatalogBootstrap()
      .then(({ categories, products }) => {
        if (!isMounted) return;

        setStoreCategories(
          categories.map((category) => ({
            id: category.id,
            name: category.name,
            parent_id: category.parent_id ?? category.parentId ?? null,
          }))
        );

        setStoreProducts(
          products.map((product) => ({
            id: product.id,
            slug: product.slug ?? null,
            name: product.title,
            description: product.description,
            price: product.price,
            category: product.subcategoryName || product.categoryName || "Diversos",
            categoryId: product.categoryId,
            subcategoryId: product.subcategoryId ?? null,
            imageUrl: product.images.length > 0 ? product.images[0] : "",
            images: product.images,
            features: product.features ?? [],
            stockQuantity: product.stockQuantity ?? 0,
            variantsEnabled: product.variantsEnabled ?? false,
            variants: product.variants ?? [],
          }))
        );
      })
      .catch(() => {
        if (!isMounted) return;
        setStoreCategories([]);
        setStoreProducts([]);
        setLoadError("Nao foi possivel carregar o catalogo agora.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const rootCategories = storeCategories.filter((category) => !getParentId(category));
  const activeCategoryData = storeCategories.find((category) => category.id === activeCategory);
  const activeCategoryLabel = activeCategory ? activeCategoryData?.name : "Todos os Itens";

  const filteredProducts = useMemo(() => {
    return storeProducts.filter((product) => {
      const selectedCategory = storeCategories.find((category) => category.id === activeCategory);
      const isSubcategory = selectedCategory ? Boolean(getParentId(selectedCategory)) : false;
      const matchCategory = activeCategory
        ? (isSubcategory ? product.subcategoryId === activeCategory : product.categoryId === activeCategory)
        : true;
      const searchLower = searchTerm.toLowerCase();
      const matchSearch =
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower);

      return matchCategory && matchSearch;
    });
  }, [storeProducts, storeCategories, activeCategory, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
    window.requestAnimationFrame(scrollCatalogToTop);
  }, [activeCategory, searchTerm]);

  return (
    <div className="relative w-full flex-1 flex overflow-hidden bg-neutral-50/50">
      <div className="absolute inset-0 dot-pattern opacity-60 pointer-events-none" />

      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-neutral-900/50 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-white lg:bg-white/80 lg:backdrop-blur-md
          border-r border-neutral-200
          transition-all duration-300 ease-in-out shrink-0 overflow-hidden
          ${
            isSidebarOpen
              ? "translate-x-0 w-72 lg:w-64 shadow-2xl lg:shadow-none pointer-events-auto"
              : "-translate-x-full w-72 border-r-0 opacity-0 pointer-events-none lg:translate-x-0 lg:w-0"
          }
        `}
      >
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
            {isLoading &&
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-10 animate-pulse rounded-lg bg-neutral-100" />
              ))}

            {!isLoading && (
              <>
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

                {rootCategories.map((category) => (
                  <div key={category.id} className="flex flex-col gap-1">
                    <button
                      onClick={() => {
                        setActiveCategory(category.id);
                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                      }}
                      className={`px-4 py-2 text-sm text-left rounded-lg transition-colors whitespace-nowrap ${
                        activeCategory === category.id
                          ? "bg-purple-100 text-purple-800 font-bold shadow-sm"
                          : "text-neutral-600 hover:text-purple-800 hover:bg-purple-50"
                      }`}
                    >
                      {category.name}
                    </button>

                    {storeCategories
                      .filter((subcategory) => getParentId(subcategory) === category.id)
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
              </>
            )}
          </div>
        </div>
      </aside>

      <div ref={catalogScrollRef} className="relative z-10 flex-1 flex flex-col p-4 lg:p-12 overflow-y-auto custom-scrollbar h-full">
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
                Moda{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-800 to-purple-500">
                  Fitness
                </span>
              </h2>
              <p className="text-xs lg:text-sm text-neutral-500">Mais do que roupa, é um estilo de vida!</p>
            </div>
          </div>

          <div className="w-full lg:w-96 relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nome ou descricao..."
              disabled={isLoading}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors shadow-sm disabled:bg-neutral-100 disabled:text-neutral-400"
            />
          </div>
        </header>

        {isLoading ? (
          <CatalogSkeleton />
        ) : loadError ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-neutral-200 border-dashed rounded-2xl bg-white shadow-sm backdrop-blur-sm"
          >
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-400 mb-4">
              <PackageX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 mb-2 uppercase tracking-wide">
              Falha ao carregar
            </h3>
            <p className="text-sm text-neutral-500 max-w-md">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-purple-100 text-purple-700 font-bold rounded-lg text-sm hover:bg-purple-200 transition-colors"
            >
              Tentar novamente
            </button>
          </motion.div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-neutral-200 border-dashed rounded-2xl bg-white shadow-sm backdrop-blur-sm"
          >
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center text-purple-400 mb-4">
              <PackageX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 mb-2 uppercase tracking-wide">
              {searchTerm
                ? "Nenhum resultado encontrado"
                : activeCategory
                  ? `Sem produtos em ${activeCategoryLabel}`
                  : "Catalogo vazio no momento"}
            </h3>
            <p className="text-sm text-neutral-500 max-w-md">
              {searchTerm
                ? `Nao encontramos nenhum produto que bata com "${searchTerm}". Tente usar termos diferentes.`
                : "Ainda nao temos produtos reais cadastrados nesta selecao. Adicione seus produtos ao painel para visualiza-los aqui."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-6 px-6 py-2 bg-purple-100 text-purple-700 font-bold rounded-lg text-sm hover:bg-purple-200 transition-colors"
              >
                Limpar busca
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

            {totalPages > 1 && (
              <div className="mt-auto flex items-center justify-center gap-4 pt-6 border-t border-neutral-200">
                <button
                  onClick={() => setCatalogPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCatalogPage(index + 1)}
                      className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                        currentPage === index + 1
                          ? "bg-purple-600 text-white shadow-md"
                          : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCatalogPage(currentPage + 1)}
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

import { Star, TrendingUp, Sparkles, Filter } from 'lucide-react';
import { useEffect } from 'react';
import { useProductStore } from '../../products/store/useProductStore';
import { useCategoryStore } from '../../categories/store/useCategoryStore';

export function HighlightsView() {
  const { products, toggleStatus, fetchProducts } = useProductStore();
  const categories = useCategoryStore(state => state.categories);
  const fetchCategories = useCategoryStore(state => state.fetchCategories);

  useEffect(() => {
    fetchProducts();
    fetchCategories(true);
  }, [fetchProducts, fetchCategories]);

  // Filtramos os produtos que possuem alguma flag ativada
  const highlightedProducts = products.filter(p => p.isFeatured || p.isPromo || p.isNew);
  const getCategoryLabel = (product: typeof products[number]) => {
    const categoryName = categories.find(c => c.id === product.categoryId)?.name || product.categoryName || 'Sem Categoria';
    const subcategoryName = categories.find(c => c.id === product.subcategoryId)?.name || product.subcategoryName;
    return subcategoryName ? `${categoryName} / ${subcategoryName}` : categoryName;
  };

  return (
    <div className="flex flex-col gap-4 md:gap-8 max-w-7xl mx-auto pb-6 md:pb-20">
       <header>
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-neutral-900">Destaques e Vitrine</h1>
        <p className="text-xs md:text-sm text-neutral-500 mt-1">Gerencie rapidamente quais produtos ganham posições especiais, tags de promoção ou novidade.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
         <div className="bg-emerald-50 border border-emerald-200 p-4 md:p-6 rounded-xl md:rounded-2xl flex flex-col gap-1.5 md:gap-2">
            <div className="flex items-center gap-1.5 md:gap-2 text-emerald-700 font-bold uppercase tracking-widest text-[10px] md:text-xs">
               <Star className="w-3 h-3 md:w-4 md:h-4"/> Destaques
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-emerald-900">{products.filter(p=>p.isFeatured).length}</h3>
            <p className="text-[10px] md:text-xs text-emerald-700">Produtos no topo da vitrine.</p>
         </div>
         <div className="bg-rose-50 border border-rose-200 p-4 md:p-6 rounded-xl md:rounded-2xl flex flex-col gap-1.5 md:gap-2">
            <div className="flex items-center gap-1.5 md:gap-2 text-rose-700 font-bold uppercase tracking-widest text-[10px] md:text-xs">
               <TrendingUp className="w-3 h-3 md:w-4 md:h-4"/> Promoções
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-rose-900">{products.filter(p=>p.isPromo).length}</h3>
            <p className="text-[10px] md:text-xs text-rose-700">Produtos com selo de oferta.</p>
         </div>
         <div className="bg-blue-50 border border-blue-200 p-4 md:p-6 rounded-xl md:rounded-2xl flex flex-col gap-1.5 md:gap-2">
            <div className="flex items-center gap-1.5 md:gap-2 text-blue-700 font-bold uppercase tracking-widest text-[10px] md:text-xs">
               <Sparkles className="w-3 h-3 md:w-4 md:h-4"/> Lançamentos
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-blue-900">{products.filter(p=>p.isNew).length}</h3>
            <p className="text-[10px] md:text-xs text-blue-700">Produtos com tag de novidade.</p>
         </div>
      </div>

       <div className="bg-white rounded-xl md:rounded-2xl border border-neutral-200 shadow-sm overflow-hidden mt-2">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-bold text-neutral-500 uppercase tracking-widest">
                <th className="p-4">Produto na Vitrine</th>
                <th className="p-4 text-center">Destaque Principal</th>
                <th className="p-4 text-center">Flag Promoção</th>
                <th className="p-4 text-center">Flag Lançamento</th>
              </tr>
            </thead>
            <tbody>
              {highlightedProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <p className="text-sm text-neutral-500">Nenhum produto marcado para exibição especial no momento.</p>
                  </td>
                </tr>
              ) : (
                highlightedProducts.map(p => (
                  <tr key={p.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-200 rounded-lg shrink-0 overflow-hidden">
                        {p.images[0] && <img src={p.images[0]} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 text-sm max-w-[200px] truncate">{p.title}</h4>
                        <span className="text-xs text-neutral-500">{getCategoryLabel(p)}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                       <input type="checkbox" checked={p.isFeatured} onChange={()=>toggleStatus(p.id, 'isFeatured')} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 accent-emerald-600 cursor-pointer"/>
                    </td>
                    <td className="p-4 text-center">
                       <input type="checkbox" checked={p.isPromo} onChange={()=>toggleStatus(p.id, 'isPromo')} className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500 accent-rose-600 cursor-pointer"/>
                    </td>
                    <td className="p-4 text-center">
                       <input type="checkbox" checked={p.isNew} onChange={()=>toggleStatus(p.id, 'isNew')} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 accent-blue-600 cursor-pointer"/>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

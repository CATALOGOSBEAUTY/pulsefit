import { useEffect, useState } from 'react';
import { Plus, Search, Filter, Package, Edit2, Trash2, ImageOff } from 'lucide-react';
import { useProductStore, Product } from '../store/useProductStore';
import { useCategoryStore } from '../../categories/store/useCategoryStore';
import { ProductFormModal } from '../components/ProductFormModal';

export function ProductsListView() {
  const { products, deleteProduct, toggleStatus, fetchProducts } = useProductStore();
  const categories = useCategoryStore(state => state.categories);
  const fetchCategories = useCategoryStore(state => state.fetchCategories);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [catalogStatusFilter, setCatalogStatusFilter] = useState('all');
  const [imageFilter, setImageFilter] = useState('all');

  const filteredProducts = products.filter((product) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = [
      product.title,
      product.slug || '',
      product.productType || '',
      product.variation || '',
    ].some((value) => value.toLowerCase().includes(term));
    const matchesAudience = audienceFilter === 'all' || product.audience === audienceFilter;
    const matchesCatalogStatus = catalogStatusFilter === 'all' || product.catalogStatus === catalogStatusFilter;
    const matchesImage = imageFilter === 'all' || (imageFilter === 'with-image' ? product.images.length > 0 : product.images.length === 0);
    return matchesSearch && matchesAudience && matchesCatalogStatus && matchesImage;
  });
  const getCategoryLabel = (product: Product) => {
    const categoryName = categories.find(c => c.id === product.categoryId)?.name || product.categoryName || 'Sem Categoria';
    const subcategoryName = categories.find(c => c.id === product.subcategoryId)?.name || product.subcategoryName;
    return subcategoryName ? `${categoryName} / ${subcategoryName}` : categoryName;
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories(true);
  }, [fetchProducts, fetchCategories]);

  const handleEdit = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 md:gap-8 max-w-7xl mx-auto pb-6 md:pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-neutral-900">Produtos</h1>
          <p className="text-xs md:text-sm text-neutral-500 mt-1">Gerencie o catálogo de roupas e equipamentos.</p>
        </div>
        <button onClick={handleCreate} className="flex items-center justify-center w-full md:w-auto gap-2 bg-gradient-to-r from-purple-800 to-purple-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:from-purple-700 hover:to-purple-500 transition-colors shadow-md shadow-purple-500/20">
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </header>

      {/* Barra de Filtros */}
      <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-neutral-200 shadow-sm flex flex-col xl:flex-row gap-3 md:gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-neutral-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, slug, tipo ou variacao..."
            className="w-full pl-9 md:pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg md:rounded-xl text-xs md:text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full xl:w-auto">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <select value={audienceFilter} onChange={(e) => setAudienceFilter(e.target.value)} className="w-full sm:w-44 pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg md:rounded-xl text-xs md:text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500">
              <option value="all">Todos os publicos</option>
              <option value="feminino">Feminino</option>
              <option value="masculino">Masculino</option>
              <option value="suplemento">Suplementos</option>
            </select>
          </div>
          <select value={catalogStatusFilter} onChange={(e) => setCatalogStatusFilter(e.target.value)} className="w-full sm:w-40 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg md:rounded-xl text-xs md:text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500">
            <option value="all">Todos status</option>
            <option value="draft">Rascunho</option>
            <option value="ready">Pronto</option>
            <option value="live">Publicado</option>
          </select>
          <select value={imageFilter} onChange={(e) => setImageFilter(e.target.value)} className="w-full sm:w-40 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg md:rounded-xl text-xs md:text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500">
            <option value="all">Todas imagens</option>
            <option value="missing-image">Sem imagem</option>
            <option value="with-image">Com imagem</option>
          </select>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-white rounded-xl md:rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-bold text-neutral-500 uppercase tracking-widest">
                <th className="p-4">Produto</th>
                <th className="p-4">Categoria</th>
                <th className="p-4">Preço</th>
                <th className="p-4">Tags</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-neutral-400">
                      <Package className="w-12 h-12 mb-4 opacity-50" />
                      <h3 className="text-lg font-bold text-neutral-900 mb-1">Nenhum produto encontrado</h3>
                      <p className="text-sm text-neutral-500 max-w-sm mx-auto">
                        Seu catálogo está vazio no momento ou a busca não retornou resultados.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-12 h-12 bg-neutral-200 rounded-lg shrink-0 overflow-hidden">
                         {p.images[0] ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover"/> : <Package className="w-5 h-5 m-auto text-neutral-400 mt-3"/>}
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 text-sm">{p.title}</h4>
                        <span className="text-xs text-neutral-500">{p.slug || `ID: ${p.id.split('-')[0].toUpperCase()}`}</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {p.audience && <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-neutral-100 text-neutral-600 rounded">{p.audience}</span>}
                          {p.productType && <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-neutral-100 text-neutral-600 rounded">{p.productType}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-neutral-600">{getCategoryLabel(p)}</td>
                    <td className="p-4 text-sm font-bold text-neutral-900">R$ {p.price.toFixed(2).replace('.', ',')}</td>
                    <td className="p-4 flex flex-wrap gap-2">
                       {p.catalogStatus && <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${p.catalogStatus === 'live' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : p.catalogStatus === 'ready' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}>{p.catalogStatus}</span>}
                       {p.isFeatured && <span className="px-2 py-1 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 rounded border border-emerald-200">Destaque</span>}
                       {p.isPromo && <span className="px-2 py-1 text-[10px] font-bold uppercase bg-rose-100 text-rose-700 rounded border border-rose-200">Promo</span>}
                       {p.isNew && <span className="px-2 py-1 text-[10px] font-bold uppercase bg-blue-100 text-blue-700 rounded border border-blue-200">Novo</span>}
                       {p.images.length === 0 && <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase bg-orange-50 text-orange-700 rounded border border-orange-200"><ImageOff className="w-3 h-3" /> Sem imagem</span>}
                    </td>
                    <td className="p-4">
                      {p.isActive 
                        ? <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-emerald-100/50 text-emerald-700 border border-emerald-500/20 rounded-full">Ativo</span>
                        : <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-neutral-100 text-neutral-500 border border-neutral-200 rounded-full">Inativo</span>
                      }
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <label className="inline-flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer" title="Ativo no catálogo">
                          <input type="checkbox" checked={p.isActive} onChange={() => toggleStatus(p.id, 'isActive')} className="w-4 h-4 accent-emerald-600" />
                          <span className="sr-only">Ativo no catálogo</span>
                        </label>
                        <button onClick={() => handleEdit(p)} className="p-2 text-neutral-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors" title="Editar Produto">
                           <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => { if(confirm('Excluir este produto?')) deleteProduct(p.id) }} className="p-2 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors" title="Excluir Produto">
                           <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ProductFormModal onClose={() => setIsModalOpen(false)} productToEdit={productToEdit} />
      )}
    </div>
  );
}

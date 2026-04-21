import { type ChangeEvent, type FormEvent, useEffect, useState, useRef } from 'react';
import { X, UploadCloud } from 'lucide-react';
import { useProductStore, Product } from '../store/useProductStore';
import { Category, useCategoryStore } from '../../categories/store/useCategoryStore';

interface ProductFormModalProps {
  onClose: () => void;
  productToEdit?: Product | null;
}

function getParentId(category: Category) {
  return category.parent_id ?? category.parentId ?? null;
}

export function ProductFormModal({ onClose, productToEdit }: ProductFormModalProps) {
  const { addProduct, updateProduct } = useProductStore();
  const categories = useCategoryStore(state => state.categories);
  const fetchCategories = useCategoryStore(state => state.fetchCategories);
  
  const [title, setTitle] = useState(productToEdit?.title || '');
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [price, setPrice] = useState(productToEdit?.price.toString() || '');
  const rootCategories = categories.filter((category) => !getParentId(category));
  const [categoryId, setCategoryId] = useState(productToEdit?.categoryId || '');
  const [subcategoryId, setSubcategoryId] = useState(productToEdit?.subcategoryId || '');
  const [images, setImages] = useState<string[]>(productToEdit?.images || []);
  
  const [isActive, setIsActive] = useState(productToEdit?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(productToEdit?.isFeatured ?? false);
  const [isPromo, setIsPromo] = useState(productToEdit?.isPromo ?? false);
  const [isNew, setIsNew] = useState(productToEdit?.isNew ?? false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories(true);
    }
  }, [categories.length, fetchCategories]);

  useEffect(() => {
    if (!categoryId && rootCategories.length > 0) {
      setCategoryId(rootCategories[0].id);
    }
  }, [categoryId, rootCategories]);

  const availableSubcategories = categories.filter((category) => getParentId(category) === categoryId);

  useEffect(() => {
    if (subcategoryId && !availableSubcategories.some((category) => category.id === subcategoryId)) {
      setSubcategoryId('');
    }
  }, [availableSubcategories, subcategoryId]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Redimensionamento de Imagem para evitar estouro de limite de 5MB do LocalStorage
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // Tamanho aceitável para cartões web
        let scaleSize = 1;
        
        if (img.width > MAX_WIDTH) {
          scaleSize = MAX_WIDTH / img.width;
        }
        
        canvas.width = img.width * scaleSize;
        canvas.height = img.height * scaleSize;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Comprime convertendo para JPEG 60%
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        setImages([compressedBase64, ...images]);
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !price || !categoryId) {
      setError("Preencha todos os campos obrigatórios marcados com (*).");
      return;
    }

    const parsedPrice = parseFloat(String(price).replace(',', '.'));
    if (isNaN(parsedPrice)) {
      setError("Preço inválido.");
      return;
    }

    const productData = {
      title,
      description,
      price: parsedPrice,
      categoryId,
      subcategoryId: subcategoryId || null,
      images,
      isActive,
      isFeatured,
      isPromo,
      isNew
    };

    try {
      if (productToEdit) {
        await updateProduct(productToEdit.id, productData);
      } else {
        await addProduct(productData);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError("Erro ao tentar salvar o produto.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-full flex flex-col shadow-2xl relative overflow-hidden flex-shrink-0 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
          <h2 className="text-xl font-bold uppercase tracking-tight text-neutral-900">
            {productToEdit ? 'Editar Produto' : 'Cadastrar Novo Produto'}
          </h2>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-900 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="productForm" onSubmit={handleSubmit} className="flex flex-col gap-8">
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-lg text-center">
                {error}
              </div>
            )}

            {/* Informações Básicas */}
            <div className="flex flex-col gap-5">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-2">Informações Básicas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-neutral-700 uppercase tracking-widest">Nome do Produto *</label>
                  <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" placeholder="Ex: Legging Alta Performance" />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700 uppercase tracking-widest">Preço (R$) *</label>
                  <input required type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" placeholder="199.90" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700 uppercase tracking-widest">Categoria Principal *</label>
                  <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={`w-full px-4 py-3 ${rootCategories.length === 0 ? 'bg-red-50 border-red-300' : 'bg-neutral-50 border-neutral-200'} border rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500`}>
                    <option value="" disabled>Selecione Masculina ou Feminina</option>
                    {rootCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {rootCategories.length === 0 && (
                    <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Crie uma categoria principal primeiro</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700 uppercase tracking-widest">Subcategoria</label>
                  <select value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value)} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500">
                    <option value="">Sem subcategoria</option>
                    {availableSubcategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-neutral-700 uppercase tracking-widest">Descrição</label>
                  <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none" placeholder="Detalhes do produto, tecido, uso..." />
                </div>
              </div>
            </div>

            {/* Imagens */}
            <div className="flex flex-col gap-5">
               <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-2">Imagens do Produto</h3>
               <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                 <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                 <button type="button" onClick={() => fileInputRef.current?.click()} className="shrink-0 w-32 h-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-purple-300 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors">
                   <UploadCloud className="w-6 h-6" />
                   <span className="text-xs font-bold">Adicionar Foto</span>
                 </button>
                 {images.map((img, idx) => (
                   <div key={idx} className="shrink-0 w-32 h-32 rounded-xl border border-neutral-200 overflow-hidden relative group">
                     <img src={img} className="w-full h-full object-cover" />
                     <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4"/></button>
                   </div>
                 ))}
               </div>
            </div>

            {/* Visibilidade e Flags */}
            <div className="flex flex-col gap-5">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-2">Configuração de Vitrine</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50 transition-colors">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 accent-purple-600" />
                  <div><p className="text-sm font-bold text-neutral-900">Produto Ativo</p><p className="text-xs text-neutral-500">Visível no catálogo</p></div>
                </label>
                <label className="flex items-center gap-3 p-4 border border-emerald-200 bg-emerald-50/50 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors">
                  <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 accent-emerald-600" />
                  <div><p className="text-sm font-bold text-emerald-900">Estrela / Destaque</p><p className="text-xs text-emerald-600">Aparece no painel destaque</p></div>
                </label>
                <label className="flex items-center gap-3 p-4 border border-rose-200 bg-rose-50/50 rounded-xl cursor-pointer hover:bg-rose-50 transition-colors">
                  <input type="checkbox" checked={isPromo} onChange={(e) => setIsPromo(e.target.checked)} className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500 accent-rose-600" />
                  <div><p className="text-sm font-bold text-rose-900">Status: Promoção</p><p className="text-xs text-rose-600">Aplica tag de promoção</p></div>
                </label>
                <label className="flex items-center gap-3 p-4 border border-blue-200 bg-blue-50/50 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                  <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 accent-blue-600" />
                  <div><p className="text-sm font-bold text-blue-900">Status: Lançamento</p><p className="text-xs text-blue-600">Aplica tag de novidade</p></div>
                </label>
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-neutral-100 bg-white grid grid-cols-2 gap-4">
           <button onClick={onClose} className="px-5 py-3 rounded-xl border border-neutral-200 text-neutral-600 font-bold text-sm hover:bg-neutral-50 transition-colors uppercase tracking-widest">
             Cancelar
           </button>
           <button form="productForm" type="submit" className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-800 to-purple-600 text-white font-bold text-sm hover:from-purple-700 hover:to-purple-500 transition-colors shadow-md uppercase tracking-widest">
             {productToEdit ? 'Salvar Alterações' : 'Cadastrar Produto'}
           </button>
        </div>

      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getPublicCatalogBootstrap, PublicCatalogProduct } from "../../services/catalogService";
import { useStore } from "../../store/useStore";
import { Product, ProductVariant } from "../../types";
import { ProductCard } from "./ProductCard";

function toStoreProduct(product: PublicCatalogProduct): Product {
  return {
    id: product.id,
    slug: product.slug ?? null,
    name: product.title,
    description: product.description,
    price: product.price,
    category: product.subcategoryName || product.categoryName || "Diversos",
    categoryId: product.categoryId,
    subcategoryId: product.subcategoryId ?? null,
    imageUrl: product.images[0] || "",
    images: product.images,
    features: product.features ?? [],
    stockQuantity: product.stockQuantity ?? 0,
    variantsEnabled: product.variantsEnabled ?? false,
    variants: product.variants ?? [],
  };
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const addToCart = useStore((state) => state.addToCart);
  const openCart = useStore((state) => state.openCart);
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError("");

    getPublicCatalogBootstrap()
      .then(({ products }) => {
        if (!mounted) return;
        const found = products.find((item) => item.slug === slug || item.id === slug);
        if (!found) {
          setError("Produto nao encontrado.");
          return;
        }
        const mapped = toStoreProduct(found);
        setAllProducts(products.map(toStoreProduct));
        setProduct(mapped);
        const firstVariant = mapped.variants?.find((variant) => variant.isActive && variant.stockQuantity > 0);
        setSelectedVariantId(firstVariant?.id ?? mapped.variants?.find((variant) => variant.isActive)?.id ?? "");
      })
      .catch(() => {
        if (mounted) setError("Nao foi possivel carregar o produto agora.");
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  const activeVariants = useMemo(
    () => product?.variants?.filter((variant) => variant.isActive) ?? [],
    [product]
  );
  const selectedVariant = activeVariants.find((variant) => variant.id === selectedVariantId) ?? null;
  const suggestedProducts = useMemo(() => {
    if (!product) return [];
    const sameCategory = allProducts.filter((item) => item.id !== product.id && item.categoryId === product.categoryId);
    const sameSubcategory = allProducts.filter((item) => item.id !== product.id && item.subcategoryId === product.subcategoryId);
    const merged = [...sameSubcategory, ...sameCategory, ...allProducts.filter((item) => item.id !== product.id)];
    return merged.filter((item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index).slice(0, 4);
  }, [allProducts, product]);
  const currentPrice = selectedVariant?.price ?? product?.price ?? 0;
  const availableQuantity = selectedVariant ? selectedVariant.stockQuantity : product?.stockQuantity ?? 0;
  const availabilityLabel = selectedVariant
    ? selectedVariant.stockQuantity > 0 ? `${selectedVariant.stockQuantity} disponivel` : "Indisponivel"
    : availableQuantity > 0 ? `${availableQuantity} disponivel` : "Disponibilidade sob confirmacao";

  const addSelectedToCart = () => {
    if (!product) return;
    addToCart(product, selectedVariant, quantity);
    openCart();
  };

  if (isLoading) {
    return <div className="flex-1 bg-neutral-50 p-8 text-neutral-500">Carregando produto...</div>;
  }

  if (error || !product) {
    return (
      <div className="flex-1 bg-neutral-50 p-8">
        <button onClick={() => navigate("/catalogo")} className="inline-flex items-center gap-2 text-sm font-bold text-purple-700">
          <ArrowLeft className="w-4 h-4" /> Voltar ao catalogo
        </button>
        <p className="mt-8 text-neutral-600">{error || "Produto nao encontrado."}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        <button onClick={() => navigate("/catalogo")} className="inline-flex items-center gap-2 mb-6 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-purple-700">
          <ArrowLeft className="w-4 h-4" /> Voltar ao catalogo
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="flex flex-col gap-5">
            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} loading="eager" decoding="async" className="w-full aspect-square object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center text-neutral-400">Sem imagem</div>
              )}
            </div>

            <section className="bg-white border border-neutral-200 rounded-2xl p-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-3">Descrição do produto</h2>
              <p className="text-sm leading-6 text-neutral-600">{product.description}</p>
            </section>
          </div>

          <section className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-purple-700">{product.category}</p>
              <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight text-neutral-900">{product.name}</h1>
            </div>

            {product.features && product.features.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.features.map((feature) => (
                  <span key={feature} className="px-3 py-2 rounded-lg bg-white border border-neutral-200 text-xs font-semibold text-neutral-600">
                    {feature}
                  </span>
                ))}
              </div>
            )}

            <div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Valor</span>
                  <p className="text-2xl font-black text-purple-700">{formatPrice(currentPrice)}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-neutral-100 text-xs font-bold uppercase tracking-widest text-neutral-600">
                  {availabilityLabel}
                </span>
              </div>

              {activeVariants.length > 0 && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Variacoes</label>
                  <select value={selectedVariantId} onChange={(event) => setSelectedVariantId(event.target.value)} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500">
                    {activeVariants.map((variant: ProductVariant) => (
                      <option key={variant.id} value={variant.id}>
                        {variant.label} - {formatPrice(variant.price ?? product.price)} - estoque {variant.stockQuantity}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Quantidade</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 flex items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button onClick={addSelectedToCart} disabled={activeVariants.length > 0 && !selectedVariant} className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-purple-800 to-purple-500 text-white font-bold text-sm uppercase tracking-tight rounded-xl hover:from-purple-700 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-purple-500/20">
                <ShoppingCart className="w-4 h-4" />
                Adicionar ao carrinho
              </button>
            </div>
          </section>
        </div>

        {suggestedProducts.length > 0 && (
          <section className="mt-12">
            <div className="flex items-end justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-purple-700">Sugestões</p>
                <h2 className="text-2xl font-black tracking-tight text-neutral-900">Outros produtos para você</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {suggestedProducts.map((suggestion) => (
                <ProductCard key={suggestion.id} product={suggestion} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

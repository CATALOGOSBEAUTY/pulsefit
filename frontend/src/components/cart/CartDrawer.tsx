import { type ChangeEvent, type FormEvent, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Minus, Plus, Trash2, Send, ShoppingCart } from "lucide-react";
import { useStore } from "../../store/useStore";
import { CheckoutData } from "../../types";
import { createOrder } from "../../services/orderService";

export function CartDrawer() {
  const { cart, isCartOpen, closeCart, updateQuantity, removeFromCart } = useStore();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  
  const [formData, setFormData] = useState<CheckoutData>({
    fullName: "",
    cep: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    region: ""
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e: FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setCheckoutError('');
    
    // Validate minimal
    if (!formData.fullName || !formData.address || !formData.number || !formData.cep) {
      setCheckoutError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setCheckoutLoading(true);
    try {
      const response = await createOrder(cart, formData);
      if (response.whatsappUrl) {
        window.open(response.whatsappUrl, "_blank", "noopener,noreferrer");
      } else {
        setCheckoutError("Pedido registrado. Configure o WhatsApp da loja para abrir a conversa automaticamente.");
      }
    } catch (err: any) {
      setCheckoutError(err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const total = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay Escuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer Lateral */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-neutral-200 shadow-2xl z-[101] flex flex-col"
          >
            {/* Header do Carrinho */}
            <header className="flex items-center justify-between p-6 border-b border-neutral-200 bg-neutral-50/80">
              <h2 className="text-xl font-bold uppercase tracking-tight text-neutral-900 flex items-center gap-2">
                Seu Carrinho
                <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-purple-800 to-purple-500 rounded-full text-white">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)} itens
                </span>
              </h2>
              <button 
                onClick={closeCart}
                className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400">
                  <ShoppingCart className="w-12 h-12 mb-4 opacity-30" />
                  <p>Seu carrinho está vazio.</p>
                </div>
              ) : (
                <div className="p-6 flex flex-col gap-6">
                  {/* Lista de Produtos no Carrinho */}
                  <div className="flex flex-col gap-4">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex gap-4 p-4 bg-white border border-neutral-200 rounded-xl shadow-sm">
                        <div className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product.imageUrl ? (
                            <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-neutral-100" />
                          )}
                        </div>
                        <div className="flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-sm text-neutral-900 line-clamp-1">{item.product.name}</h4>
                            <button onClick={() => removeFromCart(item.product.id)} className="text-neutral-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="text-purple-700 font-bold text-xs mb-3">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.product.price)}
                          </span>
                          
                          <div className="flex items-center gap-3 mt-auto">
                            <button 
                              onClick={() => {
                                if (item.quantity > 1) updateQuantity(item.product.id, item.quantity - 1);
                                else removeFromCart(item.product.id);
                              }}
                              className="w-6 h-6 flex items-center justify-center bg-neutral-100 text-neutral-700 rounded hover:bg-neutral-200 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold w-4 text-center text-neutral-900">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center bg-neutral-100 text-neutral-700 rounded hover:bg-neutral-200 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Formulário de Check-out Direto no Carrinho */}
                  <div className="h-px w-full bg-neutral-200 my-2" />
                  
                  <div className="flex flex-col gap-4">
                    <h3 className="uppercase tracking-widest text-xs font-bold text-neutral-500">Dados de Entrega</h3>
                    
                    <form id="checkout-form" onSubmit={handleCheckout} className="flex flex-col gap-3">
                      {checkoutError && (
                        <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs font-bold">
                          {checkoutError}
                        </div>
                      )}
                      <input 
                        required name="fullName" value={formData.fullName} onChange={handleChange}
                        type="text" placeholder="Nome Completo *" 
                        className="w-full bg-white border border-neutral-300 text-sm text-neutral-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors placeholder:text-neutral-400"
                      />
                      
                      <div className="flex gap-3">
                        <input 
                          required name="cep" value={formData.cep} onChange={handleChange}
                          type="text" placeholder="CEP *" 
                          className="w-full bg-white border border-neutral-300 text-sm text-neutral-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors placeholder:text-neutral-400"
                        />
                        <input 
                          required name="region" value={formData.region} onChange={handleChange}
                          type="text" placeholder="Região / Estado *" 
                          className="w-full bg-white border border-neutral-300 text-sm text-neutral-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors placeholder:text-neutral-400"
                        />
                      </div>

                      <input 
                        required name="address" value={formData.address} onChange={handleChange}
                        type="text" placeholder="Endereço (Rua/Avenida) *" 
                        className="w-full bg-white border border-neutral-300 text-sm text-neutral-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors placeholder:text-neutral-400"
                      />

                      <div className="flex gap-3">
                        <input 
                          required name="number" value={formData.number} onChange={handleChange}
                          type="text" placeholder="Número *" 
                          className="w-1/3 bg-white border border-neutral-300 text-sm text-neutral-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors placeholder:text-neutral-400"
                        />
                        <input 
                          name="complement" value={formData.complement} onChange={handleChange}
                          type="text" placeholder="Complemento" 
                          className="w-2/3 bg-white border border-neutral-300 text-sm text-neutral-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors placeholder:text-neutral-400"
                        />
                      </div>

                      <input 
                        required name="neighborhood" value={formData.neighborhood} onChange={handleChange}
                        type="text" placeholder="Bairro *" 
                        className="w-full bg-white border border-neutral-300 text-sm text-neutral-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors placeholder:text-neutral-400"
                      />
                    </form>
                  </div>
                </div>
              )}
            </main>

            {/* Footer do Carrinho */}
            <footer className="p-6 border-t border-neutral-200 bg-white/80 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <span className="text-neutral-500 uppercase tracking-widest text-[10px] font-bold">Total Estimado</span>
                <span className="text-xl font-bold text-neutral-900">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                </span>
              </div>
              
              <button 
                type="submit"
                form="checkout-form"
                disabled={cart.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-purple-800 to-purple-500 text-white font-bold text-sm uppercase tracking-tight rounded-xl hover:from-purple-700 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-purple-500/20"
              >
                <Send className="w-4 h-4" />
                {checkoutLoading ? 'Enviando Pedido...' : 'Desejo Comprar Agora'}
              </button>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

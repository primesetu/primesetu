import React, { useEffect, useState } from 'react';
import { ShoppingCart, Search, Menu, Heart, User, ChevronRight, Star, X, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/modules/billing/stores/useCartStore';
import { apiClient } from '@/api/client';

interface Product {
  stockno: string;
  itemdesc: string;
  brand: string;
  category: string;
  retail_price: number;
  in_stock: number;
  image_url: string;
}

const EcommerceStorefront: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { items, isOpen, toggleCart, addItem, updateQuantity, removeItem, getCartTotal, getCartCount, clearCart } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch from the backend API we just created
        const res = await apiClient.get('/ecommerce/products?limit=24');
        setProducts(res.data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const res = await apiClient.post('/ecommerce/checkout', {
        items: items.map(i => ({ stockno: i.stockno, qty: i.quantity }))
      });
      if (res.data) {
        alert("Order placed successfully! SMRITI-OS will process it shortly.");
        clearCart();
        toggleCart();
      } else {
        alert("Failed to place order.");
      }
    } catch (error) {
      console.error(error);
      alert("Checkout failed.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900 overflow-x-hidden selection:bg-teal-500 selection:text-white">
      {/* ── TOP NAV ── */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo area */}
            <div className="flex items-center gap-4 cursor-pointer">
              <div className="md:hidden">
                <Menu className="w-6 h-6 text-slate-700" />
              </div>
              <div className="text-2xl font-black tracking-tighter text-teal-600 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white text-xl">S</div>
                <span>SMRITI<span className="font-light text-slate-400">STORE</span></span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full group">
                <input
                  type="text"
                  placeholder="Search for premium products, brands and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-100/80 border-transparent text-sm py-3 px-6 rounded-full focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-300 outline-none"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors shadow-sm">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6">
              <button className="hidden md:flex flex-col items-center gap-1 text-slate-600 hover:text-teal-600 transition-colors">
                <User className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
              </button>
              <button className="hidden md:flex flex-col items-center gap-1 text-slate-600 hover:text-teal-600 transition-colors">
                <Heart className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Wishlist</span>
              </button>
              <button 
                className="relative flex flex-col items-center gap-1 text-slate-600 hover:text-teal-600 transition-colors"
                onClick={toggleCart}
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  <AnimatePresence>
                    {getCartCount() > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm"
                      >
                        {getCartCount()}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Cart</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Categories Bar */}
        <div className="hidden md:block border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex space-x-8 text-sm font-semibold text-slate-700 h-12 items-center">
              {['Top Offers', 'Mobiles & Electronics', 'Fashion', 'Home & Furniture', 'Beauty & Personal Care', 'Sports'].map((cat) => (
                <li key={cat} className="hover:text-teal-600 cursor-pointer transition-colors whitespace-nowrap">{cat}</li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* ── HERO BANNER ── */}
      <div className="relative bg-teal-900 text-white overflow-hidden h-[400px]">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1600" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900 via-teal-900/80 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-xl"
          >
            <h1 className="text-5xl font-black mb-4 leading-tight tracking-tight">The Big <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-200">Sovereign Sale</span></h1>
            <p className="text-lg text-teal-100 mb-8 font-light">Experience retail parity directly connected to SMRITI-OS Shoper9 cores. 50-80% Off on top brands.</p>
            <button className="bg-white text-teal-900 px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl hover:bg-gray-50 transition-all flex items-center gap-2 group">
              Shop Now 
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Trending from Smriti-OS Inventory</h2>
          <button className="text-teal-600 font-bold hover:underline flex items-center text-sm">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-4">
                <div className="bg-gray-200 h-64 rounded-2xl"></div>
                <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.filter(p => p.itemdesc.toLowerCase().includes(searchQuery.toLowerCase())).map((product, idx) => (
              <motion.div 
                key={product.stockno}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 border border-gray-100/50"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                  <img 
                    src={product.image_url} 
                    alt={product.itemdesc}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Floating Actions */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:text-red-500 hover:bg-white transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Stock Badge */}
                  {product.in_stock < 5 && (
                    <div className="absolute bottom-3 left-3 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-sm">
                      Only {product.in_stock} left
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col flex-grow">
                  <div className="text-[11px] font-bold tracking-widest text-teal-600 uppercase mb-1">
                    {product.brand}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 leading-tight mb-2 line-clamp-2">
                    {product.itemdesc}
                  </h3>
                  
                  {/* Rating Dummy */}
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex text-yellow-400">
                      <Star className="w-3 h-3 fill-current" />
                      <Star className="w-3 h-3 fill-current" />
                      <Star className="w-3 h-3 fill-current" />
                      <Star className="w-3 h-3 fill-current" />
                      <Star className="w-3 h-3 text-gray-300" />
                    </div>
                    <span className="text-xs text-gray-400">(128)</span>
                  </div>

                  <div className="mt-auto flex items-end justify-between">
                    <div>
                      <span className="text-lg font-black text-slate-900">₹{product.retail_price}</span>
                      <div className="text-xs text-gray-400 line-through">₹{(product.retail_price * 1.2).toFixed(2)}</div>
                    </div>
                    
                    <button 
                      onClick={() => addItem({
                        stockno: product.stockno,
                        itemdesc: product.itemdesc,
                        brand: product.brand,
                        retail_price: product.retail_price,
                        image_url: product.image_url
                      })}
                      className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-teal-600 hover:scale-110 active:scale-95 transition-all shadow-md"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-xl font-black tracking-tighter text-white flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded-md bg-teal-600 flex items-center justify-center text-xs">S</div>
              <span>SMRITI<span className="font-light text-slate-500">STORE</span></span>
            </div>
            <p className="text-sm">Powered by SMRITI-OS. The sovereign retail operating system connected natively to Shoper9 backend cores.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-teal-400">Men's Fashion</a></li>
              <li><a href="#" className="hover:text-teal-400">Women's Fashion</a></li>
              <li><a href="#" className="hover:text-teal-400">Electronics</a></li>
              <li><a href="#" className="hover:text-teal-400">Home Decor</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Customer Care</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-teal-400">Help Center</a></li>
              <li><a href="#" className="hover:text-teal-400">Track Order</a></li>
              <li><a href="#" className="hover:text-teal-400">Returns</a></li>
              <li><a href="#" className="hover:text-teal-400">Cancellation</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-teal-400">Instagram</a></li>
              <li><a href="#" className="hover:text-teal-400">Twitter</a></li>
              <li><a href="#" className="hover:text-teal-400">Facebook</a></li>
            </ul>
          </div>
        </div>
      </footer>

      {/* ── CART DRAWER ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
              onClick={toggleCart}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-black text-slate-800">Your Cart</h2>
                <button onClick={toggleCart} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                    <ShoppingCart className="w-16 h-16 opacity-20" />
                    <p className="font-semibold text-lg">Your cart is empty</p>
                  </div>
                ) : (
                  items.map(item => (
                    <div key={item.stockno} className="flex gap-4 border-b border-gray-50 pb-6">
                      <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        <img src={item.image_url} alt={item.itemdesc} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">{item.brand}</div>
                        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 mt-1">{item.itemdesc}</h3>
                        <div className="text-sm font-bold mt-1 text-slate-900">₹{item.retail_price}</div>
                        
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1">
                            <button onClick={() => updateQuantity(item.stockno, item.quantity - 1)} className="text-slate-500 hover:text-slate-800"><Minus className="w-4 h-4" /></button>
                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.stockno, item.quantity + 1)} className="text-slate-500 hover:text-slate-800"><Plus className="w-4 h-4" /></button>
                          </div>
                          <button onClick={() => removeItem(item.stockno)} className="text-xs text-red-500 font-bold hover:underline">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-slate-500 font-semibold">Subtotal</span>
                    <span className="text-2xl font-black text-slate-900">₹{getCartTotal().toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isCheckingOut ? (
                      <span className="animate-pulse">Processing Securely...</span>
                    ) : (
                      <>Checkout Now <ChevronRight className="w-5 h-5" /></>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EcommerceStorefront;

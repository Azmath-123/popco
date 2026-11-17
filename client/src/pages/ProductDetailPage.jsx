import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Star, ShoppingBag, ShieldCheck, Truck, RefreshCw, Plus, Minus, ArrowRight, MessageSquare } from 'lucide-react';
export const ProductDetailPage = ({ onOpenCheckout }) => {
    const { slug } = useParams();
    const { products, addToCart, reviews, addReview, currentUser } = useStore();
    const navigate = useNavigate();
    // Find product by slug or id
    const product = products.find((p) => p.slug === slug || p.id.toString() === slug) || products[0];
    // Gallery state
    const [selectedImage, setSelectedImage] = useState(product?.image || '/product_1.webp');
    // Pack selector state
    const [selectedPack, setSelectedPack] = useState(product?.packs?.[0] || { count: 1, label: 'Single Pack', price: product?.numericPrice || 229 });
    // Quantity state
    const [quantity, setQuantity] = useState(1);
    // Review Form state
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewAuthor, setReviewAuthor] = useState(currentUser?.name || '');
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewTitle, setReviewTitle] = useState('');
    const [reviewComment, setReviewComment] = useState('');
    // Update selected image and pack when product changes
    useEffect(() => {
        if (product) {
            setSelectedImage(product.image);
            setSelectedPack(product.packs?.[0] || { count: 1, label: 'Single Pack', price: product.numericPrice });
            setQuantity(1);
            window.scrollTo(0, 0);
        }
    }, [product?.slug]);
    if (!product) {
        return (<div className="py-20 text-center">
        <h2 className="text-xl font-bold">Product not found</h2>
        <Link to="/" className="text-[var(--foreground)] underline font-bold mt-2 inline-block">
          Return to Home
        </Link>
      </div>);
    }
    // Calculate current unit price from selected pack
    const currentPrice = selectedPack.price || product.numericPrice;
    const originalPackPrice = Math.round(currentPrice * 1.25);
    const savings = originalPackPrice - currentPrice;
    // Filter product specific reviews
    const productReviews = reviews.filter((r) => r.productId === product.id);
    // Related products
    const relatedProducts = products
        .filter((p) => p.id !== product.id && p.category === product.category)
        .slice(0, 4);
    const handleAddToCart = () => {
        addToCart(product, selectedPack, quantity);
    };
    const handleBuyNow = async () => {
        if (await addToCart(product, selectedPack, quantity)) onOpenCheckout();
    };
    const handleReviewSubmit = (e) => {
        e.preventDefault();
        if (!reviewAuthor || !reviewComment)
            return;
        addReview({
            productId: product.id,
            author: reviewAuthor,
            rating: reviewRating,
            title: reviewTitle || 'Crunchy and fresh!',
            comment: reviewComment,
            verified: true,
            location: 'India',
        });
        setReviewComment('');
        setReviewTitle('');
        setShowReviewForm(false);
    };
    return (<div className="flex-1 bg-[var(--background)] pb-16">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-[var(--border)]/10 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs font-bold text-[var(--foreground)]/60 uppercase tracking-wider flex items-center gap-2">
          <Link to="/" className="hover:text-[var(--foreground)]">Home</Link>
          <span>/</span>
          <Link to="/#shop" className="hover:text-[var(--foreground)]">Products</Link>
          <span>/</span>
          <span className="text-[var(--foreground)] font-black truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left: Product Gallery */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-[var(--border)]/15 p-6 shadow-sm flex items-center justify-center min-h-[380px] sm:min-h-[460px] relative overflow-hidden group">
              <img src={selectedImage} alt={product.name} className="max-h-[380px] w-auto object-contain transition-transform duration-500 group-hover:scale-105"/>
              <span className="absolute top-4 left-4 bg-[var(--secondary-foreground)] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-xs">
                {product.badge || (product.category === 'raw' ? 'Mithila 6+ Suta' : '100% Plant Protein')}
              </span>
            </div>

            {/* Thumbnail Row */}
            {product.images && product.images.length > 1 && (<div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {product.images.map((img, idx) => (<button key={idx} onClick={() => setSelectedImage(img)} className={`w-20 h-20 bg-white rounded-xl border-2 p-1.5 transition-all cursor-pointer shrink-0 ${selectedImage === img
                    ? 'border-[var(--border)] ring-2 ring-[var(--primary)]/20 scale-105'
                    : 'border-[var(--border)]/15 opacity-70 hover:opacity-100'}`}>
                    <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-contain"/>
                  </button>))}
              </div>)}

            {/* Trust highlights below gallery */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-white rounded-xl border border-[var(--border)]/10 text-center space-y-1">
                <Truck size={18} className="mx-auto text-[var(--foreground)]"/>
                <h5 className="text-[10px] font-extrabold uppercase text-[var(--foreground)]">Fast Dispatch</h5>
                <p className="text-[9px] text-[var(--foreground)]/60 font-sans">Shipped in 24 Hours</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[var(--border)]/10 text-center space-y-1">
                <ShieldCheck size={18} className="mx-auto text-[var(--foreground)]"/>
                <h5 className="text-[10px] font-extrabold uppercase text-[var(--foreground)]">100% Purity</h5>
                <p className="text-[9px] text-[var(--foreground)]/60 font-sans">Zero Preservatives</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[var(--border)]/10 text-center space-y-1">
                <RefreshCw size={18} className="mx-auto text-[var(--foreground)]"/>
                <h5 className="text-[10px] font-extrabold uppercase text-[var(--foreground)]">Fresh Harvest</h5>
                <p className="text-[9px] text-[var(--foreground)]/60 font-sans">Airtight Pouch Seal</p>
              </div>
            </div>
          </div>

          {/* Right: Product Details & Purchase Actions */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--border)]/15 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (<Star key={i} size={14} fill={i < product.rating ? 'currentColor' : 'none'} stroke={i < product.rating ? 'none' : 'currentColor'}/>))}
                </div>
                <span className="text-xs font-black text-[var(--foreground)]">{product.rating}.0</span>
                <span className="text-xs text-[var(--foreground)]/50 font-bold">
                  ({product.reviewCount} Verified Reviews)
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black uppercase text-[var(--foreground)] tracking-tight">
                {product.name}
              </h1>
              <p className="text-xs font-bold text-[var(--secondary-foreground)] uppercase tracking-wider mt-0.5">
                {product.weight}
              </p>
            </div>

            {/* Price section */}
            <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]/10 flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[var(--foreground)]">
                    ₹{currentPrice}
                  </span>
                  <span className="text-base text-[var(--foreground)]/40 line-through font-bold">
                    ₹{originalPackPrice}
                  </span>
                  <span className="bg-[var(--secondary-foreground)] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    SAVE ₹{savings}
                  </span>
                </div>
                <span className="text-[10px] text-[var(--foreground)]/70 font-bold uppercase tracking-wider block mt-1">
                  Inclusive of all taxes • Free Shipping on orders over ₹599
                </span>
              </div>
            </div>

            {/* Pack Selector (Single, 2, 3, 4 packs) */}
            {product.packs && product.packs.length > 0 && (<div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-extrabold uppercase text-[var(--foreground)]">
                  <span>Select Packaging Size</span>
                  <span className="text-[var(--secondary-foreground)]">Best Value for Bundles</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {product.packs.map((pack) => {
                const isSelected = selectedPack.count === pack.count;
                return (<button key={pack.count} type="button" onClick={() => setSelectedPack(pack)} className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${isSelected
                        ? 'border-[var(--border)] bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20 scale-102'
                        : 'border-[var(--border)]/20 bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--border)]'}`}>
                        <span className="block text-[11px] font-black uppercase tracking-wider">
                          {pack.label}
                        </span>
                        <span className="block text-xs font-extrabold mt-1">
                          ₹{pack.price}
                        </span>
                      </button>);
            })}
                </div>
              </div>)}

            {/* Quantity Stepper & Buttons */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-extrabold uppercase text-[var(--foreground)]">Quantity:</span>
                <div className="flex items-center border border-[var(--border)]/20 rounded-xl overflow-hidden bg-[var(--background)]">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-[var(--primary)]/10 text-[var(--foreground)] transition-colors">
                    <Minus size={14}/>
                  </button>
                  <span className="w-10 text-center text-sm font-black text-[var(--foreground)]">
                    {quantity}
                  </span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-[var(--primary)]/10 text-[var(--foreground)] transition-colors">
                    <Plus size={14}/>
                  </button>
                </div>
                <span className="text-xs text-[var(--foreground)]/70 font-bold">
                  Total: <span className="text-[var(--foreground)] font-black">₹{currentPrice * quantity}</span>
                </span>
              </div>

              {/* Add to Cart & Buy Now */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={handleAddToCart} className="py-3.5 px-6 rounded-full border-2 border-[var(--border)] text-[var(--foreground)] font-black text-xs uppercase tracking-widest hover:bg-[var(--primary)] hover:text-white transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer shadow-xs">
                  <ShoppingBag size={16}/>
                  <span>Add to Cart</span>
                </button>

                <button onClick={handleBuyNow} className="py-3.5 px-6 rounded-full bg-[var(--primary)] text-white font-black text-xs uppercase tracking-widest hover:bg-[var(--primary)]/90 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer shadow-lg shadow-[var(--primary)]/25">
                  <span>Buy Now (Instant)</span>
                  <ArrowRight size={16}/>
                </button>
              </div>
            </div>

            {/* Key Highlights Grid */}
            {product.keyHighlights && product.keyHighlights.length > 0 && (<div className="pt-4 border-t border-[var(--border)]/10 space-y-3">
                <h4 className="text-xs font-black uppercase text-[var(--foreground)] tracking-wider">
                  {product.keyHighlightsTitle || 'Product Highlights'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.keyHighlights.map((hl, idx) => (<div key={idx} className="p-3 bg-[var(--background)] rounded-xl border border-[var(--border)]/10 flex items-start gap-2.5">
                      <span className="text-xl shrink-0 mt-0.5">{hl.icon}</span>
                      <div>
                        <h5 className="text-[11px] font-black uppercase text-[var(--foreground)]">{hl.title}</h5>
                        <p className="text-[10px] text-[var(--foreground)]/70 font-sans mt-0.5 leading-snug">{hl.desc}</p>
                      </div>
                    </div>))}
                </div>
              </div>)}

            {/* Description & Features */}
            <div className="pt-4 border-t border-[var(--border)]/10 space-y-2">
              <h4 className="text-xs font-black uppercase text-[var(--foreground)] tracking-wider">Description</h4>
              <p className="text-xs text-[var(--foreground)]/80 font-sans leading-relaxed">
                {product.description}
              </p>

              {product.features && (<div className="flex flex-wrap gap-2 pt-2">
                  {product.features.map((feat, i) => (<span key={i} className="px-2.5 py-1 bg-[var(--primary)]/10 rounded-full text-[10px] font-extrabold uppercase text-[var(--foreground)]">
                      ✓ {feat}
                    </span>))}
                </div>)}
            </div>

            {/* Ingredients & Allergens */}
            {product.ingredients && (
              <div className="pt-4 border-t border-[var(--border)]/10 space-y-2">
                <h4 className="text-xs font-black uppercase text-[var(--foreground)] tracking-wider">Ingredients</h4>
                <p className="text-xs text-[var(--foreground)]/85 font-bold font-sans">
                  {product.ingredients}
                </p>
                {product.allergens && (
                  <p className="text-[11px] text-[var(--foreground)]/65 font-sans">
                    <span className="font-bold">Allergen Information:</span> {product.allergens}
                  </p>
                )}
              </div>
            )}

            {/* Nutrition Facts */}
            {product.nutritionFacts && (
              <div className="pt-4 border-t border-[var(--border)]/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-[var(--foreground)] tracking-wider">Nutrition Facts</h4>
                  <span className="text-[10px] text-[var(--foreground)]/60 font-sans">Per 100g</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 bg-[var(--background)] rounded-xl border border-[var(--border)]/10">
                    <span className="block text-[10px] font-bold text-[var(--foreground)]/60 uppercase">Energy</span>
                    <span className="block text-xs font-black text-[var(--foreground)] mt-0.5">{product.nutritionFacts.energy}</span>
                  </div>
                  <div className="p-2.5 bg-[var(--background)] rounded-xl border border-[var(--border)]/10">
                    <span className="block text-[10px] font-bold text-[var(--secondary-foreground)] uppercase">Protein</span>
                    <span className="block text-xs font-black text-[var(--foreground)] mt-0.5">{product.nutritionFacts.protein}</span>
                  </div>
                  <div className="p-2.5 bg-[var(--background)] rounded-xl border border-[var(--border)]/10">
                    <span className="block text-[10px] font-bold text-[var(--foreground)]/60 uppercase">Dietary Fibre</span>
                    <span className="block text-xs font-black text-[var(--foreground)] mt-0.5">{product.nutritionFacts.dietaryFiber}</span>
                  </div>
                  <div className="p-2.5 bg-[var(--background)] rounded-xl border border-[var(--border)]/10">
                    <span className="block text-[10px] font-bold text-[var(--foreground)]/60 uppercase">Total Fat</span>
                    <span className="block text-xs font-black text-[var(--foreground)] mt-0.5">{product.nutritionFacts.totalFat}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-16 bg-white p-6 sm:p-10 rounded-3xl border border-[var(--border)]/15 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)]/10 pb-6">
            <div>
              <h3 className="text-2xl font-black uppercase text-[var(--foreground)] tracking-tight">
                Customer Reviews & Ratings
              </h3>
              <p className="text-xs text-[var(--foreground)]/70 font-sans mt-1">
                Real feedback from verified food lovers across India.
              </p>
            </div>

            <button onClick={() => setShowReviewForm(!showReviewForm)} className="px-6 py-2.5 rounded-full bg-[var(--secondary-foreground)] hover:bg-[var(--secondary-foreground)]/90 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md">
              <MessageSquare size={14}/>
              <span>{showReviewForm ? 'Cancel Review' : 'Write a Review'}</span>
            </button>
          </div>

          {/* Review submission form */}
          {showReviewForm && (<form onSubmit={handleReviewSubmit} className="bg-[var(--background)] p-6 rounded-2xl border border-[var(--border)]/15 space-y-4">
              <h4 className="text-sm font-black uppercase text-[var(--foreground)]">Submit Your Verified Review</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                    Your Name *
                  </label>
                  <input type="text" required value={reviewAuthor} onChange={(e) => setReviewAuthor(e.target.value)} placeholder="e.g. Pooja Bharti" className="w-full px-3 py-2 text-xs bg-white border border-[var(--border)]/20 rounded-lg font-bold"/>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                    Rating (1 to 5 Stars) *
                  </label>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (<button key={star} type="button" onClick={() => setReviewRating(star)} className="text-amber-500 cursor-pointer p-1">
                        <Star size={20} fill={star <= reviewRating ? 'currentColor' : 'none'} stroke="currentColor"/>
                      </button>))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                  Headline / Title
                </label>
                <input type="text" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} placeholder="e.g. Unmatched Meerut crunch!" className="w-full px-3 py-2 text-xs bg-white border border-[var(--border)]/20 rounded-lg font-bold"/>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                  Your Detailed Review *
                </label>
                <textarea rows={3} required value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Tell us what you liked about the size, roasting, packaging and crunch..." className="w-full px-3 py-2 text-xs bg-white border border-[var(--border)]/20 rounded-lg font-medium"/>
              </div>

              <button type="submit" className="px-6 py-2.5 rounded-full bg-[var(--primary)] text-white text-xs font-black uppercase tracking-widest shadow-md hover:bg-[var(--primary)]/90">
                Post Review
              </button>
            </form>)}

          {/* Reviews list */}
          <div className="space-y-4">
            {productReviews.length === 0 ? (<p className="text-xs text-[var(--foreground)]/60 italic font-sans">
                Be the first to leave a review for {product.name}!
              </p>) : (productReviews.map((rev) => (<div key={rev.id} className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[var(--foreground)] uppercase">{rev.author}</span>
                      {rev.verified && (<span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-2 py-0.2 rounded-full flex items-center gap-0.5">
                          <ShieldCheck size={10}/> Verified
                        </span>)}
                    </div>
                    <span className="text-[10px] text-[var(--foreground)]/50 font-bold">{rev.date}</span>
                  </div>

                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (<Star key={i} size={12} fill={i < rev.rating ? 'currentColor' : 'none'} stroke={i < rev.rating ? 'none' : 'currentColor'}/>))}
                  </div>

                  <h5 className="text-xs font-black text-[var(--foreground)] uppercase">{rev.title}</h5>
                  <p className="text-xs text-[var(--foreground)]/80 font-sans leading-relaxed">{rev.comment}</p>
                </div>)))}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (<div className="mt-16 space-y-6">
            <h3 className="text-2xl font-black uppercase text-[var(--foreground)] tracking-tight text-center">
              You May Also Like
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (<Link key={rel.id} to={`/product/${rel.slug}`} className="group bg-white rounded-2xl border border-[var(--border)]/15 overflow-hidden p-4 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between">
                  <div className="h-44 bg-[var(--background)] rounded-xl p-2 flex items-center justify-center overflow-hidden mb-3">
                    <img src={rel.image} alt={rel.name} className="max-h-full object-contain group-hover:scale-105 transition-transform"/>
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-[var(--foreground)] group-hover:text-[var(--secondary-foreground)]">
                      {rel.name}
                    </h4>
                    <p className="text-[10px] text-[var(--secondary-foreground)] font-bold mt-0.5">{rel.weight}</p>
                    <span className="text-sm font-black text-[var(--foreground)] mt-2 block">
                      ₹{rel.numericPrice}
                    </span>
                  </div>
                </Link>))}
            </div>
          </div>)}
      </div>
    </div>);
};

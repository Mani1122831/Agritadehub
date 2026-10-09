import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, ShoppingBag, Check, Camera, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const [imgError, setImgError] = useState(false);

  const images = (product.images && product.images.length > 0)
    ? product.images
    : (product.gallery && product.gallery.length > 0)
    ? product.gallery
    : (product.image ? [product.image] : []);

  const currentDisplayImage = images[activeImgIndex] || product.image || '';

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const productTargetId = product._id || product.id || product.productId;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col">
      {/* Product Image & Thumbnail Hover Scrub */}
      <Link 
        to={`/product/${productTargetId}`} 
        className="relative block overflow-hidden aspect-[4/3] bg-slate-100"
      >
        {!imgError && currentDisplayImage ? (
          <img
            src={currentDisplayImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4 text-center">
            <Camera className="w-8 h-8 text-slate-300 mb-1" />
            <span className="text-[11px] font-semibold text-slate-500">Photo Coming Soon</span>
          </div>
        )}

        {/* Quality Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isOrganic && (
            <span className="bg-emerald-600/95 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center space-x-1">
              <span>🌿</span>
              <span>Organic</span>
            </span>
          )}
          <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
            {product.quality}
          </span>
        </div>

        {/* Multi-Photo Real Gallery Indicator Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center space-x-1">
            <Camera className="w-3 h-3 text-emerald-400" />
            <span>{images.length === 1 ? '1 Photo' : `${images.length} Photos`}</span>
          </span>
        </div>

        {/* Stock status */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-sm border border-slate-200">
            {product.stock} {product.unit} left
          </span>
        </div>

        {/* Interactive image scrub dots on hover */}
        {images.length > 1 && (
          <div 
            className="absolute bottom-3 left-3 z-10 flex items-center space-x-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.preventDefault()}
          >
            {images.slice(0, 4).map((_, idx) => (
              <button
                key={idx}
                onMouseEnter={() => setActiveImgIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeImgIndex === idx ? 'bg-emerald-400 w-3.5' : 'bg-white/70 hover:bg-white'
                }`}
                title={`View Photo ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </Link>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-emerald-700 uppercase tracking-wider text-[10px]">
              {product.category}
            </span>
            <div className="flex items-center space-x-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-800">{product.rating}</span>
              <span className="text-[10px]">({product.reviewsCount})</span>
            </div>
          </div>

          <Link to={`/product/${product._id}`}>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          <div className="mt-2 flex items-center space-x-1.5 text-xs text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{product.location?.city || 'Guntur'}, {product.location?.state || 'AP'}</span>
            <span className="text-slate-300">•</span>
            <span className="truncate text-slate-500">{product.farmerName || 'Kisan Group'}</span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Farm-Gate Price</div>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-extrabold text-slate-900">₹{product.price}</span>
              <span className="text-xs font-medium text-slate-500">/{product.unit}</span>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white border border-emerald-200'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

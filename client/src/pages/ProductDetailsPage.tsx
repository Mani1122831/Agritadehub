import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  MapPin,
  Calendar,
  ShieldCheck,
  ShoppingBag,
  Truck,
  ArrowLeft,
  Check,
  UserCheck,
  Sparkles,
  Camera,
  Maximize2,
  X,
  Award,
  Clock,
  Package,
  Layers,
  Video,
  AlertCircle,
  ImageOff
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/common/ProductCard';
import { Product } from '../types';
import { fallbackProducts } from '../data/fallbackProducts';

const PHOTO_PERSPECTIVES = [
  '🌿 Farm-Gate Harvest View',
  '📦 Mandi Lot & Sorting Crate',
  '🔬 Quality Inspection & Texture',
  '🏷️ Packaged Dispatch Ready'
];

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Strict lookup helper - never defaults to another product
  const findStrictProduct = (lookupId?: string): Product | null => {
    if (!lookupId) return null;
    const cleanId = lookupId.trim().toLowerCase();
    return (
      fallbackProducts.find(
        (p) =>
          p._id?.toLowerCase() === cleanId ||
          p.id?.toLowerCase() === cleanId ||
          p.productId?.toLowerCase() === cleanId
      ) || null
    );
  };

  const initialMatch = findStrictProduct(id);
  const [product, setProduct] = useState<Product | null>(initialMatch);
  const [related, setRelated] = useState<Product[]>(
    initialMatch
      ? fallbackProducts.filter((p) => p.category === initialMatch.category && p._id !== initialMatch._id).slice(0, 4)
      : []
  );
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!id) return;

    setImageErrorMap({});
    setActiveImgIndex(0);

    const localMatch = findStrictProduct(id);
    if (localMatch) {
      setProduct(localMatch);
      setRelated(
        fallbackProducts
          .filter((p) => p.category === localMatch.category && p._id !== localMatch._id)
          .slice(0, 4)
      );
    } else {
      setLoading(true);
    }

    apiRequest(`/products/${id}`)
      .then((data) => {
        if (data.success && data.product) {
          setProduct(data.product);
          if (data.related?.length) setRelated(data.related);
        } else if (!localMatch) {
          setProduct(null);
        }
      })
      .catch((err) => {
        console.warn('Product API fetch error, fallback active:', err);
        if (!localMatch) setProduct(null);
      })
      .finally(() => {
        setLoading(false);
      });

    // Fetch verified reviews
    apiRequest(`/reviews/product/${id}`)
      .then((res) => {
        if (res.success) setReviews(res.reviews || []);
      })
      .catch(() => {});
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto mb-4"></div>
        <div className="h-64 bg-slate-200 rounded-3xl max-w-2xl mx-auto"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          The requested agricultural produce listing could not be found. Please check the product ID or browse our marketplace catalog.
        </p>
        <Link
          to="/marketplace"
          className="mt-4 inline-flex items-center space-x-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>
    );
  }

  // Strict product media extraction: ONLY images belonging to current product
  const verifiedImages: string[] = (
    product.images && product.images.length > 0
      ? product.images
      : product.gallery && product.gallery.length > 0
      ? product.gallery
      : product.image
      ? [product.image]
      : []
  ).filter(Boolean);

  const currentImage = verifiedImages[activeImgIndex] || verifiedImages[0] || null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-16">
      {/* Lightbox Modal for Full-Resolution Photos */}
      {isLightboxOpen && currentImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="absolute top-4 right-4 flex items-center space-x-3">
            <span className="text-white/80 text-xs font-bold px-3 py-1 bg-white/10 rounded-full">
              Photo {activeImgIndex + 1} of {verifiedImages.length}
            </span>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="max-w-4xl max-h-[80vh] w-full flex items-center justify-center">
            <img
              src={currentImage}
              alt={product.name}
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
            />
          </div>

          {/* Perspective Caption & Lightbox Thumbnails */}
          <div className="mt-4 flex flex-col items-center space-y-2">
            <p className="text-emerald-400 text-xs font-semibold">
              {PHOTO_PERSPECTIVES[activeImgIndex] || `Lot Photo ${activeImgIndex + 1}`}
            </p>
            <div className="flex space-x-2">
              {verifiedImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIndex(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImgIndex === idx ? 'border-emerald-400 scale-105' : 'border-white/30 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Produce Catalog</span>
        </button>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md font-bold flex items-center space-x-1">
            <Camera className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {verifiedImages.length}{' '}
              {verifiedImages.length === 1 ? 'Verified Photo' : 'Verified Photos'} Available
            </span>
          </span>
          {product.productId && (
            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md font-mono text-[11px] font-semibold">
              SKU: {product.productId}
            </span>
          )}
        </div>
      </div>

      {/* Main Product Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Product-Specific Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-slate-200 bg-slate-100 shadow-md group flex items-center justify-center">
            {currentImage && !imageErrorMap[activeImgIndex] ? (
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
                onError={() => {
                  setImageErrorMap((prev) => ({ ...prev, [activeImgIndex]: true }));
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
                <ImageOff className="w-12 h-12 stroke-[1.5]" />
                <p className="text-sm font-semibold text-slate-600">Product Image Unavailable</p>
                <p className="text-xs text-slate-400">Authentic photo being processed by quality surveyor</p>
              </div>
            )}

            {/* Photo Perspective Overlay Tag */}
            {currentImage && !imageErrorMap[activeImgIndex] && (
              <div className="absolute bottom-4 left-4 bg-slate-900/85 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 shadow-lg">
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>{PHOTO_PERSPECTIVES[activeImgIndex] || `Photo ${activeImgIndex + 1}`}</span>
              </div>
            )}

            {/* Lightbox Zoom Trigger */}
            {currentImage && !imageErrorMap[activeImgIndex] && (
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="absolute top-4 right-4 p-2.5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md transition-all shadow-md group-hover:scale-105"
                title="Expand High Resolution Lightbox"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}

            {/* Quality Tag Overlays */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {product.isOrganic && (
                <span className="bg-emerald-600/95 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center space-x-1">
                  <span>🌿</span>
                  <span>100% Organic Certified</span>
                </span>
              )}
              <span className="bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                {product.quality}
              </span>
            </div>
          </div>

          {/* 4 Gallery Thumbnail Slots (Real images for available slots, "Photo Coming Soon" for missing slots) */}
          <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((slotIdx) => {
              const slotImage = verifiedImages[slotIdx];

              if (slotImage) {
                return (
                  <button
                    key={slotIdx}
                    onClick={() => setActiveImgIndex(slotIdx)}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all group ${
                      activeImgIndex === slotIdx
                        ? 'border-emerald-600 ring-2 ring-emerald-500/30 scale-102'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={slotImage}
                      alt={`${product.name} angle ${slotIdx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-1.5">
                      <span className="text-[9px] font-bold text-white line-clamp-1">
                        Photo {slotIdx + 1}
                      </span>
                    </div>
                  </button>
                );
              }

              // Missing slot: clean "Photo Coming Soon" tile
              return (
                <div
                  key={slotIdx}
                  className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 flex flex-col items-center justify-center p-2 text-center text-slate-400 select-none"
                  title="Additional photo coming soon"
                >
                  <Camera className="w-4 h-4 mb-1 text-slate-300" />
                  <span className="text-[9px] font-bold text-slate-400">Photo {slotIdx + 1}</span>
                  <span className="text-[8px] text-slate-400 uppercase tracking-tighter">Coming Soon</span>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs text-emerald-800 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Product Media — Zero Foreign Images</span>
            </span>
            {verifiedImages.length > 0 && (
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="font-bold underline hover:text-emerald-950"
              >
                View HD Lightbox
              </button>
            )}
          </div>
        </div>

        {/* Right: Info, Specifications & Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                {product.category}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900 text-white">
                {product.quality}
              </span>
              {product.isOrganic && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-600 text-white">
                  🌿 Organic Certified
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-center space-x-4 mt-3 text-xs text-slate-500">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-slate-800">{product.rating}</span>
                <span>({product.reviewsCount} verified reviews)</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{product.location?.city}, {product.location?.state}</span>
              </div>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-baseline justify-between">
            <div>
              <div className="text-xs text-emerald-800 font-bold uppercase tracking-wider">
                Direct Farm-Gate Price
              </div>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-3xl sm:text-4xl font-black text-slate-900">₹{product.price}</span>
                <span className="text-sm font-semibold text-slate-500">/ {product.unit}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-emerald-700">Verified Stock</div>
              <div className="text-sm font-extrabold text-slate-900">{product.stock} {product.unit} Available</div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Produce Description</h4>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Detailed Agricultural Specifications Grid */}
          {product.specifications && Object.keys(product.specifications).length > 0 ? (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Technical Specifications
              </h4>
              <div className="grid grid-cols-2 gap-2.5 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="space-y-0.5">
                    <span className="text-slate-400 capitalize font-medium">
                      {key.replace(/([A-Z])/g, ' $1')}:
                    </span>
                    <p className="font-bold text-slate-900">
                      {typeof val === 'boolean' ? (val ? 'Yes (Certified)' : 'Standard') : String(val)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Minimum Order Quantity:</span>
                <p className="font-bold text-slate-900">{product.minOrderQuantity || 5} {product.unit}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Harvest Period:</span>
                <p className="font-bold text-slate-900">
                  {product.harvestDate ? new Date(product.harvestDate).toLocaleDateString('en-IN') : 'Fresh Weekly Harvest'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">FPO / Farmer Source:</span>
                <p className="font-bold text-slate-900 flex items-center space-x-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate">{product.farmerName || 'Kisan Direct Producer'}</span>
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Mandi Merchant Hub:</span>
                <p className="font-bold text-slate-900 truncate">{product.sellerName || 'Accredited Merchant'}</p>
              </div>
            </div>
          )}

          {/* Cold-Chain Transit Guarantee */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <strong className="text-slate-900 block">Cold-Chain Route Dispatch Available</strong>
              <span className="text-slate-500">Live GPS tracking and temperature logging during interstate transit.</span>
            </div>
          </div>

          {/* Quantity & CTAs */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold text-slate-700">Quantity ({product.unit}):</span>
              <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-white text-slate-800 font-bold hover:bg-slate-200 transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center text-sm font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-8 h-8 rounded-lg bg-white text-slate-800 font-bold hover:bg-slate-200 transition-colors"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-slate-500">
                Total: <strong>₹{product.price * quantity}</strong>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all shadow-md ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 py-3.5 rounded-xl text-sm font-bold bg-slate-900 hover:bg-emerald-950 text-white shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <span>Buy Now with Sandbox Checkout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Video Section */}
      <div className="pt-8 border-t border-slate-200">
        <div className="flex items-center space-x-2 mb-4">
          <Video className="w-5 h-5 text-emerald-700" />
          <h3 className="text-xl font-bold text-slate-900">Farm Harvest & Lot Video</h3>
        </div>
        {product.video ? (
          <div className="relative aspect-video max-w-2xl rounded-2xl overflow-hidden border border-slate-200 bg-black shadow-md">
            <video
              src={product.video}
              controls
              className="w-full h-full object-cover"
              poster={currentImage || undefined}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <div className="max-w-2xl p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">
              <Video className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Product video coming soon</p>
            <p className="text-xs text-slate-400 max-w-md">
              Authentic field harvest and APMC surveyor video documentation for this produce lot is currently being prepared.
            </p>
          </div>
        )}
      </div>

      {/* Verified Reviews Section */}
      <div className="pt-8 border-t border-slate-200">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">
          Verified Customer & Merchant Reviews ({reviews.length})
        </h3>
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div key={rev._id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-sm text-slate-900">{rev.userName}</div>
                  <div className="flex items-center space-x-0.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <div className="text-xs text-emerald-700 font-semibold mb-2">
                  ✓ Verified Purchase Order
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
            <p>✓ All lots certified by APMC Surveyor. Verified purchase feedback will be published here upon delivery receipt.</p>
          </div>
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="pt-8 border-t border-slate-200">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">
            Similar Produce in {product.category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

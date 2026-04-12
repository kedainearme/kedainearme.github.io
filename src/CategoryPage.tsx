import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ExternalLink, ArrowLeft, Clock, Star, Loader2, Share2, Phone, Globe, MessageSquare, User, Send } from 'lucide-react';
import { CATEGORIES } from './constants';
import { auth, db, signInWithGoogle, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

const ReviewSection = ({ storeId, storeName }: { storeId: string, storeName: string }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(5);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    const q = query(
      collection(db, 'reviews'),
      where('storeId', '==', storeId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeReviews = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(reviewsData);
    }, (error) => {
      console.error("Error fetching reviews:", error);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeReviews();
    };
  }, [storeId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      await signInWithGoogle();
      return;
    }

    if (!newReview.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        storeId,
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        rating,
        comment: newReview,
        createdAt: serverTimestamp()
      });
      setNewReview('');
      setRating(5);
    } catch (error) {
      console.error("Error adding review:", error);
      alert("Failed to add review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6 border-t border-gray-100 pt-6">
      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-blue-600" />
        Community Reviews
      </h4>

      {/* Review List */}
      <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {review.userPhoto ? (
                    <img src={review.userPhoto} alt={review.userName} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-3 w-3 text-gray-400" />
                    </div>
                  )}
                  <span className="text-xs font-bold text-gray-700">{review.userName}</span>
                </div>
                <div className="flex items-center text-amber-500">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-xs font-bold ml-1">{review.rating}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
            </div>
          ))
        )}
      </div>

      {/* Add Review Form */}
      <form onSubmit={handleSubmitReview} className="relative">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-gray-500">Your Rating:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`transition-colors ${star <= rating ? 'text-amber-500' : 'text-gray-300'}`}
              >
                <Star className={`h-4 w-4 ${star <= rating ? 'fill-current' : ''}`} />
              </button>
            ))}
          </div>
        </div>
        <div className="relative">
          <textarea
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder={user ? "Write a review..." : "Sign in to write a review"}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={2}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        {!user && (
          <p className="text-[10px] text-gray-400 mt-1">
            Clicking send will prompt you to sign in with Google.
          </p>
        )}
      </form>
    </div>
  );
};

export const CategoryPage = () => {
  const { categoryId } = useParams();
  const category = CATEGORIES.find(c => `${c.id}-near-me` === categoryId || c.id === categoryId);
  
  const [visibleStores, setVisibleStores] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [copiedStoreId, setCopiedStoreId] = useState<number | null>(null);
  const [activeReviewStore, setActiveReviewStore] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const STORES_PER_PAGE = 4;
  const MAX_STORES = 20;

  useEffect(() => {
    if (category) {
      document.title = `Best ${category.name} Near Me in your placed - NearMe`;
    }
  }, [category]);

  // Reset state when category changes
  useEffect(() => {
    setVisibleStores([]);
    setPage(1);
    setHasMore(true);
  }, [categoryId]);

  const loadMoreStores = () => {
    if (isLoading || !hasMore || !category) return;

    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const start = (page - 1) * STORES_PER_PAGE;
      const end = start + STORES_PER_PAGE;
      
      const newStores = Array.from({ length: STORES_PER_PAGE }).map((_, i) => {
        const index = start + i;
        const descriptions: Record<string, string> = {
          'restaurants': 'Nikmati berbagai pilihan menu lezat dengan pelayanan terbaik di restoran pilihan ini.',
          'gas-stations': 'Temukan bahan bakar berkualitas dan layanan cepat untuk perjalanan Anda di stasiun ini.',
          'pharmacies': 'Dapatkan kebutuhan kesehatan dan obat-obatan terpercaya dengan layanan profesional.',
          'grocery-stores': 'Lengkapi kebutuhan rumah tangga Anda dengan produk segar dan berkualitas setiap hari.',
          'atms': 'Akses layanan perbankan dan penarikan tunai dengan mudah dan aman di lokasi ini.',
          'coffee-shops': 'Nikmati waktu santai Anda dengan aroma kopi pilihan dan suasana yang nyaman.',
          'car-repair': 'Layanan perbaikan dan perawatan kendaraan profesional untuk keamanan berkendara Anda.',
          'shopping-malls': 'Pusat perbelanjaan terlengkap untuk berbagai kebutuhan gaya hidup dan hiburan.',
          'hospitals': 'Layanan kesehatan darurat dan perawatan medis dengan fasilitas yang memadai.',
          'hotels': 'Tempat menginap yang nyaman dengan fasilitas lengkap untuk istirahat terbaik Anda.',
          'campuses': 'Pusat pendidikan tinggi dengan fasilitas akademik dan lingkungan belajar yang inspiratif.',
          'places-of-worship': 'Tempat ibadah yang tenang dan nyaman untuk menjalankan ibadah dan kegiatan keagamaan.',
          'parks': 'Area terbuka hijau yang asri untuk rekreasi, olahraga, dan bersantai bersama keluarga.',
          'services': 'Pusat layanan profesional untuk berbagai kebutuhan perbaikan dan bantuan teknis Anda.',
          'electronics': 'Temukan perangkat elektronik terbaru dan berkualitas dengan garansi resmi di toko ini.',
          'gadgets': 'Pusat gadget terkini, smartphone, dan aksesoris digital untuk gaya hidup modern Anda.',
          'clothing': 'Koleksi pakaian tren terbaru untuk berbagai gaya dan kesempatan dengan harga terbaik.',
          'entertainment': 'Tempat hiburan seru dan menyenangkan untuk melepas penat bersama teman dan keluarga.',
          'government': 'Pusat pelayanan publik dan administrasi pemerintahan untuk berbagai kebutuhan dokumen Anda.',
          'flowers': 'Temukan berbagai pilihan bunga segar dan rangkaian indah untuk momen spesial Anda.',
          'vegetables': 'Pusat sayuran segar langsung dari petani untuk memenuhi kebutuhan nutrisi harian Anda.',
          'fruits': 'Berbagai pilihan buah-buahan segar dan berkualitas untuk kesehatan keluarga Anda.',
          'building-materials': 'Toko material bangunan terlengkap untuk kebutuhan konstruksi dan renovasi rumah Anda.',
          'plastic-stores': 'Menyediakan berbagai jenis produk plastik dan kemasan untuk kebutuhan rumah tangga dan bisnis.',
          'open-24h': 'Daftar toko dan layanan yang siap melayani Anda kapan saja selama 24 jam penuh.',
          'trending': 'Temukan tempat-tempat yang sedang populer dan banyak dikunjungi saat ini di sekitar Anda.'
        };

        return {
          id: index,
          name: `${index === 0 ? 'Top Rated' : index === 1 ? 'Local' : index === 2 ? 'Quick' : 'Premium'} ${category.name} ${index > 3 ? '#' + (index + 1) : ''}`,
          rating: (4 + Math.random()).toFixed(1),
          reviews: Math.floor(Math.random() * 2000) + 100,
          distance: `${(Math.random() * 5).toFixed(1)} miles`,
          status: Math.random() > 0.2 ? 'Open Now' : 'Closing Soon',
          description: descriptions[category.id] || `Temukan layanan ${category.name.toLowerCase()} terbaik di lokasi ini.`
        };
      });

      setVisibleStores(prev => [...prev, ...newStores]);
      setPage(prev => prev + 1);
      setIsLoading(false);

      if (start + STORES_PER_PAGE >= MAX_STORES) {
        setHasMore(false);
      }
    }, 800);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMoreStores();
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, page, category]);

  const handleShare = (storeId: number, storeName: string) => {
    const shareUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeName)}`;
    const shareText = `Check out ${storeName} on NearMe!`;

    if (navigator.share) {
      navigator.share({
        title: storeName,
        text: shareText,
        url: shareUrl,
      }).catch(console.error);
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopiedStoreId(storeId);
      setTimeout(() => setCopiedStoreId(null), 2000);
    }
  };

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <Link to="/" className="text-blue-600 hover:underline">Return Home</Link>
      </div>
    );
  }

  const dummyStores = [
    { name: `Top Rated ${category.name}`, rating: 4.8, reviews: 1240, distance: '0.5 miles', status: 'Open Now', description: `Nikmati layanan ${category.name.toLowerCase()} terbaik dengan rating tinggi dari pelanggan.` },
    { name: `Local ${category.name} Choice`, rating: 4.5, reviews: 850, distance: '1.2 miles', status: 'Open Now', description: `Pilihan favorit masyarakat lokal untuk kebutuhan ${category.name.toLowerCase()} Anda.` },
    { name: `Quick ${category.name} Spot`, rating: 4.2, reviews: 320, distance: '2.1 miles', status: 'Closing Soon', description: `Lokasi strategis untuk akses ${category.name.toLowerCase()} yang cepat dan mudah.` },
    { name: `Premium ${category.name} Location`, rating: 4.9, reviews: 2100, distance: '3.5 miles', status: 'Open Now', description: `Layanan ${category.name.toLowerCase()} kelas premium dengan fasilitas yang sangat lengkap.` },
  ];

  const getAffiliateLink = (storeName: string, catId: string) => {
    const encodedStore = encodeURIComponent(storeName);
    
    // Food and Grocery categories use the 'order food from' intent
    const foodAndGroceryCats = ['restaurants', 'coffee-shops', 'grocery-stores'];
    
    if (foodAndGroceryCats.includes(catId)) {
      return `https://www.google.com/maps/search/?api=1&query=order+food+from+${encodedStore}`;
    }
    
    // For other categories, we maintain a general Google Maps search link as requested
    return `https://www.google.com/maps/search/?api=1&query=${encodedStore}`;
  };

  const filteredStores = showOnlyOpen 
    ? visibleStores.filter(store => store.status === 'Open Now')
    : visibleStores;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Search
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Best {category.name} Near Me in your placed
        </h1>
        <p className="text-gray-600 leading-relaxed">
          Looking for the closest {category.name.toLowerCase()}? We've compiled a list of the top-rated locations near you. 
          Click the button below to see the full list with real-time traffic and opening hours on Google Maps.
        </p>
      </div>

      <div className="mb-12">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(category.query + ' near me')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <MapPin className="h-5 w-5 mr-2" />
          View All on Google Maps
        </a>
      </div>

      <div className="grid gap-4 mb-12">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900">Featured {category.name} Nearby</h2>
          <button 
            onClick={() => setShowOnlyOpen(!showOnlyOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
              showOnlyOpen 
              ? 'bg-green-600 text-white shadow-lg shadow-green-100' 
              : 'bg-white border border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-600'
            }`}
          >
            <Clock className="h-4 w-4" />
            Open Now
          </button>
        </div>

        {filteredStores.map((store, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h3 className="font-bold text-lg text-gray-900">{store.name}</h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span className="flex items-center text-amber-500 font-bold">
                  <Star className="h-4 w-4 fill-current mr-1" />
                  {store.rating}
                </span>
                <span>({store.reviews} reviews)</span>
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {store.distance}
                </span>
              </div>
              <div className="flex items-center mt-2 text-xs font-semibold text-green-600">
                <Clock className="h-3 w-3 mr-1" />
                {store.status}
              </div>
              
              {/* Category Description */}
              <div className="mt-4 text-sm text-gray-600 border-t border-gray-50 pt-4 italic leading-relaxed">
                {store.description}
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveReviewStore(activeReviewStore === store.name ? null : store.name)}
                className={`p-2 rounded-lg transition-all border flex items-center gap-2 ${
                  activeReviewStore === store.name 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 border-transparent hover:border-blue-100'
                }`}
                title="View reviews"
              >
                <MessageSquare className="h-5 w-5" />
              </button>
              <button 
                onClick={() => handleShare(store.id, store.name)}
                className={`p-2 rounded-lg transition-all border flex items-center gap-2 ${
                  copiedStoreId === store.id 
                  ? 'bg-green-50 text-green-600 border-green-100' 
                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 border-transparent hover:border-blue-100'
                }`}
                title="Share this store"
              >
                <Share2 className="h-5 w-5" />
                {copiedStoreId === store.id && <span className="text-xs font-bold">Copied!</span>}
              </button>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors flex items-center justify-center"
              >
                Directions
              </a>
              <a 
                href={getAffiliateLink(store.name, category.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors text-center border border-blue-100"
              >
                Order Now
              </a>
            </div>
            {activeReviewStore === store.name && (
              <div className="w-full animate-in fade-in zoom-in-95 duration-300">
                <ReviewSection storeId={store.name} storeName={store.name} />
              </div>
            )}
          </div>
        ))}

        {/* Loader Target */}
        <div ref={loaderRef} className="py-8 flex flex-col items-center justify-center gap-4">
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500 font-medium">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              Loading more locations...
            </div>
          )}
          {!isLoading && showOnlyOpen && filteredStores.length === 0 && hasMore && (
            <p className="text-gray-500 text-sm">No open locations found in this batch. Scrolling for more...</p>
          )}
          {!hasMore && (
            <p className="text-gray-400 text-sm italic">
              {filteredStores.length === 0 && showOnlyOpen 
                ? "No open locations found nearby." 
                : "You've reached the end of the list."}
            </p>
          )}
        </div>
      </div>

      {/* SEO Content Section */}
      <section className="prose prose-blue max-w-none text-gray-600 border-t border-gray-100 pt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">How to find the best {category.name.toLowerCase()} near you</h2>
        <p className="mb-4">
          Finding a reliable {category.name.toLowerCase()} doesn't have to be complicated. By using our integrated search tool, 
          you can instantly access Google Maps data which includes user reviews, photos, and current wait times.
        </p>
        <h3 className="text-xl font-bold text-gray-900 mb-2">What to look for:</h3>
        <ul className="list-disc pl-5 mb-6 space-y-2">
          <li><strong>High Ratings:</strong> Look for locations with 4.0 stars or higher.</li>
          <li><strong>Recent Reviews:</strong> Check if people have visited in the last week.</li>
          <li><strong>Distance:</strong> Sort by proximity to save time and fuel.</li>
          <li><strong>Operating Hours:</strong> Ensure they are open before you head out.</li>
        </ul>
      </section>
    </div>
  );
};

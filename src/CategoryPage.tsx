import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ExternalLink, ArrowLeft, Clock, Star, Loader2, Share2, Phone, Globe, MessageSquare, User, Send, Navigation, Facebook, Twitter, MessageCircle, Link as LinkIcon, CloudRain, Sun, Cloud, Thermometer, Wind, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
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
        Ulasan Komuniti
      </h4>

      {/* Review List */}
      <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Belum ada ulasan. Jadilah yang pertama memberi ulasan!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {review.userPhoto ? (
                    <img 
                      src={review.userPhoto} 
                      alt={review.userName} 
                      className="w-6 h-6 rounded-full" 
                      referrerPolicy="no-referrer" 
                      loading="lazy"
                    />
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
          <span className="text-xs font-bold text-gray-500">Rating Anda:</span>
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
            placeholder={user ? "Tulis ulasan..." : "Log masuk untuk menulis ulasan"}
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
            Klik hantar akan meminta anda log masuk dengan Google.
          </p>
        )}
      </form>
    </div>
  );
};

export const CategoryPage = () => {
  const { categoryId } = useParams();
  const category = CATEGORIES.find(c => `${c.id}-near-me` === categoryId || c.id === categoryId);
  const { t } = useTranslation();
  
  const [visibleStores, setVisibleStores] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [showWeatherRecommended, setShowWeatherRecommended] = useState(false);
  const [weather, setWeather] = useState<{ temp: number, condition: string, isRaining: boolean } | null>(null);
  const [sortBy, setSortBy] = useState<'none' | 'distance' | 'rating'>('none');
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

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await response.json();
        const code = data.current_weather.weathercode;
        // WMO Weather interpretation codes (0-99)
        const rainCodes = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99];
        setWeather({
          temp: data.current_weather.temperature,
          condition: code <= 3 ? 'Cerah' : rainCodes.includes(code) ? 'Hujan' : 'Berawan',
          isRaining: rainCodes.includes(code)
        });
      } catch (error) {
        console.error("Error fetching weather:", error);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => fetchWeather(position.coords.latitude, position.coords.longitude),
        () => {
          console.log("Geolocation denied, using default location (KL)");
          fetchWeather(3.139, 101.6869); // Kuala Lumpur coordinates
        }
      );
    } else {
      fetchWeather(3.139, 101.6869); // Fallback for no geolocation support
    }
  }, []);

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
          openingHours: index % 2 === 0 ? 'Isnin-Ahad: 8:00 AM - 10:00 PM' : 'Isnin-Jumaat: 9:00 AM - 6:00 PM',
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

  const handleShare = async (storeId: number, storeName: string) => {
    const shareUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeName)}`;
    const shareText = `Check out ${storeName} on NearMe!`;

    const copyToClipboard = () => {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopiedStoreId(storeId);
      setTimeout(() => setCopiedStoreId(null), 2000);
    };

    if (navigator.share) {
      try {
        await navigator.share({
          title: storeName,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // Silently handle AbortError (user canceled)
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        // For other errors (like NotAllowedError in iframes), fall back to clipboard
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const handleSocialShare = (platform: 'facebook' | 'twitter' | 'whatsapp' | 'copy', storeName: string) => {
    const shareUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeName)}`;
    const shareText = `Check out ${storeName} on NearMe!`;
    
    let url = '';
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        alert('Link copied to clipboard!');
        return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
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

  const weatherFilteredStores = showWeatherRecommended && weather
    ? filteredStores.filter(store => {
        const indoorCategories = ['shopping-malls', 'electronics', 'gadgets', 'clothing', 'entertainment', 'restaurants', 'coffee-shops', 'grocery-stores', 'pharmacies', 'atms', 'hospitals', 'hotels', 'campuses', 'government', 'services'];
        const outdoorCategories = ['parks', 'places-of-worship', 'flowers', 'vegetables', 'fruits', 'building-materials', 'gas-stations', 'car-repair'];
        
        if (weather.isRaining) {
          // If raining, prefer indoor
          return indoorCategories.includes(category.id);
        } else if (weather.temp > 32) {
          // If very hot, prefer indoor (AC)
          return indoorCategories.includes(category.id);
        }
        // If nice weather, everything is fine
        return true;
      })
    : filteredStores;

  const sortedAndFilteredStores = [...weatherFilteredStores].sort((a, b) => {
    if (sortBy === 'distance') {
      const distA = parseFloat(a.distance.split(' ')[0]);
      const distB = parseFloat(b.distance.split(' ')[0]);
      return distA - distB;
    }
    if (sortBy === 'rating') {
      return parseFloat(b.rating) - parseFloat(a.rating);
    }
    return 0;
  });

  const StoreSkeleton = () => (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
      <div className="flex-1">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="flex items-center gap-3 mt-1">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="flex gap-3 mt-3">
          <div className="h-3 bg-gray-100 rounded w-20"></div>
          <div className="h-3 bg-gray-100 rounded w-28"></div>
        </div>
        <div className="mt-4 border-t border-gray-50 pt-4">
          <div className="h-3 bg-gray-50 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-50 rounded w-5/6"></div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-10 w-10 bg-gray-100 rounded-lg"></div>
        <div className="h-10 w-24 bg-gray-100 rounded-lg"></div>
        <div className="h-10 w-24 bg-gray-100 rounded-lg"></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        {t('back_to_search')}
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t(category.id)} Terbaik Berdekatan Anda
        </h1>
        <p className="text-gray-600 leading-relaxed">
          Mencari {category.name.toLowerCase()} yang terdekat? Kami telah menyusun senarai lokasi dengan rating tertinggi berdekatan anda. 
          Klik butang di bawah untuk melihat senarai penuh dengan trafik masa nyata dan waktu operasi di Google Maps.
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
          Lihat Semua di Google Maps
        </a>
      </div>

      <div className="grid gap-4 mb-12">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900">{t(category.id)} Pilihan Berdekatan</h2>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setSortBy(sortBy === 'distance' ? 'none' : 'distance')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                sortBy === 'distance'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600'
              }`}
            >
              <Navigation className="h-4 w-4" />
              {sortBy === 'distance' ? 'Jarak Terdekat' : 'Isih Jarak'}
            </button>
            <button 
              onClick={() => setSortBy(sortBy === 'rating' ? 'none' : 'rating')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                sortBy === 'rating'
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' 
                : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-500 hover:text-amber-500'
              }`}
            >
              <Star className="h-4 w-4" />
              {sortBy === 'rating' ? 'Rating Tertinggi' : 'Isih Rating'}
            </button>
            <button 
              onClick={() => setShowOnlyOpen(!showOnlyOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                showOnlyOpen 
                ? 'bg-green-600 text-white shadow-lg shadow-green-100' 
                : 'bg-white border border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-600'
              }`}
            >
              <Clock className="h-4 w-4" />
              Buka Sekarang
            </button>
            {weather && (
              <button 
                onClick={() => setShowWeatherRecommended(!showWeatherRecommended)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  showWeatherRecommended 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-500 hover:text-indigo-600'
                }`}
              >
                {weather.isRaining ? <CloudRain className="h-4 w-4" /> : weather.temp > 30 ? <Thermometer className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                Sesuai Cuaca ({weather.temp}°C)
              </button>
            )}
          </div>
        </div>

        {/* Weather Recommendation Banner */}
        {showWeatherRecommended && weather && (
          <div 
            className={`mb-6 p-4 rounded-xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
              weather.isRaining 
              ? 'bg-blue-50 border-blue-100 text-blue-800' 
              : weather.temp > 32 
                ? 'bg-orange-50 border-orange-100 text-orange-800'
                : 'bg-green-50 border-green-100 text-green-800'
            }`}
          >
            <div className="p-2 bg-white rounded-lg shadow-sm">
              {weather.isRaining ? <CloudRain className="h-5 w-5 text-blue-600" /> : weather.temp > 32 ? <Thermometer className="h-5 w-5 text-orange-600" /> : <Sun className="h-5 w-5 text-green-600" />}
            </div>
            <div>
              <p className="font-bold text-sm">{t('weather_syor')}</p>
              <p className="text-xs opacity-90 mt-0.5">
                {weather.isRaining 
                  ? t('weather_rain')
                  : weather.temp > 32 
                    ? t('weather_hot', { temp: weather.temp })
                    : t('weather_nice')}
              </p>
            </div>
          </div>
        )}

        {sortedAndFilteredStores.map((store, i) => (
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
              <div className="flex flex-wrap items-center mt-2 gap-3">
                <div className="flex items-center text-xs font-semibold text-green-600">
                  <Clock className="h-3 w-3 mr-1" />
                  {store.status}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1 text-gray-400" />
                  {store.openingHours}
                </div>
              </div>

              {/* Category Description */}
              <div className="mt-4 text-sm text-gray-600 border-t border-gray-50 pt-4 italic leading-relaxed">
                {store.description}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
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
              
              {/* Social Share Buttons */}
              <div className="flex gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100">
                <button 
                  onClick={() => handleSocialShare('facebook', store.name)}
                  className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                  title="Share on Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleSocialShare('twitter', store.name)}
                  className="p-1.5 text-sky-500 hover:bg-sky-100 rounded-md transition-colors"
                  title="Share on Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleSocialShare('whatsapp', store.name)}
                  className="p-1.5 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                  title="Share on WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleSocialShare('copy', store.name)}
                  className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors"
                  title="Copy Link"
                >
                  <LinkIcon className="h-4 w-4" />
                </button>
              </div>

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

        {/* Skeleton Loaders during initial or infinite load */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <StoreSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        )}

        {/* Loader Target */}
        <div ref={loaderRef} className="py-12 flex flex-col items-center justify-center gap-4">
          {!isLoading && showOnlyOpen && filteredStores.length === 0 && hasMore && (
            <div className="text-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 w-full">
              <Clock className="h-8 w-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Tiada lokasi yang dibuka ditemui dalam kumpulan ini.</p>
              <p className="text-xs text-gray-400 mt-1">Tatal ke bawah untuk mencari lebih banyak lokasi.</p>
            </div>
          )}
          
          {!hasMore && (
            <div className="text-center p-8 w-full">
              <div className="inline-flex p-3 bg-gray-50 rounded-full mb-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-gray-900 font-bold">{t('end_of_list')}</p>
              <p className="text-gray-500 text-sm mt-1">
                {filteredStores.length === 0 && showOnlyOpen 
                  ? "Tiada lokasi yang dibuka ditemui berdekatan anda buat masa ini." 
                  : `Kami telah memaparkan semua ${t(category.id).toLowerCase()} terbaik di kawasan anda.`}
              </p>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="mt-6 text-blue-600 font-bold text-sm hover:underline"
              >
                {t('back_to_top')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SEO Content Section */}
      <section className="prose prose-blue max-w-none text-gray-600 border-t border-gray-100 pt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Bagaimana untuk mencari {category.name.toLowerCase()} terbaik berdekatan anda</h2>
        <p className="mb-4">
          Mencari {category.name.toLowerCase()} yang boleh dipercayai tidak semestinya rumit. Dengan menggunakan alat carian bersepadu kami, 
          anda boleh mengakses data Google Maps secara instan yang merangkumi ulasan pengguna, foto, dan masa menunggu semasa.
        </p>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Apa yang perlu diperhatikan:</h3>
        <ul className="list-disc pl-5 mb-6 space-y-2">
          <li><strong>Rating Tinggi:</strong> Cari lokasi dengan 4.0 bintang atau lebih tinggi.</li>
          <li><strong>Ulasan Terbaru:</strong> Semak jika orang telah melawat dalam minggu lepas.</li>
          <li><strong>Jarak:</strong> Isih mengikut kedekatan untuk menjimatkan masa dan bahan bakar.</li>
          <li><strong>Waktu Operasi:</strong> Pastikan mereka dibuka sebelum anda keluar.</li>
        </ul>
      </section>
    </div>
  );
};

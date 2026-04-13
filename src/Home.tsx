import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Navigation, Locate, Loader2, ExternalLink, Users, CheckCircle, TrendingUp, HelpCircle, Mail, Star, Quote } from 'lucide-react';
import { CATEGORIES, POPULAR_SEARCHES, CITIES, BLOG_POSTS } from './constants';

export const Home = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [detectedCity, setDetectedCity] = React.useState<string | null>(null);
  const [isDetecting, setIsDetecting] = React.useState(false);
  const navigate = useNavigate();

  const detectLocation = () => {
    setIsDetecting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=id`);
          const data = await response.json();
          const city = data.city || data.locality || data.principalSubdivision;
          if (city) {
            setDetectedCity(city);
          }
        } catch (error) {
          console.error("Error detecting location:", error);
        } finally {
          setIsDetecting(false);
        }
      }, (error) => {
        console.error("Geolocation error:", error);
        setIsDetecting(false);
      });
    } else {
      setIsDetecting(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`, '_blank');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
          Cari Kedai Berdekatan Anda Dalam Beberapa Saat
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Cari perniagaan berdekatan dan dapatkan arah dengan pantas.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-12">
          <div className="relative flex items-center">
            <Search className="absolute left-4 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Cari kedai atau kategori..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent google-shadow"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute right-2 bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors"
            >
              Cari
            </button>
          </div>
        </form>

        {/* Quick Categories */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-16">
          {CATEGORIES.map((cat) => (
            <Link 
              key={cat.id} 
              to={`/${cat.id}-near-me`}
              className="category-card"
            >
              <div className={`p-3 rounded-full ${cat.color} mb-3`}>
                <cat.icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-gray-700">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="mb-16 grid grid-cols-2 md:grid-cols-4 gap-6 lazy-section">
        {[
          { icon: MapPin, label: 'Lokasi', value: '10,000+', color: 'text-blue-600' },
          { icon: Users, label: 'Pengguna Aktif', value: '500k+', color: 'text-green-600' },
          { icon: Star, label: 'Ulasan', value: '1M+', color: 'text-amber-500' },
          { icon: TrendingUp, label: 'Kategori', value: '50+', color: 'text-purple-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className={`inline-flex p-3 rounded-xl bg-gray-50 ${stat.color} mb-3`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Popular Searches */}
      <section className="mb-16 lazy-section">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Navigation className="h-6 w-6 text-blue-600" />
          Carian Popular Berdekatan Anda
        </h2>
        <div className="flex flex-wrap gap-3">
          {POPULAR_SEARCHES.map((search) => (
            <a
              key={search}
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(search)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-500 transition-all"
            >
              {search}
            </a>
          ))}
        </div>
      </section>

      {/* City Links */}
      <section className="mb-16 bg-blue-50 rounded-2xl p-8 lazy-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            {detectedCity ? `Lihat di ${detectedCity}` : 'Lihat Kawasan Berdekatan'}
          </h2>
          <button 
            onClick={detectLocation}
            disabled={isDetecting}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-full text-sm font-bold hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50 shadow-sm"
          >
            {isDetecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Locate className="h-4 w-4" />
            )}
            {detectedCity ? 'Kemas Kini Lokasi' : 'Kesan Bandar Saya'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {detectedCity ? (
            <>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Restaurants in ${detectedCity}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium flex items-center gap-1"
              >
                Restaurants in {detectedCity}
                <ExternalLink className="h-3 w-3" />
              </a>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Gas Stations in ${detectedCity}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium flex items-center gap-1"
              >
                Gas Stations in {detectedCity}
                <ExternalLink className="h-3 w-3" />
              </a>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Pharmacies in ${detectedCity}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium flex items-center gap-1"
              >
                Pharmacies in {detectedCity}
                <ExternalLink className="h-3 w-3" />
              </a>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Grocery Stores in ${detectedCity}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium flex items-center gap-1"
              >
                Groceries in {detectedCity}
                <ExternalLink className="h-3 w-3" />
              </a>
            </>
          ) : (
            CITIES.map((city) => (
              <a
                key={city}
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Best places in ${city}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium flex items-center gap-1"
              >
                {city}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))
          )}
        </div>
        
        {detectedCity && (
          <div className="mt-6 pt-6 border-t border-blue-100">
            <p className="text-sm text-gray-500 italic">
              Showing areas relevant to your current location in <strong>{detectedCity}</strong>.
            </p>
          </div>
        )}
      </section>

      {/* Blog Teaser */}
      <section className="mb-16 lazy-section">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Terbaru dari Blog Kami</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {BLOG_POSTS.map((post) => (
            <div key={post.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{post.date}</span>
              <h3 className="text-lg font-bold mt-2 mb-3 leading-tight">{post.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{post.excerpt}</p>
              <a 
                href={post.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm font-bold text-gray-900 hover:text-blue-600 flex items-center gap-1"
              >
                Baca Lagi →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mb-16 lazy-section">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Apa Kata Pengguna Kami</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Ahmad Zaki', role: 'Pelancong', text: 'Sangat membantu bila saya berada di bandar yang saya tak biasa. Cari stesen minyak jadi senang!' },
            { name: 'Siti Nurhaliza', role: 'Suri Rumah', text: 'Saya selalu guna untuk cari kedai runcit yang buka 24 jam. Interface sangat bersih dan laju.' },
            { name: 'Jason Lee', role: 'Pemandu Grab', text: 'Aplikasi wajib untuk kerja harian saya. Senang nak cari bengkel kereta yang terdekat.' },
          ].map((t, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative">
              <Quote className="absolute top-4 right-4 h-8 w-8 text-blue-50 opacity-50" />
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />)}
              </div>
              <p className="text-gray-600 mb-6 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-16 bg-gray-50 rounded-3xl p-8 md:p-12 lazy-section">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center gap-2">
            <HelpCircle className="h-6 w-6 text-blue-600" />
            Soalan Lazim (FAQ)
          </h2>
          <div className="space-y-4">
            {[
              { q: 'Adakah NearMe percuma untuk digunakan?', a: 'Ya, NearMe adalah 100% percuma untuk semua pengguna mencari lokasi dan perniagaan.' },
              { q: 'Bagaimana NearMe mendapatkan data lokasi?', a: 'Kami menggunakan API Google Maps yang sentiasa dikemaskini untuk memastikan ketepatan maklumat.' },
              { q: 'Bolehkah saya menambah perniagaan saya di sini?', a: 'Buat masa ini kami memaparkan perniagaan yang telah didaftarkan di Google Business Profile.' },
              { q: 'Adakah aplikasi ini tersedia di telefon pintar?', a: 'NearMe adalah aplikasi web responsif yang boleh diakses dengan lancar melalui pelayar web di telefon anda.' },
            ].map((faq, i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="mb-16 bg-blue-600 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-blue-500 rounded-full opacity-50"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-blue-700 rounded-full opacity-50"></div>
        
        <div className="relative z-10 max-w-xl mx-auto">
          <Mail className="h-12 w-12 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-4 text-white">Jangan Terlepas Update!</h2>
          <p className="text-blue-100 mb-8">
            Langgan surat berita kami untuk mendapatkan tips carian tempatan dan tawaran eksklusif dari perniagaan berdekatan anda.
          </p>
          <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Alamat emel anda" 
              className="flex-grow px-6 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
            />
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg">
              Langgan Sekarang
            </button>
          </form>
          <p className="text-xs text-blue-200 mt-4">Kami menghormati privasi anda. Boleh berhenti langganan bila-bila masa.</p>
        </div>
      </section>

      {/* Ad Placeholder */}
      <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200">
        Advertisement Placement
      </div>
    </div>
  );
};

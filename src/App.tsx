import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Search, MapPin, Info, Shield, FileText, Menu, X, Facebook, Twitter, Instagram, Bot, Loader2 } from 'lucide-react';

// Lazy load components
const Home = lazy(() => import('./Home').then(module => ({ default: module.Home })));
const CategoryPage = lazy(() => import('./CategoryPage').then(module => ({ default: module.CategoryPage })));
const ContactPage = lazy(() => import('./ContactPage').then(module => ({ default: module.ContactPage })));
const ChatBot = lazy(() => import('./components/ChatBot').then(module => ({ default: module.ChatBot })));
import { BLOG_POSTS } from './constants';

// Layout Component
const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">NearMe</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-blue-600">Utama</Link>
            <Link to="/about" className="text-sm font-medium text-gray-600 hover:text-blue-600">Tentang Kami</Link>
            <Link to="/blog" className="text-sm font-medium text-gray-600 hover:text-blue-600">Blog</Link>
            <Link to="/contact" className="text-sm font-medium text-gray-600 hover:text-blue-600">Hubungi</Link>
          </nav>

          <div className="hidden md:block">
            <a 
              href="https://www.google.com/maps" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors"
            >
              Buka Peta
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-gray-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 py-4 px-4 flex flex-col gap-4">
            <Link to="/" className="text-lg font-medium text-gray-900">Utama</Link>
            <Link to="/about" className="text-lg font-medium text-gray-900">Tentang Kami</Link>
            <Link to="/blog" className="text-lg font-medium text-gray-900">Blog</Link>
            <Link to="/contact" className="text-lg font-medium text-gray-900">Hubungi Kami</Link>
            <button 
              onClick={() => {
                setIsMenuOpen(false);
                window.dispatchEvent(new CustomEvent('open-chatbot'));
              }}
              className="text-lg font-medium text-blue-600 flex items-center gap-2"
            >
              <Bot className="h-5 w-5" />
              Asisten AI
            </button>
            <a 
              href="https://www.google.com/maps" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-5 py-3 rounded-xl text-center font-bold"
            >
              Buka Google Maps
            </a>
          </div>
        )}
      </header>

      <main className="flex-grow">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        }>
          {children}
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Pautan Pantas</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/restaurants-near-me" className="hover:text-blue-600">Restoran Berdekatan</Link></li>
                <li><Link to="/gas-stations-near-me" className="hover:text-blue-600">SPBU Berdekatan</Link></li>
                <li><Link to="/pharmacies-near-me" className="hover:text-blue-600">Farmasi Berdekatan</Link></li>
                <li><Link to="/grocery-stores-near-me" className="hover:text-blue-600">Kedai Runcit Berdekatan</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Syarikat</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/about" className="hover:text-blue-600">Tentang Kami</Link></li>
                <li><Link to="/blog" className="hover:text-blue-600">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-blue-600">Hubungi Kami</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/privacy" className="hover:text-blue-600">Dasar Privasi</Link></li>
                <li><Link to="/terms" className="hover:text-blue-600">Syarat Perkhidmatan</Link></li>
                <li><Link to="/disclaimer" className="hover:text-blue-600">Penafian</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Hubungi</h3>
              <p className="text-sm text-gray-500 mb-4">Membantu jutaan orang mencari apa yang mereka perlukan dengan lebih pantas.</p>
              <div className="flex gap-4">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all shadow-sm"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all shadow-sm"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
            <p>© 2026 NearMe. Partner of infokedai.com | Tidak bergabung dengan Google LLC. Semua tanda dagangan adalah milik pemilik masing-masing.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Simple Page Components
const About = () => (
  <div className="max-w-3xl mx-auto px-4 py-16">
    <h1 className="text-4xl font-bold mb-8">Tentang NearMe</h1>
    <p className="text-lg text-gray-600 mb-6">
      NearMe diasaskan dengan misi mudah: untuk membantu orang ramai mencari apa yang mereka perlukan dengan serta-merta. 
      Sama ada anda sedang mencari stesen minyak terdekat dalam perjalanan jalan raya atau farmasi bertaraf tinggi di bandar baharu, 
      kami menyediakan laluan terpantas ke maklumat yang anda perlukan.
    </p>
    <p className="text-lg text-gray-600">
      Platform kami memanfaatkan teknologi Google Maps untuk memastikan ketepatan dan kemas kini masa nyata, 
      manakala kategori kami yang disusun membantu anda melangkau kebisingan dan terus ke pilihan tempatan yang terbaik.
    </p>
  </div>
);

const Blog = () => (
  <div className="max-w-4xl mx-auto px-4 py-16">
    <h1 className="text-4xl font-bold mb-12 text-center">Wawasan Carian Tempatan</h1>
    <div className="grid gap-12">
      {BLOG_POSTS.map(post => (
        <article key={post.id} className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-64 h-48 bg-gray-200 rounded-2xl flex-shrink-0 flex items-center justify-center text-gray-400">
            <FileText className="h-12 w-12" />
          </div>
          <div>
            <span className="text-blue-600 font-bold text-sm uppercase">Panduan & Tips • {post.date}</span>
            <h2 className="text-2xl font-bold mt-2 mb-4 hover:text-blue-600 cursor-pointer">
              {post.title}
            </h2>
            <p className="text-gray-600 mb-4">
              {post.excerpt}
            </p>
            <a 
              href={post.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-bold text-gray-900 border-b-2 border-blue-600 pb-1"
            >
              Baca Artikel
            </a>
          </div>
        </article>
      ))}
    </div>
  </div>
);

const LegalPage = ({ title, content }: { title: string, content: string }) => (
  <div className="max-w-3xl mx-auto px-4 py-16">
    <h1 className="text-3xl font-bold mb-8">{title}</h1>
    <div className="prose prose-gray max-w-none text-gray-600 whitespace-pre-line">
      {content}
    </div>
  </div>
);

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:categoryId" element={<CategoryPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<LegalPage title="Dasar Privasi" content="Privasi anda adalah penting bagi kami. Dasar ini menerangkan cara kami mengumpul dan menggunakan data anda..." />} />
          <Route path="/terms" element={<LegalPage title="Syarat Perkhidmatan" content="Dengan menggunakan NearMe, anda bersetuju dengan syarat berikut..." />} />
          <Route path="/disclaimer" element={<LegalPage title="Penafian" content="NearMe ialah alat carian bebas. Kami tidak bergabung dengan, disokong oleh, atau disambungkan kepada Google LLC atau Google Maps. Semua hasil carian disediakan untuk tujuan maklumat sahaja." />} />
          <Route path="*" element={<div className="py-20 text-center">Halaman tidak ditemui. <Link to="/" className="text-blue-600">Kembali ke Utama</Link></div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

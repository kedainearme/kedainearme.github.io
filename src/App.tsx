import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Search, MapPin, Info, Shield, FileText, Menu, X } from 'lucide-react';
import { Home } from './Home';
import { CategoryPage } from './CategoryPage';

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
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-blue-600">Home</Link>
            <Link to="/about" className="text-sm font-medium text-gray-600 hover:text-blue-600">About</Link>
            <Link to="/blog" className="text-sm font-medium text-gray-600 hover:text-blue-600">Blog</Link>
          </nav>

          <div className="hidden md:block">
            <a 
              href="https://www.google.com/maps" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors"
            >
              Open Maps
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
            <Link to="/" className="text-lg font-medium text-gray-900">Home</Link>
            <Link to="/about" className="text-lg font-medium text-gray-900">About</Link>
            <Link to="/blog" className="text-lg font-medium text-gray-900">Blog</Link>
            <a 
              href="https://www.google.com/maps" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-5 py-3 rounded-xl text-center font-bold"
            >
              Open Google Maps
            </a>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/restaurants-near-me" className="hover:text-blue-600">Restaurants Near Me</Link></li>
                <li><Link to="/gas-stations-near-me" className="hover:text-blue-600">Gas Stations Near Me</Link></li>
                <li><Link to="/pharmacies-near-me" className="hover:text-blue-600">Pharmacies Near Me</Link></li>
                <li><Link to="/grocery-stores-near-me" className="hover:text-blue-600">Grocery Stores Near Me</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/about" className="hover:text-blue-600">About Us</Link></li>
                <li><Link to="/blog" className="hover:text-blue-600">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-blue-600">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
                <li><Link to="/disclaimer" className="hover:text-blue-600">Disclaimer</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Connect</h3>
              <p className="text-sm text-gray-500 mb-4">Helping millions find what they need, faster.</p>
              <div className="flex gap-4">
                {/* Social placeholders */}
                <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
            <p>© 2023 NearMe. Not affiliated with Google LLC. All trademarks belong to their respective owners.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Simple Page Components
const About = () => (
  <div className="max-w-3xl mx-auto px-4 py-16">
    <h1 className="text-4xl font-bold mb-8">About NearMe</h1>
    <p className="text-lg text-gray-600 mb-6">
      NearMe was founded with a simple mission: to help people find what they need instantly. 
      Whether you're looking for the closest gas station on a road trip or a top-rated pharmacy in a new city, 
      we provide the fastest route to the information you need.
    </p>
    <p className="text-lg text-gray-600">
      Our platform leverages Google Maps technology to ensure accuracy and real-time updates, 
      while our curated categories help you skip the noise and get straight to the best local options.
    </p>
  </div>
);

const Blog = () => (
  <div className="max-w-4xl mx-auto px-4 py-16">
    <h1 className="text-4xl font-bold mb-12 text-center">Local Search Insights</h1>
    <div className="grid gap-12">
      {[1, 2, 3, 4, 5].map(i => (
        <article key={i} className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-64 h-48 bg-gray-200 rounded-2xl flex-shrink-0"></div>
          <div>
            <span className="text-blue-600 font-bold text-sm uppercase">Guides & Tips</span>
            <h2 className="text-2xl font-bold mt-2 mb-4 hover:text-blue-600 cursor-pointer">
              {i % 2 === 0 ? "How to save on gas using local search apps" : "The ultimate guide to finding 24-hour services near you"}
            </h2>
            <p className="text-gray-600 mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <button className="font-bold text-gray-900 border-b-2 border-blue-600 pb-1">Read Article</button>
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
          <Route path="/privacy" element={<LegalPage title="Privacy Policy" content="Your privacy is important to us. This policy explains how we collect and use your data... (Standard Privacy Policy Content)" />} />
          <Route path="/terms" element={<LegalPage title="Terms of Service" content="By using NearMe, you agree to the following terms... (Standard Terms Content)" />} />
          <Route path="/disclaimer" element={<LegalPage title="Disclaimer" content="NearMe is an independent search tool. We are not affiliated with, endorsed by, or connected to Google LLC or Google Maps. All search results are provided for informational purposes only." />} />
          <Route path="*" element={<div className="py-20 text-center">Page not found. <Link to="/" className="text-blue-600">Go Home</Link></div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

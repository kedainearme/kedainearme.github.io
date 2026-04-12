import { 
  Utensils, 
  Fuel, 
  PlusSquare, 
  ShoppingCart, 
  CreditCard, 
  Coffee, 
  Car, 
  ShoppingBag, 
  Stethoscope, 
  Briefcase,
  GraduationCap,
  Church,
  Trees,
  Headset,
  Monitor,
  Smartphone,
  Shirt,
  Ticket,
  Landmark,
  Flower2,
  Leaf,
  Apple,
  Hammer,
  Box,
  Timer,
  TrendingUp
} from 'lucide-react';

export const CATEGORIES = [
  { id: 'restaurants', name: 'Restaurants', icon: Utensils, query: 'restaurants', color: 'bg-red-50 text-red-600' },
  { id: 'gas-stations', name: 'Gas Stations', icon: Fuel, query: 'gas stations', color: 'bg-blue-50 text-blue-600' },
  { id: 'pharmacies', name: 'Pharmacies', icon: PlusSquare, query: 'pharmacy', color: 'bg-green-50 text-green-600' },
  { id: 'grocery-stores', name: 'Grocery Stores', icon: ShoppingCart, query: 'grocery stores', color: 'bg-orange-50 text-orange-600' },
  { id: 'atms', name: 'ATMs', icon: CreditCard, query: 'atms', color: 'bg-indigo-50 text-indigo-600' },
  { id: 'coffee-shops', name: 'Coffee Shops', icon: Coffee, query: 'coffee shops', color: 'bg-amber-50 text-amber-600' },
  { id: 'car-repair', name: 'Car Repair', icon: Car, query: 'car repair', color: 'bg-slate-50 text-slate-600' },
  { id: 'shopping-malls', name: 'Malls', icon: ShoppingBag, query: 'shopping malls', color: 'bg-pink-50 text-pink-600' },
  { id: 'hospitals', name: 'Hospitals', icon: Stethoscope, query: 'hospitals', color: 'bg-rose-50 text-rose-600' },
  { id: 'hotels', name: 'Hotels', icon: Briefcase, query: 'hotels', color: 'bg-cyan-50 text-cyan-600' },
  { id: 'campuses', name: 'Campuses', icon: GraduationCap, query: 'university campus', color: 'bg-emerald-50 text-emerald-600' },
  { id: 'places-of-worship', name: 'Worship', icon: Church, query: 'place of worship', color: 'bg-purple-50 text-purple-600' },
  { id: 'parks', name: 'Parks', icon: Trees, query: 'parks', color: 'bg-lime-50 text-lime-600' },
  { id: 'services', name: 'Services', icon: Headset, query: 'service center', color: 'bg-blue-50 text-blue-700' },
  { id: 'electronics', name: 'Electronics', icon: Monitor, query: 'electronics store', color: 'bg-zinc-50 text-zinc-700' },
  { id: 'gadgets', name: 'Gadgets', icon: Smartphone, query: 'gadget store', color: 'bg-indigo-50 text-indigo-700' },
  { id: 'clothing', name: 'Clothing', icon: Shirt, query: 'clothing store', color: 'bg-orange-50 text-orange-700' },
  { id: 'entertainment', name: 'Entertainment', icon: Ticket, query: 'entertainment', color: 'bg-yellow-50 text-yellow-700' },
  { id: 'government', name: 'Government', icon: Landmark, query: 'government office', color: 'bg-slate-100 text-slate-800' },
  { id: 'flowers', name: 'Flowers', icon: Flower2, query: 'flower shop', color: 'bg-pink-50 text-pink-600' },
  { id: 'vegetables', name: 'Vegetables', icon: Leaf, query: 'vegetable market', color: 'bg-green-50 text-green-700' },
  { id: 'fruits', name: 'Fruits', icon: Apple, query: 'fruit shop', color: 'bg-red-50 text-red-500' },
  { id: 'building-materials', name: 'Materials', icon: Hammer, query: 'building materials store', color: 'bg-orange-50 text-orange-800' },
  { id: 'plastic-stores', name: 'Plastic', icon: Box, query: 'plastic store', color: 'bg-gray-50 text-gray-600' },
  { id: 'open-24h', name: '24 Hours', icon: Timer, query: 'open 24 hours', color: 'bg-red-50 text-red-700' },
  { id: 'trending', name: 'Trending', icon: TrendingUp, query: 'trending', color: 'bg-blue-50 text-blue-800' },
];

export const POPULAR_SEARCHES = [
  "Walmart near me",
  "CVS pharmacy near me",
  "Starbucks near me",
  "McDonald's near me",
  "Costco near me",
  "Walgreens near me",
  "Target near me",
  "Shell gas station near me"
];

export const CITIES = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego"
];

export const BLOG_POSTS = [
  {
    id: 1,
    title: "How to Find the Closest Gas Station Fast",
    excerpt: "Running low on fuel? Here are the quickest ways to find a gas station using your mobile device.",
    date: "Oct 12, 2023"
  },
  {
    id: 2,
    title: "Best Ways to Use Google Maps for Local Search",
    excerpt: "Master the art of local search with these hidden Google Maps features you probably didn't know about.",
    date: "Nov 05, 2023"
  },
  {
    id: 3,
    title: "Top Apps for Finding Stores Near You",
    excerpt: "Beyond Google Maps, these apps help you find the best deals and closest locations for your daily needs.",
    date: "Dec 20, 2023"
  }
];

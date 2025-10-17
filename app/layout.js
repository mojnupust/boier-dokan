import { Inter } from "next/font/google";
import Link from 'next/link';
import { getCurrentUserData } from "../src/lib/data";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
export const dynamic = 'force-dynamic';

export const metadata = { /* ... অপরিবর্তিত ... */ };

function LogoutButton() { /* ... অপরিবর্তিত ... */ }

function ShopCtaButton({ userShop, isAdmin }) {
  if (isAdmin) {
    return <span className="px-4 py-2 bg-purple-700 text-white rounded-md text-sm font-medium">অ্যাডমিন মোড</span>;
  }
  if (!userShop) {
    return <Link href="/shop/create" className="px-4 py-2 rounded-md bg-green-600 text-white">নিজের দোকান খুলুন</Link>;
  }
  return <Link href={`/shop/${userShop.slug}`} className="px-4 py-2 rounded-md bg-indigo-600 text-white">আমার দোকান</Link>;
}

export default async function RootLayout({ children }) {
  const { user, profile, shop } = await getCurrentUserData();
  const isAdmin = profile?.role === 'admin';

  return (
    <html lang="bn">
      <body className={inter.className}>
        <nav className="bg-white shadow-md sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <Link href="/" className="text-2xl font-bold text-gray-800">Boi Collector .com</Link>
              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                    <ShopCtaButton userShop={shop} isAdmin={isAdmin} />
                    <LogoutButton />
                  </>
                ) : (
                  <Link href="/login" className="px-4 py-2 rounded-md bg-blue-600 text-white">লগইন / রেজিস্টার</Link>
                )}
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
import { Inter } from "next/font/google";
import Link from 'next/link';
import { getUserShop } from "../src/lib/data"; // নতুন ইম্পোর্ট
import { createClient } from "../src/lib/supabase/server";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Boi Collector .com",
  description: "Boi Collector .com আপনার নিজের বইয়ের দোকান তৈরি করুন এবং শেয়ার করুন",
};

function LogoutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button type="submit" className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors">
        লগ আউট
      </button>
    </form>
  );
}

// একটি নতুন কম্পোনেন্ট যা দোকানের অবস্থা বুঝে বাটন দেখাবে
function ShopCtaButton({ userShop }) {
  if (!userShop) {
    return (
      <Link href="/shop/create" className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors">
        নিজের দোকান খুলুন
      </Link>
    );
  }
  return (
    <Link href={`/shop/${userShop.slug}`} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
      আমার দোকান
    </Link>
  );
}

export default async function RootLayout({ children }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userShop = await getUserShop(); // ব্যবহারকারীর দোকান আছে কি না চেক করা হচ্ছে

  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-white shadow-md sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <Link href="/" className="text-2xl font-bold text-gray-800">
                Boi Collector .com
              </Link>
              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                    <ShopCtaButton userShop={userShop} />
                    <LogoutButton />
                  </>
                ) : (
                  <Link href="/login" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                    লগইন / রেজিস্টার
                  </Link>
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
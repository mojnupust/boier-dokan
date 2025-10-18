import Link from "next/link";
import ShopList from "../src/components/ShopList";
import { getAllCategories, getAllShop, getCurrentUserData, getOfficialBooksGroupedByCategory } from "../src/lib/data";
import BookCard from "./shop/[slug]/BookCard";
// নতুন সার্ভার অ্যাকশনটি ইম্পোর্ট করা হচ্ছে
import { createOfficialShop } from "../src/lib/actions";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [{ user, profile }, booksData, categories, shops] = await Promise.all([
    getCurrentUserData(),
    getOfficialBooksGroupedByCategory(),
    getAllCategories(),
    getAllShop()
  ]);

  const isAdmin = profile?.role === 'admin';
  // `booksData` থেকে shop অবজেক্টটি এখন `officialShop` নামে নেওয়া হচ্ছে
  const { booksByCategory, shop: officialShop } = booksData;
  const hasBooks = Object.keys(booksByCategory).length > 0;

  // --- অ্যাডমিনের জন্য বিশেষ লজিক ---
  if (isAdmin && !officialShop) {
    return (
      <div className="container mx-auto text-center py-20">
        <h1 className="text-3xl font-bold">অ্যাডমিন সেটআপ</h1>
        <p className="text-lg text-gray-600 mt-2">সিস্টেমের জন্য কোনো &ldquo;Official Shop&rdquo; পাওয়া যায়নি।</p>
        <p className="mt-1">শুরু করার জন্য অনুগ্রহ করে অফিসিয়াল শপ তৈরি করুন।</p>
        <form action={createOfficialShop} className="mt-8">
          <button type="submit" className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105">
            Create Official Shop
          </button>
        </form>
      </div>
    );
  }
  // --- অ্যাডমিন লজিক শেষ ---


  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-800">
          {isAdmin && 'অ্যাডমিন কন্ট্রোল প্যানেল'}
        </h1>
        <p className="text-lg text-gray-500 mt-2">
          {isAdmin ? 'এখান থেকে অফিসিয়াল দোকানের বই ম্যানেজ করুন' : <div className="max-w-3xl mx-auto">
            <p className="text-xl text-gray-600">
              জনপ্রিয় বইয়ের দোকানগুলো থেকে বাছাই করা সেরা বইয়ের সংগ্রহ।
            </p>
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500 font-medium">অথবা</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <p className="text-lg text-gray-600">
              একাউন্ট খুলে নিজের প্রিয় বইগুলো সংগ্রহ করুন এবং আপনার দোকানের লিংক শেয়ার করে এফিলিয়েট মার্কেটিং করুন।
            </p>
          </div>}
        </p>
      </header>

      {isAdmin && officialShop && (
        <div className="text-center mb-12">
          <Link
            href={{
              pathname: `/shop/${officialShop.slug}/add-book`,
              query: { shopId: officialShop.id, categories: JSON.stringify(categories) }
            }}
            className="mt-8 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700"
          >
            + নতুন বই যোগ করুন
          </Link>
        </div>
      )}

      {!isAdmin &&
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-800 mb-10 relative pb-2">
            Our Trusted Partners
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-blue-500 rounded-full"></span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {shops?.map((shop) => <ShopList key={shop.id} shop={shop} />)}
          </div>
        </div>


      }

      {!hasBooks ? (
        <div className="text-center text-gray-500 py-16">
          <p>এডমিন কোনো বই যোগ করেননি।</p>
        </div>
      ) : (
        <div className="space-y-16">
          {Object.entries(booksByCategory).map(([category, books]) => (
            <section key={category}>
              <h2 className="text-3xl font-bold border-b-2 pb-3 mb-8">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    isOwner={isAdmin}
                    shopSlug={officialShop?.slug || ''}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

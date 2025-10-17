import Link from "next/link";
import { getAllCategories, getCurrentUserData, getOfficialBooksGroupedByCategory } from "../src/lib/data";
import BookCard from "./shop/[slug]/BookCard";
// নতুন সার্ভার অ্যাকশনটি ইম্পোর্ট করা হচ্ছে
import { createOfficialShop } from "../src/lib/actions";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [{ user, profile }, booksData, categories] = await Promise.all([
    getCurrentUserData(),
    getOfficialBooksGroupedByCategory(),
    getAllCategories()
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
          {isAdmin ? 'অ্যাডমিন কন্ট্রোল প্যানেল' : 'সর্বশেষ প্রকাশিত বই'}
        </h1>
        <p className="text-lg text-gray-500 mt-2">
          {isAdmin ? 'এখান থেকে অফিসিয়াল দোকানের বই ম্যানেজ করুন' : 'জনপ্রিয় বইয়ের দোকানগুলো থেকে বাছাই করা সেরা বইয়ের সংগ্রহ'}
        </p>
      </header>

      {isAdmin && officialShop && (
        <div className="text-center mb-12">
          <Link
            href={{
              pathname: `/shop/${officialShop.slug}/add-book`,
              query: { shopId: officialShop.id, categories: JSON.stringify(categories) }
            }}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700"
          >
            + নতুন বই যোগ করুন
          </Link>
        </div>
      )}

      {!hasBooks ? (
        <div className="text-center text-gray-500 py-16">
          <p>এখনো কোনো বই যোগ করা হয়নি।</p>
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
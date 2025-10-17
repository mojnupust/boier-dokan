import Image from "next/image";
import { getOfficialBooksGroupedByCategory } from "../src/lib/data";

// পেজ কম্পোনেন্টকে async করা হয়েছে যাতে আমরা সার্ভারে ডেটা fetch করতে পারি।
export default async function HomePage() {
  // সার্ভার কম্পোনেন্টে সরাসরি ডেটা ফেচিং ফাংশন কল করা হচ্ছে।
  const categoriesWithBooks = await getOfficialBooksGroupedByCategory();

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800">Boi Collector .com</h1>
        <p className="text-lg text-gray-600 mt-2">আপনার পছন্দের বই খুঁজে নিন সেরা সংগ্রহ থেকে</p>
      </header>

      {/* যদি কোনো বই না থাকে বা ক্যাটাগরি না পাওয়া যায় */}
      {categoriesWithBooks.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>এখনো কোনো বই যোগ করা হয়নি।</p>
        </div>
      ) : (
        // ক্যাটাগরি অনুযায়ী বই প্রদর্শনের সেকশন
        <div className="space-y-12">
          {categoriesWithBooks.map((category) => (
            <section key={category.id}>
              <h2 className="text-2xl font-semibold border-b-2 border-gray-200 pb-2 mb-6">
                {category.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {category.books.map((book) => (
                  <div key={book.id} className="card bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                    <div className="relative h-56">
                      {/* এখানে আমরা একটি প্লেসহোল্ডার ইমেজ ব্যবহার করছি। 
                           প্রজেক্টে আমরা next/image ব্যবহার করব */}
                      <Image
                        src={book.image_url || 'https://via.placeholder.com/300x400.png?text=Boier+Dokan'}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        width={300}
                        height={400}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg truncate">{book.title}</h3>
                      <p className="text-gray-600 text-sm mt-1 h-10 overflow-hidden">
                        {book.short_description}
                      </p>
                      <a
                        href={book.affiliate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 w-full inline-block text-center bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Buy Now {book.price ? `(৳${book.price})` : ''}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
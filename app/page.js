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

      {/* হেডারের পরে একটি eye‑catchy, animated CTA সেকশন */}
      <div className="mx-auto mb-12 max-w-4xl px-2">
        <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 shadow-[0_10px_30px_-10px_rgba(37,99,235,0.35)]">
          {/* subtle animated glow background */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-tr from-blue-400/30 to-indigo-400/20 blur-3xl animate-pulse" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-tr from-sky-400/20 to-blue-400/10 blur-3xl animate-[pulse_3s_ease-in-out_infinite]" />

          {/* divider with label */}
          <div className="relative z-10 px-6 pt-6">
            <div className="flex items-center gap-4 text-gray-500">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              <span className="text-xs md:text-sm font-semibold tracking-widest uppercase text-gray-600">অথবা</span>
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            </div>
          </div>

          {/* content */}
          <div className="relative z-10 px-6 pb-6">
            <div className="mt-4 flex flex-col items-center gap-4 text-center">
              <p className="text-base md:text-lg text-gray-800">
                একাউন্ট খুলে নিজের প্রিয় বইগুলো সংগ্রহ করে এফিলিয়েট মার্কেটিং করুন।
              </p>
              <a
                href="/login"
                className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70"
              >
                এখনই শুরু করুন
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 10H3a1 1 0 110-2h10.586l-3.293-3.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* subtle bottom sheen */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-300/60 to-transparent" />
        </div>
      </div>

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
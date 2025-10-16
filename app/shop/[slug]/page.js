import Link from "next/link";
import { notFound } from "next/navigation";
import { getShopBySlug } from "../../../src/lib/data";

function BookCard({ book, isOwner, shopSlug }) {
    // ... এই কম্পোনেন্টটি আগের মতোই থাকবে ...
    return (
        <div className="card bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 relative flex flex-col">
            {isOwner && (
                <div className="absolute top-2 right-2 z-10 flex space-x-2">
                    <Link href={`/shop/${shopSlug}/edit/${book.id}`} className="px-2 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 text-xs font-semibold shadow-md">
                        Edit
                    </Link>
                    <button className="px-2 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs font-semibold shadow-md">
                        Del
                    </button>
                </div>
            )}
            <div className="relative h-56 w-full">
                <img src={book.image_url || 'https://via.placeholder.com/300x400.png?text=Boier+Dokan'} alt={book.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-lg truncate flex-grow-0">{book.title}</h3>
                <p className="text-gray-600 text-sm mt-1 h-10 overflow-hidden flex-grow">{book.short_description || 'No description'}</p>
                <a href={book.affiliate_url} target="_blank" rel="noopener noreferrer" className="mt-4 w-full inline-block text-center bg-gray-800 text-white font-semibold py-2 rounded-md hover:bg-gray-900 transition-colors">
                    Buy Now {book.price ? `(৳${book.price})` : ''}
                </a>
            </div>
        </div>
    );
}

export default async function ShopPage({ params }) {
    const { slug } = params;
    const shop = await getShopBySlug(slug);

    if (!shop) {
        notFound();
    }

    const { name, booksByCategory, isOwner } = shop;
    const hasBooks = Object.keys(booksByCategory).length > 0;

    return (
        <main className="container mx-auto px-4 py-8">
            <header className="text-center mb-12">
                <h1 className="text-5xl font-extrabold capitalize text-gray-800">{name}</h1>
                <p className="text-lg text-gray-500 mt-2">"{name}" এর বইয়ের সংগ্রহ</p>
            </header>

            {isOwner && (
                <div className="text-center mb-12">
                    <Link
                        href={{
                            pathname: `/shop/${slug}/add-book`,
                            query: {
                                shopId: shopId,
                                // ক্যাটাগরি তালিকাটিকে JSON স্ট্রিং-এ পরিণত করে পাঠানো হচ্ছে
                                categories: JSON.stringify(allCategories)
                            }
                        }}
                        className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700"
                    >
                        + নতুন বই যোগ করুন
                    </Link>
                </div>
            )}

            {!hasBooks ? (
                <div className="text-center text-gray-500 py-16 bg-gray-50 rounded-lg">
                    <h3 className="text-2xl font-semibold text-gray-700">এখনো কোনো বই নেই</h3>
                    <p className="mt-2">মালিক হিসেবে লগইন করে নতুন বই যোগ করুন।</p>
                </div>
            ) : (
                <div className="space-y-16">
                    {Object.entries(booksByCategory).map(([category, books]) => (
                        <section key={category}>
                            <h2 className="text-3xl font-bold border-b-2 border-gray-200 pb-3 mb-8 text-gray-700">{category}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                {books.map((book) => (
                                    <BookCard key={book.id} book={book} isOwner={isOwner} shopSlug={slug} />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </main>
    );
}
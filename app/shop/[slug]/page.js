import Link from "next/link";
import { notFound } from "next/navigation";
import { getShopBySlug } from "../../../src/lib/data";
import BookCard from "./BookCard"; // BookCard.js ফাইল থেকে কম্পোনেন্ট ইম্পোর্ট করা হচ্ছে
import CopyLinkButton from "./CopyLinkButton";

/**
 * ডায়নামিক শপ পেজ।
 * URL-এর slug অনুযায়ী দোকানের তথ্য এবং বই প্রদর্শন করে।
 * এই কম্পোনেন্টটি একটি সার্ভার কম্পোনেন্ট, যা দ্রুত ডেটা ফেচ করে।
 */
export default async function ShopPage({ params }) {
    const { slug } = params;

    // সার্ভারে দোকানের সমস্ত ডেটা আনা হচ্ছে
    const shop = await getShopBySlug(slug);

    // যদি দোকান খুঁজে না পাওয়া যায় (বা RLS পলিসি ডেটা ব্লক করে), তাহলে 404 পেজ দেখানো হবে
    if (!shop) {
        notFound();
    }

    // ডেটা থেকে প্রয়োজনীয় ভ্যারিয়েবলগুলো বের করে আনা হচ্ছে
    const { name, booksByCategory, isOwner, id, allCategories } = shop;
    const hasBooks = Object.keys(booksByCategory).length > 0;
    const hasCategories = allCategories && allCategories.length > 0;

    return (
        <main className="container mx-auto px-4 py-8">
            <header className="text-center mb-12">
                <h1 className="text-5xl font-extrabold capitalize text-gray-800">{name}</h1>
                <p className="text-lg text-gray-500 mt-2">&quot;{name}&quot; এর বইয়ের সংগ্রহ</p>
            </header>

            {/* শুধুমাত্র দোকানের মালিকের জন্য ম্যানেজমেন্ট বাটন দেখানো হচ্ছে */}
            {isOwner && (
                <div className="text-center mb-12">
                    {/* ক্যাটাগরি থাকলেই কেবল "নতুন বই যোগ করুন" বাটনটি দেখানো হবে */}
                    {hasCategories ? (
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                            <Link
                                href={{
                                    pathname: `/shop/${slug}/add-book`,
                                    query: {
                                        shopId: id,
                                        categories: JSON.stringify(allCategories)
                                    }
                                }}
                                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
                            >
                                + নতুন বই যোগ করুন
                            </Link>
                            <CopyLinkButton slug={slug} />
                        </div>
                    ) : (
                        // ক্যাটাগরি না থাকলে একটি তথ্যপূর্ণ বার্তা দেখানো হবে
                        <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 max-w-lg mx-auto">
                            <p className="font-bold">এখনো কোনো বই যোগ করা যাবে না।</p>
                            <p>সাইটের অ্যাডমিন এখনো কোনো বইয়ের ক্যাটাগরি তৈরি করেননি।</p>
                        </div>
                    )}
                </div>
            )}

            {/* দোকানে বই আছে কি না, তার উপর ভিত্তি করে UI দেখানো হচ্ছে */}
            {!hasBooks ? (
                <div className="text-center text-gray-500 py-16 bg-gray-50 rounded-lg">
                    <h3 className="text-2xl font-semibold text-gray-700">এখনো কোনো বই নেই</h3>
                    <p className="mt-2">মালিক হিসেবে লগইন করে নতুন বই যোগ করুন।</p>
                </div>
            ) : (
                <div className="space-y-16">
                    {Object.entries(booksByCategory).map(([category, books]) => (
                        <section key={category}>
                            <h2 className="text-3xl font-bold border-b-2 border-gray-200 pb-3 mb-8 text-gray-700">
                                {category}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                {books.map((book) => (
                                    // এখানে নতুন BookCard ক্লায়েন্ট কম্পোনেন্টটি ব্যবহার করা হচ্ছে
                                    <BookCard
                                        key={book.id}
                                        book={book}
                                        isOwner={isOwner}
                                        shopSlug={slug}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </main>
    );
}
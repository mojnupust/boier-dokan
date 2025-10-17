import { notFound } from "next/navigation";
import { getAllCategories, getBookForEdit } from "../../../../../src/lib/data";
import EditBookForm from "./EditBookForm"; // আমরা ফর্মটিকে একটি আলাদা ক্লায়েন্ট কম্পোনেন্টে রাখব

export default async function EditBookPage({ params }) {
    const { bookId } = params;

    // দুটি ডেটা প্যারালালি ফেচ করা হচ্ছে
    const [book, categories] = await Promise.all([
        getBookForEdit(bookId),
        getAllCategories()
    ]);

    // যদি বই না পাওয়া যায় (বা ব্যবহারকারীর অনুমতি না থাকে), তাহলে 404 পেজ দেখান
    if (!book) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">বইয়ের তথ্য সম্পাদনা করুন</h1>
                    <p className="mt-3 text-lg text-gray-500">&quot;{book.title}&quot; বইটির তথ্য পরিবর্তন করুন।</p>
                </div>

                <EditBookForm
                    book={book}
                    categories={categories}
                    shopSlug={params.slug}
                />
            </div>
        </div>
    );
}
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { addBookToShop } from '../../../../src/lib/actions';

const initialState = { error: null, success: false, slug: null };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full px-6 py-3 text-lg text-white font-bold bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
        >
            {pending ? 'বই যোগ করা হচ্ছে...' : 'নতুন বই যোগ করুন'}
        </button>
    );
}

// একটি সাধারণ ইনপুট ফিল্ডের জন্য স্টাইল ক্লাস
const inputStyle = "mt-1 block w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow";

export default function AddBookPage({ params }) {
    const [state, formAction] = useActionState(addBookToShop, initialState);
    const router = useRouter();
    const searchParams = useSearchParams();

    // searchParams থেকে ডেটা পড়া এবং পার্স করা
    const shopId = searchParams.get('shopId');
    const categoriesJson = searchParams.get('categories');
    const categories = categoriesJson ? JSON.parse(decodeURIComponent(categoriesJson)) : [];

    useEffect(() => {
        if (state.success && state.slug) {
            router.push(`/shop/${state.slug}`);
        }
    }, [state, router]);

    if (!shopId || categories.length === 0) {
        // ... (ভুল অনুরোধের UI অপরিবর্তিত) ...
        return (
            <div className="container mx-auto text-center py-20">
                <h1 className="text-2xl font-bold text-red-600">ভুল অনুরোধ</h1>
                <p className="text-gray-600 mt-2">সঠিকভাবে এই পেজে আসা হয়নি। দোকানের পেজ থেকে আবার চেষ্টা করুন।</p>
                <button onClick={() => router.back()} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    ফিরে যান
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">আপনার সংগ্রহে নতুন বই যোগ করুন</h1>
                    <p className="mt-3 text-lg text-gray-500">নিচের ফর্মটি পূরণ করে আপনার দোকানের সৌন্দর্য বৃদ্ধি করুন।</p>
                </div>

                <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-2xl">
                    <form action={formAction} className="space-y-8">
                        {/* লুকানো ইনপুট ফিল্ড */}
                        <input type="hidden" name="shopId" value={shopId} />
                        <input type="hidden" name="shopSlug" value={params.slug} />

                        {/* বইয়ের নাম */}
                        <div>
                            <label htmlFor="title" className="block text-lg font-semibold text-gray-800">বইয়ের নাম <span className="text-red-500">*</span></label>
                            <input type="text" name="title" id="title" required className={inputStyle} placeholder="যেমন: মেঘনাদবধ কাব্য" />
                        </div>

                        {/* ক্যাটাগরি এবং মূল্য (একই সারিতে) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label htmlFor="categoryId" className="block text-lg font-semibold text-gray-800">ক্যাটাগরি <span className="text-red-500">*</span></label>
                                <select name="categoryId" id="categoryId" required className={inputStyle}>
                                    <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-lg font-semibold text-gray-800">মূল্য (اختیاری)</label>
                                <input type="number" name="price" id="price" step="0.01" className={inputStyle} placeholder="৳ 250.00" />
                            </div>
                        </div>

                        {/* এফিলিয়েট লিঙ্ক */}
                        <div>
                            <label htmlFor="affiliateUrl" className="block text-lg font-semibold text-gray-800">এফিলিয়েট লিঙ্ক <span className="text-red-500">*</span></label>
                            <input type="url" name="affiliateUrl" id="affiliateUrl" required className={inputStyle} placeholder="https://www.rokomari.com/book/..." />
                        </div>

                        {/* ছবির লিঙ্ক */}
                        <div>
                            <label htmlFor="imageUrl" className="block text-lg font-semibold text-gray-800">ছবির লিঙ্ক (اختیاری)</label>
                            <input type="url" name="imageUrl" id="imageUrl" className={inputStyle} placeholder="https://images.rokomari.com/..." />
                        </div>

                        {/* সংক্ষিপ্ত বর্ণনা */}
                        <div>
                            <label htmlFor="shortDescription" className="block text-lg font-semibold text-gray-800">সংক্ষিপ্ত বর্ণনা (اختیاری)</label>
                            <textarea name="shortDescription" id="shortDescription" rows="4" className={inputStyle} placeholder="বইটি সম্পর্কে কিছু আকর্ষণীয় তথ্য দিন..."></textarea>
                        </div>

                        {/* এরর মেসেজ */}
                        {state?.error && (
                            <div className="text-center text-red-700 bg-red-100 p-4 rounded-lg border border-red-200">
                                <p><strong>ত্রুটি:</strong> {state.error}</p>
                            </div>
                        )}

                        {/* সাবমিট বাটন */}
                        <div className="pt-4">
                            <SubmitButton />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
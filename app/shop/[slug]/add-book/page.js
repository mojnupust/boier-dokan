'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { addBookToShop } from '../../../../src/lib/actions';

const initialState = { error: null, success: false, slug: null };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="w-full px-6 py-3 text-white font-semibold bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors">
            {pending ? 'বই যোগ করা হচ্ছে...' : 'বই যোগ করুন'}
        </button>
    );
}

/**
 * এই পেজটি দুটি অংশে বিভক্ত:
 * ১. AddBookPage (সার্ভার কম্পোনেন্ট) - এটি ডেটা fetch করে।
 * ২. AddBookForm (ক্লায়েন্ট কম্পোনেন্ট) - এটি ফর্মটি রেন্ডার করে।
 * কিন্তু যেহেতু এই ফর্মে ক্লায়েন্ট-সাইড ইন্টারেকশন (useRouter, useEffect) প্রয়োজন,
 * আমরা পুরো পেজটিকেই একটি ক্লায়েন্ট কম্পোনেন্ট হিসেবে তৈরি করছি।
 * বড় অ্যাপ্লিকেশনে এগুলো আলাদা করা ভালো অভ্যাস।
 */
export default function AddBookPage({ params, searchParams }) {
    const [state, formAction] = useFormState(addBookToShop, initialState);
    const router = useRouter();

    // searchParams থেকে shopId এবং categories (JSON string হিসেবে) নেওয়া হচ্ছে
    const shopId = searchParams.shopId;
    const categories = JSON.parse(searchParams.categories || '[]');

    useEffect(() => {
        if (state.success && state.slug) {
            router.push(`/shop/${state.slug}`);
        }
    }, [state, router]);

    if (!shopId || categories.length === 0) {
        return (
            <div className="container mx-auto text-center py-20">
                <h1 className="text-2xl font-bold text-red-600">ভুল অনুরোধ</h1>
                <p className="text-gray-600 mt-2">সঠিকভাবে এই পেজে আসা হয়নি। দোকানের পেজ থেকে আবার চেষ্টা করুন।</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-center mb-8">নতুন বই যোগ করুন</h1>

                <form action={formAction} className="space-y-6">
                    {/* shopId এবং shopSlug ফর্মের সাথে গোপনে পাঠানো হচ্ছে */}
                    <input type="hidden" name="shopId" value={shopId} />
                    <input type="hidden" name="shopSlug" value={params.slug} />

                    {/* বইয়ের টাইটেল */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">বইয়ের নাম *</label>
                        <input type="text" name="title" id="title" required className="mt-1 w-full input-style" />
                    </div>

                    {/* ক্যাটাগরি */}
                    <div>
                        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">ক্যাটাগরি *</label>
                        <select name="categoryId" id="categoryId" required className="mt-1 w-full input-style">
                            <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* এফিলিয়েট লিঙ্ক */}
                    <div>
                        <label htmlFor="affiliateUrl" className="block text-sm font-medium text-gray-700">এফিলিয়েট লিঙ্ক *</label>
                        <input type="url" name="affiliateUrl" id="affiliateUrl" required className="mt-1 w-full input-style" placeholder="https://..." />
                    </div>

                    {/* ছবির লিঙ্ক */}
                    <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">ছবির লিঙ্ক</label>
                        <input type="url" name="imageUrl" id="imageUrl" className="mt-1 w-full input-style" placeholder="https://..." />
                    </div>

                    {/* সংক্ষিপ্ত বর্ণনা */}
                    <div>
                        <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">সংক্ষিপ্ত বর্ণনা</label>
                        <textarea name="shortDescription" id="shortDescription" rows="3" className="mt-1 w-full input-style"></textarea>
                    </div>

                    {/* মূল্য */}
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">মূল্য (اختیاری)</label>
                        <input type="number" name="price" id="price" step="0.01" className="mt-1 w-full input-style" placeholder="99.99" />
                    </div>

                    {state?.error && (
                        <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{state.error}</p>
                    )}

                    <SubmitButton />
                </form>
            </div>
        </div>
    );
}
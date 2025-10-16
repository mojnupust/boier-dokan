'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { updateBook } from '../../../../../src/lib/actions';

const initialState = { error: null, success: false, slug: null };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="w-full px-6 py-3 text-lg text-white font-bold bg-gradient-to-r from-green-500 to-teal-500 rounded-lg shadow-lg hover:from-green-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 transform hover:scale-105">
            {pending ? 'আপডেট করা হচ্ছে...' : 'আপডেট করুন'}
        </button>
    );
}

const inputStyle = "mt-1 block w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow";

export default function EditBookForm({ book, categories, shopSlug }) {
    const [state, formAction] = useActionState(updateBook, initialState);
    const router = useRouter();

    useEffect(() => {
        if (state.success && state.slug) {
            router.push(`/shop/${state.slug}`);
        }
    }, [state, router]);

    return (
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-2xl">
            <form action={formAction} className="space-y-8">
                {/* লুকানো ইনপুট ফিল্ড */}
                <input type="hidden" name="bookId" value={book.id} />
                <input type="hidden" name="shopSlug" value={shopSlug} />

                {/* বইয়ের নাম */}
                <div>
                    <label htmlFor="title" className="block text-lg font-semibold text-gray-800">বইয়ের নাম <span className="text-red-500">*</span></label>
                    <input type="text" name="title" id="title" required className={inputStyle} defaultValue={book.title} />
                </div>

                {/* ক্যাটাগরি এবং মূল্য */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label htmlFor="categoryId" className="block text-lg font-semibold text-gray-800">ক্যাটাগরি <span className="text-red-500">*</span></label>
                        <select name="categoryId" id="categoryId" required className={inputStyle} defaultValue={book.category_id}>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-lg font-semibold text-gray-800">মূল্য (اختیاری)</label>
                        <input type="number" name="price" id="price" step="0.01" className={inputStyle} defaultValue={book.price || ''} />
                    </div>
                </div>

                {/* এফিলিয়েট লিঙ্ক */}
                <div>
                    <label htmlFor="affiliateUrl" className="block text-lg font-semibold text-gray-800">এফিলিয়েট লিঙ্ক <span className="text-red-500">*</span></label>
                    <input type="url" name="affiliateUrl" id="affiliateUrl" required className={inputStyle} defaultValue={book.affiliate_url} />
                </div>

                {/* ছবির লিঙ্ক */}
                <div>
                    <label htmlFor="imageUrl" className="block text-lg font-semibold text-gray-800">ছবির লিঙ্ক (اختیاری)</label>
                    <input type="url" name="imageUrl" id="imageUrl" className={inputStyle} defaultValue={book.image_url || ''} />
                </div>

                {/* সংক্ষিপ্ত বর্ণনা */}
                <div>
                    <label htmlFor="shortDescription" className="block text-lg font-semibold text-gray-800">সংক্ষিপ্ত বর্ণনা (اختیاری)</label>
                    <textarea name="shortDescription" id="shortDescription" rows="4" className={inputStyle} defaultValue={book.short_description || ''}></textarea>
                </div>

                {state?.error && (
                    <div className="text-center text-red-700 bg-red-100 p-4 rounded-lg border border-red-200">
                        <strong>ত্রুটি:</strong> {state.error}
                    </div>
                )}

                <div className="pt-4">
                    <SubmitButton />
                </div>
            </form>
        </div>
    );
}
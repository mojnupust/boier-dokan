'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
// addBookToShop এবং createCategory দুটি অ্যাকশনই ইম্পোর্ট করা হচ্ছে
import { addBookToShop, createCategory } from '../../../../src/lib/actions';

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

const inputStyle = "mt-1 block w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow";

export default function AddBookPage({ params }) {
    const [state, formAction] = useActionState(addBookToShop, initialState);
    const router = useRouter();
    const searchParams = useSearchParams();

    // নতুন ফিচারের জন্য স্টেট ম্যানেজমেন্ট
    const [categories, setCategories] = useState([]);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [categoryError, setCategoryError] = useState(null);
    const [isPending, startTransition] = useTransition();
    const categorySelectRef = useRef(null); // নতুন ক্যাটাগরি অটো-সিলেক্ট করার জন্য

    // searchParams থেকে প্রাথমিক ক্যাটাগরি লোড করা
    useEffect(() => {
        const categoriesJson = searchParams.get('categories');
        const initialCategories = categoriesJson ? JSON.parse(decodeURIComponent(categoriesJson)) : [];
        setCategories(initialCategories);
    }, [searchParams]);

    const shopId = searchParams.get('shopId');

    // বই যোগ সফল হলে রিডাইরেক্ট করার জন্য useEffect
    useEffect(() => {
        if (state.success && state.slug) {
            router.push(`/shop/${state.slug}`);
        }
    }, [state, router]);

    // নতুন ক্যাটাগরি সেভ করার হ্যান্ডলার ফাংশন
    const handleSaveCategory = async () => {
        setCategoryError(null);
        startTransition(async () => {
            const result = await createCategory(newCategoryName);
            if (result.error) {
                setCategoryError(result.error);
            } else if (result.success && result.newCategory) {
                // সফল হলে:
                // ১. UI-তে ক্যাটাগরি তালিকা আপডেট করুন
                setCategories(prev => [...prev, result.newCategory]);
                // ২. ইনপুট ফিল্ড এবং ফর্ম রিসেট করুন
                setNewCategoryName('');
                setIsAddingCategory(false);

                // ৩. UX উন্নতি: নতুন তৈরি করা ক্যাটাগরিটি স্বয়ংক্রিয়ভাবে সিলেক্ট করুন
                setTimeout(() => {
                    if (categorySelectRef.current) {
                        categorySelectRef.current.value = result.newCategory.id;
                    }
                }, 0);
            }
        });
    };

    if (!shopId) {
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
                                <div className="flex justify-between items-center mb-1">
                                    <label htmlFor="categoryId" className="block text-lg font-semibold text-gray-800">ক্যাটাগরি <span className="text-red-500">*</span></label>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingCategory(!isAddingCategory)}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        {isAddingCategory ? 'বাতিল' : '+ নতুন ক্যাটাগরি'}
                                    </button>
                                </div>
                                <select name="categoryId" id="categoryId" required className={inputStyle} ref={categorySelectRef}>
                                    <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>

                                {isAddingCategory && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <label htmlFor="newCategory" className="block text-sm font-medium text-gray-700">নতুন ক্যাটাগরির নাম</label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <input
                                                type="text"
                                                id="newCategory"
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value)}
                                                className="flex-grow w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="যেমন: আত্ম-উন্নয়ন"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleSaveCategory}
                                                disabled={isPending || !newCategoryName.trim()}
                                                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                {isPending ? '...' : 'সেভ'}
                                            </button>
                                        </div>
                                        {categoryError && <p className="mt-2 text-xs text-red-600">{categoryError}</p>}
                                    </div>
                                )}
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
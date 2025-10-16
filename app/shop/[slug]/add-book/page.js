'use client';

// সমাধান (Error 1): useFormState এর পরিবর্তে useActionState ইম্পোর্ট করা হচ্ছে
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
// সমাধান (Error 2, 3): searchParams পড়ার জন্য useSearchParams হুক ইম্পোর্ট করা হচ্ছে
import { useRouter, useSearchParams } from 'next/navigation';
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

export default function AddBookPage({ params }) {
    // সমাধান (Error 1): useFormState এর পরিবর্তে useActionState ব্যবহার করা হচ্ছে
    const [state, formAction] = useActionState(addBookToShop, initialState);
    const router = useRouter();
    const [parsedCategories, setParsedCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Get search parameters
    const searchParams = useSearchParams();
    const shopId = searchParams.get('shopId');
    const categoriesJson = searchParams.get('categories');

    // Parse categories with error handling
    useEffect(() => {
        setIsLoading(true);

        try {
            // Decode the URL-encoded JSON string if it exists
            if (categoriesJson) {
                const decoded = decodeURIComponent(categoriesJson);
                const parsed = JSON.parse(decoded);

                if (Array.isArray(parsed)) {
                    setParsedCategories(parsed);
                } else {
                    console.error("Categories is not an array:", parsed);
                    setParsedCategories([]);
                }
            } else {
                // If no categories parameter, set empty array
                setParsedCategories([]);
            }
        } catch (error) {
            console.error("Error parsing categories:", error);
            setParsedCategories([]);
        } finally {
            setIsLoading(false);
        }
    }, [categoriesJson]);

    useEffect(() => {
        if (state.success && state.slug) {
            router.push(`/shop/${state.slug}`);
        }
    }, [state, router]);

    // Show loading state while parsing categories
    if (isLoading) {
        return (
            <div className="container mx-auto text-center py-20">
                <p className="text-gray-600">লোড হচ্ছে...</p>
            </div>
        );
    }

    if (!shopId || parsedCategories.length === 0) {
        return (
            <div className="container mx-auto text-center py-20">
                <h1 className="text-2xl font-bold text-red-600">ভুল অনুরোধ</h1>
                <p className="text-gray-600 mt-2">সঠিকভাবে এই পেজে আসা হয়নি। দোকানের পেজ থেকে আবার চেষ্টা করুন।</p>
                <div className="mt-4 text-sm text-gray-500">
                    <p>ডিবাগ তথ্য:</p>
                    <p>shopId: {shopId || 'অনুপস্থিত'}</p>
                    <p>categories: {categoriesJson ? `পাওয়া গেছে কিন্তু পার্স করা যায়নি` : 'অনুপস্থিত'}</p>
                </div>
                <button
                    onClick={() => router.push(`/shop/${params.slug}`)}
                    className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    দোকানে ফিরে যান
                </button>
            </div>
        );
    }

    // ফর্মের UI অপরিবর্তিত
    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-center mb-8">নতুন বই যোগ করুন</h1>

                <form action={formAction} className="space-y-6">
                    <input type="hidden" name="shopId" value={shopId} />
                    <input type="hidden" name="shopSlug" value={params.slug} />

                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">বইয়ের নাম *</label>
                        <input type="text" name="title" id="title" required className="mt-1 w-full input-style" />
                    </div>

                    <div>
                        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">ক্যাটাগরি *</label>
                        <select name="categoryId" id="categoryId" required className="mt-1 w-full input-style">
                            <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                            {parsedCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="affiliateUrl" className="block text-sm font-medium text-gray-700">এফিলিয়েট লিঙ্ক *</label>
                        <input type="url" name="affiliateUrl" id="affiliateUrl" required className="mt-1 w-full input-style" placeholder="https://..." />
                    </div>

                    <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">ছবির লিঙ্ক</label>
                        <input type="url" name="imageUrl" id="imageUrl" className="mt-1 w-full input-style" placeholder="https://..." />
                    </div>

                    <div>
                        <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">সংক্ষিপ্ত বর্ণনা</label>
                        <textarea name="shortDescription" id="shortDescription" rows="3" className="mt-1 w-full input-style"></textarea>
                    </div>

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
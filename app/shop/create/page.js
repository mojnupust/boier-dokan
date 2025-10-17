'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createShop } from '../../../src/lib/actions';

// সার্ভার অ্যাকশনের জন্য প্রাথমিক স্টেট
const initialState = {
  error: null,
  success: false,
  slug: null,
};

/**
 * একটি সাবমিট বাটন যা ফর্ম সাবমিশনের সময় লোডিং স্টেট দেখায়।
 */
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-4 py-2 text-white font-semibold bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? 'তৈরি হচ্ছে...' : 'দোকান তৈরি করুন'}
    </button>
  );
}

/**
 * দোকান তৈরির পেজ কম্পোনেন্ট।
 */
export default function CreateShopPage() {
  const [state, formAction] = useFormState(createShop, initialState);
  const router = useRouter();

  // এই useEffect হুকটি সার্ভার অ্যাকশনের স্টেট পরিবর্তনের ওপর নজর রাখে।
  // যখন দোকান সফলভাবে তৈরি হবে, এটি ব্যবহারকারীকে নতুন দোকানের পেজে রিডাইরেক্ট করবে।
  useEffect(() => {
    if (state.success && state.slug) {
      router.push(`/shop/${state.slug}`);
    }
  }, [state, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="container mx-auto max-w-md px-4 py-12">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">আপনার দোকান খুলুন</h1>
            <p className="text-gray-500 mt-2">
              আপনার দোকানের একটি সুন্দর নাম দিন। এই নামটি আপনার দোকানের লিঙ্কে ব্যবহৃত হবে।
            </p>
          </div>

          <form action={formAction} className="space-y-6">
            <div>
              <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-1">
                দোকানের নাম (English)
              </label>
              <input
                type="text"
                id="shopName"
                name="shopName"
                required
                minLength="3"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Boi Bikreta Rahim / Boi Premi"
              />
            </div>

            {state?.error && (
              <div className="text-sm text-red-700 bg-red-100 p-3 rounded-md border border-red-200">
                <strong>ত্রুটি:</strong> {state.error}
              </div>
            )}

            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  );
}
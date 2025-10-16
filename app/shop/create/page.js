'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createShop } from '../../../src/lib/actions';

const initialState = {
  error: null,
};

// সাবমিট বাটন লোডিং স্টেট দেখানোর জন্য
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {pending ? 'তৈরি হচ্ছে...' : 'দোকান তৈরি করুন'}
    </button>
  );
}

export default function CreateShopPage() {
  const [state, formAction] = useActionState(createShop, initialState);

  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">আপনার দোকান খুলুন</h1>
        <p className="text-center text-gray-600 mb-6">
          আপনার দোকানের একটি সুন্দর নাম দিন। এই নামটি আপনার দোকানের লিঙ্কে ব্যবহৃত হবে।
        </p>

        <form action={formAction} className="space-y-6">
          <div>
            <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">
              দোকানের নাম
            </label>
            <input
              type="text"
              id="shopName"
              name="shopName"
              required
              minLength="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="যেমন: আমার বই ঘর"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">
              {state.error}
            </p>
          )}

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
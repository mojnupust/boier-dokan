'use client'; // এই কম্পোনেন্টটি এখন একটি ক্লায়েন্ট কম্পোনেন্ট

import Image from "next/image";
import Link from "next/link";
import { useTransition } from 'react';
import { deleteBook } from "../../../src/lib/actions";

export default function BookCard({ book, isOwner, shopSlug }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = async () => {
        // ব্যবহারকারীর কাছে কনফার্মেশন চাওয়া হচ্ছে
        const confirmed = window.confirm(`আপনি কি "${book.title}" বইটি মুছে ফেলতে নিশ্চিত?`);

        if (confirmed) {
            startTransition(async () => {
                const result = await deleteBook(book.id, shopSlug);
                if (result?.error) {
                    alert(`ত্রুটি: ${result.error}`);
                }
            });
        }
    };

    return (
        <div className={`relative flex flex-col bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300 ${isPending ? 'opacity-50' : ''}`}>
            {isOwner && (
                <div className="absolute top-2 right-2 z-10 flex space-x-2">
                    <Link href={`/shop/${shopSlug}/edit/${book.id}`} className="px-2 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 text-xs font-semibold shadow-md">
                        Edit
                    </Link>
                    <button
                        onClick={handleDelete}
                        disabled={isPending}
                        className="px-2 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs font-semibold shadow-md disabled:bg-gray-400"
                    >
                        {isPending ? '...' : 'Del'}
                    </button>
                </div>
            )}
            <div className="relative h-56 w-full">
                <Image src={book.image_url || 'https://via.placeholder.com/300x400.png?text=Boier+Dokan'} alt={book.title} className="w-full h-full object-cover" width={300} height={400} />
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-lg truncate flex-grow-0">{book.title}</h3>
                <p className="text-gray-600 text-sm mt-1 h-10 overflow-hidden flex-grow">{book.short_description || 'No description'}</p>
                {book?.affiliate_url && <a href={book.affiliate_url} target="_blank" rel="noopener noreferrer" className="mt-4 w-full inline-block text-center bg-gray-800 text-white font-semibold py-2 rounded-md hover:bg-gray-900 transition-colors">
                    Buy Now {book.price ? `(৳${book.price})` : ''}
                </a>}
            </div>
        </div>
    );
}
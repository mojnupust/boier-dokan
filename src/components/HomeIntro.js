import Link from 'next/link';

export default function HomeIntro() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 sm:p-8 text-center">
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
        আপনার নিজের বইয়ের জগৎ তৈরি করুন
      </h3>
      <p className="text-base text-gray-600 leading-relaxed max-w-md mx-auto">
        একাউন্ট খুলে প্রিয় বই সংগ্রহ করুন, সবার সাথে শেয়ার করুন এবং এফিলিয়েট মার্কেটিং করে আয় করুন।
      </p>
      <div className="mt-6">
        <Link
          href="/login"
          className="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105"
        >
          শুরু করুন
        </Link>
      </div>
    </div>
  );
}
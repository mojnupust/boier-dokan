export default function HomeIntro() {
  return (
    <div className="bg-white font-sans">
      <div className="container mx-auto px-4 py-6 md:py-6">
        <div className="max-w-4xl mx-auto text-center">

          {/* --- প্রথম অংশ: ট্যাগলাইন/উদ্ধৃতি --- */}
          <div className="relative mb-20">
            {/* CSS-ভিত্তিক আলংকারিক উদ্ধৃতি চিহ্ন */}
            <span className="absolute -top-10 left-0 md:-left-4 text-8xl md:text-9xl font-serif text-gray-100 -z-0" aria-hidden="true">
              “
            </span>
            <blockquote className="relative">
              <p className="text-3xl md:text-4xl font-serif text-gray-800 leading-relaxed">
                জনপ্রিয় বইয়ের দোকানগুলো থেকে বাছাই করা সেরা বইয়ের সংগ্রহ।
              </p>
            </blockquote>
          </div>

          {/* --- বিভাজক --- */}
          <div className="flex items-center my-16">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-sm font-medium text-gray-400 uppercase tracking-widest">অথবা</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* --- দ্বিতীয় অংশ: কল-টু-অ্যাকশন (CTA) --- */}
          <div className="text-left border-l-4 border-blue-600 pl-8 py-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              আপনার নিজের বইয়ের জগৎ তৈরি করুন
            </h3>
            <p className="text-lg text-gray-600 leading-8">
              একাউন্ট খুলে নিজের প্রিয় বইগুলো সংগ্রহ করুন, যাতে করে ভবিষ্যতে বইগুলো পড়তে পারেন। প্রয়োজনে আপনার বইসংগ্রহের লিংক সবার সাথে শেয়ার করুন। আমাদের প্লাটফর্ম ব্যবহার করে এফিলিয়েট মার্কেটিং করতেও পারবেন। 
            </p>
            <div className="mt-8">
              <a 
                href="/login" 
                className="inline-block px-10 py-3 bg-blue-600 text-white font-bold rounded-md shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105"
              >
                শুরু করুন
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

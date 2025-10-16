// এই পেজটি আপাতত একটি প্লেসহোল্ডার হিসেবে কাজ করবে।
// পরবর্তীতে আমরা এখানে ঐ দোকানের বইগুলো দেখাব।

async function getShopBySlug(slug) {
    // এখানে আমরা পরে ডাটাবেস থেকে শপের ডেটা আনব।
    // আপাতত একটি মক ডেটা রিটার্ন করছি।
    if (slug) {
        return { name: decodeURIComponent(slug).replace(/-/g, ' ') };
    }
    return null;
}

export default async function ShopPage({ params }) {
    const { slug } = params;
    const shop = await getShopBySlug(slug);

    if (!shop) {
        return (
            <div className="container mx-auto text-center py-20">
                <h1 className="text-2xl font-bold">দোকান খুঁজে পাওয়া যায়নি</h1>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-bold capitalize">{shop.name}</h1>
                <p className="text-lg text-gray-600 mt-2">এই দোকানের বইয়ের সংগ্রহ নিচে দেখুন</p>
            </header>

            {/* এখানে আমরা পরবর্তীতে বইয়ের লিস্ট দেখাব */}
            <div className="text-center text-gray-500">
                <p>এই দোকানে এখনো কোনো বই যোগ করা হয়নি।</p>
            </div>
        </div>
    );
}
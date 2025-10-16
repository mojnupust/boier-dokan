import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from './supabase/server';

export async function getOfficialBooksGroupedByCategory() {
    // noStore() ব্যবহার করা হয়েছে যাতে ডেটা ক্যাশ না হয় এবং সবসময় নতুন ডেটা আসে।
    // প্রোডাকশনে আপনি প্রয়োজন অনুযায়ী ক্যাশিং পলিসি পরিবর্তন করতে পারেন।
    noStore();
    const supabase = createClient();

    // আমরা 'shops' টেবিল থেকে যে শপটির 'is_official' true, সেটিকে প্রথমে খুঁজে বের করব।
    const { data: officialShop, error: shopError } = await supabase
        .from('shops')
        .select('id')
        .eq('is_official', true)
        .single(); // .single() ব্যবহার করা হয়েছে কারণ আমরা জানি একটি মাত্র অফিসিয়াল শপ থাকবে।

    if (shopError || !officialShop) {
        console.error('Error fetching official shop:', shopError);
        return []; // যদি অফিসিয়াল শপ না পাওয়া যায়, তবে খালি অ্যারে রিটার্ন করবে।
    }

    // এখন আমরা ক্যাটাগরি এবং ঐ ক্যাটাগরির অধীনে থাকা বইগুলো আনব,
    // তবে শুধুমাত্র অফিসিয়াল শপের বইগুলো।
    const { data: categoriesWithBooks, error: booksError } = await supabase
        .from('categories')
        .select(`
      id,
      name,
      slug,
      books (
        id,
        title,
        short_description,
        image_url,
        affiliate_url,
        price
      )
    `)
        .eq('books.shop_id', officialShop.id) // শুধুমাত্র অফিসিয়াল শপের বই ফিল্টার করা হচ্ছে।
        .order('name', { ascending: true }) // ক্যাটাগরিগুলো নামের ভিত্তিতে সাজানো থাকবে।
        .order('position', { foreignTable: 'books', ascending: true }); // বইগুলো তাদের পজিশন অনুযায়ী সাজানো থাকবে।

    if (booksError) {
        console.error('Error fetching categories and books:', booksError);
        return [];
    }

    // যেসব ক্যাটাগরির অধীনে কোনো বই নেই, সেগুলো আমরা ফিল্টার করে বাদ দিয়ে দিব।
    const filteredCategories = categoriesWithBooks.filter(category => category.books.length > 0);

    return filteredCategories;
}

export async function getUserShop() {
    noStore(); // ক্যাশিং বন্ধ রাখা হলো
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null; // যদি ব্যবহারকারী লগইন না থাকেন
    }

    const { data: shop, error } = await supabase
        .from('shops')
        .select('name, slug')
        .eq('owner_id', user.id)
        .single(); // .single() কারণ একজন ব্যবহারকারীর একটিই দোকান থাকবে

    if (error && error.code !== 'PGRST116') {
        // PGRST116 মানে হলো কোনো row পাওয়া যায়নি, যা এক্ষেত্রে একটি এরর নয়।
        console.error('Error fetching user shop:', error);
    }

    return shop; // দোকান পাওয়া গেলে shop অবজেক্ট, না পাওয়া গেলে null রিটার্ন করবে
}

// getUserShop ফাংশনের নিচে এই কোড যোগ করুন

/**
 * সকল ক্যাটাগরির একটি তালিকা নিয়ে আসে।
 */
export async function getAllCategories() {
    noStore();
    const supabase = createClient();
    const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
    return data;
}
/**
 * একটি slug ব্যবহার করে দোকানের বিস্তারিত তথ্য, বই এবং মালিকানার অবস্থা নিয়ে আসে।
 * @param {string} slug - দোকানের ইউনিক URL স্ল্যাগ।
 * @returns {Promise<object|null>} - দোকানের তথ্য অথবা null।
 */
export async function getShopBySlug(slug) {
    noStore();
    const supabase = createClient();

    // ১. বর্তমান ব্যবহারকারীর তথ্য আনা হচ্ছে
    const { data: { user } } = await supabase.auth.getUser();

    // ২. শপের তথ্য এবং সম্পর্কিত বই ও ক্যাটাগরি জয়েন করে আনা হচ্ছে
    const { data: shop, error } = await supabase
        .from('shops')
        .select(`
      id,
      name,
      slug,
      owner_id,
      categories (
        id,
        name,
        slug
      ),
      books (
        id,
        title,
        short_description,
        image_url,
        affiliate_url,
        price,
        category_id
      )
    `)
        .eq('slug', slug)
        .single();

    if (error || !shop) {
        console.error('Error fetching shop by slug:', error);
        return null; // দোকান খুঁজে না পাওয়া গেলে null রিটার্ন হবে
    }

    // ৩. বইগুলোকে তাদের ক্যাটাগরি অনুযায়ী গ্রুপ করা হচ্ছে
    const booksByCategory = shop.books.reduce((acc, book) => {
        const category = shop.categories.find(cat => cat.id === book.category_id);
        const categoryName = category ? category.name : 'Uncategorized';

        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(book);
        return acc;
    }, {});

    // ৪. একটি সুন্দর ফরম্যাটে ডেটা রিটার্ন করা হচ্ছে
    return {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        booksByCategory: booksByCategory,
        // বর্তমান ব্যবহারকারী এই দোকানের মালিক কি না, তা চেক করা হচ্ছে
        isOwner: user ? user.id === shop.owner_id : false,
    };
}
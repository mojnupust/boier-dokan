import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from './supabase/server';

// দ্রষ্টব্য: getOfficialBooksGroupedByCategory এর পুরনো সংস্করণটি এখান থেকে মুছে ফেলা হয়েছে।

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

export async function getShopBySlug(slug) {
    noStore();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: shop, error } = await supabase
        .from('shops')
        .select(`
      id, name, slug, owner_id,
      books ( id, title, short_description, image_url, affiliate_url, price, category_id )
    `)
        .eq('slug', slug)
        .single();

    if (error || !shop) {
        return null;
    }

    const allCategories = await getAllCategories();
    const categoryMap = new Map(allCategories.map(cat => [cat.id, cat.name]));

    const booksByCategory = shop.books.reduce((acc, book) => {
        const categoryName = categoryMap.get(book.category_id) || 'Uncategorized';
        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(book);
        return acc;
    }, {});

    return {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        booksByCategory: booksByCategory,
        isOwner: user ? user.id === shop.owner_id : false,
        allCategories: allCategories,
    };
}

/**
 * সম্পাদনা করার জন্য একটি নির্দিষ্ট বইয়ের ডেটা এবং মালিকানা যাচাই করে।
 */
export async function getBookForEdit(bookId) {
    noStore();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: book, error } = await supabase
        .from('books')
        .select(`*, shops ( owner_id )`)
        .eq('id', bookId)
        .single();

    if (error || !book || book.shops.owner_id !== user.id) {
        return null;
    }

    return book;
}

export async function getCurrentUserData() {
    noStore();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { user: null, profile: null, shop: null, adminShop: null };
    }

    const [profileRes, shopRes] = await Promise.all([
        supabase.from('profiles').select('role, display_name').eq('id', user.id).single(),
        supabase.from('shops').select('id, name, slug').eq('owner_id', user.id).single()
    ]);

    const profile = profileRes.data;
    const userShop = shopRes.data;

    let adminShop = null;
    if (profile?.role === 'admin') {
        const { data: officialShop } = await supabase
            .from('shops')
            .select('id, name, slug')
            .eq('slug', 'official')
            .single();
        adminShop = officialShop;
    }

    return { user, profile, shop: userShop, adminShop };
}

// getOfficialBooksGroupedByCategory এর সঠিক এবং চূড়ান্ত সংস্করণ
export async function getOfficialBooksGroupedByCategory() {
    noStore();
    const supabase = createClient();

    const { data: officialShop } = await supabase
        .from('shops')
        .select('id, slug')
        .eq('slug', 'official')
        .single();

    if (!officialShop) {
        return { booksByCategory: {}, shop: null };
    }

    const { data: books, error: booksError } = await supabase
        .from('books')
        .select('*, categories (name)')
        .eq('shop_id', officialShop.id)
        .order('created_at', { ascending: false });

    if (booksError) {
        console.error('Error fetching books for official shop:', booksError);
        return { booksByCategory: {}, shop: officialShop };
    }

    const booksByCategory = books.reduce((acc, book) => {
        const categoryName = book.categories?.name || 'Uncategorized';
        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(book);
        return acc;
    }, {});

    return { booksByCategory, shop: officialShop };
}

export async function getAllShop() {
    noStore(); // ক্যাশিং বন্ধ রাখা হলো
    const supabase = createClient();

    const { data: shops, error } = await supabase
        .from('shops')
        .select('name, slug')

    if (error && error.code !== 'PGRST116') {
        // PGRST116 মানে হলো কোনো row পাওয়া যায়নি, যা এক্ষেত্রে একটি এরর নয়।
        console.error('Error fetching shop:', error);
    }

    return shops; // দোকান পাওয়া গেলে shop অবজেক্ট, না পাওয়া গেলে null রিটার্ন করবে
}
'use server'; // এই ফাইলটি একটি সার্ভার-সাইড মডিউল

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';

// একটি সহজ slugify ফাংশন
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

export async function createShop(formData) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'আপনাকে অবশ্যই লগইন করতে হবে।' };
    }

    const shopName = formData.get('shopName')?.toString();
    if (!shopName || shopName.trim().length < 3) {
        return { error: 'দোকানের নাম কমপক্ষে ৩ অক্ষরের হতে হবে।' };
    }

    const slug = slugify(shopName);

    // চেক করা হচ্ছে যে ব্যবহারকারীর আগে থেকেই কোনো দোকান আছে কি না
    const { data: existingShop, error: existingShopError } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .single();

    if (existingShop) {
        return { error: 'আপনার ইতোমধ্যে একটি দোকান রয়েছে।' };
    }

    const { data, error } = await supabase
        .from('shops')
        .insert({
            owner_id: user.id,
            name: shopName,
            slug: slug,
            // price 필드는 ডাটাবেস স্কিমাতে nullable, তাই এখানে দেওয়ার প্রয়োজন নেই।
        })
        .select('slug')
        .single();

    if (error) {
        // যদি slug ইউনিক না হয় (খুবই বিরল সম্ভাবনা), ডাটাবেস একটি এরর দেবে
        if (error.code === '23505') { // unique_violation
            return { error: 'এই নামের দোকান ইতোমধ্যে ব্যবহৃত হয়েছে। অন্য নাম দিন।' };
        }
        console.error('Error creating shop:', error);
        return { error: 'দোকান তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' };
    }

    // ক্যাশ রিভ্যালিডেট করা হচ্ছে যাতে লেআউটে "আমার দোকান" বাটন দেখা যায়
    revalidatePath('/', 'layout');

    // ব্যবহারকারীকে তার নতুন দোকানের পেজে রিডাইরেক্ট করা হচ্ছে
    redirect(`/shop/${data.slug}`);
}
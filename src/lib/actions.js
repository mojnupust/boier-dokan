'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';

function slugify(text) {
    // ... (slugify ফাংশন অপরিবর্তিত)
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

// এখানে পরিবর্তন করা হয়েছে: ফাংশনটি এখন দুটি প্যারামিটার গ্রহণ করছে।
export async function createShop(previousState, formData) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'আপনাকে অবশ্যই লগইন করতে হবে।' };
    }

    // এখন formData সঠিকভাবে FormData অবজেক্টকে নির্দেশ করছে।
    const shopName = formData.get('shopName')?.toString();
    if (!shopName || shopName.trim().length < 3) {
        return { error: 'দোকানের নাম কমপক্ষে ৩ অক্ষরের হতে হবে।' };
    }

    const slug = slugify(shopName);

    const { data: existingShop } = await supabase
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
        })
        .select('slug')
        .single();

    if (error) {
        if (error.code === '23505') {
            return { error: 'এই নামের দোকান ইতোমধ্যে ব্যবহৃত হয়েছে। অন্য নাম দিন।' };
        }
        console.error('Error creating shop:', error);
        return { error: 'দোকান তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' };
    }

    revalidatePath('/', 'layout');
    redirect(`/shop/${data.slug}`);
}
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from './supabase/server';

/**
 * একটি টেক্সটকে URL-ফ্রেন্ডলি স্ল্যাগে পরিণত করে।
 * যেমন: "আমার বই ঘর" -> "আমার-বই-ঘর"
 * @param {string} text - যে টেক্সটটিকে স্ল্যাগে পরিণত করতে হবে।
 * @returns {string} - URL-ফ্রেন্ডলি স্ল্যাগ।
 */
function slugify(text) {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')           // স্পেসকে হাইফেন (-) দিয়ে পরিবর্তন করে
        .replace(/[^\w\-]+/g, '')       // সকল নন-ওয়ার্ড ক্যারেক্টার (a-z, 0-9, _) এবং হাইফেন ছাড়া বাকি সব মুছে ফেলে
        .replace(/\-\-+/g, '-')         // একাধিক হাইফেনকে একটি হাইফেনে পরিণত করে
        .replace(/^-+/, '')             // শুরু থেকে হাইফেন মুছে ফেলে
        .replace(/-+$/, '');            // শেষ থেকে হাইফেন মুছে ফেলে
}

/**
 * একটি নতুন বইয়ের দোকান তৈরি করার জন্য সার্ভার অ্যাকশন।
 * @param {object} previousState - useFormState থেকে আসা আগের স্টেট।
 * @param {FormData} formData - ফর্ম থেকে আসা ডেটা।
 * @returns {Promise<object>} - সফল বা ব্যর্থতার তথ্যসহ একটি অবজেক্ট।
 */
export async function createShop(previousState, formData) {
    const supabase = createClient();

    // ১. ব্যবহারকারী লগইন করা আছে কি না চেক করুন
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'আপনাকে অবশ্যই লগইন করতে হবে।' };
    }

    // ২. ফর্ম থেকে দোকানের নাম নিন এবং ভ্যালিডেট করুন
    const shopName = formData.get('shopName')?.toString();
    if (!shopName || shopName.trim().length < 3) {
        return { error: 'দোকানের নাম কমপক্ষে ৩ অক্ষরের হতে হবে।' };
    }

    // ৩. ব্যবহারকারীর আগে থেকেই কোনো দোকান আছে কি না চেক করুন
    const { data: existingShop } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .single();

    if (existingShop) {
        return { error: 'আপনার ইতোমধ্যে একটি দোকান রয়েছে।' };
    }

    // ৪. ডাটাবেসে নতুন দোকানটি যোগ করুন
    const slug = slugify(shopName);
    const { data, error } = await supabase
        .from('shops')
        .insert({
            owner_id: user.id,
            name: shopName,
            slug: slug,
        })
        .select('slug')
        .single();

    // ৫. সম্ভাব্য এরর হ্যান্ডেল করুন
    if (error) {
        // যদি slug ইউনিক না হয় (unique_violation)
        if (error.code === '23505') {
            return { error: 'এই নামের দোকান ইতোমধ্যে ব্যবহৃত হয়েছে। অন্য নাম দিন।' };
        }
        console.error('Error creating shop:', error);
        return { error: 'দোকান তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' };
    }

    // ৬. সফল হলে ক্যাশ রিভ্যালিডেট করুন এবং সফলতার তথ্য রিটার্ন করুন
    revalidatePath('/', 'layout'); // লেআউট রিভ্যালিডেট করে "আমার দোকান" বাটন দেখানোর জন্য
    revalidatePath(`/shop/${data.slug}`); // নতুন দোকানের পেজের ক্যাশ রিভ্যালিডেট করার জন্য

    // ক্লায়েন্ট-সাইডে রিডাইরেক্ট করার জন্য সফলতার তথ্য এবং slug রিটার্ন করা হচ্ছে
    return { success: true, slug: data.slug };
}

/**
 * একটি দোকানে নতুন বই যোগ করার জন্য সার্ভার অ্যাকশন।
 * @param {object} previousState - useFormState থেকে আসা স্টেট।
 * @param {FormData} formData - ফর্ম থেকে আসা ডেটা।
 * @returns {Promise<object>} - সফল বা ব্যর্থতার তথ্যসহ একটি অবজেক্ট।
 */
export async function addBookToShop(previousState, formData) {
    const supabase = createClient();

    // ১. ব্যবহারকারী লগইন করা আছে কি না চেক করুন
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'বই যোগ করার জন্য আপনাকে অবশ্যই লগইন করতে হবে।' };
    }

    // ২. ফর্ম থেকে ডেটা এবং লুকানো shopId ও slug সংগ্রহ করুন
    const shopId = formData.get('shopId');
    const shopSlug = formData.get('shopSlug');
    const title = formData.get('title');
    const categoryId = formData.get('categoryId');
    const affiliateUrl = formData.get('affiliateUrl');
    const imageUrl = formData.get('imageUrl');
    const shortDescription = formData.get('shortDescription');
    const price = formData.get('price');

    // ৩. বেসিক ভ্যালিডেশন
    if (!shopId || !shopSlug || !title || !categoryId || !affiliateUrl) {
        return { error: 'টাইটেল, ক্যাটাগরি এবং এফিলিয়েট লিঙ্ক আবশ্যক।' };
    }

    // ৪. ব্যবহারকারী এই দোকানের মালিক কি না, তা পুনরায় সার্ভারে ভেরিফাই করুন
    const { data: shop, error: shopError } = await supabase
        .from('shops')
        .select('id')
        .eq('id', shopId)
        .eq('owner_id', user.id)
        .single();

    if (shopError || !shop) {
        return { error: 'এই দোকানে বই যোগ করার অনুমতি আপনার নেই।' };
    }

    // ৫. ডাটাবেসে নতুন বইটি যোগ করুন
    const { error: bookError } = await supabase
        .from('books')
        .insert({
            shop_id: shopId,
            category_id: categoryId,
            title: title,
            affiliate_url: affiliateUrl,
            image_url: imageUrl,
            short_description: shortDescription,
            price: price || null, // মূল্য না দিলে null হিসেবে সেভ হবে
        });

    if (bookError) {
        console.error('Error adding book:', bookError);
        return { error: 'বই যোগ করার সময় একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।' };
    }

    // ৬. ক্যাশ রিভ্যালিডেট করুন এবং সফলতার তথ্য রিটার্ন করুন
    revalidatePath(`/shop/${shopSlug}`); // দোকানের পেজের ক্যাশ রিভ্যালিডেট করা হচ্ছে

    return { success: true, slug: shopSlug };
}

/**
 * একটি বিদ্যমান বইয়ের তথ্য আপডেট করার জন্য সার্ভার অ্যাকশন।
 * @param {object} previousState - useActionState থেকে আসা স্টেট।
 * @param {FormData} formData - ফর্ম থেকে আসা ডেটা।
 * @returns {Promise<object>} - সফল বা ব্যর্থতার তথ্যসহ একটি অবজেক্ট।
 */
export async function updateBook(previousState, formData) {
    const supabase = createClient();

    // ১. ব্যবহারকারী লগইন করা আছে কি না, তা চেক করুন
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'বই আপডেট করার জন্য আপনাকে অবশ্যই লগইন করতে হবে।' };
    }

    // ২. ফর্ম থেকে সমস্ত ডেটা সংগ্রহ করুন
    const bookId = formData.get('bookId');
    const shopSlug = formData.get('shopSlug');
    const title = formData.get('title');
    const categoryId = formData.get('categoryId');
    const affiliateUrl = formData.get('affiliateUrl');
    const imageUrl = formData.get('imageUrl');
    const shortDescription = formData.get('shortDescription');
    const price = formData.get('price');

    // ৩. বেসিক ভ্যালিডেশন
    if (!bookId || !shopSlug || !title || !categoryId || !affiliateUrl) {
        return { error: 'টাইটেল, ক্যাটাগরি এবং এফিলিয়েট লিঙ্ক আবশ্যক।' };
    }

    // ৪. নিরাপত্তা যাচাই: ব্যবহারকারী কি আসলেই এই বইটির মালিক?
    // আমরা বইয়ের shop_id থেকে owner_id খুঁজে বের করে ব্যবহারকারীর id-এর সাথে মেলাব।
    const { data: bookOwner, error: ownerError } = await supabase
        .from('books')
        .select('shops ( owner_id )')
        .eq('id', bookId)
        .single();

    if (ownerError || !bookOwner || bookOwner.shops.owner_id !== user.id) {
        return { error: 'এই বইটি সম্পাদনা করার অনুমতি আপনার নেই।' };
    }

    // ৫. ডাটাবেসে বইটি আপডেট করুন
    const { error: updateError } = await supabase
        .from('books')
        .update({
            title: title,
            category_id: categoryId,
            affiliate_url: affiliateUrl,
            image_url: imageUrl,
            short_description: shortDescription,
            price: price || null,
        })
        .eq('id', bookId);

    if (updateError) {
        console.error('Error updating book:', updateError);
        return { error: 'বই আপডেট করার সময় একটি সমস্যা হয়েছে।' };
    }

    // ৬. ক্যাশ রিভ্যালিডেট করুন এবং সফলতার তথ্য রিটার্ন করুন
    revalidatePath(`/shop/${shopSlug}`);

    // এখানে আমরা redirect ব্যবহার করতে পারি, কারণ এটি একটি সফল সমাপ্তি।
    // তবে ক্লায়েন্ট-সাইড রিডাইরেকশন প্যাটার্নটি সামঞ্জস্যপূর্ণ।
    return { success: true, slug: shopSlug };
}
/**
 * একটি বই ডাটাবেস থেকে স্থায়ীভাবে মুছে ফেলার জন্য সার্ভার অ্যাকশন।
 * @param {string} bookId - যে বইটি মোছা হবে তার UUID।
 * @param {string} shopSlug - যে দোকানের পেজ রিভ্যালিডেট করতে হবে তার slug।
 * @returns {Promise<object>} - সফল বা ব্যর্থতার তথ্যসহ একটি অবজেক্ট।
 */
export async function deleteBook(bookId, shopSlug) {
    'use server'; // এটি একটি সার্ভার অ্যাকশন

    if (!bookId || !shopSlug) {
        return { error: 'অবৈধ অনুরোধ। বই বা দোকানের তথ্য পাওয়া যায়নি।' };
    }

    const supabase = createClient();

    // ১. ব্যবহারকারী লগইন করা আছে কি না, তা চেক করুন
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'বই মোছার জন্য আপনাকে অবশ্যই লগইন করতে হবে।' };
    }

    // ২. নিরাপত্তা যাচাই: ব্যবহারকারী কি আসলেই এই বইটির মালিক?
    const { data: bookOwner, error: ownerError } = await supabase
        .from('books')
        .select('shops ( owner_id )')
        .eq('id', bookId)
        .single();

    if (ownerError || !bookOwner || bookOwner.shops.owner_id !== user.id) {
        return { error: 'এই বইটি মোছার অনুমতি আপনার নেই।' };
    }

    // ৩. ডাটাবেস থেকে বইটি মুছে ফেলুন
    const { error: deleteError } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId);

    if (deleteError) {
        console.error('Error deleting book:', deleteError);
        return { error: 'বই মোছার সময় একটি সমস্যা হয়েছে।' };
    }

    // ৪. ক্যাশ রিভ্যালিডেট করুন যাতে পেজটি রিফ্রেশ হয়
    revalidatePath(`/shop/${shopSlug}`);

    return { success: 'বইটি সফলভাবে মুছে ফেলা হয়েছে।' };
}
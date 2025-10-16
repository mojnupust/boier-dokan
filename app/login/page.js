'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '../../src/lib/supabase/client'; // <-- সংশোধিত এবং সঠিক ইম্পোর্ট পাথ

export default function LoginPage() {
    const supabase = createClient();
    const router = useRouter();
    const [redirectUrl, setRedirectUrl] = useState(null);

    useEffect(() => {
        setRedirectUrl(`${window.location.origin}/auth/callback`);

        const checkUserAndRedirect = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // যদি ব্যবহারকারী আগে থেকেই লগইন করা থাকেন, তাহলে তাকে আর লগইন পেজ না দেখিয়ে
                // সরাসরি হোমপেজে পাঠিয়ে দেওয়া হবে।
                router.replace('/'); // .push() এর বদলে .replace() ব্যবহার করা ভালো, এতে ব্রাউজার হিস্ট্রিতে লগইন পেজটি থাকবে না。
                router.refresh(); // ensure RootLayout re-renders with new session
            }
        };

        checkUserAndRedirect();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN') {
                router.replace('/'); // go home
                router.refresh();     // re-render server components/layout now
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, [supabase, router]);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">বইয়ের দোকানে স্বাগতম</h1>
                    <p className="text-gray-600">আপনার অ্যাকাউন্ট দিয়ে শুরু করুন</p>
                </div>
                {redirectUrl && (
                    <Auth
                        supabaseClient={supabase}
                        appearance={{ theme: ThemeSupa }}
                        theme="light"
                        providers={[]}
                        redirectTo={redirectUrl}
                    />
                )}
            </div>
        </div>
    );
}
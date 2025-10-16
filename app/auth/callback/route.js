import { NextResponse } from 'next/server'
import { createClient } from '../../../src/lib/supabase/server'

export async function GET(request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        const supabase = createClient()
        await supabase.auth.exchangeCodeForSession(code)
    }

    // সফলভাবে সেশন তৈরি হওয়ার পর ব্যবহারকারীকে হোমপেজে পাঠানো হচ্ছে।
    return NextResponse.redirect(requestUrl.origin)
}
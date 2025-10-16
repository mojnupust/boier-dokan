import { NextResponse } from 'next/server'
import { createClient } from '../../../src/lib/supabase/server'

export async function POST(request) {
    const supabase = createClient()

    // Check if we have a session
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
        await supabase.auth.signOut()
    }

    return NextResponse.redirect(new URL('/login', request.url), {
        status: 302,
    })
}
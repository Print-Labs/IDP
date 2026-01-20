'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import sql from '@/lib/db'
import { encrypt } from '@/lib/auth'
import { google, github } from '@/lib/oauth'
import { generateState, generateCodeVerifier } from 'arctic'

export async function login(formData: FormData) {
    const email = formData.get('email') as string

    // Check if user exists
    const users = await sql`
        SELECT * FROM profile WHERE email = ${email}
    `

    let user = users[0];

    if (!user) {
        console.log("User not found, redirecting to signup")
        // Optionally redirect to signup or return error
        // redirect('/signup') 
        // For now, let's error or return
        return;
    }

    console.log("User logged in:", user)

    // Create session
    const session = await encrypt({ user })
    const cookieStore = await cookies()

    cookieStore.set('session', session, {
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        path: '/',
    })

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const email = formData.get('email') as string
    // const name = formData.get('name') as string 

    let user;

    try {
        // Insert and return the new user
        // We use ON CONFLICT DO UPDATE to ensure we get a return value even if row exists
        const result = await sql`
            INSERT INTO profile (id, email, role, auth_id)
            VALUES (gen_random_uuid(), ${email}, 'customer', gen_random_uuid()::text)
            ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
            RETURNING *
        `
        user = result[0]
    } catch (e) {
        console.error("Error creating user:", e)
        // Fallback: try to find existing
        const existing = await sql`SELECT * FROM profile WHERE email = ${email}`
        user = existing[0]
    }

    if (!user) {
        console.error("Failed to create or find user")
        return
    }

    console.log("User signed up:", user)

    const session = await encrypt({ user })
    const cookieStore = await cookies()

    cookieStore.set('session', session, {
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        path: '/',
    })

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signInWithGoogle() {
    const state = generateState()
    const codeVerifier = generateCodeVerifier()
    const url = await google.createAuthorizationURL(state, codeVerifier, ["profile", "email"])

    const cookieStore = await cookies()
    cookieStore.set("google_oauth_state", state, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: "lax"
    })
    cookieStore.set("google_code_verifier", codeVerifier, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: "lax"
    })

    redirect(url.toString())
}

export async function signInWithGithub() {
    const state = generateState()
    const url = await github.createAuthorizationURL(state, ["user:email"])

    const cookieStore = await cookies()
    cookieStore.set("github_oauth_state", state, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: "lax"
    })

    redirect(url.toString())
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
    redirect('/login')
}

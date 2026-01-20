import { google } from "@/lib/oauth";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { encrypt } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
        return new NextResponse("Invalid request", { status: 400 });
    }

    const cookieStore = await cookies();
    const storedState = cookieStore.get("google_oauth_state")?.value;
    const codeVerifier = cookieStore.get("google_code_verifier")?.value;

    if (!storedState || !codeVerifier || storedState !== state) {
        return new NextResponse("Invalid state", { status: 400 });
    }

    try {
        const tokens = await google.validateAuthorizationCode(code, codeVerifier);
        const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
            headers: {
                Authorization: `Bearer ${tokens.accessToken()}`
            }
        });
        const googleUser = await response.json();

        // Check if user exists
        const existingUsers = await sql`SELECT * FROM profile WHERE email = ${googleUser.email}`;
        let user = existingUsers[0];

        if (!user) {
            // Create user
            const result = await sql`
                INSERT INTO profile (id, email, role, auth_id)
                VALUES (gen_random_uuid(), ${googleUser.email}, 'customer', gen_random_uuid()::text)
                ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
                RETURNING *
            `
            user = result[0];
        }

        const session = await encrypt({ user });

        cookieStore.set("session", session, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            path: "/"
        });

        // Clean up OAuth cookies
        cookieStore.delete("google_oauth_state");
        cookieStore.delete("google_code_verifier");

        return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch (e) {
        console.error("OAuth error:", e);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

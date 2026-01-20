import { github } from "@/lib/oauth";
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
    const storedState = cookieStore.get("github_oauth_state")?.value;

    if (!storedState || storedState !== state) {
        return new NextResponse("Invalid state", { status: 400 });
    }

    try {
        const tokens = await github.validateAuthorizationCode(code);
        const accessToken = tokens.accessToken();

        const userResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const githubUser = await userResponse.json();

        let email = githubUser.email;

        // If email is private, fetch it from emails endpoint
        if (!email) {
            const emailsResponse = await fetch("https://api.github.com/user/emails", {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            const emails = await emailsResponse.json();
            const primaryEmail = emails.find((e: any) => e.primary && e.verified);
            email = primaryEmail ? primaryEmail.email : null;
        }

        if (!email) {
            return new NextResponse("No email found", { status: 400 });
        }

        // Check if user exists
        const existingUsers = await sql`SELECT * FROM profile WHERE email = ${email}`;
        let user = existingUsers[0];

        if (!user) {
            // Create user
            const result = await sql`
                INSERT INTO profile (id, email, role, auth_id)
                VALUES (gen_random_uuid(), ${email}, 'customer', gen_random_uuid()::text)
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
        cookieStore.delete("github_oauth_state");

        return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch (e) {
        console.error("OAuth error:", e);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

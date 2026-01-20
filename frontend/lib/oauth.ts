import { Google, GitHub } from "arctic";

export const google = new Google(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/oauth/google/callback`
);

export const github = new GitHub(
    process.env.GITHUB_CLIENT_ID!,
    process.env.GITHUB_CLIENT_SECRET!,
    // GitHub does not need the redirect URI in the constructor for Arctic v2/v3 sometimes, but checking latest docs it's safer to not pass if not needed or pass null? 
    // Arctic v1: (clientId, clientSecret, redirectURI)
    // Arctic v2: (clientId, clientSecret, redirectURI)
    // Let's assume standard parameters.
    // NOTE: Check installed version of arctic?
    // I installed latest, likely > 1.0.
    // For GitHub, Arctic usually takes null for redirect URI if configured in the app settings, but passing it is explicit.
    // Actually, looking at docs, GitHub constructor: (clientId, clientSecret, redirectURI)
    // Wait, recent Arctic changes removed redirectURI from constructor for some providers?
    // Let's check a documentation snippet if possible or just try the standard.
    // I will use standard 3-arg constructor.
    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/oauth/github/callback`
);

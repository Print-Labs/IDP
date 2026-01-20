import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { signup } from "../login/actions";

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Link href="/login" className="absolute top-8 left-8 text-white/50 hover:text-white flex items-center gap-2 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Login
            </Link>

            <Card className="glass-panel w-full max-w-md border border-white/10">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold text-white">Join PandaLabs</CardTitle>
                    <CardDescription className="text-white/40">
                        Create your operator credentials.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                name="email"
                                type="email"
                                placeholder="student@campus.edu"
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-sky-500/50 focus:ring-sky-500/20"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                name="password"
                                type="password"
                                placeholder="Create Password"
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-sky-500/50 focus:ring-sky-500/20"
                                required
                                minLength={6}
                            />
                        </div>
                        <Button formAction={signup} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-medium">
                            Initialize Profile
                        </Button>
                    </form>
                    <div className="text-center text-sm">
                        <Link href="/login" className="text-white/40 hover:text-white transition-colors">
                            Already have an identity? Login
                        </Link>
                    </div>
                </CardContent>
                <CardFooter className="justify-center border-t border-white/5 pt-6">
                    <p className="text-xs text-white/30 text-center">
                        By registering, you agree to the <br />
                        Campus Manufacturing Protocols.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

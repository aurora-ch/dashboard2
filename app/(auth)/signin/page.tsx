"use client";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SetupCheck } from "@/components/setup-check";
import { useState } from "react";
import { 
  Mail, 
  ArrowRight, 
  Sparkles, 
  Bot, 
  Shield, 
  Zap,
  CheckCircle,
  AlertCircle
} from "lucide-react";

function SignInForm() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function signInWithEmail() {
    if (!email) return;
    
    setIsLoading(true);
    setStatus(null);
    
    // Use root URL for OAuth handling
    const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL 
      ? process.env.NEXT_PUBLIC_SITE_URL
      : process.env.NODE_ENV === 'development' 
        ? 'http://10.50.31.119:3000'
        : window.location.origin;
    
    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: {
        emailRedirectTo: `${redirectUrl}/auth/callback?next=/dashboard`
      }
    });
    setStatus(error ? error.message : "Check your email for the magic link!");
    setIsLoading(false);
  }

  async function signInWithGoogle() {
    setIsLoading(true);
    setStatus(null);
    
    // Use root URL for OAuth handling
    const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL 
      ? process.env.NEXT_PUBLIC_SITE_URL
      : process.env.NODE_ENV === 'development' 
        ? 'http://10.50.31.119:3000'
        : window.location.origin;
    
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: "google",
      options: {
        redirectTo: `${redirectUrl}/auth/callback?next=/dashboard`
      }
    });
    if (error) setStatus(error.message);
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 aurora-shimmer" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl aurora-float" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl aurora-float aurora-delay-2" />
      
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent aurora-glow mb-4">
              <Bot className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Welcome to Aurora</h1>
            <p className="text-muted-foreground mt-2">Sign in to your AI Receptionist dashboard</p>
          </div>

          <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-card/80">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Sign In</CardTitle>
              <CardDescription className="text-center">
                Choose your preferred sign-in method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Sign In */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={signInWithEmail} 
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4" />
                      Send Magic Link
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  )}
                </Button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In */}
              <Button 
                variant="outline" 
                onClick={signInWithGoogle}
                className="w-full"
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              {/* Status Message */}
              {status && (
                <div className={`flex items-center space-x-2 p-3 rounded-lg text-sm ${
                  status.includes('Check your email') 
                    ? 'bg-accent/10 text-accent border border-accent/20' 
                    : 'bg-destructive/10 text-destructive border border-destructive/20'
                }`}>
                  {status.includes('Check your email') ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span>{status}</span>
                </div>
              )}

              {/* Features */}
              <div className="space-y-3 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">What you&apos;ll get:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-3 w-3 text-accent" />
                    <span>Secure Access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-3 w-3 text-accent" />
                    <span>Lightning Fast</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Bot className="h-3 w-3 text-accent" />
                    <span>AI Powered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-3 w-3 text-accent" />
                    <span>24/7 Available</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-muted-foreground">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <SetupCheck>
      <SignInForm />
    </SetupCheck>
  );
}



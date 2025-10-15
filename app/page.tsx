"use client";

import { SetupCheck } from "@/components/setup-check";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  Bot, 
  BarChart3, 
  Shield, 
  Zap, 
  Users, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Star,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { User } from "@supabase/supabase-js";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get('code');
      if (code) {
        try {
          console.log('Handling OAuth callback with code:', code);
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('OAuth callback error:', error);
            return;
          }
          if (data.user) {
            console.log('OAuth successful, redirecting to dashboard');
            // Create user profile if it doesn't exist
            try {
              const { data: profile } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();
              
              if (!profile) {
                // Create profile if it doesn't exist
                await supabase
                  .from('user_profiles')
                  .insert({
                    id: data.user.id,
                    full_name: data.user.user_metadata?.full_name || data.user.email || 'User',
                    avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
                  });
              }
            } catch (profileError) {
              console.error('Error creating user profile:', profileError);
            }
            
            // Redirect to dashboard after successful authentication
            router.push('/dashboard');
            return;
          }
        } catch (error) {
          console.error('OAuth callback error:', error);
        }
      }
    };

    const checkUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setUser(authUser);
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
    checkUser();
  }, [searchParams, supabase, router]);

  return (
    <div className="min-h-screen">
      {/* Header with Profile */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-lg font-bold text-foreground">A</span>
                </div>
                <span className="text-xl font-bold text-foreground">Aurora</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {!loading && user && (
                <ProfileDropdown />
              )}
              {!loading && !user && (
                <Link href="/signin">
                  <Button variant="outline" className="glass-button">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 aurora-shimmer" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl aurora-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl aurora-float aurora-delay-2" />
        
        <div className="relative z-10 px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <Badge className="mb-6 bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Receptionist
              </Badge>
              
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Aurora
                </span>
              </h1>
              
              <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-3xl mx-auto">
                Transform your business with our intelligent AI receptionist. Handle calls, manage appointments, 
                and provide 24/7 customer service with the power of artificial intelligence.
              </p>
              
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground">
                  <Link href="/signin">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Powerful Features
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to revolutionize your customer service
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Bot,
                title: "AI Receptionist",
                description: "Intelligent call handling with natural language processing",
                color: "from-primary to-purple-600"
              },
              {
                icon: Phone,
                title: "24/7 Availability",
                description: "Never miss a call with round-the-clock service",
                color: "from-accent to-green-600"
              },
              {
                icon: BarChart3,
                title: "Analytics Dashboard",
                description: "Track performance and gain insights from call data",
                color: "from-blue-500 to-cyan-600"
              },
              {
                icon: Shield,
                title: "Secure & Reliable",
                description: "Enterprise-grade security and 99.9% uptime",
                color: "from-orange-500 to-red-600"
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Instant response times and seamless integration",
                color: "from-yellow-500 to-orange-600"
              },
              {
                icon: Users,
                title: "Multi-tenant",
                description: "Perfect for agencies managing multiple clients",
                color: "from-pink-500 to-purple-600"
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50">
                <CardContent className="p-6">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r ${feature.color} mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Calls Handled", value: "10,000+", icon: Phone },
              { label: "Uptime", value: "99.9%", icon: CheckCircle },
              { label: "Response Time", value: "< 2s", icon: Clock },
              { label: "Happy Customers", value: "500+", icon: Star }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-accent mb-4">
                  <stat.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-accent p-8 sm:p-16">
            <div className="relative z-10 text-center">
              <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
                Ready to Transform Your Business?
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/90">
                Join thousands of businesses already using Aurora AI Receptionist
              </p>
              <div className="mt-8">
                <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  <Link href="/signin">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          </div>
      </div>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <SetupCheck>
      <HomeContent />
    </SetupCheck>
  );
}
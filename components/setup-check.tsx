"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SetupCheck({ children }: { children: React.ReactNode }) {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if environment variables are properly configured
    const checkConfiguration = async () => {
      try {
        // Try to create a Supabase client to test configuration
        const { createSupabaseBrowserClient } = await import("@/lib/supabase-browser");
        const supabase = createSupabaseBrowserClient();
        
        // Test the connection with a simple query that should work with valid credentials
        const { error } = await supabase.from('_supabase_migrations').select('*').limit(1);
        
        // If we get an error that suggests invalid credentials, show config error
        if (error && (error.message.includes('Invalid API key') || error.message.includes('Invalid URL') || error.message.includes('JWT'))) {
          setIsConfigured(false);
          setError("Supabase environment variables are not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Render environment variables.");
          return;
        }
        
        // If we get here, the configuration is working (even if the table doesn't exist, we got a proper response)
        setIsConfigured(true);
      } catch (err) {
        // If there's any error, assume it's a configuration issue
        console.error('Configuration check failed:', err);
        setIsConfigured(false);
        setError("Supabase environment variables are not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Render environment variables.");
      }
    };

    // Add a timeout to the entire check to prevent hanging
    const timeoutId = setTimeout(() => {
      if (isConfigured === null) {
        setIsConfigured(false);
        setError("Configuration check timed out. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Render environment variables.");
      }
    }, 2000);

    checkConfiguration().finally(() => {
      clearTimeout(timeoutId);
    });
  }, []);

  if (isConfigured === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Checking configuration...</p>
        </div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-red-600">Configuration Required</CardTitle>
            <CardDescription>
              The application needs to be configured before it can run properly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold">To fix this issue:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Go to your <a href="https://dashboard.render.com/web/srv-d3nm6o9gv73c73cf13o0" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Render Dashboard</a></li>
                <li>Navigate to the &quot;Environment&quot; tab</li>
                <li>Add these environment variables:
                  <pre className="bg-gray-100 p-2 rounded mt-1 text-xs">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here`}
                  </pre>
                </li>
                <li>Get these values from your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Dashboard</a></li>
                <li>Redeploy your service after adding the environment variables</li>
              </ol>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                Retry
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                className="flex-1"
              >
                Open Supabase Dashboard
              </Button>
            </div>

            <div className="text-xs text-gray-500 mt-4">
              <p>For detailed setup instructions, see the <code>SETUP.md</code> file in the project root.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

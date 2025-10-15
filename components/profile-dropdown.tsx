"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Settings, 
  LogOut, 
  Bot, 
  ChevronDown, 
  Activity,
  Shield
} from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  organization_id?: string;
}

interface AgentInfo {
  id: string;
  business_name: string;
  status: string;
  status_message?: string;
  created_at: string;
}

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createSupabaseBrowserClient();

  const loadAgentInfo = useCallback(async (organizationId: string) => {
    try {
      const { data } = await supabase
        .from('receptionist_settings')
        .select('id, business_name, status, status_message, created_at')
        .eq('organization_id', organizationId)
        .single();

      if (data) {
        setAgent({
          id: data.id,
          business_name: data.business_name,
          status: data.status,
          status_message: data.status_message,
          created_at: data.created_at
        });
      }
    } catch (error) {
      console.error('Error loading agent info:', error);
    }
  }, [supabase]);

  const loadUserProfile = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        // Try to get user profile from database, but don't fail if table doesn't exist
        let profile = null;
        try {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
          profile = profileData;
        } catch (profileError) {
          console.log('User profiles table not available, using auth data only');
        }

        if (profile) {
          setUser({
            id: authUser.id,
            full_name: profile.full_name || authUser.user_metadata?.full_name || 'User',
            email: authUser.email || '',
            avatar_url: profile.avatar_url || authUser.user_metadata?.avatar_url,
            organization_id: profile.organization_id
          });

          // Load agent information if organization exists
          if (profile.organization_id) {
            loadAgentInfo(profile.organization_id);
          }
        } else {
          // Use auth data directly if profile table doesn't exist
          setUser({
            id: authUser.id,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
            email: authUser.email || '',
            avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture
          });
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase, loadAgentInfo]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);


  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      window.location.href = '/signin';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'ready': return 'bg-muted/50 text-foreground border-border';
      case 'problem': return 'bg-muted/30 text-muted-foreground border-border';
      case 'maintenance': return 'bg-muted/40 text-muted-foreground border-border';
      default: return 'bg-muted/30 text-muted-foreground border-border';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        <div className="h-4 w-4 rounded bg-muted animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <Button asChild variant="outline">
        <a href="/signin">Sign In</a>
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="flex items-center space-x-2 h-10 px-3 border-border/50 hover:bg-muted/50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="relative">
          <div className="h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center">
            {user.avatar_url ? (
              <Image 
                src={user.avatar_url} 
                alt={user.full_name}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
                onError={(e) => {
                  // Fallback to default icon if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <User className={`h-4 w-4 text-muted-foreground ${user.avatar_url ? 'hidden' : ''}`} />
          </div>
          {/* Green dot indicator */}
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-foreground">{user.full_name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute right-0 top-12 z-20 w-80 shadow-lg border-border/30 bg-card/98 backdrop-blur-sm">
            <CardContent className="p-4 space-y-4">
              {/* User Info */}
              <div className="flex items-center space-x-3 pb-3 border-b border-border/50">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-muted border border-border flex items-center justify-center">
                    {user.avatar_url ? (
                      <Image 
                        src={user.avatar_url} 
                        alt={user.full_name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full object-cover"
                        onError={(e) => {
                          // Fallback to default icon if image fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <User className={`h-6 w-6 text-muted-foreground ${user.avatar_url ? 'hidden' : ''}`} />
                  </div>
                  {/* Green dot indicator */}
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{user.full_name}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>

              {/* Agent Status */}
              {agent && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground flex items-center">
                      <Bot className="h-4 w-4 mr-2 text-primary" />
                      AI Agent
                    </h4>
                    <Badge className={getStatusColor(agent.status)}>
                      {agent.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{agent.business_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(agent.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {agent.status_message && (
                      <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                        {agent.status_message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-3 w-3 text-accent" />
                      <span>Active</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-3 w-3 text-primary" />
                      <span>Secure</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="space-y-2 pt-3 border-t border-border">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/receptionist';
                  }}
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Manage Agent
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/settings';
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

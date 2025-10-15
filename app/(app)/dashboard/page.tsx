"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/dashboard-layout";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Phone, PhoneOff, CheckCircle, AlertCircle, Clock, DollarSign } from "lucide-react";

interface DailyMetrics {
  handled_calls: number;
  missed_calls: number;
  total_duration: number;
  total_cost: number;
  actions_taken: number;
}

interface CallLog {
  id: string;
  caller_phone: string;
  call_duration: number;
  call_status: 'handled' | 'missed' | 'failed';
  action_taken: string;
  summary: string;
  created_at: string;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DailyMetrics | null>(null);
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ status: string; message?: string }>({ status: 'ready' });

  const supabase = createSupabaseBrowserClient();

  const loadDashboardData = useCallback(async () => {
    console.log('📊 Starting dashboard data load...');
    try {
      // Load today's metrics
      const today = new Date().toISOString().split('T')[0];
      console.log('📅 Loading data for date:', today);
      
      // Try to load metrics, but don't fail if table doesn't exist
      let metricsData = null;
      try {
        console.log('📈 Attempting to load daily metrics...');
        const { data, error } = await supabase
          .from('daily_metrics')
          .select('*')
          .eq('date', today)
          .single();
        
        if (!error) {
          metricsData = data;
          console.log('✅ Daily metrics loaded:', metricsData);
        } else {
          console.log('⚠️ Daily metrics error:', error.message);
        }
      } catch (metricsError) {
        console.log('⚠️ Daily metrics table not available:', metricsError.message);
      }

      // Try to load calls, but don't fail if table doesn't exist
      let callsData = null;
      try {
        const { data, error } = await supabase
          .from('call_logs')
          .select('*')
          .gte('created_at', `${today}T00:00:00`)
          .lte('created_at', `${today}T23:59:59`)
          .order('created_at', { ascending: false });
        
        if (!error) {
          callsData = data;
        }
      } catch (callsError) {
        console.log('Call logs table not available:', callsError);
      }

      // Try to load receptionist status, but don't fail if table doesn't exist
      let receptionistData = null;
      try {
        const { data, error } = await supabase
          .from('receptionist_settings')
          .select('status, status_message')
          .single();
        
        if (!error) {
          receptionistData = data;
        }
      } catch (receptionistError) {
        console.log('Receptionist settings table not available:', receptionistError);
      }

      console.log('📊 Setting dashboard data...', {
        metrics: metricsData || 'default',
        callsCount: callsData?.length || 0,
        status: receptionistData?.status || 'ready'
      });
      
      setMetrics(metricsData || {
        handled_calls: 0,
        missed_calls: 0,
        total_duration: 0,
        total_cost: 0,
        actions_taken: 0
      });
      setCalls(callsData || []);
      setStatus({
        status: receptionistData?.status || 'ready',
        message: receptionistData?.status_message
      });
      
      console.log('✅ Dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
      // Set default values on error
      setMetrics({
        handled_calls: 0,
        missed_calls: 0,
        total_duration: 0,
        total_cost: 0,
        actions_taken: 0
      });
      setCalls([]);
      setStatus({
        status: 'ready',
        message: 'System ready'
      });
    } finally {
      console.log('🏁 Dashboard loading complete, setting loading to false');
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    console.log('🏠 Dashboard page mounted, starting data load...');
    loadDashboardData();
    
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('⏰ Dashboard loading timeout, setting default values');
        setLoading(false);
        setMetrics({
          handled_calls: 0,
          missed_calls: 0,
          total_duration: 0,
          total_cost: 0,
          actions_taken: 0
        });
        setCalls([]);
        setStatus({
          status: 'ready',
          message: 'System ready'
        });
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loadDashboardData, loading]);

  function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'ready': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'problem': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'maintenance': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  }

  function getCallStatusIcon(status: string) {
    switch (status) {
      case 'handled': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'missed': return <PhoneOff className="h-4 w-4 text-red-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return <Phone className="h-4 w-4 text-gray-500" />;
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border bg-background/60 p-4 backdrop-blur animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
      {/* Status Card */}
      <Card className="bg-background/60 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${
              status.status === 'ready' ? 'bg-green-500' : 
              status.status === 'problem' ? 'bg-red-500' : 'bg-yellow-500'
            }`} />
            AI Receptionist Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge className={getStatusColor(status.status)}>
            {status.status.toUpperCase()}
          </Badge>
          {status.message && (
            <p className="mt-2 text-sm opacity-80">{status.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-background/60 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Handled Calls</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.handled_calls || 0}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card className="bg-background/60 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missed Calls</CardTitle>
            <PhoneOff className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.missed_calls || 0}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card className="bg-background/60 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.handled_calls ? formatDuration(Math.floor(metrics.total_duration / metrics.handled_calls)) : '0:00'}
            </div>
            <p className="text-xs text-muted-foreground">Per call</p>
          </CardContent>
        </Card>

        <Card className="bg-background/60 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_cost?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">Credits</p>
          </CardContent>
        </Card>
      </div>

      {/* Call Summary */}
      <Card className="bg-background/60 backdrop-blur">
        <CardHeader>
          <CardTitle>Today&apos;s Call Summary</CardTitle>
          <CardDescription>
            {calls.length} calls handled today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({calls.length})</TabsTrigger>
              <TabsTrigger value="handled">Handled ({calls.filter(c => c.call_status === 'handled').length})</TabsTrigger>
              <TabsTrigger value="missed">Missed ({calls.filter(c => c.call_status === 'missed').length})</TabsTrigger>
              <TabsTrigger value="failed">Failed ({calls.filter(c => c.call_status === 'failed').length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <div className="space-y-3">
                {calls.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No calls today</p>
                ) : (
                  calls.map((call) => (
                    <div key={call.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        {getCallStatusIcon(call.call_status)}
                        <div>
                          <p className="font-medium">{call.caller_phone || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDuration(call.call_duration)} • {new Date(call.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={call.call_status === 'handled' ? 'default' : 'secondary'}>
                          {call.call_status}
                        </Badge>
                        {call.action_taken && (
                          <p className="text-xs text-muted-foreground mt-1">{call.action_taken}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="handled" className="mt-4">
              <div className="space-y-3">
                {calls.filter(c => c.call_status === 'handled').map((call) => (
                  <div key={call.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="font-medium">{call.caller_phone || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDuration(call.call_duration)} • {new Date(call.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {call.action_taken && (
                        <p className="text-sm">{call.action_taken}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="missed" className="mt-4">
              <div className="space-y-3">
                {calls.filter(c => c.call_status === 'missed').map((call) => (
                  <div key={call.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <PhoneOff className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="font-medium">{call.caller_phone || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(call.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="failed" className="mt-4">
              <div className="space-y-3">
                {calls.filter(c => c.call_status === 'failed').map((call) => (
                  <div key={call.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <div>
                        <p className="font-medium">{call.caller_phone || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(call.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
}



"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Play, Pause, Download, Calendar, Clock, Phone } from "lucide-react";

interface CallLog {
  id: string;
  vapi_call_id: string;
  caller_phone: string;
  call_duration: number;
  call_status: 'handled' | 'missed' | 'failed';
  action_taken: string;
  summary: string;
  transcript: string;
  audio_url: string;
  created_at: string;
}

interface VapiCall {
  id: string;
  status: string;
  transcript: string;
  recordingUrl: string;
  duration: number;
  cost: number;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
}

export default function LogsPage() {
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [vapiCall, setVapiCall] = useState<VapiCall | null>(null);
  const [loading, setLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState('today');

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    loadCallLogs();
  }, [dateFilter]);

  async function loadCallLogs() {
    try {
      let dateFilterQuery;
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          const today = now.toISOString().split('T')[0];
          dateFilterQuery = supabase
            .from('call_logs')
            .select('*')
            .gte('created_at', `${today}T00:00:00`)
            .lte('created_at', `${today}T23:59:59`);
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilterQuery = supabase
            .from('call_logs')
            .select('*')
            .gte('created_at', weekAgo.toISOString());
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateFilterQuery = supabase
            .from('call_logs')
            .select('*')
            .gte('created_at', monthAgo.toISOString());
          break;
        default:
          dateFilterQuery = supabase.from('call_logs').select('*');
      }

      const { data, error } = await dateFilterQuery.order('created_at', { ascending: false });
      
      if (error) throw error;
      setCalls(data || []);
    } catch (error) {
      console.error('Error loading call logs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadVapiCallDetails(callLog: CallLog) {
    if (!callLog.vapi_call_id) return;
    
    try {
      // This would integrate with Vapi API to get detailed call information
      // For now, we'll simulate the data structure
      const mockVapiCall: VapiCall = {
        id: callLog.vapi_call_id,
        status: callLog.call_status,
        transcript: callLog.transcript || "No transcript available",
        recordingUrl: callLog.audio_url || "",
        duration: callLog.call_duration,
        cost: 0.05, // Mock cost
        messages: [
          { role: 'user', content: 'Hello, I need help with...', timestamp: 0 },
          { role: 'assistant', content: 'Hello! I\'d be happy to help you. What can I do for you today?', timestamp: 2 },
          { role: 'user', content: 'I want to know your hours', timestamp: 5 },
          { role: 'assistant', content: 'We\'re open Monday to Friday from 9 AM to 6 PM. Is there anything else I can help you with?', timestamp: 7 },
        ]
      };
      
      setVapiCall(mockVapiCall);
    } catch (error) {
      console.error('Error loading Vapi call details:', error);
    }
  }

  function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'handled': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'missed': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'failed': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  }

  function toggleAudioPlayback(audioUrl: string) {
    if (playingAudio === audioUrl) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(audioUrl);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-background/60 p-4 backdrop-blur animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-background/60 backdrop-blur">
        <CardHeader>
          <CardTitle>Call Logs</CardTitle>
          <CardDescription>View and analyze your AI receptionist conversations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              variant={dateFilter === 'today' ? 'default' : 'outline'}
              onClick={() => setDateFilter('today')}
            >
              Today
            </Button>
            <Button 
              variant={dateFilter === 'week' ? 'default' : 'outline'}
              onClick={() => setDateFilter('week')}
            >
              This Week
            </Button>
            <Button 
              variant={dateFilter === 'month' ? 'default' : 'outline'}
              onClick={() => setDateFilter('month')}
            >
              This Month
            </Button>
            <Button 
              variant={dateFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setDateFilter('all')}
            >
              All Time
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Call List */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-background/60 backdrop-blur">
          <CardHeader>
            <CardTitle>Recent Calls ({calls.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {calls.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No calls found</p>
              ) : (
                calls.map((call) => (
                  <div 
                    key={call.id} 
                    className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                      selectedCall?.id === call.id ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      setSelectedCall(call);
                      loadVapiCallDetails(call);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{call.caller_phone || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(call.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(call.call_status)}>
                          {call.call_status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDuration(call.call_duration)}
                        </p>
                      </div>
                    </div>
                    {call.action_taken && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Action: {call.action_taken}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Call Details */}
        <Card className="bg-background/60 backdrop-blur">
          <CardHeader>
            <CardTitle>Call Details</CardTitle>
            {selectedCall && (
              <CardDescription>
                {selectedCall.caller_phone} • {formatDate(selectedCall.created_at)}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {!selectedCall ? (
              <p className="text-center text-muted-foreground py-8">
                Select a call to view details
              </p>
            ) : (
              <div className="space-y-4">
                {/* Call Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">{formatDuration(selectedCall.call_duration)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(selectedCall.call_status)}>
                      {selectedCall.call_status}
                    </Badge>
                  </div>
                </div>

                {/* Audio Player */}
                {selectedCall.audio_url && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleAudioPlayback(selectedCall.audio_url)}
                    >
                      {playingAudio === selectedCall.audio_url ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">Audio Recording</span>
                  </div>
                )}

                {/* Transcript */}
                <div>
                  <h4 className="font-medium mb-2">Transcript</h4>
                  <div className="bg-muted/50 rounded-lg p-3 text-sm max-h-48 overflow-y-auto">
                    {selectedCall.transcript || "No transcript available"}
                  </div>
                </div>

                {/* Summary */}
                {selectedCall.summary && (
                  <div>
                    <h4 className="font-medium mb-2">Summary</h4>
                    <p className="text-sm text-muted-foreground">{selectedCall.summary}</p>
                  </div>
                )}

                {/* Action Taken */}
                {selectedCall.action_taken && (
                  <div>
                    <h4 className="font-medium mb-2">Action Taken</h4>
                    <p className="text-sm text-muted-foreground">{selectedCall.action_taken}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



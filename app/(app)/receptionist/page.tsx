"use client";
import { useState } from "react";
import axios from "axios";
import { GooglePlacesAutocomplete } from "@/components/google-places-autocomplete";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Bot, Phone, MapPin, Globe, PhoneCall, CheckCircle, AlertCircle, Sparkles } from "lucide-react";

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  website?: string;
  phone?: string;
  types: string[];
}

interface AgentResult {
  agentId?: string;
  success: boolean;
  message: string;
}

export default function ReceptionistPage() {
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [agentResult, setAgentResult] = useState<AgentResult | null>(null);
  const [isCalling, setIsCalling] = useState(false);

  async function createAgent() {
    if (!selectedPlace) return;
    
    setIsCreatingAgent(true);
    setAgentResult(null);
    
    try {
      const payload = {
        input: `${selectedPlace.name} - ${selectedPlace.formatted_address}`,
        website: selectedPlace.website || "",
        name: selectedPlace.name,
        address: selectedPlace.formatted_address,
        place_id: selectedPlace.place_id,
        phone: selectedPlace.phone || "",
        types: selectedPlace.types.join(", ")
      };

      const { data } = await axios.post("/api/create-agent", payload);
      
      setAgentResult({
        agentId: data.agentId,
        success: data.success,
        message: data.message || "Agent created successfully"
      });
    } catch (e: unknown) {
      setAgentResult({
        success: false,
        message: e instanceof Error ? e.message : "Failed to create agent"
      });
    } finally {
      setIsCreatingAgent(false);
    }
  }

  async function makeCall() {
    if (!agentResult?.agentId) return;
    
    setIsCalling(true);
    try {
      const { data } = await axios.post("/api/call", {
        agentId: agentResult.agentId
      });
      console.log("Call initiated:", data);
    } catch (e: unknown) {
      console.error("Call failed:", e);
    } finally {
      setIsCalling(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Receptionist</h1>
            <p className="text-muted-foreground">Configure and manage your intelligent call handling system</p>
          </div>
          <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <Bot className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
        </div>

        <Card className="bg-background/60 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-primary" />
              Setup Your AI Receptionist
            </CardTitle>
            <CardDescription>
              Find your business using Google Places and create your AI receptionist
            </CardDescription>
          </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Search for your business</label>
            <GooglePlacesAutocomplete
              onPlaceSelect={setSelectedPlace}
              className="mt-2"
            />
          </div>

          {selectedPlace && (
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{selectedPlace.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedPlace.formatted_address}</p>
                  </div>
                </div>
                <Badge variant="secondary">Selected</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedPlace.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-accent" />
                    <span className="text-muted-foreground">{selectedPlace.phone}</span>
                  </div>
                )}
                {selectedPlace.website && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Globe className="h-4 w-4 text-accent" />
                    <span className="text-muted-foreground">{selectedPlace.website}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-1">
                {selectedPlace.types.slice(0, 3).map((type) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Button 
            onClick={createAgent} 
            disabled={!selectedPlace || isCreatingAgent}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground"
          >
            {isCreatingAgent ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                Creating Agent...
              </div>
            ) : (
              <div className="flex items-center">
                <Bot className="w-4 h-4 mr-2" />
                Create AI Receptionist
              </div>
            )}
          </Button>

          {agentResult && (
            <div className={`rounded-lg p-4 border ${
              agentResult.success 
                ? "bg-accent/10 border-accent/20" 
                : "bg-destructive/10 border-destructive/20"
            }`}>
              <div className="flex items-center space-x-2">
                {agentResult.success ? (
                  <CheckCircle className="h-4 w-4 text-accent" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                <p className={`text-sm ${
                  agentResult.success ? "text-accent" : "text-destructive"
                }`}>
                  {agentResult.message}
                </p>
              </div>
              {agentResult.agentId && (
                <p className="mt-2 text-xs text-muted-foreground font-mono">
                  Agent ID: {agentResult.agentId}
                </p>
              )}
            </div>
          )}

          {agentResult?.success && agentResult.agentId && (
            <Button 
              onClick={makeCall} 
              disabled={isCalling}
              variant="outline"
              className="w-full"
            >
              {isCalling ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Calling...
                </div>
              ) : (
                <div className="flex items-center">
                  <PhoneCall className="w-4 h-4 mr-2" />
                  Test Call
                </div>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
}



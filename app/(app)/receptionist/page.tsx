"use client";
import { useState } from "react";
import axios from "axios";
import { GooglePlacesAutocomplete } from "@/components/google-places-autocomplete";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <div className="space-y-6">
      <Card className="bg-background/60 backdrop-blur">
        <CardHeader>
          <CardTitle>Setup Your AI Receptionist</CardTitle>
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
            <div className="rounded-lg border bg-muted/50 p-4">
              <h3 className="font-semibold">{selectedPlace.name}</h3>
              <p className="text-sm opacity-80">{selectedPlace.formatted_address}</p>
              {selectedPlace.phone && (
                <p className="text-sm opacity-80">📞 {selectedPlace.phone}</p>
              )}
              {selectedPlace.website && (
                <p className="text-sm opacity-80">🌐 {selectedPlace.website}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedPlace.types.slice(0, 3).map((type) => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {type.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Button 
            onClick={createAgent} 
            disabled={!selectedPlace || isCreatingAgent}
            className="w-full"
          >
            {isCreatingAgent ? "Creating Agent..." : "Create AI Receptionist"}
          </Button>

          {agentResult && (
            <div className={`rounded-lg p-4 ${
              agentResult.success 
                ? "bg-green-500/10 border border-green-500/20" 
                : "bg-red-500/10 border border-red-500/20"
            }`}>
              <p className={`text-sm ${
                agentResult.success ? "text-green-600" : "text-red-600"
              }`}>
                {agentResult.message}
              </p>
              {agentResult.agentId && (
                <p className="mt-1 text-xs opacity-80">
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
              {isCalling ? "Calling..." : "Test Call"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Save, Mail, Phone, Clock, AlertCircle } from "lucide-react";

interface OpeningHours {
  [key: string]: {
    enabled: boolean;
    open: string;
    close: string;
  };
}

interface ReceptionistSettings {
  id: string;
  business_name: string;
  business_address: string;
  business_phone: string;
  business_website: string;
  fallback_email: string;
  fallback_phone: string;
  custom_notes: string;
  opening_hours: OpeningHours;
  status: string;
  status_message: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<ReceptionistSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const { data, error } = await supabase
        .from('receptionist_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      setSettings(data || {
        id: '',
        business_name: '',
        business_address: '',
        business_phone: '',
        business_website: '',
        fallback_email: '',
        fallback_phone: '',
        custom_notes: '',
        opening_hours: {},
        status: 'ready',
        status_message: ''
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    if (!settings) return;

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('receptionist_settings')
        .upsert({
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  }

  function updateSetting(field: keyof ReceptionistSettings, value: string | boolean | OpeningHours) {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-background/60 p-6 backdrop-blur animate-pulse">
            <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Message */}
      {message && (
        <Card className={`bg-background/60 backdrop-blur ${
          message.type === 'success' ? 'border-green-500/20' : 'border-red-500/20'
        }`}>
          <CardContent className="pt-6">
            <div className={`flex items-center gap-2 ${
              message.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              <AlertCircle className="h-4 w-4" />
              <span>{message.text}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Information */}
      <Card className="bg-background/60 backdrop-blur">
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Your business details that the AI receptionist will use</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="business_name">Business Name</Label>
              <Input
                id="business_name"
                value={settings?.business_name || ''}
                onChange={(e) => updateSetting('business_name', e.target.value)}
                placeholder="Your business name"
              />
            </div>
            <div>
              <Label htmlFor="business_phone">Business Phone</Label>
              <Input
                id="business_phone"
                value={settings?.business_phone || ''}
                onChange={(e) => updateSetting('business_phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="business_address">Business Address</Label>
            <Input
              id="business_address"
              value={settings?.business_address || ''}
              onChange={(e) => updateSetting('business_address', e.target.value)}
              placeholder="123 Main St, City, State 12345"
            />
          </div>

          <div>
            <Label htmlFor="business_website">Business Website</Label>
            <Input
              id="business_website"
              value={settings?.business_website || ''}
              onChange={(e) => updateSetting('business_website', e.target.value)}
              placeholder="https://yourbusiness.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Fallback Options */}
      <Card className="bg-background/60 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Fallback Options
          </CardTitle>
          <CardDescription>
            Contact information to provide when the AI can&apos;t help
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="fallback_email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Fallback Email
              </Label>
              <Input
                id="fallback_email"
                type="email"
                value={settings?.fallback_email || ''}
                onChange={(e) => updateSetting('fallback_email', e.target.value)}
                placeholder="contact@yourbusiness.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email to contact if AI can&apos;t help
              </p>
            </div>
            <div>
              <Label htmlFor="fallback_phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Fallback Phone
              </Label>
              <Input
                id="fallback_phone"
                value={settings?.fallback_phone || ''}
                onChange={(e) => updateSetting('fallback_phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Phone number to call if AI can&apos;t help
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Notes */}
      <Card className="bg-background/60 backdrop-blur">
        <CardHeader>
          <CardTitle>Custom Notes</CardTitle>
          <CardDescription>
            Additional information for the AI receptionist (e.g., &quot;Closed Thursday 8.10.25&quot;)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={settings?.custom_notes || ''}
            onChange={(e) => updateSetting('custom_notes', e.target.value)}
            placeholder="Enter any special instructions or notes for your AI receptionist..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Opening Hours */}
      <Card className="bg-background/60 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Opening Hours
          </CardTitle>
          <CardDescription>
            Set your business hours for the AI to reference
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <div key={day} className="flex items-center justify-between">
                <Label className="w-20">{day}</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings?.opening_hours?.[day.toLowerCase()]?.enabled || false}
                    onCheckedChange={(checked) => {
                      const hours = settings?.opening_hours || {};
                      updateSetting('opening_hours', {
                        ...hours,
                        [day.toLowerCase()]: {
                          ...hours[day.toLowerCase()],
                          enabled: checked
                        }
                      });
                    }}
                  />
                  {settings?.opening_hours?.[day.toLowerCase()]?.enabled && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={settings.opening_hours[day.toLowerCase()]?.open || '09:00'}
                        onChange={(e) => {
                          const hours = settings?.opening_hours || {};
                          updateSetting('opening_hours', {
                            ...hours,
                            [day.toLowerCase()]: {
                              ...hours[day.toLowerCase()],
                              open: e.target.value
                            }
                          });
                        }}
                        className="w-24"
                      />
                      <span>to</span>
                      <Input
                        type="time"
                        value={settings.opening_hours[day.toLowerCase()]?.close || '17:00'}
                        onChange={(e) => {
                          const hours = settings?.opening_hours || {};
                          updateSetting('opening_hours', {
                            ...hours,
                            [day.toLowerCase()]: {
                              ...hours[day.toLowerCase()],
                              close: e.target.value
                            }
                          });
                        }}
                        className="w-24"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving} className="min-w-32">
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}



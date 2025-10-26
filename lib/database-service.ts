// Database Service Layer for Aurora Dashboard
// This service handles all database operations and calculations

import { supabase } from './supabase'
import { DashboardConfig } from './dashboard-config'

// Types for database operations
export interface CallSession {
  id: string
  user_id: string
  phone_number?: string
  caller_name?: string
  session_start: string
  session_end?: string
  duration_seconds: number
  status: 'active' | 'completed' | 'failed' | 'transferred'
  call_type?: 'appointment_booking' | 'general_inquiry' | 'support_request' | 'sales_inquiry' | 'complaint' | 'other'
  ai_handled: boolean
  human_transferred: boolean
  transfer_reason?: string
  satisfaction_score?: number
  notes?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CallInteraction {
  id: string
  call_session_id: string
  interaction_type: 'user_input' | 'ai_response' | 'system_action' | 'transfer'
  content: string
  timestamp: string
  metadata: Record<string, any>
}

export interface CallOutcome {
  id: string
  call_session_id: string
  outcome_type: 'appointment_scheduled' | 'information_provided' | 'issue_resolved' | 'escalated' | 'callback_requested' | 'no_action'
  outcome_data: Record<string, any>
  created_at: string
}

export interface DailyMetrics {
  id: string
  user_id: string
  date: string
  total_calls: number
  completed_calls: number
  failed_calls: number
  transferred_calls: number
  total_duration_seconds: number
  avg_duration_seconds: number
  success_rate: number
  peak_hour: number
  call_types: Record<string, number>
  satisfaction_avg: number
  created_at: string
  updated_at: string
}

export interface HourlyMetrics {
  id: string
  user_id: string
  date: string
  hour: number
  call_count: number
  total_duration_seconds: number
  avg_duration_seconds: number
  success_rate: number
  created_at: string
  updated_at: string
}

export interface WeeklyMetrics {
  id: string
  user_id: string
  week_start: string
  week_end: string
  total_calls: number
  completed_calls: number
  total_duration_seconds: number
  avg_duration_seconds: number
  success_rate: number
  call_types: Record<string, number>
  growth_metrics: Record<string, number>
  created_at: string
  updated_at: string
}

// Database service class
export class DatabaseService {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  // User management
  async createOrUpdateUser(userData: {
    id: string
    email: string
    full_name?: string
    avatar_url?: string
  }) {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        avatar_url: userData.avatar_url,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Call session management
  async createCallSession(sessionData: Partial<CallSession>) {
    const { data, error } = await supabase
      .from('call_sessions')
      .insert({
        user_id: this.userId,
        ...sessionData
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateCallSession(sessionId: string, updates: Partial<CallSession>) {
    const { data, error } = await supabase
      .from('call_sessions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', this.userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async endCallSession(sessionId: string, status: CallSession['status'] = 'completed') {
    const { data, error } = await supabase
      .from('call_sessions')
      .update({
        session_end: new Date().toISOString(),
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', this.userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getCallSessions(limit: number = 50, offset: number = 0) {
    const { data, error } = await supabase
      .from('call_sessions')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data
  }

  async getRecentCalls(limit: number = 10) {
    const { data, error } = await supabase
      .from('call_sessions')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }

  // Call interactions
  async addCallInteraction(sessionId: string, interaction: Omit<CallInteraction, 'id' | 'call_session_id'>) {
    const { data, error } = await supabase
      .from('call_interactions')
      .insert({
        call_session_id: sessionId,
        ...interaction
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getCallInteractions(sessionId: string) {
    const { data, error } = await supabase
      .from('call_interactions')
      .select('*')
      .eq('call_session_id', sessionId)
      .order('timestamp', { ascending: true })

    if (error) throw error
    return data
  }

  // Call outcomes
  async addCallOutcome(sessionId: string, outcome: Omit<CallOutcome, 'id' | 'call_session_id'>) {
    const { data, error } = await supabase
      .from('call_outcomes')
      .insert({
        call_session_id: sessionId,
        ...outcome
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Metrics calculation and retrieval
  async calculateDailyMetrics(date: Date = new Date()) {
    const dateStr = date.toISOString().split('T')[0]
    
    const { error } = await supabase.rpc('aggregate_daily_metrics', {
      target_date: dateStr,
      target_user_id: this.userId
    })

    if (error) throw error
  }

  async calculateHourlyMetrics(date: Date = new Date()) {
    const dateStr = date.toISOString().split('T')[0]
    
    const { error } = await supabase.rpc('aggregate_hourly_metrics', {
      target_date: dateStr,
      target_user_id: this.userId
    })

    if (error) throw error
  }

  async getDailyMetrics(date: Date = new Date()) {
    const dateStr = date.toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('daily_metrics')
      .select('*')
      .eq('user_id', this.userId)
      .eq('date', dateStr)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async getHourlyMetrics(date: Date = new Date()) {
    const dateStr = date.toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('hourly_metrics')
      .select('*')
      .eq('user_id', this.userId)
      .eq('date', dateStr)
      .order('hour', { ascending: true })

    if (error) throw error
    return data
  }

  async getWeeklyMetrics(weekStart: Date) {
    const weekStartStr = weekStart.toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('weekly_metrics')
      .select('*')
      .eq('user_id', this.userId)
      .eq('week_start', weekStartStr)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async getGrowthMetrics() {
    const { data, error } = await supabase.rpc('calculate_growth_metrics', {
      target_user_id: this.userId
    })

    if (error) throw error
    return data
  }

  // Dashboard data aggregation
  async getDashboardData(): Promise<DashboardConfig> {
    try {
      // Get today's metrics
      const todayMetrics = await this.getDailyMetrics()
      
      // Get this week's metrics
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekMetrics = await this.getWeeklyMetrics(weekStart)
      
      // Get hourly data for today
      const hourlyData = await this.getHourlyMetrics()
      
      // Get recent calls
      const recentCalls = await this.getRecentCalls(5)
      
      // Get growth metrics
      const growthMetrics = await this.getGrowthMetrics()
      
      // Get call types distribution for the last 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { data: callTypesData, error: callTypesError } = await supabase
        .from('call_sessions')
        .select('call_type')
        .eq('user_id', this.userId)
        .gte('created_at', sevenDaysAgo.toISOString())
        .not('call_type', 'is', null)

      if (callTypesError) throw callTypesError

      // Process call types
      const callTypesMap = new Map<string, number>()
      callTypesData?.forEach(call => {
        if (call.call_type) {
          callTypesMap.set(call.call_type, (callTypesMap.get(call.call_type) || 0) + 1)
        }
      })

      const totalCalls = Array.from(callTypesMap.values()).reduce((sum, count) => sum + count, 0)
      const callTypes = Array.from(callTypesMap.entries()).map(([type, count]) => ({
        type: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count,
        percentage: totalCalls > 0 ? Number(((count / totalCalls) * 100).toFixed(1)) : 0
      }))

      // Get weekly call data for the last 7 days
      const weeklyCalls = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dayMetrics = await this.getDailyMetrics(date)
        
        weeklyCalls.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          calls: dayMetrics?.total_calls || 0,
          duration: dayMetrics?.total_duration_seconds || 0
        })
      }

      // Format recent calls
      const formattedRecentCalls = recentCalls.map(call => ({
        time: new Date(call.created_at).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        type: call.call_type ? call.call_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown',
        duration: this.formatDuration(call.duration_seconds),
        status: call.status === 'completed' ? 'Completed' : 
                call.status === 'transferred' ? 'Transferred' : 'Failed'
      }))

      // Format hourly data
      const formattedHourlyData = hourlyData.map(hour => ({
        hour: `${hour.hour}:00 ${hour.hour >= 12 ? 'PM' : 'AM'}`,
        calls: hour.call_count
      }))

      // Calculate peak hour
      const peakHourData = hourlyData.reduce((max, current) => 
        current.call_count > max.call_count ? current : max, 
        { hour: 0, call_count: 0 }
      )
      const peakHour = peakHourData.call_count > 0 ? 
        `${peakHourData.hour}:00 ${peakHourData.hour >= 12 ? 'PM' : 'AM'}` : 'N/A'

      // Get top call type
      const topCallType = callTypes.length > 0 ? callTypes[0].type : 'N/A'

      return {
        hasData: true,
        callStats: {
          totalCalls: todayMetrics?.total_calls || 0,
          todayCalls: todayMetrics?.total_calls || 0,
          avgCallDuration: this.formatDuration(todayMetrics?.avg_duration_seconds || 0),
          successRate: Number((todayMetrics?.success_rate || 0).toFixed(1)),
          peakHour,
          topCallType
        },
        weeklyCalls,
        callTypes,
        hourlyData: formattedHourlyData,
        recentCalls: formattedRecentCalls,
        growthMetrics: {
          totalCallsGrowth: growthMetrics?.total_calls_growth ? 
            `${growthMetrics.total_calls_growth > 0 ? '+' : ''}${growthMetrics.total_calls_growth}%` : 'N/A',
          todayCallsGrowth: growthMetrics?.total_calls_growth ? 
            `${growthMetrics.total_calls_growth > 0 ? '+' : ''}${growthMetrics.total_calls_growth}%` : 'N/A',
          avgDurationGrowth: growthMetrics?.avg_duration_growth ? 
            `${growthMetrics.avg_duration_growth > 0 ? '+' : ''}${growthMetrics.avg_duration_growth}%` : 'N/A',
          successRateGrowth: growthMetrics?.success_rate_growth ? 
            `${growthMetrics.success_rate_growth > 0 ? '+' : ''}${growthMetrics.success_rate_growth}%` : 'N/A'
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Return empty config on error
      return {
        hasData: false,
        callStats: {
          totalCalls: 0,
          todayCalls: 0,
          avgCallDuration: '0m 0s',
          successRate: 0,
          peakHour: 'N/A',
          topCallType: 'N/A'
        },
        weeklyCalls: [],
        callTypes: [],
        hourlyData: [],
        recentCalls: [],
        growthMetrics: {
          totalCallsGrowth: 'N/A',
          todayCallsGrowth: 'N/A',
          avgDurationGrowth: 'N/A',
          successRateGrowth: 'N/A'
        }
      }
    }
  }

  // Utility functions
  private formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  // Test data generation (for development)
  async generateTestData() {
    const testSessions = [
      {
        phone_number: '+1-555-0123',
        caller_name: 'John Doe',
        call_type: 'appointment_booking',
        status: 'completed' as const,
        duration_seconds: 245,
        satisfaction_score: 5,
        notes: 'Scheduled dental cleaning for next week'
      },
      {
        phone_number: '+1-555-0124',
        caller_name: 'Jane Smith',
        call_type: 'general_inquiry',
        status: 'completed' as const,
        duration_seconds: 180,
        satisfaction_score: 4,
        notes: 'Asked about office hours and services'
      },
      {
        phone_number: '+1-555-0125',
        caller_name: 'Bob Johnson',
        call_type: 'support_request',
        status: 'transferred' as const,
        duration_seconds: 320,
        satisfaction_score: 3,
        notes: 'Complex billing issue - transferred to billing department'
      },
      {
        phone_number: '+1-555-0126',
        caller_name: 'Alice Brown',
        call_type: 'sales_inquiry',
        status: 'completed' as const,
        duration_seconds: 420,
        satisfaction_score: 5,
        notes: 'Interested in premium package - follow-up scheduled'
      },
      {
        phone_number: '+1-555-0127',
        caller_name: 'Charlie Wilson',
        call_type: 'complaint',
        status: 'completed' as const,
        duration_seconds: 280,
        satisfaction_score: 2,
        notes: 'Issue with appointment cancellation - resolved'
      }
    ]

    const createdSessions = []
    for (const session of testSessions) {
      const created = await this.createCallSession(session)
      createdSessions.push(created)
    }

    // Generate some interactions for each session
    for (const session of createdSessions) {
      await this.addCallInteraction(session.id, {
        interaction_type: 'user_input',
        content: 'Hello, I need help with...',
        timestamp: new Date(session.created_at).toISOString()
      })
      
      await this.addCallInteraction(session.id, {
        interaction_type: 'ai_response',
        content: 'Hello! I\'d be happy to help you. How can I assist you today?',
        timestamp: new Date(Date.parse(session.created_at) + 1000).toISOString()
      })
    }

    // Calculate metrics for the test data
    await this.calculateDailyMetrics()
    await this.calculateHourlyMetrics()

    return createdSessions
  }
}

// Export a factory function to create database service instances
export function createDatabaseService(userId: string): DatabaseService {
  return new DatabaseService(userId)
}

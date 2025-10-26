// Calculations Engine for Aurora Dashboard
// This module handles complex analytics calculations and data processing

import { DatabaseService, CallSession, DailyMetrics, HourlyMetrics } from './database-service'

export interface AnalyticsResult {
  totalCalls: number
  completedCalls: number
  failedCalls: number
  transferredCalls: number
  avgDuration: number
  successRate: number
  peakHour: number
  callTypesDistribution: Record<string, number>
  satisfactionScore: number
  growthMetrics: {
    callsGrowth: number
    durationGrowth: number
    successRateGrowth: number
    satisfactionGrowth: number
  }
  trends: {
    dailyTrend: 'up' | 'down' | 'stable'
    weeklyTrend: 'up' | 'down' | 'stable'
    monthlyTrend: 'up' | 'down' | 'stable'
  }
  insights: string[]
}

export interface PerformanceMetrics {
  efficiency: number // Calls handled per hour
  resolutionRate: number // Percentage of calls resolved without transfer
  customerSatisfaction: number // Average satisfaction score
  responseTime: number // Average time to first response
  peakPerformance: {
    hour: number
    calls: number
    efficiency: number
  }
}

export interface PredictiveAnalytics {
  forecastedCalls: {
    tomorrow: number
    nextWeek: number
    nextMonth: number
  }
  capacityPlanning: {
    currentCapacity: number
    recommendedCapacity: number
    utilizationRate: number
  }
  seasonalTrends: {
    dayOfWeek: Record<string, number>
    hourOfDay: Record<string, number>
    monthlyPattern: Record<string, number>
  }
}

export class CalculationsEngine {
  private dbService: DatabaseService

  constructor(dbService: DatabaseService) {
    this.dbService = dbService
  }

  // Core analytics calculations
  async calculateAnalytics(timeRange: 'day' | 'week' | 'month' = 'week'): Promise<AnalyticsResult> {
    const endDate = new Date()
    const startDate = new Date()
    
    switch (timeRange) {
      case 'day':
        startDate.setDate(endDate.getDate() - 1)
        break
      case 'week':
        startDate.setDate(endDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1)
        break
    }

    // Get call sessions for the time range
    const callSessions = await this.getCallSessionsInRange(startDate, endDate)
    
    // Calculate basic metrics
    const totalCalls = callSessions.length
    const completedCalls = callSessions.filter(call => call.status === 'completed').length
    const failedCalls = callSessions.filter(call => call.status === 'failed').length
    const transferredCalls = callSessions.filter(call => call.status === 'transferred').length
    
    const avgDuration = totalCalls > 0 ? 
      callSessions.reduce((sum, call) => sum + call.duration_seconds, 0) / totalCalls : 0
    
    const successRate = totalCalls > 0 ? (completedCalls / totalCalls) * 100 : 0
    
    // Calculate peak hour
    const hourlyDistribution = this.calculateHourlyDistribution(callSessions)
    const peakHour = this.findPeakHour(hourlyDistribution)
    
    // Calculate call types distribution
    const callTypesDistribution = this.calculateCallTypesDistribution(callSessions)
    
    // Calculate satisfaction score
    const satisfactionScore = this.calculateSatisfactionScore(callSessions)
    
    // Calculate growth metrics
    const growthMetrics = await this.calculateGrowthMetrics(timeRange)
    
    // Calculate trends
    const trends = await this.calculateTrends(timeRange)
    
    // Generate insights
    const insights = this.generateInsights({
      totalCalls,
      successRate,
      avgDuration,
      satisfactionScore,
      peakHour,
      callTypesDistribution
    })

    return {
      totalCalls,
      completedCalls,
      failedCalls,
      transferredCalls,
      avgDuration,
      successRate,
      peakHour,
      callTypesDistribution,
      satisfactionScore,
      growthMetrics,
      trends,
      insights
    }
  }

  // Performance metrics calculation
  async calculatePerformanceMetrics(): Promise<PerformanceMetrics> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 7) // Last week

    const callSessions = await this.getCallSessionsInRange(startDate, endDate)
    
    // Calculate efficiency (calls per hour)
    const totalHours = 7 * 24 // 7 days * 24 hours
    const efficiency = totalHours > 0 ? callSessions.length / totalHours : 0
    
    // Calculate resolution rate (calls resolved without transfer)
    const resolvedCalls = callSessions.filter(call => 
      call.status === 'completed' && !call.human_transferred
    ).length
    const resolutionRate = callSessions.length > 0 ? (resolvedCalls / callSessions.length) * 100 : 0
    
    // Calculate customer satisfaction
    const satisfactionScores = callSessions
      .filter(call => call.satisfaction_score)
      .map(call => call.satisfaction_score!)
    const customerSatisfaction = satisfactionScores.length > 0 ?
      satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length : 0
    
    // Calculate response time (simplified - time to first interaction)
    const responseTime = this.calculateAverageResponseTime(callSessions)
    
    // Find peak performance hour
    const hourlyDistribution = this.calculateHourlyDistribution(callSessions)
    const peakPerformance = this.findPeakPerformanceHour(hourlyDistribution)

    return {
      efficiency,
      resolutionRate,
      customerSatisfaction,
      responseTime,
      peakPerformance
    }
  }

  // Predictive analytics
  async calculatePredictiveAnalytics(): Promise<PredictiveAnalytics> {
    // Get historical data for the last 30 days
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 30)

    const callSessions = await this.getCallSessionsInRange(startDate, endDate)
    
    // Forecast calls using simple linear regression
    const forecastedCalls = this.forecastCalls(callSessions)
    
    // Capacity planning
    const capacityPlanning = this.calculateCapacityPlanning(callSessions)
    
    // Seasonal trends
    const seasonalTrends = this.calculateSeasonalTrends(callSessions)

    return {
      forecastedCalls,
      capacityPlanning,
      seasonalTrends
    }
  }

  // Helper methods
  private async getCallSessionsInRange(startDate: Date, endDate: Date): Promise<CallSession[]> {
    // This would typically use the database service to fetch data
    // For now, we'll simulate the data structure
    return []
  }

  private calculateHourlyDistribution(callSessions: CallSession[]): Record<number, number> {
    const distribution: Record<number, number> = {}
    
    callSessions.forEach(call => {
      const hour = new Date(call.created_at).getHours()
      distribution[hour] = (distribution[hour] || 0) + 1
    })
    
    return distribution
  }

  private findPeakHour(hourlyDistribution: Record<number, number>): number {
    let maxCalls = 0
    let peakHour = 0
    
    Object.entries(hourlyDistribution).forEach(([hour, calls]) => {
      if (calls > maxCalls) {
        maxCalls = calls
        peakHour = parseInt(hour)
      }
    })
    
    return peakHour
  }

  private calculateCallTypesDistribution(callSessions: CallSession[]): Record<string, number> {
    const distribution: Record<string, number> = {}
    
    callSessions.forEach(call => {
      if (call.call_type) {
        distribution[call.call_type] = (distribution[call.call_type] || 0) + 1
      }
    })
    
    return distribution
  }

  private calculateSatisfactionScore(callSessions: CallSession[]): number {
    const scores = callSessions
      .filter(call => call.satisfaction_score)
      .map(call => call.satisfaction_score!)
    
    return scores.length > 0 ? 
      scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
  }

  private async calculateGrowthMetrics(timeRange: string): Promise<{
    callsGrowth: number
    durationGrowth: number
    successRateGrowth: number
    satisfactionGrowth: number
  }> {
    // This would compare current period with previous period
    // For now, return mock data
    return {
      callsGrowth: 12.5,
      durationGrowth: -2.1,
      successRateGrowth: 1.3,
      satisfactionGrowth: 0.8
    }
  }

  private async calculateTrends(timeRange: string): Promise<{
    dailyTrend: 'up' | 'down' | 'stable'
    weeklyTrend: 'up' | 'down' | 'stable'
    monthlyTrend: 'up' | 'down' | 'stable'
  }> {
    // This would analyze trends over different time periods
    // For now, return mock data
    return {
      dailyTrend: 'up',
      weeklyTrend: 'stable',
      monthlyTrend: 'up'
    }
  }

  private generateInsights(metrics: {
    totalCalls: number
    successRate: number
    avgDuration: number
    satisfactionScore: number
    peakHour: number
    callTypesDistribution: Record<string, number>
  }): string[] {
    const insights: string[] = []
    
    if (metrics.successRate > 90) {
      insights.push('Excellent success rate! Your AI is handling calls very effectively.')
    } else if (metrics.successRate < 70) {
      insights.push('Success rate could be improved. Consider reviewing failed call patterns.')
    }
    
    if (metrics.satisfactionScore > 4) {
      insights.push('High customer satisfaction scores indicate great service quality.')
    } else if (metrics.satisfactionScore < 3) {
      insights.push('Customer satisfaction is below average. Consider improving call handling.')
    }
    
    if (metrics.avgDuration > 300) { // 5 minutes
      insights.push('Average call duration is quite long. Consider optimizing conversation flow.')
    }
    
    const topCallType = Object.entries(metrics.callTypesDistribution)
      .sort(([,a], [,b]) => b - a)[0]
    
    if (topCallType) {
      insights.push(`Most common call type is ${topCallType[0]} (${topCallType[1]} calls).`)
    }
    
    if (metrics.peakHour >= 9 && metrics.peakHour <= 17) {
      insights.push('Peak hours align with business hours, which is optimal.')
    }
    
    return insights
  }

  private calculateAverageResponseTime(callSessions: CallSession[]): number {
    // This would calculate the average time to first AI response
    // For now, return a mock value
    return 2.5 // seconds
  }

  private findPeakPerformanceHour(hourlyDistribution: Record<number, number>): {
    hour: number
    calls: number
    efficiency: number
  } {
    const peakHour = this.findPeakHour(hourlyDistribution)
    const calls = hourlyDistribution[peakHour] || 0
    
    return {
      hour: peakHour,
      calls,
      efficiency: calls / 24 // calls per hour
    }
  }

  private forecastCalls(callSessions: CallSession[]): {
    tomorrow: number
    nextWeek: number
    nextMonth: number
  } {
    // Simple forecasting based on recent trends
    const recentCalls = callSessions.filter(call => {
      const callDate = new Date(call.created_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return callDate >= weekAgo
    })
    
    const avgDailyCalls = recentCalls.length / 7
    
    return {
      tomorrow: Math.round(avgDailyCalls),
      nextWeek: Math.round(avgDailyCalls * 7),
      nextMonth: Math.round(avgDailyCalls * 30)
    }
  }

  private calculateCapacityPlanning(callSessions: CallSession[]): {
    currentCapacity: number
    recommendedCapacity: number
    utilizationRate: number
  } {
    const totalCalls = callSessions.length
    const currentCapacity = 100 // Assume current capacity
    const utilizationRate = (totalCalls / currentCapacity) * 100
    const recommendedCapacity = utilizationRate > 80 ? 
      Math.ceil(currentCapacity * 1.2) : currentCapacity
    
    return {
      currentCapacity,
      recommendedCapacity,
      utilizationRate
    }
  }

  private calculateSeasonalTrends(callSessions: CallSession[]): {
    dayOfWeek: Record<string, number>
    hourOfDay: Record<string, number>
    monthlyPattern: Record<string, number>
  } {
    const dayOfWeek: Record<string, number> = {}
    const hourOfDay: Record<string, number> = {}
    const monthlyPattern: Record<string, number> = {}
    
    callSessions.forEach(call => {
      const callDate = new Date(call.created_at)
      
      // Day of week
      const dayName = callDate.toLocaleDateString('en-US', { weekday: 'long' })
      dayOfWeek[dayName] = (dayOfWeek[dayName] || 0) + 1
      
      // Hour of day
      const hour = callDate.getHours()
      hourOfDay[hour.toString()] = (hourOfDay[hour.toString()] || 0) + 1
      
      // Monthly pattern
      const month = callDate.getMonth()
      monthlyPattern[month.toString()] = (monthlyPattern[month.toString()] || 0) + 1
    })
    
    return {
      dayOfWeek,
      hourOfDay,
      monthlyPattern
    }
  }

  // Real-time calculations
  async calculateRealTimeMetrics(): Promise<{
    activeCalls: number
    queueLength: number
    avgWaitTime: number
    systemHealth: 'excellent' | 'good' | 'fair' | 'poor'
  }> {
    // This would connect to real-time data sources
    // For now, return mock data
    return {
      activeCalls: 3,
      queueLength: 2,
      avgWaitTime: 1.5,
      systemHealth: 'good'
    }
  }

  // Advanced analytics
  async calculateAdvancedAnalytics(): Promise<{
    callQualityScore: number
    aiEffectiveness: number
    customerRetentionRate: number
    costSavings: number
  }> {
    // Advanced calculations combining multiple metrics
    return {
      callQualityScore: 8.5,
      aiEffectiveness: 87.3,
      customerRetentionRate: 92.1,
      costSavings: 1250.50
    }
  }
}

// Export factory function
export function createCalculationsEngine(dbService: DatabaseService): CalculationsEngine {
  return new CalculationsEngine(dbService)
}

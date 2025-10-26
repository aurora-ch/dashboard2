// Data Tools for Aurora Dashboard
// This module provides tools for data manipulation, analysis, and reporting

import { DatabaseService, CallSession, CallInteraction, CallOutcome } from './database-service'
import { CalculationsEngine, AnalyticsResult, PerformanceMetrics, PredictiveAnalytics } from './calculations-engine'

export interface DataExportOptions {
  format: 'csv' | 'json' | 'xlsx'
  dateRange: {
    start: Date
    end: Date
  }
  includeInteractions: boolean
  includeOutcomes: boolean
  filters?: {
    callTypes?: string[]
    status?: string[]
    satisfactionMin?: number
  }
}

export interface DataImportOptions {
  source: 'csv' | 'json' | 'api'
  mapping: {
    phoneNumber?: string
    callerName?: string
    callType?: string
    duration?: string
    satisfaction?: string
    timestamp?: string
  }
  validation: {
    requiredFields: string[]
    dateFormat?: string
    timezone?: string
  }
}

export interface ReportConfig {
  name: string
  description: string
  metrics: string[]
  timeRange: 'day' | 'week' | 'month' | 'quarter' | 'year'
  format: 'pdf' | 'html' | 'json'
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    time: string
    recipients: string[]
  }
}

export class DataTools {
  private dbService: DatabaseService
  private calculationsEngine: CalculationsEngine

  constructor(dbService: DatabaseService, calculationsEngine: CalculationsEngine) {
    this.dbService = dbService
    this.calculationsEngine = calculationsEngine
  }

  // Data Export Tools
  async exportCallData(options: DataExportOptions): Promise<Blob> {
    const { data: callSessions, error } = await this.dbService.getCallSessions(1000, 0)
    
    if (error) throw error

    // Apply filters
    let filteredSessions = callSessions || []
    
    if (options.filters) {
      if (options.filters.callTypes) {
        filteredSessions = filteredSessions.filter(session => 
          session.call_type && options.filters!.callTypes!.includes(session.call_type)
        )
      }
      
      if (options.filters.status) {
        filteredSessions = filteredSessions.filter(session => 
          options.filters!.status!.includes(session.status)
        )
      }
      
      if (options.filters.satisfactionMin) {
        filteredSessions = filteredSessions.filter(session => 
          session.satisfaction_score && session.satisfaction_score >= options.filters!.satisfactionMin!
        )
      }
    }

    // Apply date range filter
    filteredSessions = filteredSessions.filter(session => {
      const sessionDate = new Date(session.created_at)
      return sessionDate >= options.dateRange.start && sessionDate <= options.dateRange.end
    })

    // Get additional data if requested
    let interactions: CallInteraction[] = []
    let outcomes: CallOutcome[] = []
    
    if (options.includeInteractions || options.includeOutcomes) {
      for (const session of filteredSessions) {
        if (options.includeInteractions) {
          const sessionInteractions = await this.dbService.getCallInteractions(session.id)
          interactions.push(...sessionInteractions)
        }
        
        if (options.includeOutcomes) {
          // This would need to be implemented in the database service
          // const sessionOutcomes = await this.dbService.getCallOutcomes(session.id)
          // outcomes.push(...sessionOutcomes)
        }
      }
    }

    // Convert to requested format
    switch (options.format) {
      case 'csv':
        return this.convertToCSV(filteredSessions, interactions, outcomes)
      case 'json':
        return this.convertToJSON(filteredSessions, interactions, outcomes)
      case 'xlsx':
        return this.convertToXLSX(filteredSessions, interactions, outcomes)
      default:
        throw new Error(`Unsupported export format: ${options.format}`)
    }
  }

  // Data Import Tools
  async importCallData(data: any[], options: DataImportOptions): Promise<{
    imported: number
    failed: number
    errors: string[]
  }> {
    const results = {
      imported: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (let i = 0; i < data.length; i++) {
      try {
        const record = data[i]
        
        // Validate required fields
        for (const field of options.validation.requiredFields) {
          if (!record[field]) {
            throw new Error(`Missing required field: ${field}`)
          }
        }

        // Map and transform data
        const sessionData = this.mapImportData(record, options.mapping)
        
        // Create call session
        await this.dbService.createCallSession(sessionData)
        
        results.imported++
      } catch (error) {
        results.failed++
        results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return results
  }

  // Report Generation Tools
  async generateReport(config: ReportConfig): Promise<Blob> {
    const analytics = await this.calculationsEngine.calculateAnalytics(config.timeRange)
    const performance = await this.calculationsEngine.calculatePerformanceMetrics()
    const predictive = await this.calculationsEngine.calculatePredictiveAnalytics()

    const reportData = {
      config,
      generatedAt: new Date().toISOString(),
      analytics,
      performance,
      predictive,
      summary: this.generateReportSummary(analytics, performance, predictive)
    }

    switch (config.format) {
      case 'pdf':
        return this.convertToPDF(reportData)
      case 'html':
        return this.convertToHTML(reportData)
      case 'json':
        return this.convertToJSON(reportData)
      default:
        throw new Error(`Unsupported report format: ${config.format}`)
    }
  }

  // Data Analysis Tools
  async analyzeCallPatterns(timeRange: 'day' | 'week' | 'month' = 'week'): Promise<{
    patterns: {
      hourlyDistribution: Record<number, number>
      dailyDistribution: Record<string, number>
      callTypeTrends: Record<string, number[]>
      durationTrends: number[]
    }
    insights: string[]
    recommendations: string[]
  }> {
    const analytics = await this.calculationsEngine.calculateAnalytics(timeRange)
    const predictive = await this.calculationsEngine.calculatePredictiveAnalytics()

    const patterns = {
      hourlyDistribution: predictive.seasonalTrends.hourOfDay,
      dailyDistribution: predictive.seasonalTrends.dayOfWeek,
      callTypeTrends: this.calculateCallTypeTrends(timeRange),
      durationTrends: this.calculateDurationTrends(timeRange)
    }

    const insights = this.generatePatternInsights(patterns, analytics)
    const recommendations = this.generateRecommendations(patterns, analytics)

    return {
      patterns,
      insights,
      recommendations
    }
  }

  // Data Quality Tools
  async validateDataQuality(): Promise<{
    score: number
    issues: Array<{
      type: 'missing' | 'invalid' | 'duplicate' | 'inconsistent'
      description: string
      count: number
      severity: 'low' | 'medium' | 'high'
    }>
    recommendations: string[]
  }> {
    const { data: callSessions, error } = await this.dbService.getCallSessions(1000, 0)
    
    if (error) throw error

    const issues: Array<{
      type: 'missing' | 'invalid' | 'duplicate' | 'inconsistent'
      description: string
      count: number
      severity: 'low' | 'medium' | 'high'
    }> = []

    let totalIssues = 0
    const totalRecords = callSessions?.length || 0

    // Check for missing data
    const missingPhoneNumbers = callSessions?.filter(session => !session.phone_number).length || 0
    if (missingPhoneNumbers > 0) {
      issues.push({
        type: 'missing',
        description: 'Missing phone numbers',
        count: missingPhoneNumbers,
        severity: missingPhoneNumbers > totalRecords * 0.1 ? 'high' : 'medium'
      })
      totalIssues += missingPhoneNumbers
    }

    // Check for invalid data
    const invalidDurations = callSessions?.filter(session => 
      session.duration_seconds < 0 || session.duration_seconds > 3600
    ).length || 0
    if (invalidDurations > 0) {
      issues.push({
        type: 'invalid',
        description: 'Invalid call durations',
        count: invalidDurations,
        severity: invalidDurations > totalRecords * 0.05 ? 'high' : 'medium'
      })
      totalIssues += invalidDurations
    }

    // Check for duplicates
    const phoneNumbers = callSessions?.map(session => session.phone_number).filter(Boolean) || []
    const uniquePhoneNumbers = new Set(phoneNumbers)
    const duplicates = phoneNumbers.length - uniquePhoneNumbers.size
    if (duplicates > 0) {
      issues.push({
        type: 'duplicate',
        description: 'Duplicate phone numbers',
        count: duplicates,
        severity: duplicates > totalRecords * 0.1 ? 'high' : 'low'
      })
      totalIssues += duplicates
    }

    // Calculate quality score
    const qualityScore = totalRecords > 0 ? 
      Math.max(0, 100 - (totalIssues / totalRecords) * 100) : 100

    const recommendations = this.generateDataQualityRecommendations(issues)

    return {
      score: Math.round(qualityScore),
      issues,
      recommendations
    }
  }

  // Helper methods
  private convertToCSV(sessions: CallSession[], interactions: CallInteraction[], outcomes: CallOutcome[]): Blob {
    const headers = [
      'ID', 'Phone Number', 'Caller Name', 'Call Type', 'Status', 'Duration (seconds)',
      'Satisfaction Score', 'Created At', 'Session Start', 'Session End'
    ]
    
    const rows = sessions.map(session => [
      session.id,
      session.phone_number || '',
      session.caller_name || '',
      session.call_type || '',
      session.status,
      session.duration_seconds,
      session.satisfaction_score || '',
      session.created_at,
      session.session_start,
      session.session_end || ''
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    return new Blob([csvContent], { type: 'text/csv' })
  }

  private convertToJSON(data: any): Blob {
    const jsonContent = JSON.stringify(data, null, 2)
    return new Blob([jsonContent], { type: 'application/json' })
  }

  private convertToXLSX(data: any): Blob {
    // This would require a library like xlsx
    // For now, return JSON as fallback
    return this.convertToJSON(data)
  }

  private convertToPDF(data: any): Blob {
    // This would require a library like jsPDF
    // For now, return JSON as fallback
    return this.convertToJSON(data)
  }

  private convertToHTML(data: any): Blob {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Aurora Dashboard Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
          .metric { margin: 10px 0; padding: 10px; border-left: 4px solid #007bff; }
          .summary { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Aurora Dashboard Report</h1>
          <p>Generated: ${new Date(data.generatedAt).toLocaleString()}</p>
        </div>
        
        <div class="summary">
          <h2>Summary</h2>
          <p>${data.summary}</p>
        </div>
        
        <div class="metrics">
          <h2>Key Metrics</h2>
          <div class="metric">Total Calls: ${data.analytics.totalCalls}</div>
          <div class="metric">Success Rate: ${data.analytics.successRate.toFixed(1)}%</div>
          <div class="metric">Average Duration: ${Math.round(data.analytics.avgDuration)}s</div>
          <div class="metric">Satisfaction Score: ${data.analytics.satisfactionScore.toFixed(1)}</div>
        </div>
      </body>
      </html>
    `
    
    return new Blob([htmlContent], { type: 'text/html' })
  }

  private mapImportData(record: any, mapping: DataImportOptions['mapping']): Partial<CallSession> {
    return {
      phone_number: record[mapping.phoneNumber || 'phoneNumber'],
      caller_name: record[mapping.callerName || 'callerName'],
      call_type: record[mapping.callType || 'callType'],
      duration_seconds: parseInt(record[mapping.duration || 'duration']) || 0,
      satisfaction_score: parseInt(record[mapping.satisfaction || 'satisfaction']) || undefined,
      session_start: record[mapping.timestamp || 'timestamp'] || new Date().toISOString(),
      status: 'completed',
      ai_handled: true,
      human_transferred: false
    }
  }

  private generateReportSummary(analytics: AnalyticsResult, performance: PerformanceMetrics, predictive: PredictiveAnalytics): string {
    return `
      Aurora Dashboard Report Summary:
      
      Performance Overview:
      - Total calls processed: ${analytics.totalCalls}
      - Success rate: ${analytics.successRate.toFixed(1)}%
      - Average call duration: ${Math.round(analytics.avgDuration)} seconds
      - Customer satisfaction: ${analytics.satisfactionScore.toFixed(1)}/5
      
      Key Insights:
      ${analytics.insights.map(insight => `- ${insight}`).join('\n')}
      
      Forecast:
      - Expected calls tomorrow: ${predictive.forecastedCalls.tomorrow}
      - Expected calls next week: ${predictive.forecastedCalls.nextWeek}
      
      Recommendations:
      - System utilization: ${predictive.capacityPlanning.utilizationRate.toFixed(1)}%
      - Recommended capacity: ${predictive.capacityPlanning.recommendedCapacity}
    `
  }

  private calculateCallTypeTrends(timeRange: string): Record<string, number[]> {
    // This would analyze trends for each call type over time
    // For now, return mock data
    return {
      'appointment_booking': [10, 12, 15, 18, 20, 22, 25],
      'general_inquiry': [8, 10, 12, 14, 16, 18, 20],
      'support_request': [5, 6, 7, 8, 9, 10, 11]
    }
  }

  private calculateDurationTrends(timeRange: string): number[] {
    // This would analyze duration trends over time
    // For now, return mock data
    return [180, 185, 190, 195, 200, 205, 210]
  }

  private generatePatternInsights(patterns: any, analytics: AnalyticsResult): string[] {
    const insights: string[] = []
    
    // Analyze hourly patterns
    const peakHour = Object.entries(patterns.hourlyDistribution)
      .sort(([,a], [,b]) => b - a)[0]
    
    if (peakHour) {
      insights.push(`Peak calling hour is ${peakHour[0]}:00 with ${peakHour[1]} calls`)
    }
    
    // Analyze daily patterns
    const busiestDay = Object.entries(patterns.dailyDistribution)
      .sort(([,a], [,b]) => b - a)[0]
    
    if (busiestDay) {
      insights.push(`${busiestDay[0]} is the busiest day with ${busiestDay[1]} calls`)
    }
    
    return insights
  }

  private generateRecommendations(patterns: any, analytics: AnalyticsResult): string[] {
    const recommendations: string[] = []
    
    if (analytics.successRate < 80) {
      recommendations.push('Consider reviewing failed call patterns to improve success rate')
    }
    
    if (analytics.avgDuration > 300) {
      recommendations.push('Call durations are longer than average - consider optimizing conversation flow')
    }
    
    if (analytics.satisfactionScore < 4) {
      recommendations.push('Customer satisfaction is below target - review call handling procedures')
    }
    
    return recommendations
  }

  private generateDataQualityRecommendations(issues: any[]): string[] {
    const recommendations: string[] = []
    
    const highSeverityIssues = issues.filter(issue => issue.severity === 'high')
    const mediumSeverityIssues = issues.filter(issue => issue.severity === 'medium')
    
    if (highSeverityIssues.length > 0) {
      recommendations.push('Address high-severity data quality issues immediately')
    }
    
    if (mediumSeverityIssues.length > 0) {
      recommendations.push('Plan to resolve medium-severity issues in the next maintenance window')
    }
    
    recommendations.push('Implement data validation rules to prevent future quality issues')
    recommendations.push('Set up automated data quality monitoring')
    
    return recommendations
  }
}

// Export factory function
export function createDataTools(dbService: DatabaseService, calculationsEngine: CalculationsEngine): DataTools {
  return new DataTools(dbService, calculationsEngine)
}

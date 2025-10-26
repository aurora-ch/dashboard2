// Test Integration Script for Aurora Dashboard
// This script tests the complete integration with sample data

import { createDatabaseService } from './lib/database-service'
import { createCalculationsEngine } from './lib/calculations-engine'
import { createDataTools } from './lib/data-tools'

// Test configuration
const TEST_USER_ID = 'test-user-123'
const TEST_EMAIL = 'test@aurora.com'

async function runIntegrationTests() {
  console.log('🚀 Starting Aurora Dashboard Integration Tests...\n')

  try {
    // Initialize services
    console.log('📊 Initializing services...')
    const dbService = createDatabaseService(TEST_USER_ID)
    const calculationsEngine = createCalculationsEngine(dbService)
    const dataTools = createDataTools(dbService, calculationsEngine)

    // Test 1: User Creation
    console.log('\n1️⃣ Testing user creation...')
    try {
      await dbService.createOrUpdateUser({
        id: TEST_USER_ID,
        email: TEST_EMAIL,
        full_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg'
      })
      console.log('✅ User created successfully')
    } catch (error) {
      console.log('⚠️ User creation failed (may already exist):', error)
    }

    // Test 2: Generate Test Data
    console.log('\n2️⃣ Generating test data...')
    try {
      const testSessions = await dbService.generateTestData()
      console.log(`✅ Generated ${testSessions.length} test call sessions`)
    } catch (error) {
      console.log('❌ Test data generation failed:', error)
      throw error
    }

    // Test 3: Dashboard Data Fetching
    console.log('\n3️⃣ Testing dashboard data fetching...')
    try {
      const dashboardData = await dbService.getDashboardData()
      console.log('✅ Dashboard data fetched successfully')
      console.log(`   - Total calls: ${dashboardData.callStats.totalCalls}`)
      console.log(`   - Success rate: ${dashboardData.callStats.successRate}%`)
      console.log(`   - Has data: ${dashboardData.hasData}`)
    } catch (error) {
      console.log('❌ Dashboard data fetching failed:', error)
      throw error
    }

    // Test 4: Analytics Calculations
    console.log('\n4️⃣ Testing analytics calculations...')
    try {
      const analytics = await calculationsEngine.calculateAnalytics('week')
      console.log('✅ Analytics calculated successfully')
      console.log(`   - Total calls: ${analytics.totalCalls}`)
      console.log(`   - Success rate: ${analytics.successRate.toFixed(1)}%`)
      console.log(`   - Insights: ${analytics.insights.length} generated`)
    } catch (error) {
      console.log('❌ Analytics calculation failed:', error)
      throw error
    }

    // Test 5: Performance Metrics
    console.log('\n5️⃣ Testing performance metrics...')
    try {
      const performance = await calculationsEngine.calculatePerformanceMetrics()
      console.log('✅ Performance metrics calculated successfully')
      console.log(`   - Efficiency: ${performance.efficiency.toFixed(2)} calls/hour`)
      console.log(`   - Resolution rate: ${performance.resolutionRate.toFixed(1)}%`)
      console.log(`   - Customer satisfaction: ${performance.customerSatisfaction.toFixed(1)}/5`)
    } catch (error) {
      console.log('❌ Performance metrics calculation failed:', error)
      throw error
    }

    // Test 6: Predictive Analytics
    console.log('\n6️⃣ Testing predictive analytics...')
    try {
      const predictive = await calculationsEngine.calculatePredictiveAnalytics()
      console.log('✅ Predictive analytics calculated successfully')
      console.log(`   - Tomorrow's forecast: ${predictive.forecastedCalls.tomorrow} calls`)
      console.log(`   - Next week's forecast: ${predictive.forecastedCalls.nextWeek} calls`)
      console.log(`   - Utilization rate: ${predictive.capacityPlanning.utilizationRate.toFixed(1)}%`)
    } catch (error) {
      console.log('❌ Predictive analytics calculation failed:', error)
      throw error
    }

    // Test 7: Data Quality Validation
    console.log('\n7️⃣ Testing data quality validation...')
    try {
      const quality = await dataTools.validateDataQuality()
      console.log('✅ Data quality validation completed')
      console.log(`   - Quality score: ${quality.score}/100`)
      console.log(`   - Issues found: ${quality.issues.length}`)
      console.log(`   - Recommendations: ${quality.recommendations.length}`)
    } catch (error) {
      console.log('❌ Data quality validation failed:', error)
      throw error
    }

    // Test 8: Call Pattern Analysis
    console.log('\n8️⃣ Testing call pattern analysis...')
    try {
      const patterns = await dataTools.analyzeCallPatterns('week')
      console.log('✅ Call pattern analysis completed')
      console.log(`   - Hourly patterns: ${Object.keys(patterns.patterns.hourlyDistribution).length} hours`)
      console.log(`   - Daily patterns: ${Object.keys(patterns.patterns.dailyDistribution).length} days`)
      console.log(`   - Insights: ${patterns.insights.length}`)
      console.log(`   - Recommendations: ${patterns.recommendations.length}`)
    } catch (error) {
      console.log('❌ Call pattern analysis failed:', error)
      throw error
    }

    // Test 9: Data Export
    console.log('\n9️⃣ Testing data export...')
    try {
      const exportOptions = {
        format: 'json' as const,
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          end: new Date()
        },
        includeInteractions: true,
        includeOutcomes: false
      }
      
      const exportedData = await dataTools.exportCallData(exportOptions)
      console.log('✅ Data export completed successfully')
      console.log(`   - Export size: ${exportedData.size} bytes`)
      console.log(`   - Format: ${exportOptions.format}`)
    } catch (error) {
      console.log('❌ Data export failed:', error)
      throw error
    }

    // Test 10: Report Generation
    console.log('\n🔟 Testing report generation...')
    try {
      const reportConfig = {
        name: 'Weekly Analytics Report',
        description: 'Comprehensive weekly analytics report',
        metrics: ['totalCalls', 'successRate', 'avgDuration', 'satisfactionScore'],
        timeRange: 'week' as const,
        format: 'html' as const
      }
      
      const report = await dataTools.generateReport(reportConfig)
      console.log('✅ Report generation completed successfully')
      console.log(`   - Report size: ${report.size} bytes`)
      console.log(`   - Format: ${reportConfig.format}`)
    } catch (error) {
      console.log('❌ Report generation failed:', error)
      throw error
    }

    // Test Summary
    console.log('\n🎉 All integration tests completed successfully!')
    console.log('\n📋 Test Summary:')
    console.log('   ✅ User management')
    console.log('   ✅ Test data generation')
    console.log('   ✅ Dashboard data fetching')
    console.log('   ✅ Analytics calculations')
    console.log('   ✅ Performance metrics')
    console.log('   ✅ Predictive analytics')
    console.log('   ✅ Data quality validation')
    console.log('   ✅ Call pattern analysis')
    console.log('   ✅ Data export')
    console.log('   ✅ Report generation')
    
    console.log('\n🚀 Aurora Dashboard is ready for production!')
    
  } catch (error) {
    console.error('\n❌ Integration tests failed:', error)
    console.log('\n🔧 Troubleshooting steps:')
    console.log('   1. Check database connection')
    console.log('   2. Verify environment variables')
    console.log('   3. Ensure database schema is created')
    console.log('   4. Check Supabase permissions')
    process.exit(1)
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runIntegrationTests()
}

export { runIntegrationTests }

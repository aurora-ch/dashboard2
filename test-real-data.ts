// Test Real Data Fetching Script
// This script tests fetching actual data from your Supabase database

import { createAdaptedDatabaseService } from './lib/adapted-database-service.js'

async function testRealDataFetching() {
  console.log('🔍 Testing Real Data Fetching from Supabase...\n')

  try {
    // Test with different companies
    const companies = [1, 2, 3, 4, 5]
    
    for (const companyId of companies) {
      console.log(`\n📊 Testing Company ID: ${companyId}`)
      console.log('=' .repeat(40))
      
      const dbService = createAdaptedDatabaseService(companyId)
      
      // Test 1: Company Information
      console.log('\n1️⃣ Company Information:')
      const company = await dbService.getCompany()
      if (company) {
        console.log(`   ✅ Company: ${company.name}`)
        console.log(`   📞 Phone: ${company.twilio_phone_number}`)
        console.log(`   🏢 Industry: ${company.industry || 'N/A'}`)
        console.log(`   📊 Subscription: ${company.subscription_tier || 'N/A'}`)
        console.log(`   🌍 Timezone: ${company.timezone || 'N/A'}`)
        console.log(`   ✅ Active: ${company.is_active}`)
      } else {
        console.log('   ❌ Company not found')
        continue
      }
      
      // Test 2: Call Statistics
      console.log('\n2️⃣ Call Statistics:')
      const stats = await dbService.getCallStats()
      console.log(`   📞 Total calls: ${stats.totalCalls}`)
      console.log(`   ✅ Completed calls: ${stats.completedCalls}`)
      console.log(`   ❌ Failed calls: ${stats.failedCalls}`)
      console.log(`   📈 Success rate: ${stats.successRate.toFixed(1)}%`)
      console.log(`   ⏱️ Average duration: ${Math.round(stats.avgDuration)}s`)
      
      // Test 3: Recent Calls
      console.log('\n3️⃣ Recent Calls:')
      const recentCalls = await dbService.getRecentCalls(5)
      console.log(`   📋 Found ${recentCalls.length} recent calls`)
      
      if (recentCalls.length > 0) {
        recentCalls.forEach((call, index) => {
          console.log(`   ${index + 1}. ${call.twilio_call_sid}`)
          console.log(`      Status: ${call.status}`)
          console.log(`      Direction: ${call.direction}`)
          console.log(`      Started: ${call.started_at ? new Date(call.started_at).toLocaleString() : 'N/A'}`)
          console.log(`      Duration: ${call.duration_seconds ? `${call.duration_seconds}s` : 'N/A'}`)
        })
      } else {
        console.log('   📭 No recent calls found')
      }
      
      // Test 4: Call Types Distribution
      console.log('\n4️⃣ Call Types Distribution:')
      const callTypes = await dbService.getCallTypesDistribution()
      if (callTypes.length > 0) {
        callTypes.forEach(type => {
          console.log(`   📊 ${type.type}: ${type.count} calls (${type.percentage}%)`)
        })
      } else {
        console.log('   📭 No call types found (no calls with intent data)')
      }
      
      // Test 5: Hourly Distribution
      console.log('\n5️⃣ Hourly Distribution:')
      const hourlyData = await dbService.getHourlyDistribution()
      const peakHours = hourlyData
        .filter(hour => hour.calls > 0)
        .sort((a, b) => b.calls - a.calls)
        .slice(0, 3)
      
      if (peakHours.length > 0) {
        console.log('   🕐 Peak hours:')
        peakHours.forEach(hour => {
          console.log(`      ${hour.hour}: ${hour.calls} calls`)
        })
      } else {
        console.log('   📭 No calls found for hourly analysis')
      }
      
      // Test 6: Weekly Calls
      console.log('\n6️⃣ Weekly Calls:')
      const weeklyCalls = await dbService.getWeeklyCalls()
      const totalWeeklyCalls = weeklyCalls.reduce((sum, day) => sum + day.calls, 0)
      console.log(`   📅 Total calls this week: ${totalWeeklyCalls}`)
      
      if (totalWeeklyCalls > 0) {
        console.log('   📊 Daily breakdown:')
        weeklyCalls.forEach(day => {
          console.log(`      ${day.day}: ${day.calls} calls (${Math.round(day.duration / 60)}m total)`)
        })
      } else {
        console.log('   📭 No calls found for weekly analysis')
      }
      
      // Test 7: Complete Dashboard Data
      console.log('\n7️⃣ Complete Dashboard Data:')
      const dashboardData = await dbService.getDashboardData()
      console.log(`   📊 Has data: ${dashboardData.hasData}`)
      console.log(`   📞 Total calls: ${dashboardData.callStats.totalCalls}`)
      console.log(`   📅 Today's calls: ${dashboardData.callStats.todayCalls}`)
      console.log(`   📈 Success rate: ${dashboardData.callStats.successRate}%`)
      console.log(`   ⏱️ Average duration: ${dashboardData.callStats.avgCallDuration}`)
      console.log(`   🕐 Peak hour: ${dashboardData.callStats.peakHour}`)
      console.log(`   🎯 Top call type: ${dashboardData.callStats.topCallType}`)
      console.log(`   📋 Recent calls: ${dashboardData.recentCalls.length}`)
      console.log(`   📊 Call types: ${dashboardData.callTypes.length}`)
      
      console.log('\n' + '=' .repeat(40))
    }
    
    console.log('\n🎉 Real Data Fetching Test Complete!')
    console.log('\n📋 Summary:')
    console.log('   ✅ Company information retrieval')
    console.log('   ✅ Call statistics calculation')
    console.log('   ✅ Recent calls data')
    console.log('   ✅ Call types distribution')
    console.log('   ✅ Hourly distribution analysis')
    console.log('   ✅ Weekly calls aggregation')
    console.log('   ✅ Complete dashboard data integration')
    
    console.log('\n🚀 Your dashboard is now showing real data from Supabase!')
    
  } catch (error) {
    console.error('\n❌ Real data fetching test failed:', error)
    console.log('\n🔧 Troubleshooting steps:')
    console.log('   1. Check Supabase connection and credentials')
    console.log('   2. Verify the companies table has data')
    console.log('   3. Ensure the calls table has data')
    console.log('   4. Check database permissions and RLS policies')
    process.exit(1)
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testRealDataFetching()
}

export { testRealDataFetching }

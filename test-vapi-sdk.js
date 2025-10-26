// Test Vapi Web SDK loading
console.log('🧪 Testing Vapi Web SDK...')

// Test 1: Check if Vapi is already loaded
console.log('Vapi already loaded:', typeof window.Vapi)

// Test 2: Try to load Vapi Web SDK
const script = document.createElement('script')
script.src = 'https://cdn.jsdelivr.net/npm/@vapi-ai/web@1.0.0/dist/index.js'
script.onload = () => {
  console.log('✅ Vapi Web SDK loaded successfully')
  console.log('Vapi constructor:', typeof window.Vapi)
  
  // Test 3: Try to create a Vapi instance
  try {
    const vapi = new window.Vapi('test-key')
    console.log('✅ Vapi instance created successfully')
    console.log('Vapi instance:', vapi)
    console.log('Vapi.start method:', typeof vapi.start)
  } catch (error) {
    console.error('❌ Error creating Vapi instance:', error)
  }
}
script.onerror = (error) => {
  console.error('❌ Failed to load Vapi Web SDK:', error)
}

document.head.appendChild(script)
console.log('📤 Vapi Web SDK script added to head')

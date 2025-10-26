// Test script to verify assistant ID extraction
// This matches exactly what the working HTML does

const testResponse = [
  {
    "id": "365e462b-9e38-4e63-bd39-58c12fb07136",
    "orgId": "01eebda3-ce00-4cfc-b419-fea6881abc36",
    "name": "McDonald's",
    "voice": {
      "model": "eleven_turbo_v2_5",
      "voiceId": "lvQdCgwZfBuOzxyV5pxu",
      "provider": "11labs",
      "stability": 0.5,
      "similarityBoost": 0.75
    },
    "createdAt": "2025-10-26T00:14:20.251Z",
    "updatedAt": "2025-10-26T00:14:20.251Z",
    "model": {
      "model": "gpt-4o",
      "messages": [
        {
          "role": "system",
          "content": "Test content"
        }
      ],
      "provider": "openai"
    },
    "firstMessage": "Bonjour, ici Ava de McDonald's, en quoi puis-je vous aider ?",
    "voicemailMessage": "Bonjour, vous êtes bien chez McDonald's. Nous ne sommes pas disponibles pour le moment. Veuillez rappeler pendant nos horaires d'ouverture. Merci !",
    "endCallMessage": "Merci de votre appel, bonne journée !",
    "transcriber": {
      "model": "nova-2",
      "language": "fr",
      "provider": "deepgram"
    },
    "isServerUrlSecretSet": false
  }
]

console.log('🧪 Testing assistant ID extraction...')
console.log('Test response:', testResponse)

// This is exactly what the working HTML does
const assistantId = testResponse.id || testResponse[0]?.id

console.log('✅ Extracted assistant ID:', assistantId)
console.log('Expected ID: 365e462b-9e38-4e63-bd39-58c12fb07136')
console.log('Match:', assistantId === '365e462b-9e38-4e63-bd39-58c12fb07136')

if (assistantId) {
  console.log('✅ SUCCESS: Assistant ID extracted correctly!')
} else {
  console.log('❌ FAILED: No assistant ID found')
}

export async function sendChatMessage(message) {
    try {
        const response = await fetch('https://api.gemini.com/v1/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_GEMINI_API_KEY}`
            },
            body: JSON.stringify({
                // Adjust the payload according to the Gemini API documentation.
                query: message,
                // Optionally include additional parameters
            })
        })

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }
        const data = await response.json()
        // Assuming the response has a property 'reply'
        return data.reply || 'No reply from API.'
    } catch (error) {
        console.error('Error calling Gemini API:', error)
        throw error
    }
}

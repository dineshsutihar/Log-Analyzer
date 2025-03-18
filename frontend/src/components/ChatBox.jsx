import React, { useState } from 'react'

function ChatBox() {
    const [input, setInput] = useState('')

    const handleChat = () => {
        // Here you can pass the input or log details to your chat interface.
        // For now, we simulate opening a new tab with a chat window.
        window.open('/chat', '_blank')
    }

    return (
        <div className="flex text-xs mt-8">
            <input
                type="text"
                placeholder="Chat with support..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="border border-r-0 border-gray-400 px-2 py-1 flex-1"
            />
            <button
                onClick={handleChat}
                className="bg-purple-700 text-white px-6 py-1 text-xs cursor-pointer"
            >
                Chat
            </button>
        </div>
    )
}

export default ChatBox

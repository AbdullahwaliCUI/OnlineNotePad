export interface AIMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export const mockAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const responses = [
        "That's an interesting idea! Here's how you might expand on it...",
        "I've analyzed your text. It looks clear, but you could make it punchier by...",
        "Here is a summary of the notes you provided...",
        "I can help you format this into a bulleted list.",
        "Let me rewrite that paragraph for better clarity.",
    ];

    // Specific responses based on keywords
    if (userMessage.toLowerCase().includes('summary')) {
        return "Here's a summary: The main point involves leveraging modern UI components to enhance user engagement.";
    }
    if (userMessage.toLowerCase().includes('fix')) {
        return "I've corrected the grammar in your selected text.";
    }

    return responses[Math.floor(Math.random() * responses.length)];
};

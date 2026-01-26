import { useState, useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { workflowApi } from '../../services/workflowApi';

export const ChatInterface = ({ onWorkflowGenerated }) => {
    const [messages, setMessages] = useState([
        { role: 'ai', content: "👋 Hi! I'm AutoFlow. Describe the workflow you want to build, and I'll create it for you." }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async (text) => {
        // Add user message
        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setIsLoading(true);

        try {
            // Call API
            const data = await workflowApi.generate(text);

            // Add AI response
            setMessages(prev => [...prev, {
                role: 'ai',
                content: "✅ Workflow generated! Check out the visualization on the right."
            }]);

            // Pass workflow data to parent
            if (onWorkflowGenerated && data.workflow) {
                onWorkflowGenerated(data.workflow);
            }

        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'ai',
                content: "❌ Sorry, I encountered an error while building the workflow. Please try again.",
                error: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                    <MessageBubble key={i} message={msg} />
                ))}

                {isLoading && (
                    <div className="mr-auto">
                        <TypingIndicator />
                        <span className="text-xs text-gray-400 ml-2">Building workflow...</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <ChatInput onSend={handleSend} disabled={isLoading} />
        </div>
    );
};

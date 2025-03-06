
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Bot } from "lucide-react";

interface Message {
  type: "user" | "bot";
  content: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "bot",
      content: "Hi! I'm here to help answer any questions about TailorMyResume. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState("");

  const faqResponses = {
    "pricing": "We offer three plans: Free (basic features), Pro ($29/mo), and Enterprise (custom pricing). Check our pricing page for more details!",
    "refund": "Yes, we offer a 14-day money-back guarantee if you're not satisfied with our service.",
    "payment": "We accept all major credit cards and PayPal. Enterprise plans can also pay via invoice.",
    "templates": "We offer various ATS-friendly resume templates. Free users get access to standard templates, while Pro users get premium templates.",
    "support": "We provide email support for all users. Pro users get priority support, and Enterprise users get a dedicated success manager.",
    "trial": "You can start with our Free plan to try out our basic features. No credit card required!",
    "cancel": "You can cancel your subscription anytime. There are no long-term commitments required.",
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessages: Message[] = [
      ...messages,
      { type: "user", content: input }
    ];

    // Simple keyword matching for FAQ
    const lowercaseInput = input.toLowerCase();
    let botResponse = "I'm not sure about that. Could you try asking something else? You can ask about pricing, refunds, payment methods, templates, support, or try our free plan.";

    for (const [keyword, response] of Object.entries(faqResponses)) {
      if (lowercaseInput.includes(keyword)) {
        botResponse = response;
        break;
      }
    }

    newMessages.push({ type: "bot", content: botResponse });
    
    setMessages(newMessages);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[380px] shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Assistant
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="flex flex-col gap-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[85%] ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-2 mt-4">
          <Input
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button size="icon" onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

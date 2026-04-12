import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ArrowLeft, ShieldCheck, User } from "lucide-react";

export default function Inbox() {
  const { user } = useAuth();
  const [match, params] = useRoute("/inbox/:chatId");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const chatId = match ? params.chatId : null;
  const [message, setMessage] = useState("");

  const { data: chats, isLoading: isChatsLoading } = useQuery<any[]>({
    queryKey: ["/api/chats"],
  });

  const { data: messages, isLoading: isMessagesLoading } = useQuery<any[]>({
    queryKey: [`/api/chats/${chatId}/messages`],
    enabled: !!chatId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chats/${chatId}/messages`] });
      setMessage("");
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && chatId) {
      sendMessageMutation.mutate(message);
    }
  };

  const activeChat = chats?.find((c) => c.id === chatId);

  // If no chat selected but chats exist on desktop, you could auto-select the first one.
  // For simplicity, we just show a placeholder if none selected.

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden flex">
      {/* ── Sidebar (Chats List) ── */}
      <div className={`w-full md:w-80 border-r border-border/50 flex flex-col ${chatId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border/50 font-bold text-lg font-display bg-muted/20">
          Messages
        </div>
        <div className="flex-1 overflow-y-auto">
          {isChatsLoading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading chats...</div>
          ) : chats?.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No conversations yet. {user?.role === 'BUYER' ? "Find talent to start connecting!" : "Buyers will contact you here."}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {chats?.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setLocation(`/inbox/${chat.id}`)}
                  className={`w-full text-left p-3 flex items-center gap-3 rounded-xl transition-colors ${chat.id === chatId ? 'bg-primary/10' : 'hover:bg-muted'}`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={chat.otherUser?.profileImageUrl || undefined} />
                    <AvatarFallback><User className="w-5 h-5 text-muted-foreground" /></AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-semibold text-sm truncate">
                      {chat.otherUser?.firstName || chat.otherUser?.companyName || chat.otherUser?.email?.split('@')[0]}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                       {chat.otherUser?.role === 'FREELANCER' ? 'Freelancer' : 'Buyer'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Active Chat View ── */}
      <div className={`flex-1 flex flex-col ${!chatId ? 'hidden md:flex' : 'flex'}`}>
        {!chatId ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col">
            <User className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a conversation to start messaging</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-border/50 flex items-center justify-between px-4 bg-muted/10">
              <div className="flex items-center gap-3">
                <button className="md:hidden p-2 -ml-2 text-muted-foreground" onClick={() => setLocation('/inbox')}>
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={activeChat?.otherUser?.profileImageUrl || undefined} />
                  <AvatarFallback><User className="w-4 h-4 text-muted-foreground" /></AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-sm">
                     {activeChat?.otherUser?.firstName || activeChat?.otherUser?.email?.split('@')[0]}
                  </div>
                  <div className="text-xs text-green-600 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online</div>
                </div>
              </div>
              
              {user?.role === 'BUYER' && (
                <Button 
                   size="sm" 
                   className="bg-amber-500 hover:bg-amber-600 text-white shadow-md gap-2 rounded-xl"
                   onClick={() => setLocation(`/projects/new?freelancerId=${activeChat?.otherUser?.id}`)}
                >
                  <ShieldCheck className="w-4 h-4" /> Create Contract
                </Button>
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {isMessagesLoading ? (
                 <div className="text-center text-muted-foreground text-sm my-auto">Loading messages...</div>
              ) : messages?.length === 0 ? (
                 <div className="text-center text-muted-foreground text-sm my-auto bg-muted/20 p-8 rounded-2xl mx-auto max-w-sm">
                    {user?.role === 'BUYER' 
                      ? "Start the conversation! Discuss project requirements, budget, and timeline here."
                      : "A buyer has connected with you! Reply quickly to secure the contract."}
                 </div>
              ) : (
                messages?.map((msg) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex max-w-[75%] ${isMe ? 'self-end' : 'self-start'}`}>
                      <div className={`p-3 rounded-2xl text-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border/50 bg-background">
              <form onSubmit={handleSend} className="flex gap-2">
                <Input 
                  className="flex-1 bg-muted/50 rounded-xl border-dashed"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={sendMessageMutation.isPending}
                />
                <Button type="submit" disabled={!message.trim() || sendMessageMutation.isPending} className="rounded-xl px-5">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

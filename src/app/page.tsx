'use client';

import { Plus, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { ChatInterface, ChatInterfaceRef } from "@/components/chat/ChatInterface";
import { ChatListContainer, ChatListContainerRef } from "@/components/chat/ChatListContainer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DocumentUpload } from "@/components/upload/DocumentUpload";
import { useAuth } from "@/context/AuthContext";
import { ChatService } from "@/lib/api/chatService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Home() {
  const { signIn, signOut, user } = useAuth();
  const router = useRouter();
  const [selectedChatId, setSelectedChatId] = useState<string>();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const chatListRef = useRef<ChatListContainerRef>(null);
  const chatInterfaceRef = useRef<ChatInterfaceRef>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !user) {
      const testEmail = process.env.NEXT_PUBLIC_TEST_EMAIL;
      const testPassword = process.env.NEXT_PUBLIC_TEST_PASSWORD;
      
      if (testEmail && testPassword) {
        signIn(testEmail, testPassword)
          .catch(error => console.error('Auto-login failed:', error));
      }
    }
  }, [signIn, user]);

  const handleSendMessage = async (message: string) => {
    if (!selectedChatId) return;

    try {
      const newMessage = await ChatService.addMessage(selectedChatId, message, true);
      chatInterfaceRef.current?.handleCreateMessage(newMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast('Failed to send message. Please try again.');
    }
  };

  const handleOpenUploadDialog = () => {
    setIsUploadDialogOpen(true);
  };

  const handleDocumentUploadSuccess = async (documentId: string, fileName: string) => {
    try {
      // Create a new chat with the document name
      const newChat = await ChatService.createChat(`${fileName}`, documentId);
            
      chatListRef.current?.handleCreateChat(newChat);
      setSelectedChatId(newChat.id);
      
      // Close the upload dialog
      setIsUploadDialogOpen(false);
      
      // Show success message
      toast.success(`Document uploaded and new chat created!`);
    } catch (error) {
      console.error('Failed to create new chat after document upload:', error);
      toast.error('Failed to create new chat. Please try again.');
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <div className="w-64 border-r flex flex-col">
        {/* New Chat Button */}
        <div className="p-4">
          <Button
            onClick={handleOpenUploadDialog}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>
        
        {/* Document/Chat List */}
        <div className="flex-1">
          <ChatListContainer 
            ref={chatListRef}
            onChatSelect={setSelectedChatId}
            selectedChatId={selectedChatId}
          />
        </div>

        {/* User Settings */}
        <div className="p-4 border-t">
          {user && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar>
                  <AvatarFallback>
                    {user.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="ml-2 text-sm text-muted-foreground">{user.email}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={async () => {
                  await signOut();
                  toast.success('Logged out successfully');
                  router.refresh();
                }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {selectedChatId ? (
          <ChatInterface
            ref={chatInterfaceRef}
            chatId={selectedChatId}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="scroll-m-20 text-4xl font-bold tracking-tight text-center mb-8">
                Chat with your Legal Documents
              </h1>
              <DocumentUpload onUploadSuccess={handleDocumentUploadSuccess} />
            </div>
          </main>
        )}
      </div>

      {/* Document Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload a Document to Start a New Chat</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Please upload a legal document to begin a new chat. The document will be processed and made available for your conversation.
            </p>
            <DocumentUpload onUploadSuccess={handleDocumentUploadSuccess} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
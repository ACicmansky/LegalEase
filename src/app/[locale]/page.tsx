"use client";

import { Plus, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { ChatInterface, ChatInterfaceRef } from "@/components/chat/ChatInterface";
import { ChatListContainer, ChatListContainerRef } from "@/components/chat/ChatListContainer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DocumentUpload } from "@/components/upload/DocumentUpload";
import { useAuth } from "@/context/AuthContext";
import { ChatService } from "@/lib/api/chatService";
import { addDocument } from "@/lib/services/documentService";
import { DocumentAnalyzeService } from '@/lib/api/documentAnalyzeService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { routing } from "@/i18n/routing";

export default function Home() {
  const t = useTranslations();
  const { signIn, signOut, user, loading: getUserLoading } = useAuth();
  const router = useRouter();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isDocumentAnalyzing, setIsDocumentAnalyzing] = useState(false);
  const chatListRef = useRef<ChatListContainerRef>(null);
  const chatInterfaceRef = useRef<ChatInterfaceRef>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "development" && !user) {
      const testEmail = process.env.NEXT_PUBLIC_TEST_EMAIL;
      const testPassword = process.env.NEXT_PUBLIC_TEST_PASSWORD;

      if (testEmail && testPassword) {
        signIn(testEmail, testPassword).catch((error) =>
          console.error("Auto-login failed:", error)
        );
      }
    }
  }, [signIn, user]);

  useEffect(() => {
    if (!getUserLoading) {
      if (!user) {
        router.push(`/${routing.defaultLocale}/login`);
      }
    }
  }, [getUserLoading, user, router]);

  const handleSendMessage = async (message: string) => {
    if (!selectedChatId) return;

    try {
      const userMessage = await ChatService.addMessage(selectedChatId, message, true);
      chatInterfaceRef.current?.handleCreateMessage(userMessage);

      const aiMessage = await ChatService.processUserMessage(selectedChatId, message);
      chatInterfaceRef.current?.handleCreateMessage(aiMessage);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(t("chat.failedToSend"));
    }
  };

  const handleOpenUploadDialog = () => {
    setIsUploadDialogOpen(true);
  };

  const handleCreateChatFromDocument = async (
    documentId: string,
    fileName: string
  ) => {
    try {
      // Create a new chat
      const newChat = await ChatService.createChat(`${fileName}`, documentId);
      chatListRef.current?.handleCreateChat(newChat);
      setSelectedChatId(newChat.id);

      // Close the upload dialog
      setIsUploadDialogOpen(false);

      await addDocument(documentId, fileName, newChat.id);

      // Set document analyzing state to true
      setIsDocumentAnalyzing(true);

      // Call documents analyze API
      const analysisResult = await DocumentAnalyzeService.analyzeDocument(documentId);

      // If analysis was successful, add the summary as an assistant message
      if (analysisResult.success && analysisResult.summary) {
        const summaryMessage = await ChatService.addMessage(
          newChat.id,
          analysisResult.summary,
          false // false means it's an assistant message
        );
        chatInterfaceRef.current?.handleCreateMessage(summaryMessage);
      }
    } catch (error) {
      console.error('Error creating chat from document:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to create chat from document'
      );
    } finally {
      // Set document analyzing state to false
      setIsDocumentAnalyzing(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left Sidebar */}
      <div className="w-72 border-r flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950/50">
        {/* New Chat Button */}
        <div className="p-4 border-b">
          <Button onClick={handleOpenUploadDialog} className="w-full shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            {t("chat.newChat")}
          </Button>
        </div>

        {/* Document/Chat List */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatListContainer
            ref={chatListRef}
            onChatSelect={setSelectedChatId}
            selectedChatId={selectedChatId ?? undefined}
          />
        </div>

        {/* User Settings */}
        <div className="p-4 border-t bg-slate-100/80 dark:bg-slate-900/30">
          {user && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar>
                  <AvatarFallback>
                    {user.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="ml-2 text-sm text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  await signOut();
                  toast.success("Logged out successfully");
                  router.refresh();
                }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-transparent to-background">
        {/* Show chat interface when chat is selected */}
        {selectedChatId ? (
          <ChatInterface
            ref={chatInterfaceRef}
            chatId={selectedChatId}
            onSendMessage={handleSendMessage}
            isDocumentAnalyzing={isDocumentAnalyzing}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="max-w-md text-center space-y-5">
              <h2 className="text-2xl font-semibold tracking-tight">{t("chat.welcomeTitle")}</h2>
              <p className="text-muted-foreground">{t("chat.welcomeDescription")}</p>
              <Button onClick={handleOpenUploadDialog} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                {t("chat.newChat")}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Document Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("upload.dialogTitle")}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              {t("upload.dialogDescription")}
            </p>
            <DocumentUpload onUploadSuccess={handleCreateChatFromDocument} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

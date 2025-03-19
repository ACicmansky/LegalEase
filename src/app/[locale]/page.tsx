"use client";

import { Plus, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Sling } from "hamburger-react";

import { ChatInterface, ChatInterfaceRef } from "@/components/chat/ChatInterface";
import { ChatListContainer, ChatListContainerRef } from "@/components/chat/ChatListContainer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DocumentUpload } from "@/components/upload/DocumentUpload";
import { useAuth } from "@/context/AuthContext";
import { ChatAPIService } from "@/lib/api/chatAPIService";
import { addDocument } from "@/lib/services/documentService";
import { DocumentAnalyzeService } from '@/lib/api/documentAnalyzeService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { routing } from "@/i18n/routing";
import { MessageType } from "@/types/chat";

export default function Home() {
  const t = useTranslations();
  const { signIn, signOut, user, loading: getUserLoading } = useAuth();
  const router = useRouter();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChatTitle, setSelectedChatTitle] = useState<string | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isDocumentAnalyzing, setIsDocumentAnalyzing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userHasToggledSidebar, setUserHasToggledSidebar] = useState(false);
  const chatListRef = useRef<ChatListContainerRef>(null);
  const chatInterfaceRef = useRef<ChatInterfaceRef>(null);

  // Initialize sidebar state based on screen size
  useEffect(() => {
    // Set initial state based on screen size (only on first render)
    setIsSidebarOpen(window.innerWidth >= 768);
  }, []);

  // Listen for window resize, but respect user's manual toggling
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768;

      // Only auto-change sidebar state if window size category changes
      // and the user hasn't manually toggled the sidebar
      if (!userHasToggledSidebar) {
        setIsSidebarOpen(isDesktop);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [userHasToggledSidebar]);

  // Handle hamburger menu toggle
  const handleSidebarToggle = (toggled: boolean) => {
    setIsSidebarOpen(toggled);
    setUserHasToggledSidebar(true);
  };

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
    if (!getUserLoading && !user) {
      router.push(`/${routing.defaultLocale}/login`);
    }
  }, [getUserLoading, user, router, routing.defaultLocale]);

  // Update the selected chat title whenever the selectedChatId changes
  useEffect(() => {
    if (selectedChatId && chatListRef.current) {
      const title = chatListRef.current.getSelectedChatTitle();
      setSelectedChatTitle(title);
    } else {
      setSelectedChatTitle(null);
    }
  }, [selectedChatId]);

  const handleOpenUploadDialog = () => {
    setIsUploadDialogOpen(true);
  };

  const handleCreateChat = async () => {
    const newChat = await ChatAPIService.createChat(t("chat.newChat"));
    chatListRef.current?.handleCreateChat(newChat);
    setSelectedChatId(newChat.id);

    // Close sidebar on mobile after selecting a chat
    if (window.innerWidth < 768) {
      handleSidebarToggle(false);
    }
  };

  const handleCreateChatFromDocument = async (
    documentId: string,
    fileName: string
  ) => {
    try {
      // Create a new chat
      const newChat = await ChatAPIService.createChat(`${fileName}`, documentId);
      chatListRef.current?.handleCreateChat(newChat);
      setSelectedChatId(newChat.id);

      // Close the upload dialog
      setIsUploadDialogOpen(false);

      // Close sidebar on mobile after selecting a chat
      if (window.innerWidth < 768) {
        handleSidebarToggle(false);
      }

      await addDocument(documentId, fileName, newChat.id);

      // Set document analyzing state to true
      setIsDocumentAnalyzing(true);

      // Call documents analyze API
      const analysisResult = await DocumentAnalyzeService.analyzeDocument(documentId);

      // If analysis was successful, add the summary
      if (analysisResult.success && analysisResult.summary) {
        const summaryMessage = await ChatAPIService.addMessage(
          newChat.id,
          analysisResult.summary,
          MessageType.Summary
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
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Navigation Bar */}
      <header className="h-12 md:h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-30 flex items-center px-2 md:px-4 fixed w-full top-0">
        <div className="flex items-center h-full">
          {/* Hamburger Menu Button - Always visible in the top bar */}
          <div className="flex items-center mr-2">
            <Sling toggled={isSidebarOpen} toggle={setIsSidebarOpen} onToggle={() => setUserHasToggledSidebar(true)} size={18} color={isSidebarOpen ? "#6366f1" : "#64748b"} rounded hideOutline duration={0.3} />
          </div>

          {/* Page Title / Chat Title */}
          <div className="text-sm font-medium truncate ml-1">
            {selectedChatId ?
              selectedChatTitle || t("chat.newChat") :
              t("chat.welcomeTitle")}
          </div>
        </div>
      </header>

      {/* Main content below the header */}
      <div className="flex flex-1 mt-12 md:mt-14 overflow-hidden">
        {/* Left Sidebar - Fixed position on mobile, part of the layout on desktop */}
        <aside className={`fixed md:relative h-[calc(100vh-48px)] md:h-auto z-20 w-72 border-r bg-slate-50/95 dark:bg-slate-950/90 
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            transition-transform duration-300 ease-in-out flex flex-col overflow-hidden`}>
          <div className="p-4 space-y-3 border-b">
            <Button onClick={handleCreateChat} className="w-full rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
              <Plus className="mr-2 h-4 w-4" />
              {t("chat.newChat")}
            </Button>

            <Button onClick={handleOpenUploadDialog} className="w-full rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
              <Plus className="mr-2 h-4 w-4" />
              {t("chat.newChatWithDocument")}
            </Button>
          </div>

          {/* Document/Chat List */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ChatListContainer
              ref={chatListRef}
              onChatSelect={(chatId) => {
                setSelectedChatId(chatId);
                // Close sidebar on mobile after selecting a chat
                if (window.innerWidth < 768) {
                  handleSidebarToggle(false);
                }
              }}
              selectedChatId={selectedChatId ?? undefined}
            />
          </div>

          {/* User Settings */}
          <div className="p-4 border-t bg-slate-100/90 dark:bg-slate-900/80">
            {user && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar>
                    <AvatarFallback>
                      {user.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="ml-2 text-sm text-muted-foreground truncate max-w-[150px]">
                    {user.email}
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={async () => {
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
        </aside>

        {/* Backdrop for mobile sidebar */}
        {isSidebarOpen && (
          <div className="md:hidden fixed inset-0 bg-black/30 z-10 mt-12" onClick={() => handleSidebarToggle(false)} />
        )}

        {/* Right Content Area - Use flex-grow to fill remaining space */}
        <main className={`flex-grow flex flex-col overflow-hidden bg-gradient-to-b from-transparent to-background w-full md:ml-0 transition-all duration-300 ease-in-out`}>
          {/* Show chat interface when chat is selected */}
          {selectedChatId ? (
            <ChatInterface
              ref={chatInterfaceRef}
              chatId={selectedChatId}
              isDocumentAnalyzing={isDocumentAnalyzing}
              onTitleCreated={(title) => {
                setSelectedChatTitle(title);
                // Also update the title in the chat list
                if (chatListRef.current && selectedChatId) {
                  chatListRef.current.updateChatTitle(selectedChatId, title);
                }
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 md:p-8">
              <div className="max-w-md text-center space-y-5">
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{t("chat.welcomeTitle")}</h2>
                <p className="text-sm md:text-base text-muted-foreground">{t("chat.welcomeDescription")}</p>
                <div className="p-4 space-y-3">
                  <Button onClick={handleCreateChat} className="w-full max-w-xs mx-auto rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                    <Plus className="mr-2 h-4 w-4" />
                    {t("chat.newChat")}
                  </Button>

                  <Button onClick={handleOpenUploadDialog} className="w-full max-w-xs mx-auto rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                    <Plus className="mr-2 h-4 w-4" />
                    {t("chat.newChatWithDocument")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Document Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[600px] w-[90%] max-w-[90%] sm:w-auto">
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

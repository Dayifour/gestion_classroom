import React, { useState, useEffect } from 'react'; // Assure-toi que React, useState, useEffect sont importés
import { MessageCircle, Search, Send, Paperclip, User as UserIcon, AlertTriangle } from 'lucide-react'; // <-- Ajout de AlertTriangle
import { apiService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

// Interfaces de données
interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string; // Utilise createdAt pour le timestamp
  is_read: boolean;
  sender?: User; // Informations de l'expéditeur si incluses
  recipient?: User; // Informations du destinataire si incluses
}

interface ConversationSummary {
  id: string; // L'ID de l'autre utilisateur dans la conversation
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatarUrl?: string; // Si tu as des avatars
}

export function MessagesList() {
  const { user, loading: authLoading } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [currentConversationMessages, setCurrentConversationMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les conversations (messages reçus pour l'utilisateur actuel)
  useEffect(() => {
    if (!authLoading && user) {
      loadConversations();
    }
  }, [authLoading, user]);

  const loadConversations = async () => {
    setLoadingConversations(true);
    setError(null);
    try {
      // Utilise apiService.getReceivedMessages et apiService.getSentMessages
      const receivedMessages: Message[] = await apiService.getReceivedMessages(); // <-- MODIFIÉ
      const sentMessages: Message[] = await apiService.getSentMessages();         // <-- MODIFIÉ

      const allMessages = [...receivedMessages, ...sentMessages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const conversationMap = new Map<string, ConversationSummary>();

      allMessages.forEach(msg => {
        const otherUser = msg.senderId === user?.id ? msg.recipient : msg.sender;
        if (!otherUser) return; // S'assurer que l'autre utilisateur existe

        const conversationId = otherUser.id;
        const conversationName = `${otherUser.first_name} ${otherUser.last_name}`;
        const lastMessageContent = msg.content;
        const timestamp = msg.createdAt;

        // Si la conversation n'existe pas encore ou si ce message est plus récent
        if (!conversationMap.has(conversationId) || new Date(timestamp) > new Date(conversationMap.get(conversationId)!.timestamp)) {
          conversationMap.set(conversationId, {
            id: conversationId,
            name: conversationName,
            lastMessage: lastMessageContent,
            timestamp: timestamp,
            unreadCount: 0 // Sera mis à jour après
          });
        }
      });

      // Calculer les messages non lus
      receivedMessages.forEach(msg => {
        if (!msg.is_read && msg.senderId !== user?.id) { // Si le message n'est pas lu et n'est pas de moi
          const senderId = msg.senderId;
          if (conversationMap.has(senderId)) {
            const convo = conversationMap.get(senderId)!;
            convo.unreadCount++;
            conversationMap.set(senderId, convo);
          }
        }
      });

      setConversations(Array.from(conversationMap.values()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

    } catch (err: any) {
      console.error('Error loading conversations:', err);
      setError(err.message || 'Erreur lors du chargement des conversations.'); // Utilise err.message
    } finally {
      setLoadingConversations(false);
    }
  };

  // Charger les messages de la conversation sélectionnée
  useEffect(() => {
    if (selectedConversationId && user) {
      loadCurrentConversationMessages(selectedConversationId);
    } else {
      setCurrentConversationMessages([]); // Vide les messages si aucune conversation sélectionnée
    }
  }, [selectedConversationId, user]);

  const loadCurrentConversationMessages = async (otherUserId: string) => {
    setLoadingMessages(true);
    setError(null);
    try {
      const messages: Message[] = await apiService.getConversation(otherUserId);
      setCurrentConversationMessages(messages);

      // Marquer les messages reçus comme lus
      messages.filter(msg => msg.recipientId === user?.id && !msg.is_read)
              .forEach(async msg => {
                try {
                  await apiService.markMessageAsRead(msg.id); // <-- MODIFIÉ
                } catch (readErr) {
                  console.error('Error marking message as read:', readErr);
                }
              });
      loadConversations(); // Recharge les conversations pour mettre à jour les comptes de non lus
    } catch (err: any) {
      console.error('Error loading current conversation:', err);
      setError(err.message || 'Erreur lors du chargement de la conversation.'); // Utilise err.message
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId || !user) return;

    try {
      await apiService.sendMessage(selectedConversationId, newMessage);
      setNewMessage('');
      loadCurrentConversationMessages(selectedConversationId); // Recharge la conversation pour voir le nouveau message
      loadConversations(); // Met à jour la liste des conversations
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Erreur lors de l\'envoi du message.'); // Utilise err.message
    }
  };

  if (loadingConversations) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Chargement des messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" /> {/* <-- Assure-toi que AlertTriangle est importé */}
        <h3 className="text-lg font-medium mb-2">Erreur de chargement</h3>
        <p>{error}</p>
        <button
          onClick={loadConversations}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white rounded-lg shadow-md overflow-hidden">
      {/* Colonne de gauche: Liste des conversations */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher des conversations..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm">Aucune conversation.</div>
          ) : (
            conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => setSelectedConversationId(convo.id)}
                className={`flex items-center w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  selectedConversationId === convo.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                  {convo.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3 text-left flex-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-900">{convo.name}</p>
                    {convo.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{convo.lastMessage}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(convo.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Colonne de droite: Zone de chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                {conversations.find(c => c.id === selectedConversationId)?.name.charAt(0).toUpperCase()}
              </div>
              <p className="ml-3 text-lg font-semibold text-gray-900">
                {conversations.find(c => c.id === selectedConversationId)?.name}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : currentConversationMessages.length === 0 ? (
                <div className="text-center text-gray-500">Commencez une nouvelle conversation.</div>
              ) : (
                currentConversationMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg shadow ${
                        message.senderId === user?.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 opacity-75 text-right">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <div className="flex-1">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez une conversation</h3>
              <p className="text-gray-600">Choisissez une conversation pour commencer à discuter.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

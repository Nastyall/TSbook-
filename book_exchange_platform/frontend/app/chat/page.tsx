'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

interface Chat {
  other_user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    profile: {
      avatar: string | null;
    } | null;
  };
  last_message: string;
  last_message_time: string;
  book: {
    id: number;
    title: string;
    cover_image: string | null;
  } | null;
  unread_count: number;
}

interface Message {
  id: number;
  sender: number;
  sender_username: string;
  receiver: number;
  receiver_username: string;
  book: number | null;
  book_details: {
    id: number;
    title: string;
    cover_image: string | null;
  } | null;
  content: string;
  attachment_image: string | null;
  is_read: boolean;
  created_at: string;
}

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingChat, setFetchingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isUserScrolledRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const owner_id = searchParams.get('owner_id');
  const bookId = searchParams.get('book_id');

  
  const [targetUserId, setTargetUserId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push('/login');
      return;
    }
    if (isAuthenticated && !authLoading) {
      fetchChats();
      
      
      if (owner_id) {
        console.log('Использование owner_id из URL:', owner_id);
        setTargetUserId(parseInt(owner_id));
      }
    }
  }, [token, owner_id, isAuthenticated, authLoading]);

  useEffect(() => {
    if (targetUserId && !selectedChat && !fetchingChat) {
      setFetchingChat(true);
      loadChatWithUser(targetUserId.toString());
    }
  }, [targetUserId, bookId]);

  useEffect(() => {
    if (selectedChat && messages.length === 0) {
      loadMessages(selectedChat);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (!isUserScrolledRef.current) {
      scrollToBottom();
    }
  }, [messages]);

  const fetchChats = async () => {
    if (!token) {
      console.log('fetchChats: нет токена, редирект на вход');
      router.push('/login');
      return;
    }
    try {
      console.log('fetchChats: запрос к API с токеном:', token.substring(0, 20) + '...');
      const response = await fetch('http://127.0.0.1:8000/api/messages/chats/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log('fetchChats: статус ответа:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('fetchChats: чаты загружены:', data.length);
        console.log('Первый чат:', data[0]);
        setChats(data);
        
        
        if (selectedChat && data.length > 0) {
          const chatFromList = data.find((c: any) => c.other_user.id === selectedChat.other_user.id);
          if (chatFromList) {
            setSelectedChat({
              ...selectedChat,
              other_user: {
                ...selectedChat.other_user,
                username: chatFromList.other_user.username || selectedChat.other_user.username,
                first_name: chatFromList.other_user.first_name || selectedChat.other_user.first_name,
                last_name: chatFromList.other_user.last_name || selectedChat.other_user.last_name,
                profile: chatFromList.other_user.profile || selectedChat.other_user.profile,
              },
            });
          }
        }
      } else if (response.status === 401) {
        console.log('fetchChats: 401 ошибка, токен невалиден');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.push('/login');
      } else if (response.status === 400) {
        setChats([]);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Ошибка загрузки чатов:', response.status, errorData);
      }
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error);
    }
  };

  const loadChatWithUser = async (userId: string) => {
    if (!token) return;
    console.log('Загрузка чата с пользователем ID:', userId, 'bookId:', bookId);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/messages/?other_user_id=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log('Статус ответа сообщений:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Сообщения:', data);
        setMessages(data);
        isUserScrolledRef.current = false;
        
        
        let username = '';
        if (data.length > 0) {
          username = data[0].sender_username === user?.username 
            ? data[0].receiver_username 
            : data[0].sender_username;
        }
        
        console.log('Определён username:', username);
        
        
        const newChat: Chat = {
          other_user: {
            id: parseInt(userId),
            username: username,
            first_name: '',
            last_name: '',
            profile: { avatar: null },
          },
          last_message: data.length > 0 ? data[0].content : '',
          last_message_time: data.length > 0 ? data[0].created_at : '',
          book: data.length > 0 && data[0].book_details ? data[0].book_details : (bookId ? { id: parseInt(bookId), title: '', cover_image: null } : null),
          unread_count: 0,
        };
        setSelectedChat(newChat);
        console.log('selectedChat установлен:', newChat);
        
        
        await fetchChats();
      } else if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.push('/login');
      } else {
        const errorText = await response.text();
        console.error('Ошибка загрузки сообщений:', response.status, errorText);
      }
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    }
  };

  const loadMessages = async (chat: Chat) => {
    if (!token) return;
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/messages/?other_user_id=${chat.other_user.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log('loadMessages: загружено сообщений:', data.length);
        setMessages(data);
        isUserScrolledRef.current = false;
        
        
        if (data.length > 0 && selectedChat) {
          const username = data[0].sender_username === user?.username 
            ? data[0].receiver_username 
            : data[0].sender_username;
          
          if (username && username !== selectedChat.other_user.username) {
            setSelectedChat({
              ...selectedChat,
              other_user: {
                ...selectedChat.other_user,
                username,
              },
            });
          }
        }
        
        
        await fetchChats();
      } else if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.push('/login');
      }
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    }
  };

  const sendMessage = async () => {
    if ((!messageText.trim() && !selectedFile) || !token || !selectedChat) {
      console.log('sendMessage: проверка не пройдена', { 
        hasText: !!messageText.trim(), 
        hasFile: !!selectedFile,
        hasToken: !!token, 
        hasSelectedChat: !!selectedChat,
        selectedChatId: selectedChat?.other_user.id
      });
      return;
    }

    const receiverId = selectedChat.other_user.id;
    const bookIdNum = bookId ? parseInt(bookId) : null;
    
    console.log('Отправка сообщения:', {
      receiver_id: receiverId,
      book_id: bookIdNum,
      content: messageText,
      hasFile: !!selectedFile,
      selectedChat: selectedChat
    });

    try {
      const formData = new FormData();
      formData.append('receiver_id', receiverId.toString());
      formData.append('content', messageText || ' ');
      
      if (selectedFile) {
        formData.append('attachment_image', selectedFile, selectedFile.name);
        console.log('FormData содержит файл:', selectedFile.name, selectedFile.size, selectedFile.type);
      }
      
      
      console.log('FormData keys:', Array.from(formData.keys()));
      for (const [key, val] of formData.entries()) {
        console.log(`  ${key}:`, val instanceof File ? `File(${val.name}, ${val.size})` : val);
      }

      
      if (bookIdNum) {
        formData.append('book_id', bookIdNum.toString());
      }

      console.log('Отправка FormData с файлом:', selectedFile?.name);

      const response = await fetch('http://127.0.0.1:8000/api/messages/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          
        },
        body: formData,
      });

      console.log('Статус ответа отправки:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ошибка отправки сообщения:', response.status, errorText);
        alert(`Ошибка отправки: ${errorText.substring(0, 200)}`);
        return;
      }
      
      const newMessage = await response.json();
      console.log('Сообщение отправлено:', newMessage);
      setMessages([...messages, newMessage]);
      setMessageText('');
      setSelectedFile(null);
      isUserScrolledRef.current = false;
      fetchChats();
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Файл должен быть меньше 5MB');
        return;
      }
      setSelectedFile(file);
      console.log('Файл выбран:', file.name, file.size);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMessagesScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    isUserScrolledRef.current = distanceToBottom > 100;
  };

  const deleteMessage = async (messageId: number) => {
    if (!token) return;
    
    if (!confirm('Вы уверены, что хотите удалить это сообщение?')) {
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/messages/${messageId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessages(messages.filter(msg => msg.id !== messageId));
        console.log('Сообщение удалено:', messageId);
      } else if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.push('/login');
      } else {
        const errorText = await response.text();
        console.error('Ошибка удаления сообщения:', response.status, errorText);
        alert(`Ошибка удаления: ${errorText}`);
      }
    } catch (error) {
      console.error('Ошибка удаления сообщения:', error);
    }
  };

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[url('/background.jpg')] bg-cover bg-center bg-no-repeat relative">
        <div className="absolute inset-0 bg-[#e8ded1]/45"></div>
        <div className="relative z-10 flex flex-col flex-1">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-[#57534e] mb-4">{'Для доступа к чату необходимо войти в систему'}</p>
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-3 bg-[#5C4033] text-white rounded-lg hover:bg-[#3E2B22] transition-colors"
              >
                {'Войти'}
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[url('/background.jpg')] bg-cover bg-center bg-no-repeat relative">
        <div className="absolute inset-0 bg-[#e8ded1]/45"></div>
        <div className="relative z-10 text-center">
          <p className="text-[#57534e]">{'Загрузка...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[url('/background.jpg')] bg-cover bg-center bg-no-repeat relative">
      <div className="absolute inset-0 bg-[#e8ded1]/45"></div>
      <div className="relative z-10 flex flex-col flex-1">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-180px)] bg-[#F5F0EB] p-4 rounded-2xl border border-[#D6C8B8]">
            
            <div className="bg-[#E8DED1] rounded-xl border border-[#D6C8B8] overflow-hidden">
              <div className="p-5 border-b border-[#D6C8B8] bg-[#5C4033]">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-white text-lg">{'Сообщения'}</h2>
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
                <div className="w-full h-0.5 bg-gradient-to-r from-[#F5F0EB] to-transparent mt-3 rounded-full"></div>
              </div>
              <div className="overflow-y-auto h-[calc(100%-60px)]">
                {chats.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-[#5C4033]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-[#B8A598]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-[#7A6555] font-medium">{'У вас пока нет сообщений'}</p>
                    <p className="text-[#B8A598] text-sm mt-1">{'Начните общение с другими пользователями'}</p>
                  </div>
                ) : (
                  chats.map((chat, index) => (
                    <div
                      key={index}
                      onClick={async () => {
                        setSelectedChat(chat);
                        await loadMessages(chat);
                      }}
                      className={`p-4 border-b border-[#D6C8B8] cursor-pointer transition-colors ${
                        selectedChat?.other_user.id === chat.other_user.id
                          ? 'bg-[#5C4033]/10 border-l-4 border-l-[#5C4033]'
                          : 'hover:bg-[#F5F0EB]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          {chat.other_user.profile?.avatar ? (
                            <img
                              src={chat.other_user.profile.avatar.startsWith('http')
                                ? chat.other_user.profile.avatar
                                : `http://localhost:8000${chat.other_user.profile.avatar}`}
                              alt={chat.other_user.username}
                              className="w-12 h-12 rounded-full object-cover border border-[#5C4033]/10"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-[#5C4033] text-white rounded-full flex items-center justify-center font-bold">
                              {chat.other_user.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {chat.unread_count > 0 && (
                            <span className="absolute bottom-0 right-0 w-4 h-4 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center">
                              <span className="text-[10px] font-bold text-white">{chat.unread_count}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className={`text-sm font-bold truncate ${
                              selectedChat?.other_user.id === chat.other_user.id
                                ? 'text-[#3E2B22]'
                                : 'text-[#6B5748]'
                            }`}>
                              {chat.other_user.username}
                            </p>
                            <p className={`text-xs ${
                              selectedChat?.other_user.id === chat.other_user.id
                                ? 'text-[#5C4033]'
                                : 'text-[#B8A598]'
                            }`}>
                              {new Date(chat.last_message_time).toLocaleTimeString('ru-RU', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <p className={`font-semibold text-sm truncate ${
                            selectedChat?.other_user.id === chat.other_user.id
                              ? 'text-[#3E2B22]'
                              : 'text-[#3E2B22]'
                          }`}>
                            {chat.other_user.first_name} {chat.other_user.last_name}
                          </p>
                          <p className={`text-sm truncate ${
                            selectedChat?.other_user.id === chat.other_user.id
                              ? 'text-[#5C4033]/90'
                              : 'text-[#A89585]'
                          }`}>
                            {chat.last_message}
                          </p>
                          {chat.book && (
                            <div className="flex items-center gap-1 mt-1">
                              <svg className="w-3.5 h-3.5 text-[#A89585]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              <p className={`text-xs truncate ${
                                selectedChat?.other_user.id === chat.other_user.id
                                  ? 'text-[#5C4033]/80'
                                  : 'text-[#C4B5A8]'
                              }`}>
                                {chat.book.title}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            
            <div className="md:col-span-2 bg-[#F5F0EB] rounded-xl border border-[#D6C8B8] flex flex-col h-full">
              {selectedChat ? (
                <>
                  
                  <div className="p-4 border-b border-[#D6C8B8] bg-[#E8DED1] flex-shrink-0">
                    <div className="flex items-center gap-3">
                      {(() => {
                        console.log('Chat Header - selectedChat:', selectedChat);
                        console.log('Chat Header - username:', selectedChat?.other_user?.username);
                        const username = selectedChat.other_user.username;
                        const hasAvatar = selectedChat.other_user.profile?.avatar;
                        
                        if (username) {
                          if (hasAvatar) {
                            return (
                              <Link
                                href={`/users/${username}`}
                                className="relative hover:opacity-80 transition-opacity block"
                              >
                                <img
                                  src={hasAvatar.startsWith('http') ? hasAvatar : `http://localhost:8000${hasAvatar}`}
                                  alt={username}
                                  className="w-12 h-12 rounded-full object-cover border border-[#5C4033]/10"
                                />
                              </Link>
                            );
                          } else {
                            return (
                              <Link
                                href={`/users/${username}`}
                                className="relative hover:opacity-80 transition-opacity block"
                              >
                                <div className="w-12 h-12 bg-[#5C4033] text-white rounded-full flex items-center justify-center font-bold">
                                  {username.charAt(0).toUpperCase()}
                                </div>
                              </Link>
                            );
                          }
                        } else {
                          if (hasAvatar) {
                            return (
                              <img
                                src={hasAvatar.startsWith('http') ? hasAvatar : `http://localhost:8000${hasAvatar}`}
                                alt={selectedChat.other_user.username}
                                className="w-12 h-12 rounded-full object-cover border border-[#5C4033]/10"
                              />
                            );
                          } else {
                            return (
                              <div className="w-12 h-12 bg-[#5C4033] text-white rounded-full flex items-center justify-center font-bold">
                                {selectedChat.other_user.username?.charAt(0).toUpperCase() || '?'}
                              </div>
                            );
                          }
                        }
                      })()}
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-[#5C4033]">
                          {selectedChat.other_user.username}
                        </p>
                        <h3 className="font-bold text-lg text-[#3E2B22]">
                          {selectedChat.other_user.first_name} {selectedChat.other_user.last_name}
                        </h3>
                        {selectedChat.book && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <svg className="w-3 h-3 text-[#A89585]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <p className="text-xs text-[#A89585]">
                              {'Обсуждение: '}<span className="font-semibold text-[#5C4033]">{selectedChat.book.title}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[320px] bg-[#FAF7F2]" onScroll={handleMessagesScroll}>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="flex items-end gap-2 max-w-[70%]">
                          {msg.sender !== user?.id && (
                            selectedChat.other_user.username ? (
                              <Link
                                href={`/users/${selectedChat.other_user.username}`}
                                className="flex-shrink-0 hover:opacity-80 transition-opacity"
                              >
                                {selectedChat.other_user.profile?.avatar ? (
                                  <img
                                    src={selectedChat.other_user.profile!.avatar.startsWith('http')
                                      ? selectedChat.other_user.profile!.avatar
                                      : `http://localhost:8000${selectedChat.other_user.profile!.avatar}`}
                                    alt={selectedChat.other_user.username}
                                    className="w-7 h-7 rounded-full object-cover border border-[#5C4033]/10"
                                  />
                                ) : (
                                  <div className="w-7 h-7 bg-[#5C4033] text-white rounded-full flex items-center justify-center text-xs font-semibold">
                                    {selectedChat.other_user.username.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </Link>
                            ) : selectedChat.other_user.profile?.avatar ? (
                              <img
                                src={selectedChat.other_user.profile!.avatar.startsWith('http')
                                  ? selectedChat.other_user.profile!.avatar
                                  : `http://localhost:8000${selectedChat.other_user.profile!.avatar}`}
                                alt={selectedChat.other_user.username}
                                className="w-7 h-7 rounded-full object-cover border border-[#5C4033]/10"
                              />
                            ) : (
                              <div className="w-7 h-7 bg-[#5C4033] text-white rounded-full flex items-center justify-center text-xs font-semibold">
                                {selectedChat.other_user.username?.charAt(0).toUpperCase() || '?'}
                              </div>
                            )
                          )}
                          <div
                            className={`relative rounded-lg p-3 ${
                              msg.sender === user?.id
                                ? 'bg-[#5C4033] text-white rounded-br-sm'
                                : 'bg-[#F5F0EB] border-l-4 border-l-[#5C4033] rounded-r-lg rounded-bl-sm'
                            }`}
                          >
                            <p className={`whitespace-pre-wrap text-sm leading-relaxed ${
                              msg.sender === user?.id ? 'text-[#E8DED1]' : 'text-[#3E2B22]'
                            }`}>{msg.content}</p>
                            {msg.attachment_image && (
                              <img
                                src={msg.attachment_image}
                                alt="Attachment"
                                className="mt-2 rounded-lg max-w-[200px] h-auto shadow-sm"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  console.error('Ошибка загрузки изображения:', target.src);
                                  console.error('Полученный URL:', msg.attachment_image);
                                  target.style.display = 'none';
                                }}
                                onLoad={(e) => {
                                  console.log('Изображение загружено успешно:', msg.attachment_image);
                                }}
                              />
                            )}
                            <div className={`flex items-center justify-end gap-1 mt-1.5 ${
                              msg.sender === user?.id ? 'text-[#E8DED1]' : 'text-[#8B7363]'
                            }`}>
                              <span className="text-[11px] font-medium">
                                {new Date(msg.created_at).toLocaleTimeString('ru-RU', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {msg.sender === user?.id && (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                              {msg.sender === user?.id && (
                                <button
                                  onClick={() => deleteMessage(msg.id)}
                                  className="ml-2 text-[#E8DED1]/60 hover:text-red-400 transition-colors"
                                  title="Удалить сообщение"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  
                  <div className="p-4 border-t border-[#D6C8B8] bg-[#E8DED1]">
                    {selectedFile && (
                      <div className="mb-3 flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={URL.createObjectURL(selectedFile)}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-lg border border-[#5C4033]/20"
                          />
                          <button
                            onClick={handleFileRemove}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            title="Удалить файл"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#3E2B22] truncate">{selectedFile.name}</p>
                          <p className="text-xs text-[#A89585]">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-3 items-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <button
                        onClick={triggerFileInput}
                        className="p-3.5 bg-[#5C4033]/10 text-[#5C4033] rounded-lg hover:bg-[#5C4033]/20 transition-colors"
                        title="Прикрепить фото"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Введите сообщение..."
                          className="w-full px-5 py-3.5 rounded-lg border border-[#D6C8B8] bg-white text-[#3E2B22] placeholder-[#A89585] focus:border-[#5C4033] focus:ring-1 focus:ring-[#5C4033] outline-none transition-colors"
                        />
                      </div>
                      <button
                        onClick={sendMessage}
                        disabled={(!messageText.trim() && !selectedFile)}
                        className="px-6 py-3.5 bg-[#5C4033] text-white rounded-lg hover:bg-[#3E2B22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-[#F5F0EB]">
                  <div className="text-center p-8">
                    <div className="w-32 h-32 bg-[#5C4033]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-16 h-16 text-[#A89585]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-[#3E2B22] mb-2">{'Добро пожаловать в чат'}</h3>
                    <p className="text-[#A89585] text-lg">{'Выберите чат для начала общения'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[url('/background.jpg')] bg-cover bg-center bg-no-repeat relative">
        <div className="absolute inset-0 bg-[#e8ded1]/45"></div>
        <div className="relative z-10 text-text-secondary">{'Загрузка...'}</div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}

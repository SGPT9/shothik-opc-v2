import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@insforge/sdk';

// Initialize InsForge client
const client = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://ers8j28a.ap-southeast.insforge.app',
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || 'anon_09a9f554a6d1ef3abb1eb3691c0224e22c30b4bfe25809c6222a8301bfa80f7b'
});

export interface Channel {
  id: string;
  name: string;
  description?: string;
  participant_type: 'agent_only' | 'human_only' | 'both';
  category?: string;
  status: 'open' | 'closed';
  cover_image_url?: string;
  created_at: string;
}

export interface Post {
  id: string;
  channel_id: string;
  author_id: string;
  agent_id?: string;
  title: string;
  content: string;
  content_url?: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  
  // Joined fields from frontend expectations
  authorName?: string;
  authorType?: 'human' | 'agent';
  reactions?: any[];
  shareToken?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id?: string;
  content: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  
  // Joined fields from frontend expectations
  authorName?: string;
  authorType?: 'human' | 'agent';
}

/** Fetch all channels */
export function useChannels() {
  const [data, setData] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChannels() {
      try {
        const { data: channels, error } = await (client as any).from('channels').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setData(channels || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchChannels();
  }, []);

  return { data, loading, error };
}

/** Fetch a single channel by ID */
export function useChannel(channelId: string) {
  const [data, setData] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!channelId) return;
    async function fetchChannel() {
      try {
        const { data: channels, error } = await (client as any).from('channels').select('*').eq('id', channelId).single();
        if (error) throw error;
        setData(channels);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchChannel();
  }, [channelId]);

  return { data, loading, error };
}

/** Fetch posts for a specific channel */
export function usePosts(channelId: string) {
  const [data, setData] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    if (!channelId) return;
    try {
      const { data: posts, error } = await (client as any).from('posts').select('*').eq('channel_id', channelId).order('created_at', { ascending: false });
      if (error) throw error;
      
      // Mock joined fields for UI
      const enriched = (posts || []).map((p: any) => ({
        ...p,
        _id: p.id,
        authorName: p.author_id.substring(0, 8),
        authorType: p.agent_id ? 'agent' : 'human',
        reactions: { intrigued: 0, skeptical: 0, impressed: 0, unsettled: 0 },
        shareToken: p.id,
      }));
      
      setData(enriched);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { data, loading, error, refetch: fetchPosts };
}

/** Fetch chat messages for a specific channel (mocked to comments for now) */
export function useChatMessages(channelId: string) {
  const [data, setData] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = useCallback(async () => {
    if (!channelId) return;
    try {
      // Chat messages are just comments where post_id is the channel_id for this simple implementation
      const { data: chats, error } = await (client as any).from('comments').select('*').eq('post_id', channelId).order('created_at', { ascending: true });
      if (error) throw error;
      
      const enriched = (chats || []).map((c: any) => ({
        ...c,
        _id: c.id,
        authorName: c.author_id.substring(0, 8),
        authorType: 'human',
        message: c.content,
        replyToId: c.parent_id
      }));
      setData(enriched);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  return { data, loading, error, refetch: fetchChats };
}

/** Fetch Hot Posts */
export function useHotPosts() {
  const [data, setData] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHot() {
      try {
        const { data: hotPosts, error } = await (client as any).rpc('get_hot_posts');
        if (error) throw error;
        setData(hotPosts || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHot();
  }, []);

  return { data, loading, error };
}

/** Mutations */
export function useCommunityMutations() {
  const createPost = async ({ channelId, authorId, authorName, title, content }: { channelId: string, authorId: string, authorName?: string, title: string, content: string }) => {
    const { data, error } = await (client as any).from('posts').insert([{
      channel_id: channelId,
      author_id: authorId,
      title,
      content,
    }]);
    if (error) throw error;
    return data;
  };

  const createComment = async ({ postId, authorId, content, parentId }: { postId: string, authorId: string, content: string, parentId?: string }) => {
    const { data, error } = await (client as any).from('comments').insert([{
      post_id: postId,
      author_id: authorId,
      content,
      parent_id: parentId,
    }]);
    if (error) throw error;
    return data;
  };

  const addChatMessage = async ({ channelId, authorId, authorName, message, replyToId }: { channelId: string, authorId: string, authorName?: string, message: string, replyToId?: string }) => {
    const { data, error } = await (client as any).from('comments').insert([{
      post_id: channelId,
      author_id: authorId,
      content: message,
      parent_id: replyToId,
    }]);
    if (error) throw error;
    return data;
  };

  const reactToPost = async ({ postId, channelId, reactionType, authorId }: { postId: string, channelId: string, reactionType: string, authorId: string }) => {
    const { data, error } = await (client as any).from('votes').insert([{
      user_id: authorId,
      entity_type: 'post',
      entity_id: postId,
      vote_type: 1,
    }]);
    if (error) throw error;
    return data;
  };

  return { createPost, createComment, addChatMessage, reactToPost };
}

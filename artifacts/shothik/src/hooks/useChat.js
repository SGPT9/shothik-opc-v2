// hooks/useChat.js
import {
  useCreateChatMutation,
  useDeleteChatMutation,
  useGetMyResearchChatsQuery,
  useUpdateChatNameMutation,
} from "@/redux/api/research/researchChatApi";
import { setCurrentChat, updateTitle } from "@/redux/slices/researchChatSlice";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

export const useChat = () => {
  const dispatch = useDispatch();
  // ⚡ Bolt: Using specific property selectors to prevent unnecessary re-renders
  const currentChatId = useSelector((state) => state.researchChat.currentChatId);
  const title = useSelector((state) => state.researchChat.title);

  const [createChat] = useCreateChatMutation();
  const [updateChatName] = useUpdateChatNameMutation();
  const [deleteChat] = useDeleteChatMutation();

  const { data: chats, isLoading, refetch } = useGetMyResearchChatsQuery();

  const createNewChat = useCallback(
    async (name) => {
      try {
        const result = await createChat(name).unwrap();
        dispatch(setCurrentChat(result.id));
        return result;
      } catch (error) {
        console.error("Failed to create chat:", error);
        throw error;
      }
    },
    [createChat, dispatch],
  );

  const selectChat = useCallback(
    (chatId) => {
      dispatch(setCurrentChat(chatId));
    },
    [dispatch],
  );

  const updateCurrentChatName = useCallback(
    async (name) => {
      if (!currentChatId) return;

      try {
        await updateChatName({ id: currentChatId, name }).unwrap();
        dispatch(updateTitle(name));
      } catch (error) {
        console.error("Failed to update chat name:", error);
        throw error;
      }
    },
    [currentChatId, updateChatName, dispatch],
  );

  const deleteCurrentChat = useCallback(async () => {
    if (!currentChatId) return;

    try {
      await deleteChat(currentChatId).unwrap();
      dispatch(setCurrentChat(null));
    } catch (error) {
      console.error("Failed to delete chat:", error);
      throw error;
    }
  }, [currentChatId, deleteChat, dispatch]);

  return {
    chats,
    currentChatId,
    title,
    isLoading,
    createNewChat,
    selectChat,
    updateCurrentChatName,
    deleteCurrentChat,
    refetchChats: refetch,
  };
};

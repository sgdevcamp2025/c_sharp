import { useEffect, useReducer } from 'react';

import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/src/shared';

import {
  getWorkspaceList,
  WorkspaceListResponse,
  joinChannelResponse,
  unjoinChannelResponse,
} from '../api';
import { useWorkspaceMessages, useWorkspaceSubscription } from '../model';

type Action =
  | { type: 'SET_INITIAL_DATA'; payload: WorkspaceListResponse }
  | { type: 'ADD_JOINED_CHANNEL'; payload: joinChannelResponse }
  | { type: 'ADD_UNJOINED_CHANNEL'; payload: unjoinChannelResponse };

type State = {
  joinedChannels: joinChannelResponse[];
  unjoinedChannels: unjoinChannelResponse[];
};

const initialState: State = {
  joinedChannels: [],
  unjoinedChannels: [],
};

const workspaceReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_INITIAL_DATA':
      return {
        joinedChannels: action.payload.joinedChannels || [],
        unjoinedChannels: action.payload.unjoinedChannels || [],
      };

    case 'ADD_JOINED_CHANNEL':
      return {
        ...state,
        joinedChannels: [...state.joinedChannels, action.payload],
      };

    case 'ADD_UNJOINED_CHANNEL':
      return {
        ...state,
        unjoinedChannels: [...state.unjoinedChannels, action.payload],
      };

    default:
      return state;
  }
};

export const useWorkspaceChannels = (workspaceId: number) => {
  const { subscribe } = useWorkspaceSubscription(workspaceId);
  const { data: workspaceSocketMessage } = useWorkspaceMessages(workspaceId);

  const [state, dispatch] = useReducer(workspaceReducer, initialState);

  const {
    data: workspaceData,
    isLoading,
    error,
    refetch,
  } = useQuery<WorkspaceListResponse>({
    queryKey: QUERY_KEYS.workspaceList(workspaceId),
    queryFn: () => getWorkspaceList(workspaceId),
    enabled: workspaceId !== -1,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    const unsubscribe = subscribe();
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [subscribe]);

  useEffect(() => {
    if (!workspaceData) return;
    dispatch({ type: 'SET_INITIAL_DATA', payload: workspaceData });
  }, [workspaceData]);

  useEffect(() => {
    if (!workspaceSocketMessage) return;

    const userString = localStorage.getItem('user');
    if (!userString) return;
    try {
      const user = JSON.parse(userString);
      const userId = user.userId;
      if (!userId) return;

      const isUserCreator = workspaceSocketMessage.createUserId === userId;
      if (isUserCreator) {
        dispatch({
          type: 'ADD_JOINED_CHANNEL',
          payload: workspaceSocketMessage,
        });
      } else {
        dispatch({
          type: 'ADD_UNJOINED_CHANNEL',
          payload: workspaceSocketMessage,
        });
      }
    } catch (error) {
      console.error('Failed to parse user data:', error);
    }
  }, [workspaceSocketMessage]);

  const refreshChannels = async () => {
    try {
      console.log('채널 목록 새로고침 중...');
      const result = await refetch();
      console.log('채널 목록 새로고침 완료:', result.data);
      return result;
    } catch (error) {
      console.error('채널 목록 새로고침 실패:', error);
      throw error;
    }
  };

  return { ...state, isLoading, error, refetch: refreshChannels };
};

import { ApiServerType } from '@/src/shared/services/models';

export const getBaseUrl = (serverType: ApiServerType): string => {
  const ports: Record<ApiServerType, string | undefined> = {
    gateway: process.env.NEXT_PUBLIC_GATEWAY_SERVER_PORT,
    auth: process.env.NEXT_PUBLIC_AUTH_SERVER_PORT,
    stock: process.env.NEXT_PUBLIC_STOCK_SERVER_PORT,
    file: process.env.NEXT_PUBLIC_FILE_SERVER_PORT,
    chat1: process.env.NEXT_PUBLIC_CHAT_SERVER1_PORT,
    chat2: process.env.NEXT_PUBLIC_CHAT_SERVER2_PORT,
    history: process.env.NEXT_PUBLIC_HISTORY_SERVER_PORT,
    workspace: process.env.NEXT_PUBLIC_WORKSPACE_SERVER_PORT,
    push: process.env.NEXT_PUBLIC_PUSH_SERVER_PORT,
    state: process.env.NEXT_PUBLIC_STATE_SERVER_PORT,
    signaling: process.env.NEXT_PUBLIC_SIGNALING_SERVER_PORT,
  };

  const port = ports[serverType];

  if (!port) {
    throw new Error(`❌ Unknown serverType: ${serverType}`);
  }

  return `${process.env.NEXT_PUBLIC_REAL_BASE_URL}`;
};

import { AUTH_ERROR_MESSAGES } from './authorization-errors';
import { WORKSPACE_ERROR_MESSAGES } from './workspace-errors';

export const ERROR_MESSAGES: Record<string, string> = {
  ...AUTH_ERROR_MESSAGES,
  ...WORKSPACE_ERROR_MESSAGES,
};

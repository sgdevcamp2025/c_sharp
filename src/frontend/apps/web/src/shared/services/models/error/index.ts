import { AUTH_ERROR_MESSAGES } from './authorization-errors';
import type { AuthErrorCode } from './authorization-errors';
import { WORKSPACE_ERROR_MESSAGES } from './workspace-errors';
import type { WorkspaceErrorCode } from './workspace-errors';

export type ErrorCode = AuthErrorCode | WorkspaceErrorCode;

export const ERROR_MESSAGES: Record<string, string> = {
  ...AUTH_ERROR_MESSAGES,
  ...WORKSPACE_ERROR_MESSAGES,
};

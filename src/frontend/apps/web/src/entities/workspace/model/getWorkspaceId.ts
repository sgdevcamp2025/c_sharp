import { WORKSPACE_ID } from './WorkspaceId';

export const getWorkspaceId = (stockSlug: string): number => {
  switch (stockSlug) {
    case 'samsung-electronics':
      return WORKSPACE_ID.SAMSUNG;
    case 'sk-hynix':
      return WORKSPACE_ID.SK_HYNIX;
    case 'kakao':
      return WORKSPACE_ID.KAKAO;
    case 'naver':
      return WORKSPACE_ID.NAVER;
    case 'hanwha-aerospace':
      return WORKSPACE_ID.HWANHWA;
    default:
      return -1;
  }
};

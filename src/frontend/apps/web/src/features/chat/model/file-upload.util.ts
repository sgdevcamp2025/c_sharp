import type { FileData } from './file-data.type';
import { validateFileSize, generateVideoThumbnail } from './file.utils';

type SetFilesState = React.Dispatch<React.SetStateAction<FileData[]>>;

/**
 * `input[type="file"]`의 `change` 이벤트를 받아서,
 * 선택된 파일들을 기존 상태(state)에 추가
 * 이미지/비디오 파일의 최대 용량도 검증하며,
 * **비디오 파일**이라면 중간 프레임을 썸네일로 생성해 저장
 *
 * @remarks
 * - 최대 용량(이미지: 20MB, 영상: 200MB)을 초과한 파일은 무시함.
 * - 동영상은 재생 길이의 **중간 지점**을 썸네일로 사용
 *
 * @param event - `input[type="file"]`의 `change` 이벤트
 * @param setSelectedFiles - 파일 목록을 관리하는 React 상태 업데이트 함수
 *
 * @example
 * ```ts
 * // 예시: 컴포넌트 내부에서 사용
 * const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);
 *
 * <input
 *   type="file"
 *   multiple
 *   onChange={(event) => handleFileChangeEvent(event, setSelectedFiles)}
 * />
 * ```
 */
export const handleFileChangeEvent = async (
  event: React.ChangeEvent<HTMLInputElement>,
  setSelectedFiles: SetFilesState,
) => {
  const files = Array.from(event.target.files || []);
  // 이벤트 초기화
  event.target.value = '';

  for (const file of files) {
    if (!validateFileSize(file)) continue;

    try {
      const fileData: FileData = {
        id: Math.random().toString(36).substring(7),
        name: file.name,
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'video',
      };

      // 비디오라면 썸네일 생성
      if (fileData.type === 'video') {
        try {
          const thumbnailUrl = await generateVideoThumbnail(file);
          if (thumbnailUrl) {
            fileData.thumbnailUrl = thumbnailUrl;
          }
        } catch (error) {
          console.error('Failed to generate thumbnail:', error);
        }
      }

      // 상태에 추가
      setSelectedFiles((prev) => [...prev, fileData]);
    } catch (error) {
      console.error('Error processing file:', error);
    }
  }
};

/**
 * 지정된 `id`를 가진 파일을 상태에서 제거하고,
 * 해당 파일에 할당되었던 **object URL**도 해제하여 메모리를 정리
 *
 * @param id - 제거할 파일의 고유 식별자
 * @param setSelectedFiles - 파일 목록을 관리하는 React 상태 업데이트 함수
 *
 * @example
 * ```ts
 * // 예시: 특정 파일 삭제
 * removeFile(someFileId, setSelectedFiles);
 * ```
 */
export const removeFile = (id: string, setSelectedFiles: SetFilesState) => {
  setSelectedFiles((prev) => {
    const fileToRemove = prev.find((file) => file.id === id);
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    return prev.filter((file) => file.id !== id);
  });
};

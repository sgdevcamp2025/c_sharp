import { danger, fail, warn, message } from 'danger';

// PR에서 변경된 파일 목록 가져오기
const changedFiles = danger.git.modified_files;

// 예시: 변경된 파일에 대해 경고 추가
if (changedFiles.some((file) => file.includes('src/frontend'))) {
  warn('Frontend files were modified. Please ensure that UI tests are run.');
}

// 예시: 특정 파일이 포함된 경우 실패를 표시
if (changedFiles.some((file) => file.includes('README.md'))) {
  fail(
    'The README.md file was modified. Please check for outdated documentation.'
  );
}

// 예시: 특정 파일 변경을 알림으로 표시
if (changedFiles.length === 0) {
  message('No files were modified in this PR.');
}

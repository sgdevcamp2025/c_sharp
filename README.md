# 📌 프로젝트 이름

주식 실시간 커뮤니티 서비스 '주톡피아'

## 👥 팀 소개

### 무엇이든 될 수 있는 C#팀

### 팀원 소개

| 역할                   | 이름   | GitHub                                          | 이메일                   |
| ---------------------- | ------ | ----------------------------------------------- | ------------------------ |
| 팀장,프론트엔드 개발자 | 손지은 | [GitHub 링크](https://github.com/handje)        | sonjieun2661@gmail.com   |
| 프론트엔드 개발자      | 김규회 | [GitHub 링크](https://github.com/KimKyuHoi)     | k546kh@gmail.com         |
| 백엔드 개발자          | 김보람 | [GitHub 링크](https://github.com/bo-ram-bo-ram) | qhfka8253@chungbuk.ac.kr |
| 백엔드 개발자          | 김세훈 | [GitHub 링크](https://github.com/Ki-met-hoon)   | shggm2000@gmail.com      |
| 백엔드 개발자          | 이미르 | [GitHub 링크](https://github.com/mirlee0304)    | danzzydala@gmail.com     |

---

## 📝 프로젝트 개요

- **프로젝트 목표**: 주식의 단순한 게시판 형태의 커뮤니티를 넘어서 실시간으로 의견을 주고 받을 수 있는 서비스 제공
- **주요 기능**
  - 실시간 주식 시세 및 차트
  - 주식별 워크스페이스 및 채널 제공
  - 채널별 채팅, 허들 기능 제공

## 🛠 기술 스택

### 🔹 백엔드 (BE)

- **주요 언어**: Java
- **프레임워크 및 라이브러리**: Spring Boot, Apache Kafka, WebRTC, FCM, SockJS, Spring Cloud Gateway, Kurento Media Server, Coturn
- **데이터베이스**: PostgreSQL, MongoDB, Redis, Amazon S3
- **API 방식**: Apache Kafka, REST API
- **클라우드 및 배포 환경**: Docker, AWS EC2, GitHub Actions
- **기타 사용 도구**: 한국투자증권 Open API, Kakao Open API, Slack, GitHub

### 🔹 프론트엔드 (FE)

- **주요 언어**: TypeScript
- **프레임워크 및 라이브러리**: Next.js
- **상태 관리**: Zustand
- **UI 라이브러리/디자인 시스템**: shadcn/ui, Tailwind CSS
- **빌드 및 번들러**
  - **빌드**: TurboRepo
  - **번들러**
    - Next.js 앱의 경우 → SWC
    - UI 라이브러리의 경우 → Rollup, esbuild
- **배포**: netlify
- **기타 사용 도구**: pnpm, GitHub Actions, 한국투자증권 Open API, Slack, GitHub, GitHub Projects

## 🚀 팀 컨벤션

### 🔹 GitHub Project & Issue

- 스프린트, 마일스톤, 이슈를 한 번에 관리
- 마일스톤 일정: 1차(2/2), 2차(2/16), 3차(2/23)
- 스프린트(1주일) 단위로 이슈를 미리 생성

### 🔹 Branch

- 기능별 브랜치 구분하여 작업
- 브랜치 예시: `main`, `dev`, `fe-feat/구현내용`
- 브랜치는 최소한의 범위를 잡고 작업 후 삭제

### 🔹 Commit

```plaintext
<Commit Message Header>
#이슈번호 <type>(<scope>): <short summary>

Commit Scope: fe | be
Commit Type: build | ci | docs | feat | fix | perf | refactor
```

### 🔹 PR

- 작업 내용이 명확하도록 제목과 내용을 작성
- 팀원이 이해하기 쉽도록 라벨, 프로젝트, 마일스톤 연동

### 🔹 코드리뷰 및 코드 스타일

- **코드리뷰 기준**
  - 우선순위에 따라 리뷰 진행
  - 24시간 이내 리뷰하기
  - 최소 1명 이상의 팀원이 리뷰 후 진행
- **코드 스타일**:
  - **백엔드**: [우아한테크코스(우테코) 코드 스타일](https://github.com/woowacourse/java-code-style) 준수
  - **프론트엔드**: ESLint, Prettier 적용

## 🔧 설치 방법

이 프로젝트를 로컬에서 실행하는 방법은 다음과 같습니다.

```bash
# FrontEnd

# 1. 저장소 클론
git clone https://github.com/sgdevcamp2025/c_sharp.git

# 2. 프로젝트 디렉터리로 이동
cd src/frontend

# 3. 패키지 설치
pnpm install

# 4. 환경 변수 설정 (.env 파일 생성)

# 5. 개발 서버 실행
pnpm run dev
```

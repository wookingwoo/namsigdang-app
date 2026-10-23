# 남식당

남도학숙 학생들이 은평관과 동작관 식단을 빠르게 확인할 수 있도록 만든 Expo 기반 통합 앱입니다. 하나의 코드베이스로 웹, 안드로이드, iOS를 함께 지원합니다.

## namsigdang service
- namsigdang-crawler: https://github.com/wookingwoo/namsigdang-crawler
- namsigdang-app: https://github.com/wookingwoo/namsigdang-app
- namsigdang-android-app: https://github.com/wookingwoo/namsigdang-android-app
- namsigdang-chatbot: https://github.com/wookingwoo/namsigdang-chatbot

## 핵심 기능

- 은평관 / 동작관 전환
- 날짜별 식단 조회
- 아침 / 점심 / 저녁 구분 표시
- Firebase Firestore 연동

## Firestore 구조

`menu` 컬렉션 아래에 `Dongjak`, `Eunpyeong` 문서가 있고, 각 문서 아래 연도별 서브컬렉션과 월별 문서가 있다고 가정합니다.

```text
menu
  Dongjak
    year_2026
      month_03
        do20260314a: "..."
        do20260314b: "..."
        do20260314c: "..."
  Eunpyeong
    year_2026
      month_03
        eu20260314a: "..."
        eu20260314b: "..."
        eu20260314c: "..."
```

## 시작 방법

1. 의존성 설치

```bash
npm install
```

2. 환경 변수 파일 생성

`.env.example`을 참고해 `.env` 파일을 만들고 Firebase Web App 설정값을 채웁니다.

Firebase 설정값을 어디서 복사해야 하는지 자세한 절차는 [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) 를 참고하면 됩니다.

Firebase Hosting으로 웹 배포하는 절차는 [FIREBASE_DEPLOY.md](./FIREBASE_DEPLOY.md) 를 참고하면 됩니다.

3. 개발 서버 실행

```bash
npm run web
```

또는

```bash
npm start
```

## 주요 스크립트

```bash
npm run web                   # Expo 웹 개발 서버 실행
npm run build:web             # Firebase 환경 변수 검증 후 Expo 웹 빌드 생성
npm run validate:firebase-env # Firebase 환경 변수 누락 여부 확인
npm test                      # 환경 변수 CLI + TypeScript 단위 테스트 전체 실행
npm run test:env              # 환경 변수 파싱·검증·CLI 테스트
npm run test:unit             # 날짜·식단·Firebase 단위 테스트
npm run test:coverage         # 전체 테스트 + 핵심 소스 파일별 커버리지 검사
npm run typecheck             # TypeScript 타입 검사
```

## 테스트와 검증

테스트 도구는 Node.js 20.19 이상, 22.12 이상 또는 24 이상을 사용합니다. 테스트는 Firebase 자격 증명이나 실제 Firestore 연결 없이 실행됩니다. 외부 Firebase SDK 경계만 대체하고 날짜 계산, 입력 검증, 식단 변환과 초기화 로직은 실제 소스를 검사합니다.

```bash
npm ci
npm test
npm run test:coverage
npm run typecheck
```

| 범위 | 검증 내용 |
| --- | --- |
| 날짜 | 로컬 날짜, 윤년·월말·연도 변경, 일광절약시간, ±3개월 포함 경계, 5일/7일 날짜 목록 |
| 식단 | 관별 월 문서와 필드, 쉼표·공백 처리, 미등록·잘못된 값, 조회 오류, 날짜 입력 검증, 빈 결과 간 변경 격리 |
| Firebase 초기화 | 설정값 매핑, 앱·DB 재사용, 기존 앱 활용, 설정 누락, 개발용 진단, 실패 후 재시도 |
| 환경 변수 CLI | dotenv 파싱, 파일·프로세스 우선순위, 값 노출 방지, 실제 프로세스 종료 코드 |

`date.ts`, `menu.ts`, `firebase.ts`는 **파일별 줄·구문·함수·분기 커버리지 100%**를 검사합니다. 보고서는 `coverage/`에 생성되며 Git에 포함하지 않습니다. 이는 명시된 세 모듈의 커버리지이며, React 화면·훅·기기별 렌더링·실제 Firestore 연동을 검증하는 E2E 테스트는 포함하지 않습니다.

GitHub Actions는 Node 20/22/24, Windows/Linux, UTC·서울·로스앤젤레스 시간대의 다섯 조합에서 타입 검사와 커버리지를 실행합니다. 이 워크플로는 secrets를 사용하지 않으므로 외부 기여자의 PR에도 실행할 수 있습니다. 웹 배포는 기존 Firebase Hosting 워크플로가 별도로 담당합니다.

## 환경 변수

웹 빌드와 Firebase Hosting 배포에는 아래 값이 모두 필요합니다. GitHub Actions 배포에서는 같은 이름의 repository/organization variables를 먼저 사용하고, 없으면 repository secrets를 사용합니다.

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

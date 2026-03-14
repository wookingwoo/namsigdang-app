# 남식당

남도학숙 학생들이 은평관과 동작관 식단을 빠르게 확인할 수 있도록 만든 Expo 기반 통합 앱입니다. 하나의 코드베이스로 웹, 안드로이드, iOS를 함께 지원합니다.

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

## 환경 변수

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

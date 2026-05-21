# Firebase Hosting 배포 가이드

남식당 앱은 Expo 웹 빌드 결과물을 `dist/` 폴더로 export한 뒤 Firebase Hosting에 배포할 수 있습니다.

이 문서는 현재 프로젝트 구조를 기준으로 웹 배포 절차만 정리합니다. Firebase Web SDK 환경 변수 설정은 [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)를 먼저 참고하세요.

## 1. 사전 준비

배포 전에 아래 항목이 준비되어 있어야 합니다.

- Firebase 프로젝트가 생성되어 있어야 합니다.
- `.env` 파일에 Firebase Web App 설정값이 들어 있어야 합니다.
- `npm install`이 끝난 상태여야 합니다.

환경 변수가 비어 있으면 웹 빌드는 되더라도 실행 시 Firebase 초기화가 실패할 수 있습니다.

## 2. Firebase CLI 설치 및 로그인

Firebase Hosting 배포에는 Firebase CLI가 필요합니다.

```bash
npm install -g firebase-tools
firebase login
```

이미 CLI가 설치되어 있다면 로그인만 다시 확인하면 됩니다.

## 3. Hosting 초기화

프로젝트 루트에서 아래 명령을 실행합니다.

```bash
firebase init hosting
```

질문이 나오면 이 프로젝트에서는 아래처럼 선택하면 됩니다.

- `Please select an option:` -> `Use an existing project`
- `Select a default Firebase project for this directory:` -> 배포할 Firebase 프로젝트 선택
- `What do you want to use as your public directory?` -> `dist`
- `Configure as a single-page app (rewrite all urls to /index.html)?` -> `Yes`
- `Set up automatic builds and deploys with GitHub?` -> `No`
- `File dist/index.html already exists. Overwrite?` -> `No`

초기화가 끝나면 루트에 `firebase.json`, `.firebaserc` 파일이 생성됩니다.

## 4. 웹 빌드 생성

Expo 웹 산출물을 다시 만듭니다.

```bash
npm run build:web
```

정상적으로 완료되면 `dist/` 폴더에 아래와 같은 파일이 생성됩니다.

```text
dist/
  index.html
  metadata.json
  _expo/
```

`.env` 값을 변경했다면 반드시 이 명령을 다시 실행한 뒤 배포해야 합니다.

`npm run build:web`는 빌드 전에 Firebase 환경 변수가 모두 있는지 검사합니다. 값이 비어 있으면 Firebase 설정이 빈 문자열로 번들에 들어가 배포 사이트에서 식단 조회가 실패하므로, 누락된 키를 채운 뒤 다시 빌드해야 합니다.

GitHub Actions로 배포한다면 repository 또는 organization variables에 아래 값을 모두 등록해야 합니다. 이미 repository secrets에 같은 이름으로 등록했다면 그대로 사용할 수 있습니다.

```text
EXPO_PUBLIC_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID
```

## 5. Firebase Hosting 배포

빌드가 끝났으면 아래 명령으로 배포합니다.

```bash
firebase deploy --only hosting
```

배포가 완료되면 보통 아래 주소 중 하나로 접속할 수 있습니다.

```text
https://<project-id>.web.app
https://<project-id>.firebaseapp.com
```

## 6. 반복 배포 절차

코드를 수정한 뒤 다시 배포할 때는 아래 두 명령만 실행하면 됩니다.

```bash
npm run build:web
firebase deploy --only hosting
```

## 7. firebase.json 예시

`firebase init hosting`을 정상적으로 마치면 보통 아래와 비슷한 설정이 생성됩니다.

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

이 프로젝트는 Expo 웹 단일 페이지 앱으로 배포하는 구성이므로 `rewrites`가 있어야 새로고침이나 직접 URL 접근 시 404를 피할 수 있습니다.

## 8. package.json 스크립트로 단축하기

원하면 `package.json`에 아래 스크립트를 추가해 배포 명령을 줄일 수 있습니다.

```json
{
  "scripts": {
    "build:web": "expo export --platform web",
    "deploy:hosting": "npm run build:web && firebase deploy --only hosting"
  }
}
```

추가 후에는 아래처럼 실행하면 됩니다.

```bash
npm run deploy:hosting
```

## 9. 자주 발생하는 문제

### Firebase 설정 오류

앱 실행 시 Firebase 초기화 오류가 뜨면 `.env`의 `EXPO_PUBLIC_FIREBASE_*` 값이 비어 있거나 잘못된 경우가 많습니다.

### Firestore 권한 오류

배포는 성공했는데 식단 데이터가 보이지 않으면 Firestore 보안 규칙에서 `menu` 컬렉션 읽기가 막혀 있을 수 있습니다.

### 빈 화면 또는 404

`firebase.json`의 `public`이 `dist`가 아니거나 SPA rewrite가 빠져 있으면 새로고침 시 404가 발생할 수 있습니다.

### 수정 내용이 반영되지 않음

웹 코드 수정 후 `firebase deploy`만 실행하면 이전 빌드가 올라갈 수 있습니다. 항상 먼저 `npx expo export --platform web`를 다시 실행하세요.

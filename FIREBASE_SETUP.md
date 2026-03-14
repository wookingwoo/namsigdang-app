# Firebase / Firestore Setup

남식당 앱은 Firebase의 Web SDK 설정값을 사용합니다. Expo 앱이지만 현재 코드 구조에서는 Android 앱 설정값이나 iOS 앱 설정값이 아니라 Firebase 콘솔의 `웹 앱` 설정값을 `.env`에 넣어야 합니다.

## 1. Firebase 프로젝트 열기

1. [Firebase Console](https://console.firebase.google.com/)에 접속합니다.
2. 남식당에서 사용할 프로젝트를 선택합니다.
3. 아직 프로젝트가 없다면 새 프로젝트를 만듭니다.

## 2. Firebase에 웹 앱 추가

1. 프로젝트 홈 화면에서 `앱에 Firebase 추가` 영역으로 이동합니다.
2. 플랫폼 선택에서 `웹 앱`을 선택합니다.
3. 앱 닉네임은 예를 들어 `namsigdang-web`처럼 입력합니다.
4. `Firebase Hosting 설정`은 지금 당장 필요 없으면 체크하지 않아도 됩니다.
5. 앱 등록을 완료합니다.

## 3. Firebase SDK 방식 선택

앱 등록 후 SDK 추가 안내가 나오면 `npm 사용`을 선택합니다.

이 프로젝트는 다음처럼 `firebase` 패키지를 직접 import하는 구조입니다.

```ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
```

따라서 `<script> 태그 사용`이 아니라 `npm 사용`이 맞습니다.

## 4. firebaseConfig 값 복사

Firebase 콘솔은 보통 아래와 비슷한 코드를 보여줍니다.

```ts
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "namsigdang-dev.firebaseapp.com",
  projectId: "namsigdang-dev",
  storageBucket: "namsigdang-dev.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def4567890abcd12",
};
```

여기서 필요한 값은 아래 6개입니다.

- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`

## 5. .env 파일에 넣기

프로젝트 루트에서 `.env.example`을 참고해 `.env` 파일을 만들고 아래처럼 입력합니다.

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=namsigdang-dev.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=namsigdang-dev
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=namsigdang-dev.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def4567890abcd12
```

값 매핑은 다음과 같습니다.

- `EXPO_PUBLIC_FIREBASE_API_KEY` <- `apiKey`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` <- `authDomain`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID` <- `projectId`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` <- `storageBucket`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` <- `messagingSenderId`
- `EXPO_PUBLIC_FIREBASE_APP_ID` <- `appId`

## 6. Firestore 데이터베이스 확인

앱은 Firestore에 아래 구조가 있다고 가정합니다.

```text
menu
  Dongjak
    year_2026
      month_03
        do20260314a: "김치국, 떡갈비구이, 취나물무침, 백김치"
        do20260314b: "북어채계란국, 폭찹스테이크, 꽃맛살샐러드, 오이지, 김치, 사탕"
        do20260314c: "수수밥, 근대된장국, 매콤돈등뼈찜, 청경채나물무침, 김치"
  Eunpyeong
    year_2026
      month_03
        eu20260314a: "콩나물두부찌개,소고기표고볶음,미나리나물,김치"
        eu20260314b: "게살크림스파게티,미역유부장국,생과일샐러드&망고소스,장아찌,김치,사탕"
        eu20260314c: "보리밥,소고기장국,바지락김치전,청포묵김가루무침,배추겉절이"
```

Firestore가 아직 비어 있다면 먼저 이 구조대로 데이터를 넣어야 앱에서 식단이 보입니다.

## 7. Firestore 보안 규칙 확인

개발 중이라면 최소한 앱에서 `menu` 데이터를 읽을 수 있어야 합니다. 규칙이 너무 엄격하면 식단 조회가 실패합니다.

개발용으로는 예를 들어 읽기 허용 규칙을 둘 수 있습니다.

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /menu/{document=**} {
      allow read: if true;
    }
  }
}
```

이 규칙은 개발 확인용입니다. 운영 배포 전에는 필요한 범위로 더 좁히는 편이 좋습니다.

## 8. 앱 실행

환경 변수 입력이 끝나면 아래 명령으로 실행합니다.

```bash
npm run web
```

또는

```bash
npm start
```

## 자주 헷갈리는 점

- `API key`는 Firebase Web App 설정값의 일부입니다. 별도로 Firestore 전용 키를 새로 발급받는 개념이 아닙니다.
- Expo 프로젝트라도 현재 구조에서는 `웹 앱` 설정값을 사용합니다.
- `storageBucket` 값은 프로젝트에 따라 `...appspot.com`일 수도 있고 `...firebasestorage.app`일 수도 있습니다. Firebase 콘솔에 보이는 값을 그대로 넣으면 됩니다.
- `.env`를 바꾼 뒤에는 개발 서버를 다시 시작하는 편이 안전합니다.

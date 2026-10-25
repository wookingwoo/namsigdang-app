# 남식당 3.0.0 릴리즈 준비

작성일: 2026-10-25 (Asia/Seoul). 이 문서는 출시 준비 기록이며 스토어 심사·출시 완료 기록이 아니다.

## 브랜치와 버전

- 릴리즈 브랜치: `release/3.0.0`, 기준: `develop`의 파란 테마 커밋 `ec3df8c`.
- 초안 PR: [#5](https://github.com/wookingwoo/namsigdang-app/pull/5). 네이티브 빌드·실기 검증·제출 정보의 남은 조건을 해결한 후 검토 상태를 바꾼다.
- PR 대상: `main`. 병합하면 기존 Firebase Hosting 워크플로가 웹을 배포하므로, 초안 PR 검토 후 별도로 병합한다.
- `release/` 브랜치의 PR은 Firebase Hosting 미리보기 빌드·배포를 건너뛴다. 준비 중인 산출물을 외부 호스팅에 자동 업로드하지 않는다.
- 표시 버전: `3.0.0` (`app.json`, `package.json`, `package-lock.json`).
- Android application ID: `com.wookingwoo.namdo_menu_V_1_1_0`.
- Android versionCode: `300` (제안값). [기존 Android 소스](https://github.com/wookingwoo/namsigdang-android-app/blob/master/app/build.gradle)는 `2.5.0`/`250`이다. **Play Console에 등록된 전체 트랙의 최신 번호를 확인해야 한다.** 300 이상이 이미 사용됐다면 제출 전에 더 큰 번호로 바꾼다.
- iOS buildNumber: `1` (제안값). Bundle ID와 기존 스토어 이력 미확인. 기존 iOS 앱이면 해당 Bundle ID와 제출 이력에 맞춘다.
- [스토어 등록 문안](STORE-LISTING.ko.md), [출시 체크리스트](CHECKLIST.md).

## 이번 준비 작업의 검증 결과

| 검증 | 결과 |
| --- | --- |
| 환경 변수 검증 | 통과, 설정값을 기록하지 않음 |
| 회귀 테스트 | CLI 13개 + 소스 86개, 총 99개 통과 |
| 커버리지 | date.ts/menu.ts/firebase.ts 파일별 줄·구문·함수·분기 100% |
| TypeScript | 통과 |
| Expo 프로덕션 내보내기 | web JS, Android/iOS Hermes 번들 및 에셋 46개, 15,914,017바이트 |
| 로컬 압축본 | namsigdang-3.0.0-export.zip, 7,448,670바이트 |
| 프로덕션 웹 확인 | 임시 로컬 정적 서버에서 앱 로딩·양쪽 관 식단 조회·파란 테마 확인 |
| 독립 코드 리뷰 | 수정이 필요한 지적 없음 |
| 스토어용 AAB/IPA | **미생성** — 빌드 방식·네이티브 도구·서명 정보·iOS Bundle ID 미확정 |
| Android/iPhone 실기 | 미실행 |

Windows 샌드박스 안의 Hermes 임시 파일 쓰기 제한으로 첫 내보내기는 실패했다. 호스트 권한으로 같은 소스를 내보내 성공했다. 이 과정에서 클라우드 빌드나 스토어 업로드는 실행하지 않았다.

## 로컬 산출물 정책

빌드 결과는 프로젝트 루트의 `artifacts/3.0.0/`에만 보관한다. 이 폴더와 APK/AAB/IPA·서명 파일은 `.gitignore`로 제외한다. PR에는 소스·설정·문서만 올리고 GitHub Releases나 Actions artifacts에 결과물을 업로드하지 않는다. 기존 `dist/`도 Git에서 제외되어 있다.

`artifacts/3.0.0/BUILD-REPORT.md`와 `SHA256SUMS.txt`는 로컬 검증 기록이다. 파일 목록과 해시는 결과물 생성 후 기록한다. 웹/JavaScript 내보내기 결과는 스토어에 제출할 네이티브 바이너리가 아니다.

## 로컬 내보내기

Node 의존성과 `.env`의 Firebase Web 설정 6개가 필요하다. 환경 변수 값이나 서명 비밀번호를 문서·PR·빌드 로그에 적지 않는다. `EXPO_PUBLIC_*` 값은 앱 번들에 포함되는 공개 클라이언트 설정이며 Firestore 보안 규칙을 대신하지 않는다.

```powershell
npm run typecheck
npm run test:coverage
npm run validate:firebase-env
npx expo export --platform all --output-dir artifacts/3.0.0/export
```

이 명령은 웹 정적 파일과 Android/iOS용 JavaScript·에셋을 내보낸다. `.aab`·`.ipa`를 생성하지 않는다.

## 스토어용 네이티브 빌드의 선행 조건

현재 Windows 환경의 PATH에 Java/Android SDK/EAS CLI가 없고 표준 SDK 설치 경로도 확인되지 않았다. iOS 로컬 빌드는 macOS와 Xcode가 필요하다. Expo 로그인도 확인되지 않았다. 따라서 네이티브 빌드 도구와 서명 정보가 준비되기 전에는 스토어 제출용 빌드를 완료했다고 판단하지 않는다.

`eas.json`은 `credentialsSource: local`을 사용한다. 기존 앱용 키를 임의 생성하지 않으며, 실제 키 경로와 비밀번호가 있는 `credentials.json`은 로컬에서만 준비한다. Android의 업로드 키와 Play App Signing 설정, iOS 배포 인증서·프로비저닝 프로필을 확인한다. `ios.bundleIdentifier`와 Expo 프로젝트 연결도 확정해야 한다.

지원되는 macOS/Linux 환경에서 도구·인증·서명·Firebase 설정을 준비한 후:

```bash
npx eas-cli build --platform android --profile production --local --output artifacts/3.0.0/namsigdang-3.0.0-android.aab
# iOS는 macOS + Xcode에서 실행
npx eas-cli build --platform ios --profile production --local --output artifacts/3.0.0/namsigdang-3.0.0-ios.ipa
```

`eas build --local`도 Expo 인증과 프로젝트 정보 확인을 위해 네트워크를 사용한다. EAS의 Windows/WSL 로컬 빌드는 공식 지원 대상이 아니다. Windows에서 Android를 직접 빌드하려면 Java·Android SDK를 설치한 뒤 Expo prebuild와 Gradle을 이용하는 별도 절차가 필요하다. 클라우드 빌드는 소스·서명 자료·산출물을 Expo로 전송하므로 사용자와 보관 정책을 먼저 확정한다. 이 PR에는 자동 업로드·자동 제출 워크플로를 추가하지 않는다.

## 공식 참고 자료

- [Expo 버전 관리](https://docs.expo.dev/build-reference/app-versions/)
- [Expo 로컬 빌드](https://docs.expo.dev/build-reference/local-builds/)
- [Expo 환경 변수](https://docs.expo.dev/eas/environment-variables/)
- [Android 앱 서명](https://developer.android.com/studio/publish/app-signing)
- [Google Play 대상 API 요구사항](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en-en)
- [Android 16KB 페이지](https://developer.android.com/guide/practices/page-sizes)
- [Apple 제출 SDK 요구사항](https://developer.apple.com/news/upcoming-requirements/?id=04282026a)

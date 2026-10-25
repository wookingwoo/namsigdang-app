# 남식당 3.0.0 릴리즈 준비

작성일: 2026-10-25 (Asia/Seoul). 이 문서는 출시 준비 기록이며 스토어 심사·출시 완료 기록이 아니다.

범위 변경 (2026-10-26, Asia/Seoul): 사용자 요청으로 Mac 준비와 iOS 네이티브 빌드를 추후로 미뤘다. 현재 진행 범위는 Android 로컬 빌드와 출시 준비다. iOS 관련 항목은 향후 참고로 유지하며, 이번 Android 준비 작업의 차단 조건으로 취급하지 않는다.

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
| Android 네이티브 컴파일 | **성공** — 로컬 Gradle bundleRelease/assembleRelease, 255개 태스크 실행 |
| Android AAB/APK | **서명 전 파일 생성** — AAB 41,746,706바이트, APK 59,785,744바이트; jarsigner/apksigner로 미서명 확인 |
| Android 메타데이터 | application ID 유지, versionName 3.0.0, versionCode 300, minSdk 24, targetSdk 36, ARM/ARM64/x86/x86_64 포함 |
| Android 권한 | INTERNET 및 앱 내부용 DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION만 남음 |
| 16KB 구조 검사 | AAB/APK 각각 64비트 네이티브 라이브러리 26개 ELF 검사 통과, APK ZIP 정렬 검사 통과. 실제 16KB 기기 테스트는 미실행 |
| 스토어 제출용 서명 | **미완료** — 기존 Android 서명·업로드 키 확인 필요 |
| iOS IPA | **사용자 요청으로 보류** (2026-10-26) — 이번 진행 범위에서 제외, 추후 Mac/Xcode·서명 정보·iOS Bundle ID 확인 후 재개 |
| Android/iPhone 실기 | 미실행 |

Windows 샌드박스 안의 Hermes 임시 파일 쓰기 제한으로 첫 내보내기는 실패했다. 호스트 권한으로 같은 소스를 내보내 성공했다. 이 과정에서 클라우드 빌드나 스토어 업로드는 실행하지 않았다.

## 로컬 산출물 정책

사용자가 **빌드 실행도 로컬에서만 진행**하도록 확정했다. 이 릴리즈에서 EAS 클라우드 빌드·클라우드 서명·원격 산출물 보관을 사용하지 않는다. 도구·의존성 다운로드는 로컬 컴파일을 위한 것이며 소스·빌드 파일 업로드를 포함하지 않는다.

빌드 결과는 프로젝트 루트의 `artifacts/3.0.0/`에만 보관한다. 이 폴더와 APK/AAB/IPA·서명 파일은 `.gitignore`로 제외한다. PR에는 소스·설정·문서만 올리고 GitHub Releases나 Actions artifacts에 결과물을 업로드하지 않는다. 기존 `dist/`도 Git에서 제외되어 있다.

`artifacts/3.0.0/BUILD-REPORT.md`와 `SHA256SUMS.txt`는 로컬 검증 기록이다. 파일 목록과 해시는 결과물 생성 후 기록한다. 웹/JavaScript 내보내기 결과는 스토어에 제출할 네이티브 바이너리가 아니다.

Android 네이티브 파일은 `namsigdang-3.0.0-android-unsigned.aab`, `namsigdang-3.0.0-android-unsigned.apk`다. **둘 다 서명이 없어 그대로 설치하거나 스토어에 제출할 수 없다.** AAB는 기존 Play 업로드 키, 기존 Play 설치 앱을 대체하는 APK는 실제 앱 서명 인증서와의 호환성을 확인해야 한다. Play App Signing의 업로드 키와 앱 서명 키를 혼동하지 않는다.

로컬 `NATIVE-ELF-REPORT.json`, `APK-METADATA.txt`, `AAB-SIGNATURE.txt`, `APK-SIGNATURE.txt`, `android-native-build.log`에 검증 근거를 보관한다. 도구·캐시·소스 복사본 역시 외부로 업로드하지 않는다.

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

Windows의 기존 Java/Android SDK 설치가 없어 공식 배포본을 `artifacts/3.0.0/toolchain/`에 준비했다. 시스템 전역 설치나 영구 환경 변수 변경은 하지 않는다. iOS 로컬 빌드는 현재 보류 중이며, 재개할 때 사용할 Mac과 서명 정보를 확인한다.

Windows Android 빌드는 `C:\Users\Public\Documents\ESTsoft\CreatorTemp\ns3-source`의 소스·의존성 복사본에 Expo prebuild를 실행하고 Gradle로 컴파일한다. 드라이브 경로 혼합을 피하기 위해 node_modules는 junction이 아닌 실제 복사본을 사용한다. 도구 경로에만 artifacts/3.0.0/을 가리키는 임시 N: 드라이브를 사용한다. 최종 산출물은 원래 프로젝트의 artifacts/3.0.0/에 복사하고 임시 드라이브를 해제한다. 생성된 프로젝트는 앱에서 사용하지 않는 저장소·오버레이·진동 권한을 제외한다. 로컬 SDK의 JavaScript 파일을 TypeScript가 검사하지 않도록 artifacts/ 등 생성물 폴더도 타입 검사에서 제외한다.

Gradle 8.14.3 캐시는 동기화 드라이브의 이름 변경 충돌을 피하도록 전용 `CreatorTemp\ns3-gradle` 폴더를 사용한다. Java 21의 로컬 소켓 경로 오류는 전용 `CreatorTemp\ns3-java` 경로를 `jdk.net.unixdomain.tmpdir`로 지정해 해결했다. 모두 프로세스별 로컬 설정이며 시스템 보안 설정을 바꾸지 않는다. 로컬 재실행 명령은 artifacts/3.0.0/build-android-unsigned.ps1에 보관한다.

검증 후 빌드용 Java 백그라운드 프로세스와 임시 N: 연결을 정리했다. 파일은 보존되어 있다. 같은 환경에서 다시 빌드하려면 프로젝트 루트에서 N: 드라이브가 비어 있는지 확인한 뒤 아래처럼 도구 경로를 연결한다. 서명 전 설정을 유지하는 명령이다.

```powershell
$localArtifactPath = (Resolve-Path 'artifacts/3.0.0').Path
subst N: $localArtifactPath
& ./artifacts/3.0.0/build-android-unsigned.ps1
subst N: /D
```

네이티브 구성에서 buildTools 36.0.0, compileSdk/targetSdk 36, minSdk 24, NDK 27.1.12297006을 확인했다. **기존 앱 소스의 minSdk 19와 달리 이 버전은 Android 7.0(API 24) 이상을 요구하므로 출시 전에 지원 범위를 확인한다.**

기존 출시 서명 키를 아직 확인하지 못했으므로 복사본의 release signingConfig를 명시적으로 null로 바꾼 후 **서명 전 AAB/APK**를 생성한다. Expo 기본 템플릿의 debug 키를 출시 서명으로 사용하지 않는다. 성공해도 기존 앱 업데이트나 스토어 제출이 가능한 최종 서명 파일로 간주하지 않는다.

`eas.json`은 `credentialsSource: local`을 사용한다. 기존 앱용 키를 임의 생성하지 않으며, 실제 키 경로와 비밀번호가 있는 `credentials.json`은 로컬에서만 준비한다. Android의 업로드 키와 Play App Signing 설정, iOS 배포 인증서·프로비저닝 프로필을 확인한다. `ios.bundleIdentifier`와 Expo 프로젝트 연결도 확정해야 한다.

아래 EAS 로컬 명령은 도구·인증·프로젝트 연결·서명이 준비된 macOS/Linux 환경에서 사용할 수 있는 참고 경로다. 현재 Windows Android 빌드에서는 EAS를 실행하지 않는다.

```bash
npx eas-cli build --platform android --profile production --local --output artifacts/3.0.0/namsigdang-3.0.0-android.aab
# iOS는 macOS + Xcode에서 실행
npx eas-cli build --platform ios --profile production --local --output artifacts/3.0.0/namsigdang-3.0.0-ios.ipa
```

`eas build --local`도 Expo 인증과 프로젝트 정보 확인을 위해 네트워크를 사용한다. EAS의 Windows/WSL 로컬 빌드는 공식 지원 대상이 아니다. 이 PR에는 자동 업로드·자동 제출 워크플로를 추가하지 않는다.

## 공식 참고 자료

- [Expo 버전 관리](https://docs.expo.dev/build-reference/app-versions/)
- [Expo 로컬 빌드](https://docs.expo.dev/build-reference/local-builds/)
- [Expo 환경 변수](https://docs.expo.dev/eas/environment-variables/)
- [Android 앱 서명](https://developer.android.com/studio/publish/app-signing)
- [Google Play 대상 API 요구사항](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en-en)
- [Android 16KB 페이지](https://developer.android.com/guide/practices/page-sizes)
- [Apple 제출 SDK 요구사항](https://developer.apple.com/news/upcoming-requirements/?id=04282026a)

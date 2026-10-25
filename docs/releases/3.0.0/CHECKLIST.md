# 3.0.0 제출 체크리스트

체크되지 않은 항목은 미완료 또는 미확인이다. 웹 내보내기 성공과 스토어 제출용 네이티브 빌드 성공을 구분한다.

## 계정·앱 식별자·서명

- [ ] Google Play 개발자 계정·본인 확인·앱 접근 권한 확인.
- [ ] 기존 Android 앱 업데이트 여부와 Play Console 패키지명 확인.
- [ ] Play Console의 전체 트랙에서 가장 높은 versionCode 확인; 300이 충분히 큰지 확인.
- [ ] Play App Signing 사용 여부와 기존 업로드 키/키스토어 확인. 새 키를 임의 생성하지 않음.
- [ ] Apple Developer Program과 App Store Connect 권한 확인.
- [ ] iOS 신규/기존 앱 여부와 Bundle ID 확정; `ios.bundleIdentifier` 반영.
- [ ] iOS 배포 인증서·프로비저닝 프로필과 buildNumber 확인.
- [ ] Expo 프로젝트·빌드 방식 확정. 클라우드 사용 시 소스와 산출물 보관 정책 승인 확인.

## 빌드·보관

- [x] 표시 버전 3.0.0 및 패키지 잠금 파일 버전 일치.
- [x] EAS preview/production 프로필 작성, 로컬 서명 자료 사용 지정.
- [x] artifacts/ 및 APK/AAB/IPA·서명 파일 Git 제외 설정.
- [x] 현재 릴리즈 소스에서 타입 검사·기존 99개 테스트·핵심 세 모듈 커버리지 통과.
- [x] 로컬 내보내기 환경의 Firebase 환경 변수 6개 확인. 네이티브 최종 빌드 환경은 별도로 확인 필요.
- [x] 로컬 웹/Android·iOS JS 내보내기, 압축본과 해시 목록 작성.
- [ ] **Android 제출용 AAB 생성 및 서명 확인.**
- [ ] **iOS 제출용 IPA 생성 및 서명 확인.**
- [ ] 실제 Android target API 36 이상과 16KB 페이지 호환성 확인.
- [ ] 실제 iOS 빌드가 Xcode 26+/iOS 26 SDK+를 사용하는지 확인.
- [ ] 최종 바이너리의 앱 버전·식별자·빌드 번호·요청 권한 검사.
- [x] Git 변경 파일과 산출물 ignore 규칙 확인. 최종 PR diff에서도 재확인.

## 운영·실기 검증

- [ ] Firestore 식단 읽기 허용과 무단 쓰기 차단 확인.
- [ ] 크롤러 운영 상태와 양쪽 관의 실제 최신 식단 확인.
- [ ] Android·iPhone 출시 빌드 최초 실행, 재실행, 관 저장 확인.
- [ ] 관·날짜 변경, 오늘 복귀, 조회 경계, 식단 미등록 확인.
- [ ] 네트워크 단절·복구, 재시도, 빠른 관·날짜 전환 확인.
- [ ] 노치·하단 안전 영역, 큰 글자, 화면 읽기, 외부 링크 확인.
- [ ] Android 뒤로가기·서비스 정보 모달 확인.
- [ ] 기존 앱에서 3.0.0 업데이트 설치와 저장 데이터 호환성 확인.

## 스토어 자료·심사·출시

- [ ] STORE-LISTING.ko.md 문안과 기존 앱 대비 변경 사항 검수.
- [ ] 아이콘·Android Play 그래픽·기기별 실제 스크린샷 준비.
- [ ] 개인정보처리방침 공개 URL과 앱 내부 링크 준비.
- [ ] Google Data safety·Apple App Privacy·SDK Privacy Manifest 점검.
- [ ] 연령 등급·대상 연령·카테고리·광고 여부·콘텐츠 권리 응답 확정.
- [ ] 지원 URL·연락처·출시 국가·가격 확정.
- [ ] 해당하는 Google 신규 개인 계정은 12명/연속 14일 비공개 테스트 및 프로덕션 접근 승인 완료.
- [ ] Google 테스트 트랙·TestFlight에서 실제 설치 확인.
- [ ] 심사 메모에 확인 가능한 실제 식단 날짜와 사용법 기록.
- [ ] 수출 규정·암호화 등 콘솔 질문에 최종 구현 기준으로 응답.
- [ ] 양쪽 스토어 승인 후 수동 공개 또는 출시 일정 조율.

## 정책 참고 (2026-10-25 확인)

- [Google 테스트 요건](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en-PN)
- [Google 개인정보 정책](https://support.google.com/googleplay/android-developer/answer/10144311?hl=en-GB)
- [Apple App Privacy](https://developer.apple.com/app-store/app-privacy-details/)
- [Apple 심사 지침](https://developer.apple.com/app-store/review/guidelines/)

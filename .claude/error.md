# 프로젝트 트러블슈팅 및 에러 해결 일지

## 1. 소셜 로그인 시도 중 500 에러 (KOE320)
**현상:**
- 카카오 로그인 시도 시 프론트엔드 콘솔에 500 Internal Server Error 발생.
- 화면에 "소셜 로그인에 실패했습니다"라는 에러 메시지가 출력됨.

**원인:**
- 프론트엔드의 최신 React 18 버전에 적용된 `StrictMode`로 인해 `useEffect`가 개발 모드에서 2번 연속 실행됨.
- 첫 번째 API 요청으로 인가(Authorization) 코드를 서버로 보내 정상 처리되었으나, 즉시 이어진 두 번째 요청에서 '이미 사용된 인가 코드'를 다시 보내게 됨.
- 카카오 API 서버에서 `KOE320(코드 재사용)` 에러를 반환하였고, 이 예외가 캐치되어 사용자에게 에러 UI를 렌더링함.

**해결:**
- `OAuthCallback.jsx`에서 `useRef`를 사용하여 API 호출이 한 번만 실행되도록(방어 로직) 수정. (`hasFetched.current` 활용)

---

## 2. 사용자 계정 생성 시 데이터베이스 무결성 에러 (NULL not allowed)
**현상:**
- 카카오/구글 로그인 인증은 성공했으나 백엔드 로그에서 `DataIntegrityViolationException` 및 `NULL not allowed for column "EMAIL"` 에러 발생.

**원인:**
- 소셜 로그인 연동 시 사용자가 이메일 제공에 동의하지 않았거나, 해당 플랫폼 계정에 이메일이 등록되어 있지 않은 경우 `email` 필드 값이 `null`로 백엔드에 전달됨.
- 하지만 데이터베이스의 `users` 테이블은 `email` 필드를 `NOT NULL`과 `UNIQUE`로 강제하고 있어 `INSERT` 쿼리 실행 시 예외 발생.

**해결:**
- `AuthService.java`의 `oauthLogin` 메서드 내에 방어 로직 추가.
- 소셜 프로바이더가 이메일을 제공하지 않은 경우(`null` 또는 빈 문자열), 고유한 임시 이메일(예: `{providerId}@kakao.com`)을 자동 생성하여 가입되도록 수정함.

---

## 3. 카카오 OAuth Client Secret 누락 (KOE010)
**현상:**
- 카카오 API 요청 시 HTTP 401 Unauthorized (`KOE010: Bad client credentials`) 에러 발생.

**원인:**
- 카카오 디벨로퍼스 콘솔의 [보안] 탭에서 `Client Secret(클라이언트 시크릿)` 기능이 활성화되어 있었으나, 백엔드 환경 변수에 해당 시크릿 키가 전달되지 않음.

**해결:**
- `application.yml` 및 백엔드 서버 실행 환경에 `KAKAO_CLIENT_SECRET`을 명시적으로 추가하여 카카오 API 보안 인증을 통과하도록 수정.

---

## 4. 새 기능 추가 후 화면이 나오지 않는 현상 (Blank Screen)
**현상:**
- 닉네임 설정 강제 로직 및 내 정보 변경 기능을 추가한 후, 웹 페이지가 하얗게 나오며 아무것도 렌더링되지 않음.
- 백엔드 쿼리 로그에서 새롭게 추가한 `nickname_set` 컬럼이 누락된 상태로 `SELECT`가 실행됨.

**원인:**
1. **프론트엔드 참조 에러(ReferenceError)**: `App.jsx`의 `ProtectedRoute` 컴포넌트에서 `user.nicknameSet` 조건을 확인하려 했으나, 정작 `useAuth()` 훅에서 `user` 객체를 구조 분해 할당(Destructuring)으로 가져오지 않아 `user is not defined` 에러가 발생하며 렌더링이 중단됨.
2. **백엔드 스키마 불일치**: `User` 엔티티에 `nicknameSet` 필드를 추가했으나, 기존에 실행 중이던 백엔드 서버의 인메모리 DB(H2) 스키마가 업데이트되지 않아 쿼리 실행 시 해당 컬럼을 찾지 못함.

**해결:**
- **프론트엔드**: `App.jsx`의 `ProtectedRoute`에서 `const { user, isAuthenticated, loading } = useAuth()`와 같이 `user`를 정상적으로 가져오도록 수정.
- **백엔드**: 서버를 중단한 후 `.\gradlew clean bootRun` 명령을 통해 빌드 캐시를 삭제하고 DB 스키마를 재생성하여 `nickname_set` 컬럼이 정상적으로 생성되도록 조치함.

---

## 5. 프론트엔드 컴포넌트 Props 누락 (ReferenceError)
**현상:**
- `UpdateNicknameModal.jsx`에서 `isMandatory is not defined` 에러 발생.

**원인:**
- 컴포넌트 내부에서 `isMandatory` 변수를 사용하도록 수정했으나, 정작 함수의 인자(Props) 부분에 추가하는 것을 누락함.

**해결:**
- `UpdateNicknameModal` 함수의 인자에 `{ onClose, onUpdated, isMandatory = false }`와 같이 `isMandatory`를 추가하여 해결.

---

## 6. Spring Security CORS 설정 누락 (CORS error)
**현상:**
- 브라우저 콘솔에서 `Access to XMLHttpRequest ... has been blocked by CORS policy` 에러 발생.

**원인:**
- `WebMvcConfigurer`를 통한 CORS 설정은 되어 있었으나, Spring Security 필터 체인에서 CORS를 명시적으로 활성화하지 않아 인증이 필요한 요청의 Preflight(OPTIONS) 요청이 차단됨.

**해결:**
- `SecurityConfig.java`에 `.cors(Customizer.withDefaults())`를 추가.
- `CorsConfig.java`에 Spring Security가 참조할 수 있는 `CorsConfigurationSource` Bean을 별도로 정의함.

---

## 7. API 응답 DTO 필드 누락 (UserResponse)
**현상:**
- 로그인 후 유저 정보에 `role`이나 `nicknameSet` 값이 들어오지 않아 관련 로직이 오작동함.

**원인:**
- 백엔드 엔티티(`User`)에는 필드가 추가되었으나, 클라이언트로 전달되는 DTO인 `UserResponse`에는 해당 필드들이 누락되어 있었음.

**해결:**
- `UserResponse.java`에 `role`, `nicknameSet` 필드를 추가하고, `from()` 메서드에서 엔티티 값을 DTO로 복사하도록 수정.

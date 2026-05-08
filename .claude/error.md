# Deployment Error Log & Solutions

이 문서는 Moim 애플리케이션의 프로덕션 배포(Render, Vercel, TiDB) 과정에서 발생한 에러와 해결 방법을 기록합니다.

## 1. Backend (Render / Spring Boot)

### ❌ Dockerfile Path Error
- **현상**: Render 빌드 중 JAR 파일을 찾지 못해 배포 실패.
- **원인**: Dockerfile 내 `COPY` 명령의 경로가 실제 빌드 결과물 위치와 불일치.
- **해결**: `backend/build/libs/*.jar` 경로를 정확히 지정하고 Gradle 빌드 단계를 최적화함.

### ❌ WeakKeyException (JWT)
- **현상**: 서버 시작 시 `io.jsonwebtoken.security.WeakKeyException` 발생.
- **원인**: `JWT_SECRET` 환경 변수 값이 256비트(32자) 미만임.
- **해결**: 32자 이상의 강력한 비밀키로 환경 변수 업데이트.

### ❌ Database Connection Timeout
- **현상**: 서버가 데이터베이스 연결 단계에서 멈추거나 타임아웃 발생.
- **원인**: TiDB Cloud의 IP Access List에 Render 서버의 IP가 등록되지 않음.
- **해결**: TiDB 콘솔의 Networking 설정에서 `0.0.0.0/0`을 추가하여 외부 접속 허용.

### ❌ Port Binding Error (Exit Status 1)
- **현상**: 서버가 "Live" 상태가 되지 못하고 강제 종료됨.
- **원인**: Render는 환경 변수 `PORT`에 할당된 포트로 앱이 실행되길 기대하지만, 앱이 `8080` 고정 포트를 사용함.
- **해결**: 
  1. `application.yml`의 `server.port`를 `${PORT:8080}`으로 수정.
  2. Render 환경 변수에 `PORT: 8080` 추가.

### ❌ Hibernate Entity Scan Issue (No Tables Created)
- **현상**: DB 연결은 성공했으나 테이블이 자동으로 생성되지 않음.
- **원인**: Spring Boot가 다른 패키지에 있는 JPA 엔티티를 자동으로 스캔하지 못함.
- **해결**: `MoimApplication` 클래스에 `@EntityScan` 및 `@EnableJpaRepositories` 어노테이션을 명시적으로 추가.

### ❌ Compilation Error (Symbol Not Found)
- **현상**: Render 빌드 중 `cannot find symbol: class EntityScan` 에러 발생.
- **원인**: `MoimApplication`에 어노테이션을 추가했으나 필요한 클래스를 `import` 하지 않음.
- **해결**: `org.springframework.boot.autoconfigure.domain.EntityScan` 등 누락된 임포트 추가.

### ❌ 403 Forbidden / White Screen
- **현상**: 프론트엔드 접속 시 흰 화면만 나오고 API 요청이 403 에러로 거부됨.
- **원인**: 
  1. CORS 설정에 새로운 도메인(`8o2.site`)이 누락됨.
  2. Spring Security가 설정 클래스를 제대로 로드하지 못해 기본 보안 설정(무작위 비번)이 작동함.
- **해결**: 
  1. Render 환경 변수 `ALLOWED_ORIGINS`에 도메인 추가.
  2. `SecurityConfig`에 `UserDetailsService` 빈을 명시적으로 추가하여 기본 설정 방지.

## 2. Frontend (Vercel / React)

### ❌ SPA Routing Error (404 on Refresh)
- **현상**: 페이지 새로고침 시 404 에러 발생.
- **원인**: Vercel이 클라이언트 사이드 라우팅을 인식하지 못함.
- **해결**: `vercel.json` 파일을 생성하여 모든 요청을 `index.html`로 리다이렉트하도록 설정.

### ❌ Environment Variable Mismatch
- **현상**: API 요청 주소가 `localhost`로 가거나 잘못된 주소로 감.
- **해결**: Vercel 대시보드에서 `VITE_API_URL`을 Render 백엔드 주소로 정확히 설정.

## 3. Infrastructure (Gabia / DNS)

### ❌ DNS_PROBE_FINISHED_NXDOMAIN
- **현상**: 도메인 접속 시 사이트를 찾을 수 없음.
- **원인**: DNS 레코드(A, CNAME) 설정 미비 또는 전파 시간 부족.
- **해결**: 
  1. 가비아에서 Vercel이 제공한 A 레코드(`@`)와 CNAME(`www`) 값 입력.
  2. 서브도메인(`moim`) 사용 시 CNAME 레코드 추가.
  3. 전파 시간(최대 10분) 대기.

### ❌ SSL Certificate Generation Failure
- **현상**: Vercel에서 "Failed to generate cert" 에러 발생.
- **원인**: DNS 레코드 값이 Vercel 가이드와 일치하지 않아 HTTP-01 챌린지 실패.
- **해결**: 가비아에서 레코드 값의 끝에 마침표(`.`)를 포함하여 정확히 입력하고 불필요한 레코드 삭제.

## 4. Email / SMTP (회원가입 무한 로딩)

### ❌ 회원가입 이메일 인증 시 무한 로딩
- **현상**: 프로덕션(`moim.8o2.site`)에서 회원가입 시 이메일 입력 후 "인증 코드 받기" 버튼을 누르면 무한 로딩에 빠짐. 로컬 환경에서는 정상 동작.
- **에러 메시지**: "인증 코드 발송에 실패했습니다."

#### 근본 원인 (3가지 복합 원인)

1. **`@Async` + `@Transactional` 충돌**
   - `AuthService.sendVerificationCode()`에 `@Transactional`이 걸려 있고, 그 안에서 `EmailService.sendVerificationCode()`(`@Async`)를 호출함.
   - Spring의 `@Async` 프록시는 `@Transactional` 프록시 **내부**에서 호출되면 비동기가 무시되고 **동기적으로 실행**됨.
   - 결과: SMTP 연결이 완료될 때까지 HTTP 응답이 차단됨.

2. **Render 환경에서 SMTP 응답 지연**
   - 로컬에서는 구글 SMTP(`smtp.gmail.com:587`)에 빠르게 연결되지만, Render 무료 티어 환경에서는 아웃바운드 SMTP 연결이 **느리거나 차단**될 수 있음.
   - 타임아웃 설정이 없어 서버가 무한정 대기함.

3. **`@EnableAsync` 미설정**
   - `MoimApplication.java`에 `@EnableAsync` 어노테이션이 빠져 있어, `@Async`가 전혀 활성화되지 않은 상태였음.

#### 해결 방법

```java
// AuthService.java — DB 트랜잭션과 이메일 발송을 완전히 분리
@Transactional
public String prepareVerificationCode(String email) {
    // DB 저장만 수행 (트랜잭션 범위)
    ...
    return code;
}

public void sendVerificationCode(String email) {
    String code = prepareVerificationCode(email); // 트랜잭션 완료
    CompletableFuture.runAsync(() -> {             // 별도 스레드에서 메일 발송
        try {
            emailService.sendVerificationCode(email, code);
        } catch (Exception e) {
            log.error("인증 코드 이메일 발송 실패: {}", email, e);
        }
    });
}
```

- **`CompletableFuture.runAsync()`**: Spring의 `@Async` 대신 Java 표준 비동기 API를 사용하여, 프레임워크 프록시 간섭 없이 확실하게 별도 스레드에서 실행.
- **`application.yml` 타임아웃 추가**: `connectiontimeout`, `timeout`, `writetimeout`을 각각 5000ms로 설정하여 SMTP 무한 대기 방지.
- **`@EnableAsync` 추가**: `MoimApplication.java`에 추가 (향후 다른 곳에서 `@Async`를 쓸 경우를 위해).

#### 핵심 교훈
> **`@Transactional` 내부에서 `@Async`를 호출하면 비동기가 동작하지 않는다.**
> 이메일, 푸시 알림 등 외부 서비스 호출은 반드시 트랜잭션 밖에서 `CompletableFuture.runAsync()` 또는 이벤트 리스너(`@TransactionalEventListener`)를 사용할 것.

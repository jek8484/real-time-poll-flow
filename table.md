현재 데이터베이스 테이블의 컬럼들을 설명해드리겠습니다.



## 📊 현재 데이터베이스 테이블 컬럼 설명



### **votes 테이블** (투표)

- `id` - 투표 고유 ID (bigint)

- `title` - 투표 제목 (varchar)

- `content` - 투표 내용/설명 (text)

- `options` - 투표 선택지들 (jsonb 배열)

- `vote_count` - 총 투표 수 (integer, 기본값: 0)

- `status` - 투표 상태 (vote_status enum: active 등)

- `expires_at` - 투표 종료 시간 (timestamp)

- `creator_id` - 투표 생성자 ID (uuid)

- `created_at` - 생성 시간 (timestamp)



### **users 테이블** (사용자)

- `id` - 사용자 고유 ID (uuid)

- `device_id` - 디바이스 식별자 (text)

- `created_at` - 계정 생성 시간 (timestamp)



### **reports 테이블** (신고)

- `id` - 신고 고유 ID (uuid)

- `vote_id` - 신고된 투표 ID (bigint)

- `reporter_id` - 신고자 ID (uuid, nullable)

- `created_at` - 신고 시간 (timestamp)



### **hidden_votes 테이블** (숨긴 투표)

- `id` - 레코드 고유 ID (uuid)

- `user_id` - 사용자 ID (uuid)

- `vote_id` - 숨긴 투표 ID (bigint)

- `hidden_at` - 숨긴 시간 (timestamp)



### **privacy_policies 테이블** (개인정보처리방침)

- `id` - 정책 고유 ID (uuid)

- `content` - 정책 내용 (text)

- `created_at` - 생성 시간 (timestamp). 두 컬럼의 구조와 사용법을 자세히 설명해드리겠습니다.



## 📋 **options 컬럼** (jsonb 배열)



투표 선택지들을 JSON 배열 형태로 저장합니다.



### 구조 예시:

```json

[

  {

    "id": 1,

    "name": "찬성",

    "vote_count": 45,

    "color": "#10b981"

  },

  {

    "id": 2, 

    "name": "반대",

    "vote_count": 23,

    "color": "#ef4444"

  }

]

```



### 각 선택지 객체 속성:

- `id` - 선택지 고유 번호

- `name` - 선택지 이름/텍스트

- `vote_count` - 해당 선택지 투표 수

- `color` - 그래프 표시용 색상 코드



## 🔄 **status 컬럼** (vote_status enum)



투표의 현재 상태를 나타내는 열거형입니다.



### 가능한 상태값:

- `active` - 활성 상태 (투표 진행 중)

- `ended` - 종료된 상태 (시간 만료)

- `early_ended` - 조기 종료된 상태 (수동 종료)



### 사용 예시:

```sql

-- 활성 투표만 조회

SELECT * FROM votes WHERE status = 'active';



-- 종료된 투표 조회  

SELECT * FROM votes WHERE status IN ('ended', 'early_ended');

```



이 구조를 통해 유연한 투표 옵션 관리와 상태 추적이 가능합니다.
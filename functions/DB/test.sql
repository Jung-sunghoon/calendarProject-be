-- 테이블 삭제
DROP TABLE IF EXISTS recurring_pattern;
DROP TABLE IF EXISTS schedule;
DROP TABLE IF EXISTS users;

-- users 테이블 생성
CREATE TABLE IF NOT EXISTS users (
  email VARCHAR(255) PRIMARY KEY,
  username VARCHAR(255),
  nickname VARCHAR(255)
);

-- schedule 테이블 생성
CREATE TABLE IF NOT EXISTS schedule (
  schedule_id INT AUTO_INCREMENT PRIMARY KEY,
  user_email VARCHAR(255),
  schedule_title VARCHAR(255),
  schedule_description TEXT,
  schedule_start TIMESTAMP,
  schedule_end TIMESTAMP,
  schedule_notification BOOLEAN DEFAULT FALSE,
  schedule_recurring BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_email) REFERENCES users(email)
);

-- recurring_pattern 테이블 생성
CREATE TABLE IF NOT EXISTS recurring_pattern (
  pattern_id INT AUTO_INCREMENT PRIMARY KEY,
  schedule_id INT UNIQUE,
  repeat_type ENUM('daily', 'weekly', 'monthly', 'yearly'),
  repeat_interval INT,
  repeat_on JSON,
  starts_on DATE,
  ends_on DATE,
  FOREIGN KEY (schedule_id) REFERENCES schedule(schedule_id)
);

-- users 테이블에 샘플 데이터 삽입
INSERT IGNORE INTO users (email, username, nickname)
VALUES 
('john.doe@example.com', 'johndoe', '존'),
('jane.smith@example.com', 'janesmith', '제인'),
('alice.wonderland@example.com', 'alicew', '앨리스');

-- schedule 테이블에 샘플 데이터 삽입
INSERT IGNORE INTO schedule (user_email,schedule_title, schedule_description, schedule_start, schedule_end, schedule_notification, schedule_recurring)
VALUES 
('john.doe@example.com', '팀 회의', '주간 팀 동기화 회의', '2024-08-05 10:00:00', '2024-08-05 11:00:00', TRUE, TRUE),
('john.doe@example.com', '야호 팀 회의', '팀 회의', '2024-08-05 10:00:00', '2024-08-05 11:00:00', FALSE, FALSE),
('john.doe@example.com', '연휴다~', '연휴다', '2024-08-05 10:00:00', '2024-08-07 11:00:00', FALSE, FALSE),
('jane.smith@example.com', '이 주간에는 쉬어야 해', '이 주간에는 쉬어야 해', '2024-08-10 10:00:00', '2024-08-20 11:00:00', TRUE, TRUE),
('jane.smith@example.com', '병원 예약', '연간 건강 검진', '2024-08-07 09:00:00', '2024-08-07 10:00:00', FALSE, FALSE),
('alice.wonderland@example.com', '프로젝트 마감일', '프로젝트 최종 제출', '2024-08-15 17:00:00', '2024-08-15 18:00:00', TRUE, FALSE);

-- recurring_pattern 테이블에 샘플 데이터 삽입
INSERT IGNORE INTO recurring_pattern (schedule_id, repeat_type, repeat_interval, repeat_on, starts_on, ends_on)
VALUES 
(1, 'weekly', 1, JSON_ARRAY('월'), '2024-08-05', '2024-12-31'),
(4, 'monthly', 1, NULL, '2024-08-10', '2024-12-20 ');

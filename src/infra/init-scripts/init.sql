-- Users 테이블 생성
CREATE TABLE IF NOT EXISTS users (
                                     user_id SERIAL PRIMARY KEY,
                                     platform VARCHAR(50) NOT NULL,
    social_id VARCHAR(50) NOT NULL UNIQUE,
    nickname VARCHAR(100) NOT NULL,
    email VARCHAR(320) NOT NULL UNIQUE,
    profile_image VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

-- WorkSpace 테이블 생성
CREATE TABLE IF NOT EXISTS work_space (
                                          workspace_id SERIAL PRIMARY KEY,
                                          name VARCHAR(100) NOT NULL,
    stock_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Channel 테이블 생성
CREATE TABLE IF NOT EXISTS channel (
                                       channel_id SERIAL PRIMARY KEY,
                                       workspace_id BIGINT NOT NULL REFERENCES work_space(workspace_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- UserChannel 테이블 생성
CREATE TABLE IF NOT EXISTS user_channel (
                                            user_channel_id SERIAL PRIMARY KEY,
                                            user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    channel_id BIGINT NOT NULL REFERENCES channel(channel_id) ON DELETE CASCADE,
    mute BOOLEAN NOT NULL DEFAULT FALSE,
    last_read_ts TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Mention 테이블 생성
CREATE TABLE IF NOT EXISTS mention (
                                       mention_id SERIAL PRIMARY KEY,
                                       user_channel_id BIGINT NOT NULL REFERENCES user_channel(user_channel_id) ON DELETE CASCADE,
    message_id BIGINT NOT NULL,
    is_unread BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- 초기 데이터 삽입
-- WorkSpace 데이터
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM work_space) THEN
        INSERT INTO work_space (name, stock_name)
        VALUES
            ('삼성전자 워크스페이스', '삼성전자'),
            ('SK 하이닉스 워크스페이스', 'SK 하이닉스'),
            ('카카오 워크스페이스', '카카오'),
            ('네이버 워크스페이스', '네이버'),
            ('한화에어로스페이스 워크스페이스', '한화에어로스페이스');
END IF;
END $$;
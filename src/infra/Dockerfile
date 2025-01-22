# PostgreSQL 15 이미지 기반
FROM postgres:15

# 초기화 스크립트 복사
COPY init-scripts/init.sql /docker-entrypoint-initdb.d/

# 포트 노출
EXPOSE 5432

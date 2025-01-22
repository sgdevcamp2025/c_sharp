# PostgreSQL 15 이미지 기반
FROM mirlee/postgresql-db:data-included

# 초기화 스크립트 복사
COPY init.sql /docker-entrypoint-initdb.d/

# 포트 노출
EXPOSE 5432

--
-- PostgreSQL database cluster dump
--

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE admin;
ALTER ROLE admin WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:AchQfPLq90tDAn0BOzgESw==$L/OeB0EI3wokX/dp052TBbmo5FsZU5GXQzba6d+J4s4=:wGKoXxP/6Lt/GiKesDwz491qQN6g3xqRdEC713OY2Tg=';

--
-- User Configurations
--








--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.10 (Debian 15.10-1.pgdg120+1)
-- Dumped by pg_dump version 15.10 (Debian 15.10-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

--
-- Database "jootalkpia" dump
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.10 (Debian 15.10-1.pgdg120+1)
-- Dumped by pg_dump version 15.10 (Debian 15.10-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: jootalkpia; Type: DATABASE; Schema: -; Owner: admin
--

CREATE DATABASE jootalkpia WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE jootalkpia OWNER TO admin;

\connect jootalkpia

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: channels; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.channels (
    channel_id integer NOT NULL,
    workspace_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.channels OWNER TO admin;

--
-- Name: channels_channel_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.channels_channel_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.channels_channel_id_seq OWNER TO admin;

--
-- Name: channels_channel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.channels_channel_id_seq OWNED BY public.channels.channel_id;


--
-- Name: mention; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.mention (
    mention_id integer NOT NULL,
    user_channel_id bigint NOT NULL,
    message_id bigint NOT NULL,
    is_unread boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.mention OWNER TO admin;

--
-- Name: mention_mention_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.mention_mention_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.mention_mention_id_seq OWNER TO admin;

--
-- Name: mention_mention_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.mention_mention_id_seq OWNED BY public.mention.mention_id;


--
-- Name: user_channel; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.user_channel (
    user_channel_id integer NOT NULL,
    user_id bigint NOT NULL,
    channel_id bigint NOT NULL,
    mute boolean DEFAULT false NOT NULL,
    last_read_ts timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_channel OWNER TO admin;

--
-- Name: user_channel_user_channel_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.user_channel_user_channel_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_channel_user_channel_id_seq OWNER TO admin;

--
-- Name: user_channel_user_channel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.user_channel_user_channel_id_seq OWNED BY public.user_channel.user_channel_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    platform character varying(50) NOT NULL,
    social_id character varying(50) NOT NULL,
    nickname character varying(100) NOT NULL,
    email character varying(320) NOT NULL,
    profile_image character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.users OWNER TO admin;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_user_id_seq OWNER TO admin;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: work_space; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.work_space (
    workspace_id integer NOT NULL,
    name character varying(100) NOT NULL,
    stock_name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.work_space OWNER TO admin;

--
-- Name: work_space_workspace_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.work_space_workspace_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.work_space_workspace_id_seq OWNER TO admin;

--
-- Name: work_space_workspace_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.work_space_workspace_id_seq OWNED BY public.work_space.workspace_id;


--
-- Name: channels channel_id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.channels ALTER COLUMN channel_id SET DEFAULT nextval('public.channels_channel_id_seq'::regclass);


--
-- Name: mention mention_id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.mention ALTER COLUMN mention_id SET DEFAULT nextval('public.mention_mention_id_seq'::regclass);


--
-- Name: user_channel user_channel_id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_channel ALTER COLUMN user_channel_id SET DEFAULT nextval('public.user_channel_user_channel_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: work_space workspace_id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.work_space ALTER COLUMN workspace_id SET DEFAULT nextval('public.work_space_workspace_id_seq'::regclass);


--
-- Data for Name: channels; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.channels (channel_id, workspace_id, name, created_at, updated_at) FROM stdin;
1	1	default	2025-01-22 11:16:20.379917	2025-01-22 11:16:20.379917
\.


--
-- Data for Name: mention; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.mention (mention_id, user_channel_id, message_id, is_unread, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_channel; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.user_channel (user_channel_id, user_id, channel_id, mute, last_read_ts, created_at, updated_at) FROM stdin;
1	1	1	t	2025-01-22 11:16:20.385783	2025-01-22 11:16:20.385783	2025-01-22 11:16:20.385783
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.users (user_id, platform, social_id, nickname, email, profile_image, created_at, updated_at) FROM stdin;
1	kakao	1	test	test@gmail.com	profile	2025-01-22 11:15:59.529396	2025-01-22 11:15:59.529396
\.


--
-- Data for Name: work_space; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.work_space (workspace_id, name, stock_name, created_at, updated_at) FROM stdin;
1	삼성전자 워크스페이스	삼성전자	2025-01-22 10:35:40.39851	2025-01-22 10:35:40.39851
2	SK 하이닉스 워크스페이스	SK 하이닉스	2025-01-22 10:35:40.39851	2025-01-22 10:35:40.39851
3	카카오 워크스페이스	카카오	2025-01-22 10:35:40.39851	2025-01-22 10:35:40.39851
4	네이버 워크스페이스	네이버	2025-01-22 10:35:40.39851	2025-01-22 10:35:40.39851
5	한화에어로스페이스 워크스페이스	한화에어로스페이스	2025-01-22 10:35:40.39851	2025-01-22 10:35:40.39851
\.


--
-- Name: channels_channel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.channels_channel_id_seq', 1, false);


--
-- Name: mention_mention_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.mention_mention_id_seq', 1, false);


--
-- Name: user_channel_user_channel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.user_channel_user_channel_id_seq', 1, false);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.users_user_id_seq', 1, false);


--
-- Name: work_space_workspace_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.work_space_workspace_id_seq', 5, true);


--
-- Name: channels channels_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.channels
    ADD CONSTRAINT channels_pkey PRIMARY KEY (channel_id);


--
-- Name: mention mention_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.mention
    ADD CONSTRAINT mention_pkey PRIMARY KEY (mention_id);


--
-- Name: user_channel user_channel_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_channel
    ADD CONSTRAINT user_channel_pkey PRIMARY KEY (user_channel_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_social_id_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_social_id_key UNIQUE (social_id);


--
-- Name: work_space work_space_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.work_space
    ADD CONSTRAINT work_space_pkey PRIMARY KEY (workspace_id);


--
-- Name: channels channels_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.channels
    ADD CONSTRAINT channels_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.work_space(workspace_id) ON DELETE CASCADE;


--
-- Name: mention mention_user_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.mention
    ADD CONSTRAINT mention_user_channel_id_fkey FOREIGN KEY (user_channel_id) REFERENCES public.user_channel(user_channel_id) ON DELETE CASCADE;


--
-- Name: user_channel user_channel_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_channel
    ADD CONSTRAINT user_channel_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(channel_id) ON DELETE CASCADE;


--
-- Name: user_channel user_channel_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_channel
    ADD CONSTRAINT user_channel_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.10 (Debian 15.10-1.pgdg120+1)
-- Dumped by pg_dump version 15.10 (Debian 15.10-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database cluster dump complete
--


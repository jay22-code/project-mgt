-- Supabase DB Schema Setup for Project Board

-- 1. Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id VARCHAR(50) PRIMARY KEY,
  title TEXT NOT NULL,
  desc_text TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'todo',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for public access (or customize for auth)
CREATE POLICY "Allow public select on tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert on tasks" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on tasks" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on tasks" ON public.tasks FOR DELETE USING (true);

-- 4. Enable Real-Time Replication
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;

-- 5. Insert initial task list data
INSERT INTO public.tasks (id, title, desc_text, status, priority, tags) VALUES
  ('TASK-01', '[TASK-01] 프로젝트 디렉토리 및 시맨틱 HTML5 구조 설계', 'hbj-work 프로젝트 초기 환경을 구축하고 Kanban 보드, 대시보드 헤더, 리스트 뷰 및 모달 폼 레이아웃을 담은 시맨틱 HTML 구조 작성', 'done', 'high', ARRAY['Foundation', 'HTML5']),
  ('TASK-02', '[TASK-02] Glassmorphism UI/UX 디자인 시스템 및 style.css 구축', 'Google Fonts(Inter/Outfit), 현대적 Glassmorphism 반응형 카드, 신규 테마 변수, 상태별 애니메이션 뱃지 및 프로그레스 바 스타일 적용', 'done', 'high', ARRAY['Styling', 'CSS3']),
  ('TASK-03', '[TASK-03] 태스크 상태 관리, localStorage sync, 드래그 앤 드롭 JS 개발', 'HTML5 Drag and Drop API 연동, 드래그 반응 애니메이션, 컬럼 간 이동 시 상태 자동 변경 및 로컬 스토리지 데이터 동기화 구현', 'done', 'high', ARRAY['JavaScript', 'Core']),
  ('TASK-04', '[TASK-04] 태스크 검색, 필터링, 모달 다이얼로그 및 JSON 내보내기/불러오기 기능', '검색창 및 우선순위 필터링, 태스크 CRUD 모달, JSON 파일 Export/Import 기능을 구현하여 유연한 데이터 관리 제공', 'done', 'medium', ARRAY['Features', 'JS']),
  ('TASK-05', '[TASK-05] 초기 구현 Task List 탑재 및 실시간 대시보드 메트릭 연동', '전체 구현 과제를 프로젝트 보드 초기 데이터로 세팅하고 실시간 달성률(%) 및 카운터 자동 계산 연동', 'done', 'medium', ARRAY['Integration']),
  ('TASK-06', '[TASK-06] 진행 상황 연동 업데이트 및 웹 애플리케이션 최종 검증', '작업 진행에 따른 프로젝트 보드 데이터 실시간 반영 및 기능/디자인 통합 검증 완료', 'done', 'low', ARRAY['Verification'])
ON CONFLICT (id) DO NOTHING;

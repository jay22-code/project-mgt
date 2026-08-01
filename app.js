// Project Pulse - Task Management & Progress Tracker Engine

// Default Initial Task List (Pre-loaded implementation tasks)
const DEFAULT_TASKS = [
  {
    id: "TASK-01",
    title: "[TASK-01] 프로젝트 디렉토리 및 시맨틱 HTML5 구조 설계",
    desc: "hbj-work 프로젝트 초기 환경을 구축하고 Kanban 보드, 대시보드 헤더, 리스트 뷰 및 모달 폼 레이아웃을 담은 시맨틱 HTML 구조 작성",
    status: "done",
    priority: "high",
    tags: ["Foundation", "HTML5"],
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: "TASK-02",
    title: "[TASK-02] Glassmorphism UI/UX 디자인 시스템 및 style.css 구축",
    desc: "Google Fonts(Inter/Outfit), 현대적 Glassmorphism 반응형 카드, 신규 테마 변수, 상태별 애니메이션 뱃지 및 프로그레스 바 스타일 적용",
    status: "done",
    priority: "high",
    tags: ["Styling", "CSS3"],
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: "TASK-03",
    title: "[TASK-03] 태스크 상태 관리, localStorage sync, 드래그 앤 드롭 JS 개발",
    desc: "HTML5 Drag and Drop API 연동, 드래그 반응 애니메이션, 컬럼 간 이동 시 상태 자동 변경 및 로컬 스토리지 데이터 동기화 구현",
    status: "done",
    priority: "high",
    tags: ["JavaScript", "Core"],
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: "TASK-04",
    title: "[TASK-04] 태스크 검색, 필터링, 모달 다이얼로그 및 JSON 내보내기/불러오기 기능",
    desc: "검색창 및 우선순위 필터링, 태스크 CRUD 모달, JSON 파일 Export/Import 기능을 구현하여 유연한 데이터 관리 제공",
    status: "done",
    priority: "medium",
    tags: ["Features", "JS"],
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: "TASK-05",
    title: "[TASK-05] 초기 구현 Task List 탑재 및 실시간 대시보드 메트릭 연동",
    desc: "전체 구현 과제를 프로젝트 보드 초기 데이터로 세팅하고 실시간 달성률(%) 및 카운터 자동 계산 연동",
    status: "done",
    priority: "medium",
    tags: ["Integration"],
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: "TASK-06",
    title: "[TASK-06] 진행 상황 연동 업데이트 및 웹 애플리케이션 최종 검증",
    desc: "작업 진행에 따른 프로젝트 보드 데이터 실시간 반영 및 기능/디자인 통합 검증 완료",
    status: "done",
    priority: "low",
    tags: ["Verification"],
    createdAt: new Date().toISOString().split('T')[0]
  }
];

class ProjectBoardApp {
  constructor() {
    this.tasks = [];
    this.currentView = 'kanban';
    this.draggedTaskId = null;

    this.initElements();
    this.loadTasks();
    this.bindEvents();
    this.render();
  }

  initElements() {
    // Metrics
    this.metricTotal = document.getElementById('metric-total');
    this.metricInProgress = document.getElementById('metric-in-progress');
    this.metricDone = document.getElementById('metric-done');
    this.metricPercent = document.getElementById('metric-percent');
    this.progressBarFill = document.getElementById('progress-bar-fill');

    // Views
    this.kanbanView = document.getElementById('kanban-view');
    this.listView = document.getElementById('list-view');
    this.btnViewKanban = document.getElementById('btn-view-kanban');
    this.btnViewList = document.getElementById('btn-view-list');
    this.taskListBody = document.getElementById('task-list-body');

    // Toolbar
    this.searchInput = document.getElementById('search-input');
    this.priorityFilter = document.getElementById('priority-filter');
    this.btnAddTask = document.getElementById('btn-add-task');
    this.btnExportJson = document.getElementById('btn-export-json');
    this.btnImportJson = document.getElementById('btn-import-json');
    this.fileImportInput = document.getElementById('file-import-input');
    this.btnSupabaseConfig = document.getElementById('btn-supabase-config');

    // Containers
    this.containers = {
      'backlog': document.getElementById('container-backlog'),
      'todo': document.getElementById('container-todo'),
      'in-progress': document.getElementById('container-in-progress'),
      'in-review': document.getElementById('container-in-review'),
      'done': document.getElementById('container-done')
    };

    // Column counters
    this.counts = {
      'backlog': document.getElementById('count-backlog'),
      'todo': document.getElementById('count-todo'),
      'in-progress': document.getElementById('count-in-progress'),
      'in-review': document.getElementById('count-in-review'),
      'done': document.getElementById('count-done')
    };

    // Task Modal
    this.taskModal = document.getElementById('task-modal');
    this.taskForm = document.getElementById('task-form');
    this.modalTitle = document.getElementById('modal-title');
    this.taskIdInput = document.getElementById('task-id');
    this.taskTitleInput = document.getElementById('task-title-input');
    this.taskStatusSelect = document.getElementById('task-status-select');
    this.taskPrioritySelect = document.getElementById('task-priority-select');
    this.taskTagsInput = document.getElementById('task-tags-input');
    this.taskDescInput = document.getElementById('task-desc-input');
    this.btnCloseModal = document.getElementById('btn-close-modal');
    this.btnCancelModal = document.getElementById('btn-cancel-modal');

    // Supabase Modal
    this.supabaseModal = document.getElementById('supabase-modal');
    this.supabaseForm = document.getElementById('supabase-form');
    this.spUrlInput = document.getElementById('sp-url-input');
    this.spKeyInput = document.getElementById('sp-key-input');
    this.btnCloseSpModal = document.getElementById('btn-close-sp-modal');
    this.btnCancelSpModal = document.getElementById('btn-cancel-sp-modal');
  }

  async loadTasks() {
    // Try loading from Supabase first if available
    if (window.supabaseService && window.supabaseService.isConfigured) {
      const remoteTasks = await window.supabaseService.fetchTasks();
      if (remoteTasks && remoteTasks.length > 0) {
        this.tasks = remoteTasks;
        this.saveLocalStorage();
        this.render();
        return;
      }
    }

    // Fallback to local storage
    const saved = localStorage.getItem('project_pulse_tasks');
    if (saved) {
      try {
        this.tasks = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved tasks", e);
        this.tasks = DEFAULT_TASKS;
      }
    } else {
      this.tasks = DEFAULT_TASKS;
      this.saveLocalStorage();
    }
    this.render();
  }

  saveLocalStorage() {
    localStorage.setItem('project_pulse_tasks', JSON.stringify(this.tasks));
  }

  async syncTaskToCloud(task) {
    this.saveLocalStorage();
    if (window.supabaseService && window.supabaseService.isConfigured) {
      await window.supabaseService.upsertTask(task);
    }
  }

  async deleteTaskFromCloud(taskId) {
    this.saveLocalStorage();
    if (window.supabaseService && window.supabaseService.isConfigured) {
      await window.supabaseService.deleteTask(taskId);
    }
  }

  bindEvents() {
    // View switching
    if (this.btnViewKanban) this.btnViewKanban.addEventListener('click', () => this.switchView('kanban'));
    if (this.btnViewList) this.btnViewList.addEventListener('click', () => this.switchView('list'));

    // Search and filter
    if (this.searchInput) this.searchInput.addEventListener('input', () => this.render());
    if (this.priorityFilter) this.priorityFilter.addEventListener('change', () => this.render());

    // Task Modal
    if (this.btnAddTask) this.btnAddTask.addEventListener('click', () => this.openTaskModal());
    if (this.btnCloseModal) this.btnCloseModal.addEventListener('click', () => this.closeTaskModal());
    if (this.btnCancelModal) this.btnCancelModal.addEventListener('click', () => this.closeTaskModal());
    if (this.taskForm) this.taskForm.addEventListener('submit', (e) => this.handleFormSubmit(e));

    // Supabase Modal
    if (this.btnSupabaseConfig) this.btnSupabaseConfig.addEventListener('click', () => this.openSupabaseModal());
    if (this.btnCloseSpModal) this.btnCloseSpModal.addEventListener('click', () => this.closeSupabaseModal());
    if (this.btnCancelSpModal) this.btnCancelSpModal.addEventListener('click', () => this.closeSupabaseModal());
    if (this.supabaseForm) this.supabaseForm.addEventListener('submit', (e) => this.handleSupabaseFormSubmit(e));

    // Export & Import
    if (this.btnExportJson) this.btnExportJson.addEventListener('click', () => this.exportJson());
    if (this.btnImportJson) this.btnImportJson.addEventListener('click', () => this.fileImportInput.click());
    if (this.fileImportInput) this.fileImportInput.addEventListener('change', (e) => this.importJson(e));

    // Drag and Drop for Kanban Columns
    Object.keys(this.containers).forEach(status => {
      const container = this.containers[status];
      if (!container) return;

      container.addEventListener('dragover', (e) => {
        e.preventDefault();
        container.classList.add('drag-over');
      });

      container.addEventListener('dragleave', () => {
        container.classList.remove('drag-over');
      });

      container.addEventListener('drop', (e) => {
        e.preventDefault();
        container.classList.remove('drag-over');
        if (this.draggedTaskId) {
          this.updateTaskStatus(this.draggedTaskId, status);
          this.draggedTaskId = null;
        }
      });
    });
  }

  switchView(viewMode) {
    this.currentView = viewMode;
    if (viewMode === 'kanban') {
      if (this.kanbanView) this.kanbanView.classList.remove('hidden');
      if (this.listView) this.listView.classList.add('hidden');
      if (this.btnViewKanban) this.btnViewKanban.classList.add('active');
      if (this.btnViewList) this.btnViewList.classList.remove('active');
    } else {
      if (this.kanbanView) this.kanbanView.classList.add('hidden');
      if (this.listView) this.listView.classList.remove('hidden');
      if (this.btnViewKanban) this.btnViewKanban.classList.remove('active');
      if (this.btnViewList) this.btnViewList.classList.add('active');
    }
    this.render();
  }

  getFilteredTasks() {
    const query = this.searchInput ? this.searchInput.value.trim().toLowerCase() : '';
    const priority = this.priorityFilter ? this.priorityFilter.value : 'all';

    return this.tasks.filter(task => {
      const matchesSearch = query === '' ||
        (task.title && task.title.toLowerCase().includes(query)) ||
        (task.desc && task.desc.toLowerCase().includes(query)) ||
        (task.tags && task.tags.some(t => t.toLowerCase().includes(query))) ||
        (task.id && task.id.toLowerCase().includes(query));

      const matchesPriority = priority === 'all' || task.priority === priority;

      return matchesSearch && matchesPriority;
    });
  }

  updateMetrics() {
    const total = this.tasks.length;
    const inProgress = this.tasks.filter(t => t.status === 'in-progress' || t.status === 'in-review').length;
    const done = this.tasks.filter(t => t.status === 'done').length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    if (this.metricTotal) this.metricTotal.textContent = total;
    if (this.metricInProgress) this.metricInProgress.textContent = inProgress;
    if (this.metricDone) this.metricDone.textContent = done;
    if (this.metricPercent) this.metricPercent.textContent = `${percent}%`;
    if (this.progressBarFill) this.progressBarFill.style.width = `${percent}%`;
  }

  render() {
    this.updateMetrics();
    const filteredTasks = this.getFilteredTasks();

    if (this.currentView === 'kanban') {
      this.renderKanban(filteredTasks);
    } else {
      this.renderList(filteredTasks);
    }
  }

  renderKanban(filteredTasks) {
    Object.keys(this.containers).forEach(status => {
      if (this.containers[status]) this.containers[status].innerHTML = '';
      if (this.counts[status]) this.counts[status].textContent = '0';
    });

    const statusCounts = { 'backlog': 0, 'todo': 0, 'in-progress': 0, 'in-review': 0, 'done': 0 };

    filteredTasks.forEach(task => {
      if (statusCounts[task.status] !== undefined) {
        statusCounts[task.status]++;
      }

      const card = this.createTaskCard(task);
      if (this.containers[task.status]) {
        this.containers[task.status].appendChild(card);
      }
    });

    Object.keys(statusCounts).forEach(status => {
      if (this.counts[status]) {
        this.counts[status].textContent = statusCounts[status];
      }
    });
  }

  createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.draggable = true;
    card.dataset.id = task.id;

    const tagsHtml = (task.tags || []).map(t => `<span class="tag-badge">#${t}</span>`).join('');
    const priorityLabels = { 'high': '🔥 High', 'medium': '⚡ Med', 'low': '🌱 Low' };

    card.innerHTML = `
      <div class="task-card-header">
        <span class="task-card-title">${task.title}</span>
        <div class="task-card-actions">
          <button class="action-btn edit" title="수정"><i class="fa-solid fa-pen"></i></button>
          <button class="action-btn delete" title="삭제"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
      <p class="task-card-desc">${task.desc || ''}</p>
      <div class="task-card-footer">
        <div class="task-tags">${tagsHtml}</div>
        <span class="priority-badge ${task.priority}">${priorityLabels[task.priority] || task.priority}</span>
      </div>
    `;

    card.addEventListener('dragstart', (e) => {
      this.draggedTaskId = task.id;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      this.draggedTaskId = null;
    });

    card.querySelector('.edit').addEventListener('click', (e) => {
      e.stopPropagation();
      this.openTaskModal(task);
    });

    card.querySelector('.delete').addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteTask(task.id);
    });

    return card;
  }

  renderList(filteredTasks) {
    if (!this.taskListBody) return;
    this.taskListBody.innerHTML = '';

    const statusBadges = {
      'backlog': '<span class="priority-badge low">대기</span>',
      'todo': '<span class="priority-badge medium">진행 예정</span>',
      'in-progress': '<span class="priority-badge high">진행 중</span>',
      'in-review': '<span class="priority-badge medium">검토 중</span>',
      'done': '<span class="priority-badge low" style="color:#6ee7b7; border-color:rgba(16,185,129,0.3)">완료됨</span>'
    };

    filteredTasks.forEach(task => {
      const tr = document.createElement('tr');
      const tagsStr = (task.tags || []).map(t => `#${t}`).join(' ');

      tr.innerHTML = `
        <td><strong style="color: var(--accent-primary);">${task.id}</strong></td>
        <td><strong>${task.title}</strong><br><small style="color:var(--text-muted);">${task.desc || ''}</small></td>
        <td>${statusBadges[task.status] || task.status}</td>
        <td><span class="priority-badge ${task.priority}">${task.priority ? task.priority.toUpperCase() : ''}</span></td>
        <td>${tagsStr}</td>
        <td>${task.createdAt || '-'}</td>
        <td>
          <button class="action-btn edit-list" title="수정"><i class="fa-solid fa-pen"></i></button>
          <button class="action-btn delete-list delete" title="삭제"><i class="fa-solid fa-trash"></i></button>
        </td>
      `;

      tr.querySelector('.edit-list').addEventListener('click', () => this.openTaskModal(task));
      tr.querySelector('.delete-list').addEventListener('click', () => this.deleteTask(task.id));

      this.taskListBody.appendChild(tr);
    });
  }

  async updateTaskStatus(taskId, newStatus) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      task.status = newStatus;
      await this.syncTaskToCloud(task);
      this.render();
    }
  }

  openTaskModal(task = null) {
    if (task) {
      this.modalTitle.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Task 편집';
      this.taskIdInput.value = task.id;
      this.taskTitleInput.value = task.title;
      this.taskStatusSelect.value = task.status;
      this.taskPrioritySelect.value = task.priority;
      this.taskTagsInput.value = (task.tags || []).join(', ');
      this.taskDescInput.value = task.desc || '';
    } else {
      this.modalTitle.innerHTML = '<i class="fa-solid fa-plus-circle"></i> 새 Task 추가';
      this.taskIdInput.value = '';
      this.taskForm.reset();
      this.taskStatusSelect.value = 'todo';
      this.taskPrioritySelect.value = 'medium';
    }

    this.taskModal.classList.remove('hidden');
  }

  closeTaskModal() {
    this.taskModal.classList.add('hidden');
  }

  openSupabaseModal() {
    if (this.spUrlInput) this.spUrlInput.value = localStorage.getItem('supabase_url') || '';
    if (this.spKeyInput) this.spKeyInput.value = localStorage.getItem('supabase_anon_key') || '';
    if (this.supabaseModal) this.supabaseModal.classList.remove('hidden');
  }

  closeSupabaseModal() {
    if (this.supabaseModal) this.supabaseModal.classList.add('hidden');
  }

  async handleSupabaseFormSubmit(e) {
    e.preventDefault();
    const url = this.spUrlInput.value.trim();
    const key = this.spKeyInput.value.trim();

    if (window.supabaseService) {
      const ok = window.supabaseService.saveCredentials(url, key);
      if (ok) {
        alert("⚡ Supabase 데이터베이스와 성공적으로 연결되었습니다.");
        await this.loadTasks();
      } else {
        alert("⚠️ Supabase 연결에 실패하였습니다. Key와 URL을 다시 확인해주세요.");
      }
    }
    this.closeSupabaseModal();
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    const id = this.taskIdInput.value;
    const title = this.taskTitleInput.value.trim();
    const status = this.taskStatusSelect.value;
    const priority = this.taskPrioritySelect.value;
    const tags = this.taskTagsInput.value.split(',').map(t => t.trim()).filter(t => t.length > 0);
    const desc = this.taskDescInput.value.trim();

    if (!title) return;

    let targetTask = null;

    if (id) {
      targetTask = this.tasks.find(t => t.id === id);
      if (targetTask) {
        targetTask.title = title;
        targetTask.status = status;
        targetTask.priority = priority;
        targetTask.tags = tags;
        targetTask.desc = desc;
      }
    } else {
      const newId = `TASK-${String(this.tasks.length + 1).padStart(2, '0')}`;
      targetTask = {
        id: newId,
        title,
        status,
        priority,
        tags,
        desc,
        createdAt: new Date().toISOString().split('T')[0]
      };
      this.tasks.push(targetTask);
    }

    if (targetTask) {
      await this.syncTaskToCloud(targetTask);
    }

    this.closeTaskModal();
    this.render();
  }

  async deleteTask(taskId) {
    if (confirm(`Task (${taskId})를 정말 삭제하시겠습니까?`)) {
      this.tasks = this.tasks.filter(t => t.id !== taskId);
      await this.deleteTaskFromCloud(taskId);
      this.render();
    }
  }

  exportJson() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `project_tasks_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  importJson(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedTasks = JSON.parse(event.target.result);
        if (Array.isArray(importedTasks)) {
          this.tasks = importedTasks;
          this.saveLocalStorage();
          this.render();
          alert('성공적으로 Task 목록을 불러왔습니다.');
        } else {
          alert('올바른 JSON 포맷이 아닙니다.');
        }
      } catch (err) {
        alert('JSON 파일 파싱 실패: ' + err.message);
      }
    };
    reader.readAsText(file);
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ProjectBoardApp();
});

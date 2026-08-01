// Supabase Client Wrapper for Real-time DB Integration

class SupabaseService {
  constructor() {
    this.client = null;
    this.isConfigured = false;
    this.init();
  }

  init() {
    const url = window.SUPABASE_URL || localStorage.getItem('supabase_url') || '';
    const key = window.SUPABASE_ANON_KEY || localStorage.getItem('supabase_anon_key') || '';

    const supabaseLib = window.supabase || (window.supabaseJS ? window.supabaseJS : null);

    if (url && key && supabaseLib && typeof supabaseLib.createClient === 'function') {
      try {
        this.client = supabaseLib.createClient(url, key);
        this.isConfigured = true;
        console.log("⚡ Supabase Client initialized successfully.");
      } catch (err) {
        console.warn("Supabase init error:", err);
        this.isConfigured = false;
      }
    } else {
      this.isConfigured = false;
      console.log("ℹ️ Supabase running in LocalStorage fallback mode.");
    }
  }

  saveCredentials(url, key) {
    if (url && key) {
      localStorage.setItem('supabase_url', url);
      localStorage.setItem('supabase_anon_key', key);
      this.init();
      return this.isConfigured;
    }
    return false;
  }

  async fetchTasks() {
    if (!this.isConfigured || !this.client) return null;
    try {
      const { data, error } = await this.client.from('tasks').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      return data.map(row => ({
        id: row.id,
        title: row.title,
        desc: row.desc_text || '',
        status: row.status,
        priority: row.priority,
        tags: row.tags || [],
        createdAt: row.created_at ? row.created_at.split('T')[0] : ''
      }));
    } catch (e) {
      console.error("Supabase fetch error:", e);
      return null;
    }
  }

  async upsertTask(task) {
    if (!this.isConfigured || !this.client) return false;
    try {
      const row = {
        id: task.id,
        title: task.title,
        desc_text: task.desc,
        status: task.status,
        priority: task.priority,
        tags: task.tags,
        updated_at: new Date().toISOString()
      };
      const { error } = await this.client.from('tasks').upsert(row);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Supabase upsert error:", e);
      return false;
    }
  }

  async deleteTask(taskId) {
    if (!this.isConfigured || !this.client) return false;
    try {
      const { error } = await this.client.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Supabase delete error:", e);
      return false;
    }
  }

  subscribeToChanges(callback) {
    if (!this.isConfigured || !this.client) return null;
    return this.client
      .channel('public:tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        console.log("⚡ Real-time database update payload:", payload);
        if (callback) callback(payload);
      })
      .subscribe();
  }
}

window.supabaseService = new SupabaseService();

const PREFIX = 'kisiagri_db_';

function read(name) {
  try { return JSON.parse(localStorage.getItem(PREFIX + name) || '[]'); } catch { return []; }
}
function write(name, items) {
  localStorage.setItem(PREFIX + name, JSON.stringify(items));
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}
function currentUser() {
  try { return JSON.parse(localStorage.getItem('kisiagri_user') || 'null'); } catch { return null; }
}

export function createEntity(name) {
  return {
    async list(sort, limit) {
      let items = read(name);
      if (sort) {
        const desc = sort.startsWith('-');
        const field = desc ? sort.slice(1) : sort;
        items.sort((a, b) => { const av = a[field], bv = b[field]; if (av < bv) return desc ? 1 : -1; if (av > bv) return desc ? -1 : 1; return 0; });
      }
      if (limit) items = items.slice(0, limit);
      return items;
    },
    async filter(query, sort, limit) {
      let items = read(name).filter(item => Object.entries(query).every(([k, v]) => item[k] === v));
      if (sort) {
        const desc = sort.startsWith('-');
        const field = desc ? sort.slice(1) : sort;
        items.sort((a, b) => { const av = a[field], bv = b[field]; if (av < bv) return desc ? 1 : -1; if (av > bv) return desc ? -1 : 1; return 0; });
      }
      if (limit) items = items.slice(0, limit);
      return items;
    },
    async get(id) { return read(name).find(i => i.id === id); },
    async create(data) {
      const items = read(name);
      const user = currentUser();
      const record = { id: uid(), created_date: new Date().toISOString(), updated_date: new Date().toISOString(), created_by_id: user ? user.id : 'local', ...data };
      items.push(record); write(name, items); return record;
    },
    async update(id, data) {
      const items = read(name); const idx = items.findIndex(i => i.id === id);
      if (idx === -1) throw new Error('Not found');
      items[idx] = { ...items[idx], ...data, updated_date: new Date().toISOString() };
      write(name, items); return items[idx];
    },
    async delete(id) { write(name, read(name).filter(i => i.id !== id)); },
    async bulkCreate(records) {
      const items = read(name); const user = currentUser();
      const created = records.map(data => {
        const r = { id: uid(), created_date: new Date().toISOString(), updated_date: new Date().toISOString(), created_by_id: user ? user.id : 'local', ...data };
        items.push(r); return r;
      });
      write(name, items); return created;
    },
    async deleteMany(query) { write(name, read(name).filter(item => !Object.entries(query).every(([k, v]) => item[k] === v))); },
    subscribe(cb) {
      const h = (e) => { if (e.key === PREFIX + name) cb({ type: 'update', data: read(name) }); };
      window.addEventListener('storage', h);
      return () => window.removeEventListener('storage', h);
    },
    schema() { return {}; }
  };
}

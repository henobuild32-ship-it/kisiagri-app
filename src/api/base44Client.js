import { createEntity } from '@/lib/localDb';

const entities = {
  Debt: createEntity('Debt'),
  DebtPayment: createEntity('DebtPayment'),
  MarketPrice: createEntity('MarketPrice'),
  Inventory: createEntity('Inventory'),
  Contract: createEntity('Contract'),
  Notification: createEntity('Notification'),
  ActivityLog: createEntity('ActivityLog'),
  Profile: createEntity('Profile'),
  MobileMoneyTransaction: createEntity('MobileMoneyTransaction'),
  User: createEntity('User'),
};

const auth = {
  async me() {
    const u = localStorage.getItem('kisiagri_user');
    if (!u) throw new Error('Not authenticated');
    return JSON.parse(u);
  },
  async isAuthenticated() { return !!localStorage.getItem('kisiagri_user'); },
  async loginViaEmailPassword(email, password) {
    const users = JSON.parse(localStorage.getItem('kisiagri_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Identifiants invalids');
    localStorage.setItem('kisiagri_user', JSON.stringify(user));
    return user;
  },
  async register({ email, password }) {
    const users = JSON.parse(localStorage.getItem('kisiagri_users') || '[]');
    if (users.find(u => u.email === email)) throw new Error('Email deja enregistre');
    const user = { id: Date.now().toString(36), email, password, full_name: '', role: 'user' };
    users.push(user);
    localStorage.setItem('kisiagri_users', JSON.stringify(users));
    return user;
  },
  async verifyOtp({ email, otpCode }) {
    const users = JSON.parse(localStorage.getItem('kisiagri_users') || '[]');
    const user = users.find(u => u.email === email);
    if (!user) throw new Error('Utilisateur introuvable');
    localStorage.setItem('kisiagri_user', JSON.stringify(user));
    return { access_token: 'local_' + user.id };
  },
  async resendOtp(email) {},
  setToken(token) { localStorage.setItem('kisiagri_token', token); },
  async logout() { localStorage.removeItem('kisiagri_user'); localStorage.removeItem('kisiagri_token'); },
  async updateMe(data) {
    const u = JSON.parse(localStorage.getItem('kisiagri_user') || '{}');
    const updated = { ...u, ...data };
    localStorage.setItem('kisiagri_user', JSON.stringify(updated));
    return updated;
  },
  loginWithProvider() { throw new Error('OAuth non disponible en mode local'); },
  async resetPasswordRequest(email) {},
  async resetPassword() {},
};

const integrations = {
  Core: {
    async UploadFile({ file }) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ file_url: reader.result });
        reader.readAsDataURL(file);
      });
    },
    async SendEmail({ to, subject, body }) {
      console.log('Email:', to, subject, body);
      return { success: true };
    },
    async InvokeLLM({ prompt }) {
      return { response: 'Mode local - IA non disponible' };
    },
    async GenerateImage({ prompt }) {
      return { url: 'https://via.placeholder.com/400?text=' + encodeURIComponent(prompt) };
    },
  }
};

const analytics = { track() {} };
const users = { async inviteUser() { throw new Error('Non disponible en mode local'); } };
const agents = {};

export const base44 = { entities, auth, integrations, analytics, users, agents };

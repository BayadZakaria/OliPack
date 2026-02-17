
import { createClient } from '@supabase/supabase-js';
import { UserProfile, UserStatus, ProductReview } from '../types';

const supabaseUrl = (window as any).process?.env?.SUPABASE_URL || '';
const supabaseAnonKey = (window as any).process?.env?.SUPABASE_ANON_KEY || '';

const isConfigured = supabaseUrl && supabaseUrl.startsWith('https://') && supabaseAnonKey && supabaseAnonKey.length > 10;

let supabaseClient: any = null;
if (isConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    console.log("🟢 OliPack Cloud : Connecté");
  } catch (e) {
    console.error("🔴 Erreur Initialisation Supabase:", e);
  }
} else {
  console.log("🟡 OliPack Simulation : Mode hors-ligne activé");
}

export const supabase = supabaseClient;

export const MAASSRAS_DATA: Record<string, string[]> = {
  "Beni Mellal": ["Maâssra El Baraka", "Coopérative Atlas", "Pressoir Ain Asserdoun"],
  "Meknès": ["Huilerie du Nord", "OliMeknès Press", "Domaine de l'Olivier"],
  "Marrakech": ["Al Haouz Bio", "Menara Olive", "Palmeraie Extraction"],
  "Casablanca": ["OliCasa Industrie", "Raffinage Mansour"],
  "Rabat": ["BioPress Rabat", "Zitoun Chellah"],
  "Agadir": ["Souss Olive", "Agadir Oil Tech"],
  "Tanger": ["Nord Olea", "Détroit Olive"]
};

const MOCK_USERS: UserProfile[] = [
  { 
    id: 'admin-zakaria',
    email: "bayadzakaria6@gmail.com", 
    password: "zakaria", 
    prenom: "Zakaria", 
    nom: "Bayad", 
    cin: "A1234567",
    telephone: "0600000000",
    ville: "Beni Mellal",
    role: 'ADMIN', 
    status: 'APPROVED',
    fonction: 'Administrateur & Fondateur'
  },
  { 
    id: 'tech-default',
    email: "tech@olipak.com", 
    password: "zakaria", 
    prenom: "Technicien", 
    nom: "OliPack", 
    cin: "TECH-001",
    telephone: "0600000001",
    ville: "Beni Mellal",
    role: 'TECHNICIEN', 
    status: 'APPROVED',
    fonction: 'Expert Qualité & Diagnostic'
  }
];

export const db = {
  async getCurrentUser(): Promise<UserProfile | null> {
    if (!supabase) return null;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;
      return await this.formatUser(session.user);
    } catch (e) {
      return null;
    }
  },

  async formatUser(supabaseUser: any): Promise<UserProfile> {
    if (!supabaseUser) return { email: '', prenom: 'Utilisateur', nom: '', ville: '', role: 'HUILERIE', cin: '', telephone: '', fonction: 'Partenaire', status: 'PENDING' };
    let profileData = null;
    if (supabase) {
      const { data } = await supabase.from('profiles').select('*').eq('id', supabaseUser.id).single();
      profileData = data;
    }
    const role = (profileData?.role || supabaseUser.user_metadata?.role || 'HUILERIE') as any;
    const status = (profileData?.status || 'PENDING') as UserStatus;
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      prenom: String(profileData?.prenom || supabaseUser.user_metadata?.prenom || 'Utilisateur'),
      nom: String(profileData?.nom || supabaseUser.user_metadata?.nom || ''),
      ville: String(profileData?.ville || supabaseUser.user_metadata?.ville || ''),
      role: role,
      status: status,
      cin: profileData?.cin || '',
      telephone: profileData?.telephone || '',
      fonction: profileData?.fonction || (role === 'ADMIN' ? 'Administrateur' : 'Partenaire OliPack'),
      deletionRequested: profileData?.deletionRequested || false
    };
  },

  async signUp(userData: UserProfile) {
    const initialStatus = userData.role === 'ACHETEUR' ? 'APPROVED' : 'PENDING';
    if (!supabase) {
      const users = JSON.parse(localStorage.getItem('olipack_mock_users') || '[]');
      const newUser = { ...userData, id: 'mock-' + Date.now(), status: initialStatus, deletionRequested: false }; 
      users.push(newUser);
      localStorage.setItem('olipack_mock_users', JSON.stringify(users));
      return { user: newUser };
    }
    const { data, error } = await supabase.auth.signUp({ 
      email: userData.email, password: userData.password!,
      options: { data: { prenom: userData.prenom, nom: userData.nom, ville: userData.ville, role: userData.role || 'HUILERIE', status: initialStatus } }
    });
    if (error) throw error;
    if (data.user) {
      await supabase.from('profiles').upsert([{ id: data.user.id, email: userData.email, nom: userData.nom, prenom: userData.prenom, ville: userData.ville, role: userData.role || 'HUILERIE', status: initialStatus, deletionRequested: false }]);
    }
    return data;
  },

  async signIn(email: string, password: string) {
    if (!supabase) {
      const storedUsers = JSON.parse(localStorage.getItem('olipack_mock_users') || '[]');
      const mockUser = MOCK_USERS.find(u => u.email === email && u.password === password) || storedUsers.find((u: any) => u.email === email && u.password === password);
      if (!mockUser) throw new Error("Identifiants incorrects.");
      return mockUser;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return await this.formatUser(data.user);
  },

  async getAllUsers(): Promise<UserProfile[]> {
    if (!supabase) {
      const stored = JSON.parse(localStorage.getItem('olipack_mock_users') || '[]');
      return [...MOCK_USERS, ...stored];
    }
    const { data } = await supabase.from('profiles').select('*');
    return data || [];
  },

  async getPendingUsersCount(): Promise<number> {
    const users = await this.getAllUsers();
    return users.filter(u => u.status === 'PENDING').length;
  },

  async verifyUser(userId: string, newStatus: UserStatus) {
    if (!supabase) {
      const users = JSON.parse(localStorage.getItem('olipack_mock_users') || '[]');
      const updated = users.map((u: any) => u.id === userId ? { ...u, status: newStatus } : u);
      localStorage.setItem('olipack_mock_users', JSON.stringify(updated));
      return true;
    }
    await supabase.from('profiles').update({ status: newStatus }).eq('id', userId);
    return true;
  },

  async saveReview(review: ProductReview) {
    if (!supabase) {
      const reviews = JSON.parse(localStorage.getItem('olipack_reviews') || '[]');
      reviews.push(review);
      localStorage.setItem('olipack_reviews', JSON.stringify(reviews));
      return true;
    }
    const { error } = await supabase.from('reviews').insert([review]);
    if (error) throw error;
    return true;
  },

  async getReviews(productId?: number): Promise<ProductReview[]> {
    if (!supabase) {
      const reviews = JSON.parse(localStorage.getItem('olipack_reviews') || '[]');
      return productId ? reviews.filter((r: any) => r.productId === productId) : reviews;
    }
    let query = supabase.from('reviews').select('*');
    if (productId) query = query.eq('productId', productId);
    const { data } = await query;
    return data || [];
  },

  async requestAccountDeletion(userId: string) {
    if (!supabase) {
      const all = JSON.parse(localStorage.getItem('olipack_mock_users') || '[]');
      const updated = all.map((u: any) => u.id === userId ? { ...u, deletionRequested: true } : u);
      localStorage.setItem('olipack_mock_users', JSON.stringify(updated));
      return true;
    }
    await supabase.from('profiles').update({ deletionRequested: true }).eq('id', userId);
    return true;
  },

  async cancelAccountDeletion(userId: string) {
    if (!supabase) {
      const all = JSON.parse(localStorage.getItem('olipack_mock_users') || '[]');
      const updated = all.map((u: any) => u.id === userId ? { ...u, deletionRequested: false } : u);
      localStorage.setItem('olipack_mock_users', JSON.stringify(updated));
      return true;
    }
    await supabase.from('profiles').update({ deletionRequested: false }).eq('id', userId);
    return true;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    if (!supabase) {
      const all = JSON.parse(localStorage.getItem('olipack_mock_users') || '[]');
      const updatedAll = all.map((u: any) => u.id === userId ? { ...u, ...updates } : u);
      localStorage.setItem('olipack_mock_users', JSON.stringify(updatedAll));
      return { ...updates };
    }
    const { data } = await supabase.from('profiles').update(updates).eq('id', userId).select();
    return data?.[0];
  },

  async deleteAccount(userId: string) {
    if (!supabase) {
      const all = JSON.parse(localStorage.getItem('olipack_mock_users') || '[]');
      localStorage.setItem('olipack_mock_users', JSON.stringify(all.filter((u: any) => u.id !== userId)));
      return true;
    }
    await supabase.from('profiles').delete().eq('id', userId);
    return true;
  },

  async saveCollectionEvent(collection: any) {
    if (!supabase) {
      const collections = JSON.parse(localStorage.getItem('olipack_collections') || '[]');
      const newEvent = { ...collection, id: 'col-' + Date.now(), created_at: new Date().toISOString(), is_read: false };
      collections.push(newEvent);
      localStorage.setItem('olipack_collections', JSON.stringify(collections));
      return newEvent;
    }
    const { data } = await supabase.from('collections').insert([{ ...collection, is_read: false }]).select();
    return data?.[0];
  },

  async getCollections(): Promise<any[]> {
    if (!supabase) return JSON.parse(localStorage.getItem('olipack_collections') || '[]');
    const { data } = await supabase.from('collections').select('*').order('created_at', { ascending: false });
    return data || [];
  },

  async getUnreadCollectionsCount(): Promise<number> {
    const cols = await this.getCollections();
    return cols.filter(c => !c.is_read).length;
  },

  async markCollectionAsRead(id: string) {
    if (!supabase) {
      const collections = JSON.parse(localStorage.getItem('olipack_collections') || '[]');
      const updated = collections.map((c: any) => c.id === id ? { ...c, is_read: true } : c);
      localStorage.setItem('olipack_collections', JSON.stringify(collections));
      return true;
    }
    await supabase.from('profiles').update({ is_read: true }).eq('id', id);
    return true;
  },

  async getPredictionHistory() {
    if (!supabase) return [];
    const { data } = await supabase.from('predictions').select('*').order('created_at', { ascending: false });
    return data || [];
  },

  async savePrediction(prediction: any) {
    if (!supabase) return prediction;
    const { data } = await supabase.from('predictions').insert([prediction]).select();
    return data?.[0];
  },
};


import { createClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';

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

const MOCK_USERS: UserProfile[] = [
  { 
    email: "admin@olipack.ma", 
    password: "admin", 
    prenom: "Zakaria", 
    nom: "Bayad", 
    cin: "A1234567",
    telephone: "0600000000",
    role: 'ADMIN', 
    fonction: 'CEO & Founder'
  },
  {
    email: "maassra@olipack.ma",
    password: "maassra",
    prenom: "Ahmed",
    nom: "Olive",
    cin: "B987654",
    telephone: "0611223344",
    role: 'HUILERIE',
    fonction: 'Propriétaire Maâssra'
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
    if (!supabaseUser) {
      return { email: '', prenom: 'Utilisateur', nom: '', role: 'HUILERIE', cin: '', telephone: '', fonction: 'Partenaire' };
    }

    let profileData = null;
    try {
      if (supabase) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();
        profileData = data;
      }
    } catch (e) {
      console.warn("Profil non trouvé ou erreur DB.");
    }

    const role = (profileData?.role || supabaseUser.user_metadata?.role || 'HUILERIE') as any;

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      prenom: String(profileData?.prenom || supabaseUser.user_metadata?.prenom || 'Utilisateur'),
      nom: String(profileData?.nom || supabaseUser.user_metadata?.nom || ''),
      role: role,
      cin: profileData?.cin || '',
      telephone: profileData?.telephone || '',
      fonction: role === 'ADMIN' ? 'Administrateur' : 'Partenaire OliPack'
    };
  },

  async signUp(userData: UserProfile) {
    if (!supabase) {
      const users = JSON.parse(localStorage.getItem('olipack_mock_users') || '[]');
      if (users.find((u: any) => u.email === userData.email)) throw new Error("Email déjà utilisé.");
      const newUser = { ...userData, id: 'mock-' + Date.now() };
      users.push(newUser);
      localStorage.setItem('olipack_mock_users', JSON.stringify(users));
      return { user: newUser };
    }

    const { data, error } = await supabase.auth.signUp({ 
      email: userData.email, 
      password: userData.password!,
      options: {
        data: {
          prenom: userData.prenom,
          nom: userData.nom,
          role: userData.role || 'HUILERIE'
        }
      }
    });

    if (error) throw error;
    
    if (data.user) {
      try {
        await supabase.from('profiles').upsert([{ 
          id: data.user.id, 
          email: userData.email,
          nom: userData.nom,
          prenom: userData.prenom,
          role: userData.role || 'HUILERIE',
          cin: userData.cin || '',
          telephone: userData.telephone || ''
        }]);
      } catch (err) {
        console.warn("Table profiles inaccessible.");
      }
    }
    return data;
  },

  async signIn(email: string, password: string) {
    if (!supabase) {
      const storedUsers = JSON.parse(localStorage.getItem('olipack_mock_users') || '[]');
      const mockUser = MOCK_USERS.find(u => u.email === email && u.password === password) || 
                       storedUsers.find((u: any) => u.email === email && u.password === password);
      if (!mockUser) throw new Error("Identifiants incorrects.");
      return mockUser;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return await this.formatUser(data.user);
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    if (!supabase) {
      // Simulation mode
      const savedUser = localStorage.getItem('olipack_user');
      if (savedUser) {
        const current = JSON.parse(savedUser);
        const updated = { ...current, ...updates };
        localStorage.setItem('olipack_user', JSON.stringify(updated));
        return updated;
      }
      return null;
    }

    // Cloud mode
    const { data, error } = await supabase
      .from('profiles')
      .update({
        nom: updates.nom,
        prenom: updates.prenom,
        cin: updates.cin,
        telephone: updates.telephone
      })
      .eq('id', userId)
      .select();

    if (error) throw error;
    return data[0];
  },

  async deleteAccount(userId: string) {
    if (!supabase) {
      // Simulation mode
      localStorage.removeItem('olipack_user');
      return true;
    }

    // Note: Supabase user deletion usually requires service role. 
    // Here we clear the profile and then sign out.
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (profileError) throw profileError;

    const { error: authError } = await supabase.auth.signOut();
    if (authError) throw authError;

    localStorage.removeItem('olipack_user');
    return true;
  },

  async savePrediction(prediction: any) {
    if (!supabase) return prediction;
    const { data, error } = await supabase.from('predictions').insert([prediction]).select();
    if (error) throw error;
    return data[0];
  },

  async getPredictionHistory() {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase.from('predictions').select('*').order('created_at', { ascending: false });
      if (error) return [];
      return data || [];
    } catch (e) { return []; }
  },

  async saveCollectionEvent(collection: any) {
    if (!supabase) return collection;
    const { data, error } = await supabase.from('collections').insert([collection]).select();
    if (error) throw error;
    return data[0];
  }
};

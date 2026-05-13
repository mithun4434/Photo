import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../lib/supabase";

export type Role = "member" | "leader" | "co-leader" | "co-lead";

export interface AppUser {
  id: string;
  email: string;
  name?: string;
  role: Role;
  personalTarget: number;
  uploadedCount: number;
  lastSyncedAt?: number;
  createdAt: number;
  driveFolderId?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (authUser: any) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (data) {
        // Map database row to AppUser type, handling snake_case to camelCase if needed
        // Assuming the database uses camelCase internally or exactly matching fields.
        // Let's rely on standard object matching in this app for now.
        setUser({
          ...data,
          personalTarget: data.personalTarget || data.personal_target || 100,
          uploadedCount: data.uploadedCount || data.uploaded_count || 0,
          lastSyncedAt: data.lastSyncedAt || data.last_synced_at,
          driveFolderId: data.driveFolderId || data.drive_folder_id || undefined,
        } as AppUser);
        
        // Trigger background sync on login
        if (authUser) {
           const { data: session } = await supabase.auth.getSession();
           if (session?.session?.access_token) {
              fetch(`/api/sync/${authUser.id}`, { 
                 method: 'POST', 
                 headers: { 'Authorization': `Bearer ${session.session.access_token}` }
              }).catch(() => {});
           }
        }
      } else {
        // Create the user profile on first fetch
        const newUser = {
          id: authUser.id,
          email: authUser.email || "",
          role: "member",
          personalTarget: 100,
          uploadedCount: 0,
          createdAt: Date.now(),
        };
        const { data: createdData, error: createError } = await supabase
          .from('users')
          .insert([newUser])
          .select()
          .single();
        
        if (createdData) {
          setUser(createdData as AppUser);
        } else {
          setUser(newUser as AppUser);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

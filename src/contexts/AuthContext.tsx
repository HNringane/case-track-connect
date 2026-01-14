import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'victim' | 'police' | 'admin';

interface Profile {
  id: string;
  full_name: string | null;
  id_number: string | null;
  phone: string | null;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  anonymous: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  supabaseUser: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
}

interface RegisterData {
  fullName: string;
  saId: string;
  phone: string;
  email?: string;
  password: string;
  anonymous: boolean;
  role: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user role from database
  const fetchUserRole = async (userId: string): Promise<UserRole> => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return 'victim'; // Default role
    }
    return data.role as UserRole;
  };

  // Fetch user profile from database
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error.message);
      return null;
    }
    return data;
  };

  // Build auth user from Supabase user
  const buildAuthUser = async (supabaseUser: User): Promise<AuthUser> => {
    const role = await fetchUserRole(supabaseUser.id);
    const profile = await fetchProfile(supabaseUser.id);
    
    return {
      id: supabaseUser.id,
      name: profile?.full_name || supabaseUser.user_metadata?.full_name || 'User',
      email: supabaseUser.email || '',
      role,
      anonymous: supabaseUser.user_metadata?.anonymous || false,
    };
  };

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener FIRST (synchronous callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      
      if (session?.user) {
        // Defer Supabase calls with setTimeout to avoid deadlock
        setTimeout(() => {
          buildAuthUser(session.user).then(authUser => {
            setUser(authUser);
            setIsLoading(false);
          });
        }, 0);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      
      if (session?.user) {
        buildAuthUser(session.user).then(authUser => {
          setUser(authUser);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (saId: string, password: string, role: UserRole) => {
    // Use SA ID as email format for login
    const email = `${saId}@casetrack.saps.gov.za`;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error.message);
      throw new Error(error.message);
    }

    // Verify user has the expected role
    if (data.user) {
      const actualRole = await fetchUserRole(data.user.id);
      if (actualRole !== role) {
        await supabase.auth.signOut();
        throw new Error(`You don't have ${role} access. Please select the correct role.`);
      }
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
  };

  const register = async (data: RegisterData) => {
    // Use SA ID as email format
    const email = data.email || `${data.saId}@casetrack.saps.gov.za`;
    
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          id_number: data.saId,
          phone: data.phone,
          anonymous: data.anonymous,
          role: data.role, // Include role in user metadata
        },
      },
    });

    if (error) {
      console.error('Registration error:', error.message);
      throw new Error(error.message);
    }

    // The trigger will automatically create the profile and assign the victim role
    if (authData.user) {
      toast({
        title: 'Account Created',
        description: 'Your account has been created successfully.',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      supabaseUser,
      session,
      isAuthenticated: !!user, 
      isLoading,
      login, 
      logout, 
      register 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
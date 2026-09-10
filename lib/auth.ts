import { supabase } from './supabase'

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function createUserProfile(
  userId: string,
  profileData: {
    full_name: string
    email: string
    phone: string
    role?: 'admin' | 'reception' | 'security'
  }
): Promise<any> {
  const insertResult = (supabase.from('profiles') as any)
    .insert([
      {
        id: userId,
        ...profileData,
      },
    ])
    .select()
    .single()

  const { data, error } = await insertResult

  if (error) throw error
  return data
}

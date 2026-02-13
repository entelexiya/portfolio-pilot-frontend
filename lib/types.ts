// Shared types for verification system (Stage 1)

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected'

export interface Achievement {
  id: string
  user_id: string
  title: string
  description: string
  category: 'award' | 'activity'
  type: string
  date: string
  file_url?: string
  created_at: string
  updated_at: string
  // Verification (Stage 1)
  verification_status: VerificationStatus
  verified_by?: string | null
  verified_at?: string | null
  verifier_comment?: string | null
  verification_link?: string | null
}

export interface VerificationRequest {
  id: string
  achievement_id: string
  student_id: string
  verifier_email: string
  verifier_id?: string | null
  message?: string | null
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  token: string
  verifier_comment?: string | null
  created_at: string
}

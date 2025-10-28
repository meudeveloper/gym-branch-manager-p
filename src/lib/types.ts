export interface Branch {
  id: string
  name: string
  code: string
  address: string
  openHours: string
  isActive: boolean
  createdAt: string
}

export interface Room {
  id: string
  branchId: string
  name: string
  capacity: number
  isActive: boolean
}

export type MembershipPlan = '1-month' | '3-months' | '6-months' | '12-months'

export interface Member {
  id: string
  fullName: string
  gender: 'male' | 'female' | 'other'
  phone: string
  birthday: string
  address: string
  branchId: string
  roomId: string
  membershipPlan: MembershipPlan
  startDate: string
  endDate: string
  photoUrl?: string
  isActive: boolean
  createdAt: string
}

export interface AttendanceSession {
  id: string
  memberId: string
  branchId: string
  roomId: string
  checkinTime: string
  checkoutTime?: string
  duration?: number
}

export type MemberStatus = 'active' | 'expired' | 'expiring-soon'

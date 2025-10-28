import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MemberCard } from '@/components/MemberCard'
import { PhotoCapture } from '@/components/PhotoCapture'
import { Member, Branch, Room, MembershipPlan } from '@/lib/types'
import { generateId, calculateEndDate, getMemberStatus } from '@/lib/helpers'
import { Plus, Users, MagnifyingGlass } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function MembersSection() {
  const [members, setMembers] = useKV<Member[]>('gym-members', [])
  const [branches] = useKV<Branch[]>('gym-branches', [])
  const [rooms] = useKV<Room[]>('gym-rooms', [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterBranch, setFilterBranch] = useState<string>('all')
  
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'male' as 'male' | 'female' | 'other',
    phone: '',
    birthday: '',
    address: '',
    branchId: '',
    roomId: '',
    membershipPlan: '1-month' as MembershipPlan,
    startDate: new Date().toISOString().split('T')[0],
    photoUrl: undefined as string | undefined,
  })

  const activeBranches = (branches || []).filter(b => b.isActive)
  const availableRooms = (rooms || []).filter(r => r.branchId === formData.branchId && r.isActive)

  const filteredMembers = (members || []).filter(member => {
    const matchesSearch = 
      member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm)
    
    const matchesStatus = 
      filterStatus === 'all' || getMemberStatus(member) === filterStatus
    
    const matchesBranch = 
      filterBranch === 'all' || member.branchId === filterBranch
    
    return matchesSearch && matchesStatus && matchesBranch
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.branchId || !formData.roomId) {
      toast.error('Please select both branch and room')
      return
    }

    const endDate = calculateEndDate(formData.startDate, formData.membershipPlan)
    
    if (editingMember) {
      setMembers(current =>
        (current || []).map(m =>
          m.id === editingMember.id
            ? { ...m, ...formData, endDate }
            : m
        )
      )
      toast.success('Member updated successfully')
    } else {
      const newMember: Member = {
        id: generateId(),
        ...formData,
        endDate,
        isActive: true,
        createdAt: new Date().toISOString(),
      }
      setMembers(current => [...(current || []), newMember])
      toast.success('Member registered successfully')
    }
    
    handleClose()
  }

  const handleClose = () => {
    setIsDialogOpen(false)
    setEditingMember(null)
    setFormData({
      fullName: '',
      gender: 'male',
      phone: '',
      birthday: '',
      address: '',
      branchId: '',
      roomId: '',
      membershipPlan: '1-month',
      startDate: new Date().toISOString().split('T')[0],
      photoUrl: undefined,
    })
  }

  const handleEdit = (member: Member) => {
    setEditingMember(member)
    setFormData({
      fullName: member.fullName,
      gender: member.gender,
      phone: member.phone,
      birthday: member.birthday,
      address: member.address,
      branchId: member.branchId,
      roomId: member.roomId,
      membershipPlan: member.membershipPlan,
      startDate: member.startDate,
      photoUrl: member.photoUrl,
    })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" weight="fill" />
          <div>
            <h2 className="text-2xl font-bold">Member Management</h2>
            <p className="text-sm text-muted-foreground">
              {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" weight="bold" />
          Add Member
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterBranch} onValueChange={setFilterBranch}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {activeBranches.map(branch => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm || filterStatus !== 'all' || filterBranch !== 'all'
              ? 'No members found'
              : 'No members yet'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchTerm || filterStatus !== 'all' || filterBranch !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Add your first member to get started'}
          </p>
          {!searchTerm && filterStatus === 'all' && filterBranch === 'all' && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Member
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map(member => (
            <MemberCard
              key={member.id}
              member={member}
              branch={(branches || []).find(b => b.id === member.branchId)}
              room={(rooms || []).find(r => r.id === member.roomId)}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? 'Edit Member' : 'Register New Member'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <PhotoCapture
              value={formData.photoUrl}
              onChange={photoUrl => setFormData(prev => ({ ...prev, photoUrl }))}
              name={formData.fullName}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value: 'male' | 'female' | 'other') => 
                    setFormData(prev => ({ ...prev, gender: value }))
                  }
                >
                  <SelectTrigger id="gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="555-0123"
                  required
                />
              </div>

              <div>
                <Label htmlFor="birthday">Birthday</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={e => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main St, City, State"
                  required
                />
              </div>

              <div>
                <Label htmlFor="branchId">Branch</Label>
                <Select
                  value={formData.branchId}
                  onValueChange={value => setFormData(prev => ({ ...prev, branchId: value, roomId: '' }))}
                >
                  <SelectTrigger id="branchId">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeBranches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="roomId">Room</Label>
                <Select
                  value={formData.roomId}
                  onValueChange={value => setFormData(prev => ({ ...prev, roomId: value }))}
                  disabled={!formData.branchId}
                >
                  <SelectTrigger id="roomId">
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.map(room => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="membershipPlan">Membership Plan</Label>
                <Select
                  value={formData.membershipPlan}
                  onValueChange={(value: MembershipPlan) =>
                    setFormData(prev => ({ ...prev, membershipPlan: value }))
                  }
                >
                  <SelectTrigger id="membershipPlan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-month">1 Month</SelectItem>
                    <SelectItem value="3-months">3 Months</SelectItem>
                    <SelectItem value="6-months">6 Months</SelectItem>
                    <SelectItem value="12-months">12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">
                {editingMember ? 'Update' : 'Register'} Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

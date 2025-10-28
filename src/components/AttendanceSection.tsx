import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ActiveMemberCard } from '@/components/ActiveMemberCard'
import { Member, AttendanceSession, Branch, Room } from '@/lib/types'
import { generateId, getMemberStatus, formatTime } from '@/lib/helpers'
import { DoorOpen, SignOut, ClipboardText } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function AttendanceSection() {
  const [members] = useKV<Member[]>('gym-members', [])
  const [branches] = useKV<Branch[]>('gym-branches', [])
  const [rooms] = useKV<Room[]>('gym-rooms', [])
  const [sessions, setSessions] = useKV<AttendanceSession[]>('gym-attendance-sessions', [])
  const [phoneInput, setPhoneInput] = useState('')
  const [filterBranch, setFilterBranch] = useState<string>('all')
  const [filterRoom, setFilterRoom] = useState<string>('all')

  const activeSessions = (sessions || []).filter(s => !s.checkoutTime)

  useEffect(() => {
    const checkAutoCheckout = () => {
      const now = new Date()
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)

      setSessions(current =>
        (current || []).map(session => {
          if (!session.checkoutTime && new Date(session.checkinTime) < twoHoursAgo) {
            const checkoutTime = new Date(new Date(session.checkinTime).getTime() + 2 * 60 * 60 * 1000).toISOString()
            return {
              ...session,
              checkoutTime,
              duration: 120
            }
          }
          return session
        })
      )
    }

    checkAutoCheckout()
    const interval = setInterval(checkAutoCheckout, 60000)
    return () => clearInterval(interval)
  }, [setSessions])

  const handleCheckin = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!phoneInput.trim()) {
      toast.error('Please enter a phone number')
      return
    }

    const member = (members || []).find(m => m.phone === phoneInput.trim())
    
    if (!member) {
      toast.error(`No member found with phone: ${phoneInput}`)
      setPhoneInput('')
      return
    }

    const status = getMemberStatus(member)
    if (status === 'expired') {
      toast.error(`Membership expired on ${new Date(member.endDate).toLocaleDateString()}. Please renew.`)
      return
    }

    const alreadyCheckedIn = activeSessions.some(s => s.memberId === member.id)
    if (alreadyCheckedIn) {
      toast.error(`${member.fullName} is already checked in`)
      return
    }

    const room = (rooms || []).find(r => r.id === member.roomId)
    const currentInRoom = activeSessions.filter(s => s.roomId === member.roomId).length
    
    if (room && currentInRoom >= room.capacity) {
      toast(`Warning: Room at ${currentInRoom}/${room.capacity} capacity`, {
        description: 'Check-in allowed but room is full'
      })
    }

    const newSession: AttendanceSession = {
      id: generateId(),
      memberId: member.id,
      branchId: member.branchId,
      roomId: member.roomId,
      checkinTime: new Date().toISOString(),
    }

    setSessions(current => [...(current || []), newSession])
    toast.success(`${member.fullName} checked in successfully`)
    setPhoneInput('')
  }

  const handleCheckout = (sessionId: string) => {
    setSessions(current =>
      (current || []).map(session => {
        if (session.id === sessionId && !session.checkoutTime) {
          const checkinTime = new Date(session.checkinTime)
          const checkoutTime = new Date()
          const duration = Math.floor((checkoutTime.getTime() - checkinTime.getTime()) / (1000 * 60))
          
          return {
            ...session,
            checkoutTime: checkoutTime.toISOString(),
            duration
          }
        }
        return session
      })
    )
    toast.success('Checked out successfully')
  }

  const filteredActiveSessions = activeSessions.filter(session => {
    const matchesBranch = filterBranch === 'all' || session.branchId === filterBranch
    const matchesRoom = filterRoom === 'all' || session.roomId === filterRoom
    return matchesBranch && matchesRoom
  })

  const availableRooms = filterBranch === 'all' 
    ? rooms || []
    : (rooms || []).filter(r => r.branchId === filterBranch)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <DoorOpen className="h-8 w-8 text-primary" weight="fill" />
        <div>
          <h2 className="text-2xl font-bold">Attendance</h2>
          <p className="text-sm text-muted-foreground">
            {filteredActiveSessions.length} member{filteredActiveSessions.length !== 1 ? 's' : ''} currently inside
          </p>
        </div>
      </div>

      <Tabs defaultValue="checkin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="checkin">
            <DoorOpen className="h-4 w-4 mr-2" />
            Check-in
          </TabsTrigger>
          <TabsTrigger value="inside">
            <ClipboardText className="h-4 w-4 mr-2" />
            Currently Inside
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checkin" className="space-y-6">
          <Card className="p-6">
            <form onSubmit={handleCheckin} className="space-y-4">
              <div>
                <Label htmlFor="phone">Member Phone Number</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="lg" className="bg-accent hover:bg-accent/90">
                    <DoorOpen className="h-5 w-5 mr-2" weight="bold" />
                    Check In
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          <div>
            <h3 className="font-semibold mb-3">Recent Check-ins</h3>
            <div className="space-y-3">
              {(sessions || [])
                .filter(s => s.checkinTime)
                .sort((a, b) => new Date(b.checkinTime).getTime() - new Date(a.checkinTime).getTime())
                .slice(0, 10)
                .map(session => {
                  const member = (members || []).find(m => m.id === session.memberId)
                  const branch = (branches || []).find(b => b.id === session.branchId)
                  const room = (rooms || []).find(r => r.id === session.roomId)
                  
                  if (!member) return null
                  
                  return (
                    <Card key={session.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold">{member.fullName}</p>
                          <div className="text-sm text-muted-foreground mt-1">
                            <span>{branch?.name} - {room?.name}</span>
                            <span className="mx-2">•</span>
                            <span>{formatTime(session.checkinTime)}</span>
                          </div>
                        </div>
                        {session.checkoutTime ? (
                          <div className="text-sm text-muted-foreground">
                            <SignOut className="h-4 w-4 inline mr-1" />
                            {formatTime(session.checkoutTime)}
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCheckout(session.id)}
                          >
                            <SignOut className="h-4 w-4 mr-1" />
                            Check Out
                          </Button>
                        )}
                      </div>
                    </Card>
                  )
                })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inside" className="space-y-4">
          <div className="flex gap-3">
            <Select value={filterBranch} onValueChange={value => {
              setFilterBranch(value)
              setFilterRoom('all')
            }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {(branches || []).map(branch => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterRoom} onValueChange={setFilterRoom}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rooms</SelectItem>
                {availableRooms.map(room => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredActiveSessions.length === 0 ? (
            <Card className="p-12 text-center">
              <ClipboardText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No one inside</h3>
              <p className="text-sm text-muted-foreground">
                Check in members to see them here
              </p>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredActiveSessions.map(session => {
                const member = (members || []).find(m => m.id === session.memberId)
                if (!member) return null
                
                return (
                  <ActiveMemberCard
                    key={session.id}
                    member={member}
                    checkinTime={session.checkinTime}
                    onCheckout={() => handleCheckout(session.id)}
                  />
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

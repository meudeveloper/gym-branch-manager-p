import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatCard } from '@/components/StatCard'
import { Member, AttendanceSession, Branch, Room } from '@/lib/types'
import { formatDuration, formatDate, formatTime, exportToCSV } from '@/lib/helpers'
import { ChartBar, Download, Clock, Users as UsersIcon } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function ReportsSection() {
  const [members] = useKV<Member[]>('gym-members', [])
  const [branches] = useKV<Branch[]>('gym-branches', [])
  const [rooms] = useKV<Room[]>('gym-rooms', [])
  const [sessions] = useKV<AttendanceSession[]>('gym-attendance-sessions', [])
  
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0])
  const [monthlyMonth, setMonthlyMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const [selectedMemberId, setSelectedMemberId] = useState<string>('')

  const completedSessions = (sessions || []).filter(s => s.checkoutTime)

  const dailySessions = completedSessions.filter(session => {
    const sessionDate = new Date(session.checkinTime).toISOString().split('T')[0]
    return sessionDate === dailyDate
  })

  const monthlySessions = completedSessions.filter(session => {
    const sessionMonth = new Date(session.checkinTime).toISOString().slice(0, 7)
    return sessionMonth === monthlyMonth
  })

  const memberSessions = selectedMemberId
    ? completedSessions.filter(s => s.memberId === selectedMemberId)
    : []

  const dailyStats = {
    totalSessions: dailySessions.length,
    uniqueMembers: new Set(dailySessions.map(s => s.memberId)).size,
    totalDuration: dailySessions.reduce((sum, s) => sum + (s.duration || 0), 0),
    avgDuration: dailySessions.length > 0
      ? Math.round(dailySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / dailySessions.length)
      : 0
  }

  const monthlyStats = {
    totalSessions: monthlySessions.length,
    uniqueMembers: new Set(monthlySessions.map(s => s.memberId)).size,
    totalDuration: monthlySessions.reduce((sum, s) => sum + (s.duration || 0), 0),
    avgSessionsPerMember: monthlySessions.length > 0 && new Set(monthlySessions.map(s => s.memberId)).size > 0
      ? (monthlySessions.length / new Set(monthlySessions.map(s => s.memberId)).size).toFixed(1)
      : 0
  }

  const memberStats = {
    totalVisits: memberSessions.length,
    totalDuration: memberSessions.reduce((sum, s) => sum + (s.duration || 0), 0),
    avgDuration: memberSessions.length > 0
      ? Math.round(memberSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / memberSessions.length)
      : 0,
    frequency: memberSessions.length > 0 ? 'Regular' : 'None'
  }

  const exportDaily = () => {
    const data = dailySessions.map(session => {
      const member = (members || []).find(m => m.id === session.memberId)
      const branch = (branches || []).find(b => b.id === session.branchId)
      const room = (rooms || []).find(r => r.id === session.roomId)
      
      return {
        Member: member?.fullName || 'Unknown',
        Phone: member?.phone || 'N/A',
        Branch: branch?.name || 'N/A',
        Room: room?.name || 'N/A',
        CheckIn: formatTime(session.checkinTime),
        CheckOut: session.checkoutTime ? formatTime(session.checkoutTime) : 'N/A',
        Duration: session.duration ? `${session.duration} mins` : 'N/A'
      }
    })
    
    exportToCSV(data, `gym-daily-report-${dailyDate}.csv`)
    toast.success('Report exported successfully')
  }

  const exportMonthly = () => {
    const memberSessionCounts = new Map<string, number>()
    monthlySessions.forEach(session => {
      memberSessionCounts.set(
        session.memberId,
        (memberSessionCounts.get(session.memberId) || 0) + 1
      )
    })
    
    const data = Array.from(memberSessionCounts.entries()).map(([memberId, count]) => {
      const member = (members || []).find(m => m.id === memberId)
      const memberSessions = monthlySessions.filter(s => s.memberId === memberId)
      const totalDuration = memberSessions.reduce((sum, s) => sum + (s.duration || 0), 0)
      
      return {
        Member: member?.fullName || 'Unknown',
        Phone: member?.phone || 'N/A',
        TotalVisits: count,
        TotalDuration: `${totalDuration} mins`,
        AvgDuration: `${Math.round(totalDuration / count)} mins`
      }
    })
    
    exportToCSV(data, `gym-monthly-report-${monthlyMonth}.csv`)
  }

  const exportMember = () => {
    const member = (members || []).find(m => m.id === selectedMemberId)
    
    const data = memberSessions.map(session => {
      const branch = (branches || []).find(b => b.id === session.branchId)
      const room = (rooms || []).find(r => r.id === session.roomId)
      
      return {
        Date: formatDate(session.checkinTime),
        Branch: branch?.name || 'N/A',
        Room: room?.name || 'N/A',
        CheckIn: formatTime(session.checkinTime),
        CheckOut: session.checkoutTime ? formatTime(session.checkoutTime) : 'N/A',
        Duration: session.duration ? `${session.duration} mins` : 'N/A'
      }
    })
    
    exportToCSV(data, `gym-member-report-${member?.fullName.replace(/\s+/g, '-')}.csv`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ChartBar className="h-8 w-8 text-primary" weight="fill" />
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-sm text-muted-foreground">Track attendance and member engagement</p>
        </div>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="member">By Member</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="dailyDate">Select Date</Label>
              <Input
                id="dailyDate"
                type="date"
                value={dailyDate}
                onChange={e => setDailyDate(e.target.value)}
                className="mt-2"
              />
            </div>
            <Button onClick={exportDaily} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Sessions"
              value={dailyStats.totalSessions}
              icon={<UsersIcon className="h-6 w-6" weight="fill" />}
            />
            <StatCard
              title="Unique Members"
              value={dailyStats.uniqueMembers}
              icon={<UsersIcon className="h-6 w-6" weight="fill" />}
            />
            <StatCard
              title="Total Duration"
              value={formatDuration(dailyStats.totalDuration)}
              icon={<Clock className="h-6 w-6" weight="fill" />}
            />
            <StatCard
              title="Avg Duration"
              value={formatDuration(dailyStats.avgDuration)}
              icon={<Clock className="h-6 w-6" weight="fill" />}
            />
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailySessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No sessions recorded for this date
                    </TableCell>
                  </TableRow>
                ) : (
                  dailySessions.map(session => {
                    const member = (members || []).find(m => m.id === session.memberId)
                    const branch = (branches || []).find(b => b.id === session.branchId)
                    const room = (rooms || []).find(r => r.id === session.roomId)
                    
                    return (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">{member?.fullName || 'Unknown'}</TableCell>
                        <TableCell>{branch?.name || 'N/A'}</TableCell>
                        <TableCell>{room?.name || 'N/A'}</TableCell>
                        <TableCell>{formatTime(session.checkinTime)}</TableCell>
                        <TableCell>
                          {session.checkoutTime ? formatTime(session.checkoutTime) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {session.duration ? formatDuration(session.duration) : 'N/A'}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="monthlyMonth">Select Month</Label>
              <Input
                id="monthlyMonth"
                type="month"
                value={monthlyMonth}
                onChange={e => setMonthlyMonth(e.target.value)}
                className="mt-2"
              />
            </div>
            <Button onClick={exportMonthly} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Sessions"
              value={monthlyStats.totalSessions}
              icon={<UsersIcon className="h-6 w-6" weight="fill" />}
            />
            <StatCard
              title="Unique Members"
              value={monthlyStats.uniqueMembers}
              icon={<UsersIcon className="h-6 w-6" weight="fill" />}
            />
            <StatCard
              title="Total Duration"
              value={formatDuration(monthlyStats.totalDuration)}
              icon={<Clock className="h-6 w-6" weight="fill" />}
            />
            <StatCard
              title="Avg Sessions/Member"
              value={monthlyStats.avgSessionsPerMember}
              icon={<ChartBar className="h-6 w-6" weight="fill" />}
            />
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Total Visits</TableHead>
                  <TableHead>Total Duration</TableHead>
                  <TableHead>Avg Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyStats.uniqueMembers === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No sessions recorded for this month
                    </TableCell>
                  </TableRow>
                ) : (
                  Array.from(new Set(monthlySessions.map(s => s.memberId))).map(memberId => {
                    const member = (members || []).find(m => m.id === memberId)
                    const memberSessions = monthlySessions.filter(s => s.memberId === memberId)
                    const totalDuration = memberSessions.reduce((sum, s) => sum + (s.duration || 0), 0)
                    
                    return (
                      <TableRow key={memberId}>
                        <TableCell className="font-medium">{member?.fullName || 'Unknown'}</TableCell>
                        <TableCell>{member?.phone || 'N/A'}</TableCell>
                        <TableCell>{memberSessions.length}</TableCell>
                        <TableCell>{formatDuration(totalDuration)}</TableCell>
                        <TableCell>
                          {formatDuration(Math.round(totalDuration / memberSessions.length))}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="member" className="space-y-6">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="memberId">Select Member</Label>
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                <SelectTrigger id="memberId" className="mt-2">
                  <SelectValue placeholder="Choose a member" />
                </SelectTrigger>
                <SelectContent>
                  {(members || []).map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.fullName} - {member.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={exportMember} variant="outline" disabled={!selectedMemberId}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {selectedMemberId && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total Visits"
                  value={memberStats.totalVisits}
                  icon={<UsersIcon className="h-6 w-6" weight="fill" />}
                />
                <StatCard
                  title="Total Duration"
                  value={formatDuration(memberStats.totalDuration)}
                  icon={<Clock className="h-6 w-6" weight="fill" />}
                />
                <StatCard
                  title="Avg Duration"
                  value={formatDuration(memberStats.avgDuration)}
                  icon={<Clock className="h-6 w-6" weight="fill" />}
                />
                <StatCard
                  title="Frequency"
                  value={memberStats.frequency}
                  icon={<ChartBar className="h-6 w-6" weight="fill" />}
                />
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberSessions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No attendance history for this member
                        </TableCell>
                      </TableRow>
                    ) : (
                      memberSessions
                        .sort((a, b) => new Date(b.checkinTime).getTime() - new Date(a.checkinTime).getTime())
                        .map(session => {
                          const branch = (branches || []).find(b => b.id === session.branchId)
                          const room = (rooms || []).find(r => r.id === session.roomId)
                          
                          return (
                            <TableRow key={session.id}>
                              <TableCell>{formatDate(session.checkinTime)}</TableCell>
                              <TableCell>{branch?.name || 'N/A'}</TableCell>
                              <TableCell>{room?.name || 'N/A'}</TableCell>
                              <TableCell>{formatTime(session.checkinTime)}</TableCell>
                              <TableCell>
                                {session.checkoutTime ? formatTime(session.checkoutTime) : 'N/A'}
                              </TableCell>
                              <TableCell>
                                {session.duration ? formatDuration(session.duration) : 'N/A'}
                              </TableCell>
                            </TableRow>
                          )
                        })
                    )}
                  </TableBody>
                </Table>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Member, Branch, Room } from '@/lib/types'
import { getMemberStatus, getInitials, formatDate } from '@/lib/helpers'
import { Pencil, CheckCircle, XCircle, Warning } from '@phosphor-icons/react'

interface MemberCardProps {
  member: Member
  branch?: Branch
  room?: Room
  onEdit: (member: Member) => void
}

export function MemberCard({ member, branch, room, onEdit }: MemberCardProps) {
  const status = getMemberStatus(member)
  
  const statusConfig = {
    active: { icon: CheckCircle, color: 'bg-green-500', text: 'Active' },
    'expiring-soon': { icon: Warning, color: 'bg-yellow-500', text: 'Expiring Soon' },
    expired: { icon: XCircle, color: 'bg-red-500', text: 'Expired' }
  }
  
  const StatusIcon = statusConfig[status].icon

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={member.photoUrl} alt={member.fullName} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(member.fullName)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">{member.fullName}</h3>
              <p className="text-sm text-muted-foreground">{member.phone}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(member)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              <StatusIcon className="h-3 w-3 mr-1" weight="fill" />
              {statusConfig[status].text}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {member.membershipPlan}
            </Badge>
          </div>
          
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">Branch:</span> {branch?.name || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Room:</span> {room?.name || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Expires:</span> {formatDate(member.endDate)}
            </div>
            <div>
              <span className="font-medium">Gender:</span> {member.gender}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Member } from '@/lib/types'
import { getInitials, getTimeSince } from '@/lib/helpers'
import { SignOut, Clock } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

interface ActiveMemberCardProps {
  member: Member
  checkinTime: string
  onCheckout: () => void
}

export function ActiveMemberCard({ member, checkinTime, onCheckout }: ActiveMemberCardProps) {
  const [timeDisplay, setTimeDisplay] = useState(getTimeSince(checkinTime))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeDisplay(getTimeSince(checkinTime))
    }, 30000)
    return () => clearInterval(interval)
  }, [checkinTime])

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={member.photoUrl} alt={member.fullName} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(member.fullName)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{member.fullName}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-1 animate-pulse" />
              Inside
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeDisplay}
            </span>
          </div>
        </div>
        
        <Button
          size="sm"
          variant="outline"
          onClick={onCheckout}
        >
          <SignOut className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}

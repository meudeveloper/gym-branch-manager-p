import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Room, Branch } from '@/lib/types'
import { generateId } from '@/lib/helpers'
import { Plus, DoorOpen, Pencil, CheckCircle, XCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface RoomManagementDialogProps {
  branch: Branch
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RoomManagementDialog({ branch, open, onOpenChange }: RoomManagementDialogProps) {
  const [rooms, setRooms] = useKV<Room[]>('gym-rooms', [])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    capacity: 20,
  })

  const branchRooms = (rooms || []).filter(r => r.branchId === branch.id)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingRoom) {
      setRooms(current =>
        (current || []).map(r =>
          r.id === editingRoom.id
            ? { ...r, ...formData }
            : r
        )
      )
      toast.success('Room updated')
    } else {
      const newRoom: Room = {
        id: generateId(),
        branchId: branch.id,
        ...formData,
        isActive: true,
      }
      setRooms(current => [...(current || []), newRoom])
      toast.success('Room created')
    }
    
    handleCloseAddDialog()
  }

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false)
    setEditingRoom(null)
    setFormData({ name: '', capacity: 20 })
  }

  const handleEdit = (room: Room) => {
    setEditingRoom(room)
    setFormData({
      name: room.name,
      capacity: room.capacity,
    })
    setIsAddDialogOpen(true)
  }

  const toggleActive = (roomId: string) => {
    setRooms(current =>
      (current || []).map(r =>
        r.id === roomId ? { ...r, isActive: !r.isActive } : r
      )
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <DoorOpen className="h-5 w-5" />
                Rooms in {branch.name}
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Button onClick={() => setIsAddDialogOpen(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Room
            </Button>

            {branchRooms.length === 0 ? (
              <Card className="p-8 text-center">
                <DoorOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No rooms yet. Add your first room to this branch.
                </p>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {branchRooms.map(room => (
                  <Card key={room.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{room.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Capacity: {room.capacity}
                        </p>
                        <Badge 
                          variant={room.isActive ? "default" : "secondary"}
                          className="mt-2"
                        >
                          {room.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(room)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleActive(room.id)}
                        >
                          {room.isActive ? (
                            <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" weight="fill" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRoom ? 'Edit Room' : 'Add New Room'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="roomName">Room Name</Label>
              <Input
                id="roomName"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Main Training Area"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={e => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseAddDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingRoom ? 'Update' : 'Create'} Room
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

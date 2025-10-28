import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RoomManagementDialog } from '@/components/RoomManagementDialog'
import { Branch, Room } from '@/lib/types'
import { generateId } from '@/lib/helpers'
import { Plus, Buildings, Pencil, CheckCircle, XCircle, DoorOpen } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function BranchesSection() {
  const [branches, setBranches] = useKV<Branch[]>('gym-branches', [])
  const [rooms] = useKV<Room[]>('gym-rooms', [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [managingRoomsBranch, setManagingRoomsBranch] = useState<Branch | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    openHours: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingBranch) {
      setBranches(current => 
        (current || []).map(b => 
          b.id === editingBranch.id 
            ? { ...b, ...formData }
            : b
        )
      )
      toast.success('Branch updated successfully')
    } else {
      const newBranch: Branch = {
        id: generateId(),
        ...formData,
        isActive: true,
        createdAt: new Date().toISOString(),
      }
      setBranches(current => [...(current || []), newBranch])
      toast.success('Branch created successfully')
    }
    
    handleClose()
  }

  const handleClose = () => {
    setIsDialogOpen(false)
    setEditingBranch(null)
    setFormData({ name: '', code: '', address: '', openHours: '' })
  }

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch)
    setFormData({
      name: branch.name,
      code: branch.code,
      address: branch.address,
      openHours: branch.openHours,
    })
    setIsDialogOpen(true)
  }

  const toggleActive = (branchId: string) => {
    setBranches(current =>
      (current || []).map(b =>
        b.id === branchId ? { ...b, isActive: !b.isActive } : b
      )
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Buildings className="h-8 w-8 text-primary" weight="fill" />
          <div>
            <h2 className="text-2xl font-bold">Branch Management</h2>
            <p className="text-sm text-muted-foreground">Manage your gym locations</p>
          </div>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" weight="bold" />
          Add Branch
        </Button>
      </div>

      {!branches || branches.length === 0 ? (
        <Card className="p-12 text-center">
          <Buildings className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No branches yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first gym location to get started
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Branch
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(branches || []).map(branch => {
            const branchRoomCount = (rooms || []).filter(r => r.branchId === branch.id).length
            return (
              <Card key={branch.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{branch.name}</h3>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {branch.code}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(branch)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleActive(branch.id)}
                    >
                      {branch.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" weight="fill" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Address:</span>
                    <p className="font-medium">{branch.address}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hours:</span>
                    <p className="font-medium">{branch.openHours}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={branch.isActive ? "default" : "secondary"}>
                      {branch.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setManagingRoomsBranch(branch)}
                    >
                      <DoorOpen className="h-3 w-3 mr-1" />
                      Rooms ({branchRoomCount})
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBranch ? 'Edit Branch' : 'Add New Branch'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Branch Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Downtown Fitness Center"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="code">Branch Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={e => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="DFC"
                required
              />
            </div>
            
            <div>
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
              <Label htmlFor="openHours">Open Hours</Label>
              <Input
                id="openHours"
                value={formData.openHours}
                onChange={e => setFormData(prev => ({ ...prev, openHours: e.target.value }))}
                placeholder="6:00 AM - 10:00 PM"
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">
                {editingBranch ? 'Update' : 'Create'} Branch
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {managingRoomsBranch && (
        <RoomManagementDialog
          branch={managingRoomsBranch}
          open={!!managingRoomsBranch}
          onOpenChange={open => !open && setManagingRoomsBranch(null)}
        />
      )}
    </div>
  )
}

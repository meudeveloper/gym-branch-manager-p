import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MembersSection } from '@/components/MembersSection'
import { AttendanceSection } from '@/components/AttendanceSection'
import { ReportsSection } from '@/components/ReportsSection'
import { BranchesSection } from '@/components/BranchesSection'
import { Users, DoorOpen, ChartBar, Buildings } from '@phosphor-icons/react'
import { Toaster } from '@/components/ui/sonner'

function App() {
  const [activeTab, setActiveTab] = useState('members')

  return (
    <>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                <Users className="h-6 w-6 text-accent-foreground" weight="bold" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Gym Manager</h1>
                <p className="text-sm text-muted-foreground">Multi-Branch Attendance System</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="members" className="flex items-center gap-2">
                <Users className="h-4 w-4" weight="fill" />
                <span className="hidden sm:inline">Members</span>
              </TabsTrigger>
              <TabsTrigger value="attendance" className="flex items-center gap-2">
                <DoorOpen className="h-4 w-4" weight="fill" />
                <span className="hidden sm:inline">Attendance</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <ChartBar className="h-4 w-4" weight="fill" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
              <TabsTrigger value="branches" className="flex items-center gap-2">
                <Buildings className="h-4 w-4" weight="fill" />
                <span className="hidden sm:inline">Branches</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members">
              <MembersSection />
            </TabsContent>

            <TabsContent value="attendance">
              <AttendanceSection />
            </TabsContent>

            <TabsContent value="reports">
              <ReportsSection />
            </TabsContent>

            <TabsContent value="branches">
              <BranchesSection />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      <Toaster position="top-right" />
    </>
  )
}

export default App
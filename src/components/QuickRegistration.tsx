import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PhotoCapture } from '@/components/PhotoCapture'
import { Camera, User, Phone, MapPin, ArrowLeft } from '@phosphor-icons/react'
import { Loader2 } from 'lucide-react'
import { generateId } from '@/lib/helpers'
import { toast } from 'sonner'

type Branch = {
  id: string
  name: string
  isActive: boolean
}

type Gender = 'male' | 'female' | 'other'

type Member = {
  id: string
  fullName: string
  phone: string
  gender: Gender
  birthday: string
  address: string
  branchId: string
  photoUrl?: string
  createdAt: string
}

export function QuickRegistration() {
  const [branches] = useKV<Branch[]>('gym-branches', [])
  const [members, setMembers] = useKV<Member[]>('gym-members', [])
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    gender: 'male' as Gender,
    birthday: '',
    address: '',
    branchId: '',
    photoUrl: undefined as string | undefined
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const activeBranches = branches?.filter(b => b.isActive) || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.photoUrl) {
      toast.error('Vui lòng chụp ảnh thành viên')
      return
    }
    
    if (!formData.fullName || !formData.phone || !formData.branchId || !formData.birthday) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc (*)')
      return
    }

    try {
      setIsSubmitting(true)
      
      const newMember: Member = {
        id: generateId(),
        fullName: formData.fullName,
        phone: formData.phone,
        gender: formData.gender,
        birthday: formData.birthday,
        address: formData.address,
        branchId: formData.branchId,
        photoUrl: formData.photoUrl,
        createdAt: new Date().toISOString(),
      }
      
      await setMembers([...(members || []), newMember])
      
      toast.success('Đăng ký thành viên thành công!')
      
      // Reset form
      setFormData({
        fullName: '',
        phone: '',
        gender: 'male',
        birthday: '',
        address: '',
        branchId: '',
        photoUrl: undefined
      })
      
    } catch (error) {
      console.error('Lỗi khi đăng ký:', error)
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-blue-50 text-blue-600"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Đăng ký nhanh</h1>
              <p className="text-xs text-gray-500">
                Điền thông tin cơ bản để đăng ký thành viên
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <form id="quick-register-form" onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
          {/* Photo Capture Section */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-gray-900">Ảnh đại diện</h3>
                <p className="text-xs text-gray-500">Chụp ảnh rõ mặt để dễ nhận diện</p>
              </div>
              <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                <PhotoCapture
                  value={formData.photoUrl}
                  onChange={(photoUrl) => setFormData(prev => ({ ...prev, photoUrl }))}
                  name={formData.fullName || 'User'}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4 border border-gray-100">
            {/* Full Name */}
            <div className="space-y-1">
              <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User className="h-4 w-4 text-blue-600" />
                <span>Họ và tên</span>
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Nhập họ và tên"
                className="w-full bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Phone className="h-4 w-4 text-blue-600" />
                <span>Số điện thoại <span className="text-red-500">*</span></span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Nhập số điện thoại"
                className="w-full bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {/* Gender */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Giới tính</Label>
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    checked={formData.gender === 'male'}
                    onChange={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
                  />
                  <span className="text-gray-700">Nam</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    checked={formData.gender === 'female'}
                    onChange={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
                  />
                  <span className="text-gray-700">Nữ</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    checked={formData.gender === 'other'}
                    onChange={() => setFormData(prev => ({ ...prev, gender: 'other' }))}
                  />
                  <span className="text-gray-700">Khác</span>
                </label>
              </div>
            </div>

            {/* Birthday */}
            <div className="space-y-1">
              <Label htmlFor="birthday" className="text-sm font-medium text-gray-700">
                Ngày sinh <span className="text-red-500">*</span>
              </Label>
              <Input
                id="birthday"
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                className="w-full bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {/* Address */}
            <div className="space-y-1">
              <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                Địa chỉ
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Nhập địa chỉ"
                className="w-full bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {/* Branch Selection */}
            <div className="space-y-1">
              <Label htmlFor="branch" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>Chi nhánh <span className="text-red-500">*</span></span>
              </Label>
              <Select
                value={formData.branchId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, branchId: value }))}
              >
                <SelectTrigger id="branch" className="bg-gray-50 border-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Chọn chi nhánh" />
                </SelectTrigger>
                <SelectContent>
                  {activeBranches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
      </div>
      
      <div className="bg-white border-t border-gray-200 p-4">
        <Button 
          type="submit" 
          form="quick-register-form"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-2.5 rounded-lg shadow-md hover:shadow-blue-200 transition-all duration-200"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : 'Hoàn tất đăng ký'}
        </Button>
      </div>
    </div>
  )
}

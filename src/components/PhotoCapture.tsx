import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Upload, X, CameraRotate } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface PhotoCaptureProps {
  value?: string
  onChange: (photoUrl: string | undefined) => void
  name: string
  className?: string
}

export function PhotoCapture({ value, onChange, name, className = '' }: PhotoCaptureProps) {
  const [preview, setPreview] = useState<string | undefined>(value)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  let stream: MediaStream | null = null

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      // Dừng camera hiện tại nếu đang chạy
      await stopCamera()
      
      // Yêu cầu quyền truy cập camera với cấu hình đơn giản hơn
      const constraints = {
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      }
      
      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      if (videoRef.current) {
        // Lưu stream để dọn dẹp sau này
        stream = newStream
        const video = videoRef.current
        
        // Đặt srcObject trước khi play
        video.srcObject = stream
        
        // Đảm bảo video có thể phát
        video.muted = true
        video.playsInline = true
        
        // Chờ video sẵn sàng
        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            video.play()
              .then(() => {
                console.log('Video playback started')
                resolve(true)
              })
              .catch(err => {
                console.error('Error playing video:', err)
                // Thử lại với tùy chọn khác nếu cần
                video.muted = true
                video.play().catch(console.error)
                resolve(true)
              })
          }
        })
        
        setIsCameraActive(true)
        console.log('Camera started successfully')
      }
    } catch (err) {
      console.error('Lỗi truy cập camera:', err)
      // Thông báo lỗi cho người dùng
      toast.error('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.')
      // Tự động chuyển sang chế độ chọn ảnh từ thư viện nếu không thể mở camera
      fileInputRef.current?.click()
    }
  }

  const stopCamera = async () => {
    if (stream) {
      console.log('Stopping camera...')
      stream.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind)
        track.stop()
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      
      stream = null
      console.log('Camera stopped')
    }
    return Promise.resolve()
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
        
        const photoUrl = canvasRef.current.toDataURL('image/jpeg')
        setPreview(photoUrl)
        onChange(photoUrl)
        stopCamera()
      }
    }
  }

  const toggleCamera = async () => {
    try {
      setIsLoading(true)
      const newFacingMode = facingMode === 'user' ? 'environment' : 'user'
      console.log('Toggling camera to:', newFacingMode)
      await stopCamera()
      setFacingMode(newFacingMode)
      // Đợi một chút để state được cập nhật
      await new Promise(resolve => setTimeout(resolve, 100))
      await startCamera()
    } catch (error) {
      console.error('Error toggling camera:', error)
      toast.error('Không thể chuyển đổi camera')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreview(result)
        onChange(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemove = () => {
    setPreview(undefined)
    onChange(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Thêm hiệu ứng loading khi đang khởi tạo camera
  const [isLoading, setIsLoading] = useState(false)
  
  // Xử lý khi nhấn nút chụp ảnh
  const handleCameraClick = async () => {
    try {
      setIsLoading(true)
      await startCamera()
    } catch (error) {
      console.error('Lỗi khi mở camera:', error)
      toast.error('Có lỗi xảy ra khi mở camera')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className={`w-full ${className} relative`}>
      {isCameraActive ? (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)' }}
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm"
              onClick={toggleCamera}
            >
              <CameraRotate className="h-6 w-6 text-white" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white"
              onClick={capturePhoto}
            >
              <div className="h-14 w-14 rounded-full bg-white" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm"
              onClick={stopCamera}
            >
              <X className="h-6 w-6 text-white" />
            </Button>
          </div>
        </div>
      ) : preview ? (
        <div className="relative mx-auto w-full max-w-xs">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted border-2 border-dashed border-muted-foreground/20">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="mt-2 flex justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 text-xs"
              onClick={startCamera}
            >
              <Camera className="h-3.5 w-3.5" />
              Chụp lại
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 text-xs"
              onClick={handleRemove}
            >
              <X className="h-3.5 w-3.5" />
              Xóa ảnh
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div 
            className={`relative aspect-square max-w-xs mx-auto bg-muted rounded-lg flex flex-col items-center justify-center gap-2 border-2 border-dashed border-muted-foreground/30 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            onClick={isLoading ? undefined : handleCameraClick}
            role="button"
            aria-disabled={isLoading}
          >
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
            <Camera className="h-12 w-12 text-muted-foreground/50" />
            <span className="text-sm text-muted-foreground">Chạm để chụp ảnh</span>
          </div>
          
          <div className="text-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 text-xs"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" />
              Chọn ảnh từ thư viện
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

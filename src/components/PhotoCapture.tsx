import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Upload, X } from '@phosphor-icons/react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface PhotoCaptureProps {
  value?: string
  onChange: (photoUrl: string | undefined) => void
  name: string
}

export function PhotoCapture({ value, onChange, name }: PhotoCaptureProps) {
  const [preview, setPreview] = useState<string | undefined>(value)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  return (
    <div className="flex flex-col items-center gap-4">
      {preview ? (
        <div className="relative">
          <Avatar className="h-32 w-32">
            <AvatarImage src={preview} alt={name} />
            <AvatarFallback className="bg-muted text-4xl">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center">
          <Camera className="h-12 w-12 text-muted-foreground" />
        </div>
      )}

      <input
        ref={fileInputRef}
        id="photo-upload"
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          {preview ? 'Change' : 'Upload'} Photo
        </Button>
      </div>
    </div>
  )
}

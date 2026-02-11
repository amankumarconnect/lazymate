import { useRef, JSX } from 'react'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface ProfileEditViewProps {
  profile: string
  setProfile: (value: string) => void
  onSave: () => void
  onCancel?: () => void
  onFileUpload: (file: File) => Promise<void>
  isParsing: boolean
  isRunning: boolean
}

export function ProfileEditView({
  profile,
  setProfile,
  onSave,
  onCancel,
  onFileUpload,
  isParsing,
  isRunning
}: ProfileEditViewProps): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0]
    if (!file) return
    await onFileUpload(file)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="flex-shrink-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Your Profile</CardTitle>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf"
          onChange={handleFileChange}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isParsing || isRunning}
        >
          {isParsing ? 'Parsing...' : 'Upload PDF Resume'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          placeholder="Describe yourself..."
          className="min-h-[150px] max-h-[300px] overflow-y-auto"
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
        />
        <Button className="w-full" onClick={onSave} disabled={!profile}>
          Save Profile
        </Button>
        {onCancel && (
          <Button variant="ghost" size="sm" className="w-full mt-2" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

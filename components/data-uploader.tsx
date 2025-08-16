'use client'

import { useState, useCallback } from 'react'
import { Upload, FileJson, Database, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SlackChannel } from '@/lib/mock-data'

interface DataUploaderProps {
  onDataLoaded: (channels: SlackChannel[]) => void
  onUseMockData: () => void
}

export function DataUploader({ onDataLoaded, onUseMockData }: DataUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processFile = async (file: File) => {
    setError(null)
    setFileName(file.name)

    try {
      const text = await file.text()
      let data: SlackChannel[]

      if (file.name.endsWith('.json')) {
        data = JSON.parse(text)
      } else if (file.name.endsWith('.csv')) {
        // Parse CSV
        const lines = text.split('\n')
        const headers = lines[0].split(',')
        
        const messagesMap = new Map<string, any[]>()
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue
          
          const values = lines[i].match(/(".*?"|[^,]+)/g) || []
          const message: any = {}
          
          headers.forEach((header, index) => {
            let value = values[index] || ''
            value = value.replace(/^"|"$/g, '').replace(/""/g, '"')
            
            if (header === 'reactions') {
              message[header] = value ? value.split(' ') : []
            } else if (header === 'thread_count') {
              message[header] = parseInt(value) || 0
            } else {
              message[header] = value
            }
          })
          
          if (!message.channel) continue
          
          if (!messagesMap.has(message.channel)) {
            messagesMap.set(message.channel, [])
          }
          
          messagesMap.get(message.channel)!.push({
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            user: message.user || 'unknown',
            userName: message.userName || message.user || 'Unknown User',
            text: message.text || '',
            timestamp: message.timestamp || new Date().toISOString(),
            reactions: message.reactions || [],
            thread_count: message.thread_count || 0,
            channel: message.channel
          })
        }
        
        data = Array.from(messagesMap.entries()).map(([channelName, messages]) => ({
          id: `channel_${channelName}`,
          name: channelName,
          messages
        }))
      } else {
        throw new Error('Please upload a JSON or CSV file')
      }

      // Validate data structure
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format. Expected an array of channels.')
      }

      for (const channel of data) {
        if (!channel.name || !Array.isArray(channel.messages)) {
          throw new Error('Invalid channel format. Each channel must have a name and messages array.')
        }
      }

      onDataLoaded(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file')
      setFileName(null)
    }
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      await processFile(file)
    }
  }, [onDataLoaded])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await processFile(file)
    }
  }, [onDataLoaded])

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardHeader>
          <CardTitle>Upload Slack Data</CardTitle>
          <CardDescription>
            Drop your Slack export file here or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Upload className="h-12 w-12 text-muted-foreground" />
            
            {fileName ? (
              <div className="flex items-center gap-2 text-sm">
                <FileJson className="h-4 w-4" />
                <span>{fileName}</span>
                <button
                  onClick={() => {
                    setFileName(null)
                    setError(null)
                  }}
                  className="ml-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Supports JSON or CSV format
                </p>
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" asChild>
                    <span>Choose File</span>
                  </Button>
                </label>
              </div>
            )}
            
            {error && (
              <div className="text-sm text-red-500 text-center">
                {error}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <div className="flex-1 border-t" />
        <span className="text-sm text-muted-foreground">or</span>
        <div className="flex-1 border-t" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Use Demo Data</CardTitle>
          <CardDescription>
            Generate realistic sample data to explore the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onUseMockData} className="w-full">
            <Database className="mr-2 h-4 w-4" />
            Load Demo Data
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
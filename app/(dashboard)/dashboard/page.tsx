'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Download, Database, Upload } from "lucide-react"
import { DataUploader } from '@/components/data-uploader'
import { SentimentChart } from '@/components/sentiment-chart'
import { ChannelGrid } from '@/components/channel-card'
import { BurnoutIndicators } from '@/components/burnout-alert'
import { InsightsPanel } from '@/components/insights-panel'
import { SlackChannel, generateMockData, exportToJSON, exportToCSV } from '@/lib/mock-data'
import { 
  analyzeChannel, 
  calculateDailySentiments, 
  detectBurnoutIndicators,
  ChannelSentiment,
  DailySentiment,
  BurnoutIndicator
} from '@/lib/sentiment-analyzer'

export default function DashboardPage() {
  const [slackData, setSlackData] = useState<SlackChannel[]>([])
  const [channelSentiments, setChannelSentiments] = useState<ChannelSentiment[]>([])
  const [dailySentiments, setDailySentiments] = useState<DailySentiment[]>([])
  const [burnoutIndicators, setBurnoutIndicators] = useState<BurnoutIndicator[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState('upload')

  const handleDataLoaded = (channels: SlackChannel[]) => {
    // Create a deep copy to avoid readonly issues
    const mutableData = JSON.parse(JSON.stringify(channels))
    setSlackData(mutableData)
    analyzeData(mutableData)
    setActiveTab('overview')
  }

  const handleUseMockData = () => {
    const mockData = generateMockData()
    // Create a deep copy to avoid readonly issues
    const mutableData = JSON.parse(JSON.stringify(mockData))
    setSlackData(mutableData)
    analyzeData(mutableData)
    setActiveTab('overview')
  }

  const analyzeData = (channels: SlackChannel[]) => {
    setIsAnalyzing(true)
    
    // Analyze each channel - create copies to avoid mutation
    const channelsCopy = JSON.parse(JSON.stringify(channels))
    const channelAnalysis = channelsCopy.map(analyzeChannel)
    setChannelSentiments(channelAnalysis)
    
    // Calculate daily sentiments
    const daily = calculateDailySentiments(channelsCopy)
    setDailySentiments(daily)
    
    // Detect burnout indicators
    const indicators = detectBurnoutIndicators(channelsCopy, daily)
    setBurnoutIndicators(indicators)
    
    setIsAnalyzing(false)
  }

  const handleExport = (format: 'json' | 'csv') => {
    if (slackData.length === 0) return
    
    const data = format === 'json' ? exportToJSON(slackData) : exportToCSV(slackData)
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `team-sentiment-${new Date().toISOString().split('T')[0]}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const hasData = slackData.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Employee Engagement Pulse
          </h1>
          <p className="text-muted-foreground">
            {hasData 
              ? `Analyzing ${slackData.length} channels with ${slackData.reduce((sum, c) => sum + c.messages.length, 0)} messages`
              : 'Upload your Slack data or use demo data to get started'}
          </p>
        </div>
        {hasData && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport('json')}>
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Data Source
          </TabsTrigger>
          <TabsTrigger value="overview" disabled={!hasData}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="channels" disabled={!hasData}>
            Channels
          </TabsTrigger>
          <TabsTrigger value="insights" disabled={!hasData}>
            AI Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <DataUploader 
            onDataLoaded={handleDataLoaded}
            onUseMockData={handleUseMockData}
          />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          {hasData && (
            <>
              <div className="grid gap-6 lg:grid-cols-2">
                <SentimentChart data={dailySentiments} />
                <BurnoutIndicators indicators={burnoutIndicators} />
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Channel Overview</CardTitle>
                  <CardDescription>
                    Sentiment breakdown by channel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChannelGrid 
                    channels={channelSentiments.slice(0, 3)} 
                    onChannelClick={() => setActiveTab('channels')}
                  />
                  {channelSentiments.length > 3 && (
                    <div className="mt-4 text-center">
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab('channels')}
                      >
                        View All {channelSentiments.length} Channels
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          {hasData && (
            <div>
              <div className="mb-4">
                <h2 className="text-2xl font-semibold">Channel Analysis</h2>
                <p className="text-muted-foreground">
                  Detailed sentiment breakdown for each channel
                </p>
              </div>
              <ChannelGrid channels={channelSentiments} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {hasData && (
            <div className="grid gap-6 lg:grid-cols-2">
              <InsightsPanel 
                dailySentiments={dailySentiments}
                channelSentiments={channelSentiments}
                burnoutIndicators={burnoutIndicators}
              />
              <div className="space-y-6">
                <SentimentChart 
                  data={dailySentiments}
                  title="7-Day Trend"
                  description="Sentiment progression over the week"
                />
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Messages</span>
                      <span className="font-medium">
                        {slackData.reduce((sum, c) => sum + c.messages.length, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Active Channels</span>
                      <span className="font-medium">{channelSentiments.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Burnout Alerts</span>
                      <span className="font-medium text-red-600">
                        {burnoutIndicators.filter(i => i.severity === 'high').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Overall Trend</span>
                      <span className="font-medium">
                        {dailySentiments.length >= 2 && 
                         dailySentiments[dailySentiments.length - 1].score > 
                         dailySentiments[dailySentiments.length - 2].score 
                          ? '📈 Improving' 
                          : '📉 Declining'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {!hasData && activeTab !== 'upload' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No Data Available</p>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Upload your Slack data or use the demo data to see insights
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setActiveTab('upload')}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Data
              </Button>
              <Button variant="outline" onClick={handleUseMockData}>
                <Database className="h-4 w-4 mr-2" />
                Use Demo Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
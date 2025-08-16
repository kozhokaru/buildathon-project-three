'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BurnoutIndicator } from '@/lib/sentiment-analyzer'
import { AlertTriangle, TrendingDown, Users, Clock, CheckCircle } from 'lucide-react'

interface BurnoutAlertProps {
  indicator: BurnoutIndicator
}

export function BurnoutAlert({ indicator }: BurnoutAlertProps) {
  const icon = indicator.type === 'declining_sentiment' ? <TrendingDown className="h-4 w-4" /> :
               indicator.type === 'low_engagement' ? <Users className="h-4 w-4" /> :
               indicator.type === 'overtime_activity' ? <Clock className="h-4 w-4" /> :
               <AlertTriangle className="h-4 w-4" />
  
  const severityColor = indicator.severity === 'high' ? 'destructive' :
                        indicator.severity === 'medium' ? 'default' :
                        'secondary'
  
  const bgClass = indicator.severity === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-950' :
                  indicator.severity === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' :
                  'border-blue-500 bg-blue-50 dark:bg-blue-950'

  return (
    <Alert className={bgClass}>
      <div className="flex items-start gap-3">
        {icon}
        <div className="flex-1">
          <AlertTitle className="text-sm font-medium mb-1">
            {indicator.message}
          </AlertTitle>
          <AlertDescription className="text-xs">
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={severityColor} className="text-xs">
                {indicator.severity.toUpperCase()}
              </Badge>
              {indicator.affectedChannels.length > 0 && (
                <span className="text-muted-foreground">
                  Affects: {indicator.affectedChannels.map(c => `#${c}`).join(', ')}
                </span>
              )}
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  )
}

interface BurnoutIndicatorsProps {
  indicators: BurnoutIndicator[]
}

export function BurnoutIndicators({ indicators }: BurnoutIndicatorsProps) {
  if (indicators.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Health Status</CardTitle>
          <CardDescription>No burnout indicators detected</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-100">All Clear</p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Team sentiment and engagement levels are healthy
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const highSeverity = indicators.filter(i => i.severity === 'high')
  const mediumSeverity = indicators.filter(i => i.severity === 'medium')
  const lowSeverity = indicators.filter(i => i.severity === 'low')

  const statusEmoji = highSeverity.length > 0 ? '🔴' :
                      mediumSeverity.length > 0 ? '🟡' : '🟢'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Burnout Indicators</CardTitle>
            <CardDescription>Warning signs that need attention</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{statusEmoji}</span>
            <div className="text-right">
              <p className="text-sm font-medium">{indicators.length} Alert{indicators.length !== 1 ? 's' : ''}</p>
              <p className="text-xs text-muted-foreground">
                {highSeverity.length > 0 && `${highSeverity.length} high`}
                {highSeverity.length > 0 && mediumSeverity.length > 0 && ', '}
                {mediumSeverity.length > 0 && `${mediumSeverity.length} medium`}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {highSeverity.map((indicator, i) => (
          <BurnoutAlert key={`high-${i}`} indicator={indicator} />
        ))}
        {mediumSeverity.map((indicator, i) => (
          <BurnoutAlert key={`medium-${i}`} indicator={indicator} />
        ))}
        {lowSeverity.map((indicator, i) => (
          <BurnoutAlert key={`low-${i}`} indicator={indicator} />
        ))}
      </CardContent>
    </Card>
  )
}
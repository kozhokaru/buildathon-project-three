import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthButton } from "@/components/auth-button"
import { ArrowRight, Activity, TrendingUp, AlertTriangle, Brain } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link className="mr-6 flex items-center space-x-2" href="/">
              <Activity className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">
                Employee Pulse
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                href="#features"
              >
                Features
              </Link>
              <Link
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                href="#tech"
              >
                Tech Stack
              </Link>
              <Link
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                href="https://github.com"
                target="_blank"
              >
                GitHub
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
            </div>
            <nav className="flex items-center">
              <AuthButton />
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background"></div>
        <div className="container relative">
          <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center py-20 text-center">
            <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4">
              <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">
                Employee Engagement
                <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent"> Pulse</span>
              </h1>
              <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
                Transform Slack conversations into actionable team insights. 
                Detect burnout early, track sentiment trends, and get AI-powered recommendations.
              </p>
              <div className="flex gap-4 mt-8">
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2">
                    Analyze Your Team <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="https://github.com" target="_blank">
                  <Button size="lg" variant="outline">
                    View Demo
                  </Button>
                </Link>
              </div>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span>Real-time Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  <span>Burnout Detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span>AI Insights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-20">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
            Understand Your Team's Health
          </h2>
          <p className="max-w-[750px] text-lg text-muted-foreground">
            Turn everyday Slack conversations into powerful insights that help you build better teams.
          </p>
        </div>
        <div className="mx-auto grid gap-4 md:grid-cols-3 mt-12">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
            <CardHeader className="relative">
              <TrendingUp className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Real-time Sentiment</CardTitle>
              <CardDescription>
                Track team mood automatically through message analysis. 
                See trends, patterns, and changes as they happen.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 7-day sentiment trends</li>
                <li>• Channel-by-channel analysis</li>
                <li>• Emoji sentiment scoring</li>
                <li>• Engagement metrics</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
            <CardHeader className="relative">
              <AlertTriangle className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Burnout Prevention</CardTitle>
              <CardDescription>
                Catch warning signs early with intelligent pattern detection. 
                Get alerts when team health needs attention.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Declining sentiment alerts</li>
                <li>• Overtime activity detection</li>
                <li>• Stress keyword monitoring</li>
                <li>• Engagement drop warnings</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
            <CardHeader className="relative">
              <Brain className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>
                Get actionable recommendations from Claude AI. 
                Weekly summaries with specific steps to improve team health.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Weekly team summaries</li>
                <li>• Actionable recommendations</li>
                <li>• Trend explanations</li>
                <li>• Manager guidance</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>


      {/* CTA Section */}
      <section className="container py-20">
        <div className="mx-auto flex max-w-[600px] flex-col items-center gap-4 text-center rounded-lg border bg-card p-8">
          <h2 className="text-2xl font-bold">Start Understanding Your Team</h2>
          <p className="text-muted-foreground">
            Upload your Slack data or try our demo to see insights in seconds.
          </p>
          <div className="flex gap-4 mt-4">
            <Link href="/dashboard">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Activity className="h-5 w-5" />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Employee Engagement Pulse - Transform team conversations into actionable insights.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
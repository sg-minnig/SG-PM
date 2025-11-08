// Landing page for non-authenticated users
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Calendar, CheckCircle2 } from "lucide-react";
import logoImage from "@assets/30919374-809c-459f-a8a3-07e75b17bfe4-removebg-preview_1762566106604.png";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex flex-col pastel-rainbow">
      {/* Header */}
      <header className="px-8 py-6 border-b border-slate-200/50 dark:border-slate-700/50 backdrop-blur-lg bg-white/70 dark:bg-slate-900/70">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={logoImage} 
              alt="ChapterOps Logo" 
              className="h-10 w-10 object-contain"
            />
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">ChapterOps</h1>
          </div>
          <Button onClick={handleLogin} variant="secondary" data-testid="button-login">
            Log In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-8 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
              Streamline Your Club's
              <span className="block text-violet-600 dark:text-violet-400 mt-2">Executive Transition</span>
            </h2>
            <p className="text-xl text-slate-700 dark:text-slate-300 max-w-2xl mx-auto">
              AI-powered project management for club executives. Track role-specific tasks,
              manage timelines, and ensure smooth transitions between leadership teams.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button size="lg" onClick={handleLogin} className="text-lg px-8" data-testid="button-get-started">
              Get Started
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="border-slate-200/50 dark:border-slate-700/50 shadow-sm bg-white/85 dark:bg-slate-900/80 backdrop-blur-lg">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30 mx-auto">
                  <Users className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold">Role-Based Access</h3>
                <p className="text-sm text-muted-foreground">
                  Presidents manage the team, members edit their own profiles and timelines
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200/50 dark:border-slate-700/50 shadow-sm bg-white/85 dark:bg-slate-900/80 backdrop-blur-lg">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30 mx-auto">
                  <Calendar className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold">Custom Timelines</h3>
                <p className="text-sm text-muted-foreground">
                  Track progress through role-specific tasks and add custom milestones
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200/50 dark:border-slate-700/50 shadow-sm bg-white/85 dark:bg-slate-900/80 backdrop-blur-lg">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-pink-100 dark:bg-pink-900/30 mx-auto">
                  <CheckCircle2 className="h-7 w-7 text-pink-600 dark:text-pink-400" />
                </div>
                <h3 className="text-lg font-semibold">Progress Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize team progress and see where each executive is in their journey
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-slate-200/50 dark:border-slate-700/50 backdrop-blur-lg bg-white/70 dark:bg-slate-900/70">
        <div className="max-w-7xl mx-auto text-center text-sm text-slate-600 dark:text-slate-400">
          <p>Club Executive Manager • Powered by AI</p>
        </div>
      </footer>
    </div>
  );
}

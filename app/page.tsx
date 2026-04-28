import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { About } from '@/components/about'
import { Skills } from '@/components/skills'
import { Experience } from '@/components/experience'
import { Projects } from '@/components/projects'
import { Contact } from '@/components/contact'
import { Footer } from '@/components/footer'
import { WhyHireMe } from '@/components/why-hire-me'
import { HireMeBar } from '@/components/hire-me-bar'
import { ExperienceModeSelector } from '@/components/experience-mode'
import { AdminToggle } from '@/components/admin-toggle'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <AdminToggle />
      <ExperienceModeSelector />
      <HireMeBar />
      <Hero />

      {/* AI Resume Studio CTA Banner */}
      <section className="border-t border-border py-14 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto relative">
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 dark:from-slate-900 dark:to-slate-800 border border-blue-500/20 rounded-3xl p-8 md:p-12 text-center backdrop-blur-sm">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-6">
              ✨ Free AI-Powered Tool • No Signup Required
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
              Get Your Resume to{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                90+ ATS Score
              </span>
            </h2>
            <p className="text-slate-400 text-base mb-8 max-w-2xl mx-auto">
              AI-powered resume analyzer & builder. Upload your resume and get instant feedback against Google, Amazon, Microsoft, Meta, and 13+ more top companies. Or build a brand-new AI-optimized resume from scratch — completely free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/resume?tab=analyze"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all hover:scale-105">
                📊 Analyze My Resume
              </Link>
              <Link href="/resume?tab=build"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-bold text-sm transition-all hover:scale-105">
                🏗 Build AI Resume
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {['Google', 'Amazon', 'Microsoft', 'Meta', 'Netflix', 'Apple', 'TCS', 'Infosys', '+9 more'].map(co => (
                <span key={co} className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400">{co}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <About />
      </section>

      <section className="border-t border-border">
        <Skills />
      </section>

      <section className="border-t border-border">
        <Experience />
      </section>

      <section className="border-t border-border">
        <Projects />
      </section>

      {/* AI-powered Why Hire Me section */}
      <section className="border-t border-border">
        <WhyHireMe />
      </section>

      <section className="border-t border-border">
        <Contact />
      </section>

      <Footer />
    </main>
  )
}

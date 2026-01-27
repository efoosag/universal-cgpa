import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100">
      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 pt-28 pb-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6">
          Universal <span className="text-blue-600">CGPA Calculator</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
          Accurately calculate, track, and plan your CGPA across semesters and
          grading systems — all in one simple, reliable tool.
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/onboarding">
            <Button size="lg" className="px-8">
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white py-20 border-t">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-14">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="p-8 rounded-2xl border bg-slate-50">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                1. Add Your Courses
              </h3>
              <p className="text-slate-600">
                Enter your courses semester by semester, including credit units
                and grades — supporting multiple grading systems.
              </p>
            </div>

            <div className="p-8 rounded-2xl border bg-slate-50">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                2. Track Your CGPA
              </h3>
              <p className="text-slate-600">
                Instantly view your GPA per semester and cumulative CGPA with
                accurate calculations.
              </p>
            </div>

            <div className="p-8 rounded-2xl border bg-slate-50">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                3. Plan & Improve
              </h3>
              <p className="text-slate-600">
                Use What-If scenarios and target CGPA planning to understand
                what grades you need to reach your goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-14">
            Why Students Love It
          </h2>

          <div className="grid md:grid-cols-2 gap-10">
            <Feature
              title="Multiple Grading Systems"
              description="Supports 4.0, 5.0, 10.0 scales and custom grading rules."
            />
            <Feature
              title="Semester-Based Organization"
              description="Courses are neatly grouped by academic year and semester."
            />
            <Feature
              title="What-If Analysis"
              description="Experiment with future grades and see how they affect your CGPA."
            />
            <Feature
              title="Clean & Distraction-Free"
              description="Focused purely on CGPA calculation, tracking, and planning."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-6">
            Take Control of Your Academic Journey
          </h2>
          <p className="text-slate-300 mb-8">
            Stop guessing your CGPA. Track it accurately, plan ahead, and
            graduate with confidence.
          </p>

          <Link href="/onboarding">
            <Button size="lg" variant="secondary" className="px-8">
              Start Calculating
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}

function Feature({ title, description }) {
  return (
    <div className="p-8 rounded-2xl border bg-white">
      <h3 className="text-xl font-semibold text-slate-900 mb-3">
        {title}
      </h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}

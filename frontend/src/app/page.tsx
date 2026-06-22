import { Plane, Sparkles, Users, CloudSun, DollarSign } from 'lucide-react';
import HeroActions from '@/components/home/HeroActions';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 px-4 py-24 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-primary-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            Powered by Gemini 2.5 Flash
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Plan Your Dream Trip with AI
          </h1>
          <p className="mt-6 text-lg text-primary-100 sm:text-xl">
            Personalized itineraries, weather-aware packing lists, crowd predictions,
            hotel picks, and budget estimates — all in one place.
          </p>
          <HeroActions />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Everything You Need to Travel Smart
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Plane,
              title: 'AI Itineraries',
              desc: 'Day-by-day plans tailored to your interests, budget tier, and travel month',
            },
            {
              icon: CloudSun,
              title: 'Weather Packing',
              desc: 'Climate-aware checklists with documents, gear, and seasonal clothing',
            },
            {
              icon: Users,
              title: 'Crowd Predictor',
              desc: 'Best visiting times and crowd levels for every major attraction',
            },
            {
              icon: DollarSign,
              title: 'Budget & Hotels',
              desc: 'Full cost breakdowns and hotel suggestions matched to your budget',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                <Icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

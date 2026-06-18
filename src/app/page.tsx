"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, MapPin, Sparkles, Activity, ShieldAlert, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import DoctorCard from "@/components/shared/DoctorCard";
import { SPECIALITIES } from "@/lib/data/specialities";

export default function HomePage() {
  const router = useRouter();
  const [district, setDistrict] = useState<string>("Jamui");
  const [query, setQuery] = useState<string>("");
  const [featuredDoctors, setFeaturedDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load district from cookie on mount
  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const districtCookie = cookies.find((row) => row.startsWith("jvc_district="));
    if (districtCookie) {
      setDistrict(decodeURIComponent(districtCookie.split("=")[1]));
    }
  }, []);

  // Fetch featured doctors whenever district changes
  useEffect(() => {
    setLoading(true);
    fetch(`/api/public/home?district=${encodeURIComponent(district)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFeaturedDoctors(data.data.featuredDoctors || []);
        }
      })
      .catch((err) => console.error("Error fetching featured doctors:", err))
      .finally(() => setLoading(false));
  }, [district]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 2) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}&district=${encodeURIComponent(district)}`);
  };

  const handleSpecialityClick = (name: string) => {
    router.push(`/search?speciality=${encodeURIComponent(name)}&district=${encodeURIComponent(district)}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-primary">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-brand-blue/10 via-brand-blue/5 to-transparent py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center flex flex-col items-center gap-6">
          
          <BadgePremium />

          <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-content-primary leading-tight max-w-2xl">
            Book Same-Day <span className="text-brand-blue">Doctor Tokens</span> in Bihar & Jharkhand
          </h1>

          <p className="text-base md:text-lg text-content-secondary max-w-lg leading-relaxed font-sans">
            Skip long clinic queues. Register online in 30 seconds, get your token number, and track your position in real-time.
          </p>

          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-lg bg-surface-card border border-border shadow-lg p-2 rounded-xl flex items-center gap-2 mt-4"
          >
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search className="w-5 h-5 text-content-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search symptom (e.g. bukhar, kamar dard) or doctor..."
                className="w-full bg-transparent text-sm md:text-base focus:outline-none placeholder-content-muted text-content-primary py-2"
              />
            </div>
            
            <Button
              type="submit"
              disabled={query.trim().length < 2}
              className="bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold rounded-lg px-6"
            >
              Search
            </Button>
          </form>

          {query.trim().length === 1 && (
            <p className="text-xs text-status-warning font-medium animate-pulse">
              Please enter at least 2 characters to search
            </p>
          )}

        </div>
      </section>

      {/* Popular Specialities Section */}
      <section className="py-8 px-4 bg-surface-card border-y border-border/80">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-sm font-semibold text-content-muted uppercase tracking-wider text-center mb-6">
            Common Specialities
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {SPECIALITIES.slice(0, 5).map((spec) => (
              <button
                key={spec.id}
                onClick={() => handleSpecialityClick(spec.name)}
                className="flex flex-col items-center gap-2.5 bg-surface-primary hover:bg-brand-blue/5 border border-border/60 hover:border-brand-blue/20 p-4 rounded-xl transition-all duration-200 group text-center"
              >
                <span className="text-3xl transition-transform group-hover:scale-110 duration-200">
                  {spec.icon}
                </span>
                <span className="text-sm font-medium text-content-primary group-hover:text-brand-blue">
                  {spec.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-display font-semibold text-content-primary">
                Doctors Available Today
              </h2>
              <p className="text-sm text-content-secondary mt-1">
                Top rated same-day appointments in {district}
              </p>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs text-brand-green font-semibold bg-brand-green/10 border border-brand-green/20 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-ping" />
              Live Queue Tracking Active
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : featuredDoctors.length === 0 ? (
            <div className="bg-surface-card border border-border rounded-xl p-8 text-center flex flex-col items-center gap-4">
              <ShieldAlert className="w-12 h-12 text-content-muted" />
              <h3 className="text-lg font-semibold text-content-primary">
                No active doctors in {district} today
              </h3>
              <p className="text-sm text-content-secondary max-w-xs leading-relaxed">
                Doctors are joining soon. Tap the district selector at the top to check other locations.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {featuredDoctors.map((doc) => (
                <DoctorCard key={doc.id} doctor={doc} />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 bg-surface-primary border-t border-border/60">
        <div className="container mx-auto max-w-4xl px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <Award className="w-8 h-8 text-brand-green" />
            <h4 className="text-sm font-semibold text-content-primary">Verified Doctors Only</h4>
            <p className="text-xs text-content-secondary">All doctors are validated with NMC registrations.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Activity className="w-8 h-8 text-brand-blue" />
            <h4 className="text-sm font-semibold text-content-primary">Real-Time Queues</h4>
            <p className="text-xs text-content-secondary">Track exact patient token orders before leaving home.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">⚡</span>
            <h4 className="text-sm font-semibold text-content-primary">Zero Booking Fees</h4>
            <p className="text-xs text-content-secondary">₹0 platform convenience fees during V1 launch.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function BadgePremium() {
  return (
    <div className="flex items-center gap-1.5 bg-brand-green/10 border border-brand-green/20 text-brand-green px-3 py-1 rounded-full text-xs font-semibold shadow-sm w-fit mb-2 animate-bounce">
      <Sparkles className="w-3.5 h-3.5" />
      Jamui & Deoghar Exclusive
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="w-full bg-surface-card border border-border rounded-xl p-4 md:p-5 flex flex-col md:flex-row gap-5 animate-pulse">
      <div className="w-full md:w-32 h-36 md:h-32 bg-surface-secondary rounded-lg" />
      <div className="flex-1 flex flex-col justify-between py-1 gap-4">
        <div>
          <div className="h-6 bg-surface-secondary rounded w-1/3 mb-3" />
          <div className="h-4 bg-surface-secondary rounded w-1/4 mb-2" />
          <div className="h-4 bg-surface-secondary rounded w-1/2" />
        </div>
        <div className="h-10 bg-surface-secondary rounded w-1/4 self-end" />
      </div>
    </div>
  );
}

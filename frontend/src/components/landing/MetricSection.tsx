"use client";

import React, { useEffect, useState, useRef } from "react";
import { TrendingUp, Users, ShoppingCart, Clock } from "lucide-react";

interface MetricItem {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
}

const metrics: MetricItem[] = [
  {
    icon: <TrendingUp size={24} />,
    value: 50000,
    suffix: "+",
    label: "Transaksi Diproses",
  },
  {
    icon: <Users size={24} />,
    value: 150,
    suffix: "+",
    label: "Restoran Mitra",
  },
  {
    icon: <ShoppingCart size={24} />,
    value: 98,
    suffix: "%",
    label: "Uptime",
  },
  {
    icon: <Clock size={24} />,
    value: 3,
    suffix: " detik",
    label: "Proses Transaksi",
  },
];

function AnimatedCounter({
  value,
  suffix,
  duration = 2000,
}: {
  value: number;
  suffix: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * value));

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  const displayValue = value >= 1000
    ? count >= 1000
      ? `${Math.floor(count / 1000)}K`
      : String(count)
    : String(count);

  return (
    <div ref={ref} className="text-3xl md:text-4xl font-bold text-white">
      {displayValue}
      <span className="text-brand-200">{suffix}</span>
    </div>
  );
}

export function MetricSection() {
  return (
    <section className="py-16 bg-brand-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 text-white mb-4">
                {metric.icon}
              </div>
              <AnimatedCounter value={metric.value} suffix={metric.suffix} />
              <p className="text-white/70 text-sm mt-1">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import TestimonialCard from "./Testimonial";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Container from "./Container";
import { otherData } from "../assets";

const testimonials = [
  {
    name: `Jessica M.`,
    position: `Homeowner | New York, NY`,
    review:
      `I never thought I'd find premium furniture at these prices. ${otherData?.brandName} is my go-to for adding unique pieces to my home without the retail markup.`,
    image: `/avatars/1.jpg`,
    date: `February 12, 2026`
  },
  {
    name: `Marcus T.`,
    position: `Interior Designer | Austin, TX`,
    review:
      `The hunt is real here. I've scored vintage mid-century pieces that you just can't find anywhere else. ${otherData?.brandName} gets it.`,
    image: `/avatars/2.jpg`,
    date: `January 28, 2026`
  },
  {
    name: `Danielle K.`,
    position: `Furniture Collector | Los Angeles, CA`,
    review:
      `I love checking the 'Ending Soon' section. Snagged a dining table set for less than the price of one chair. The thrill of the win never gets old.`,
    image: `/avatars/3.jpg`,
    date: `March 5, 2026`
  },
  {
    name: `Ryan P.`,
    position: `Property Stager | Miami, FL`,
    review:
      `${otherData?.brandName} is my go-to for staging luxury homes. The quality pieces let me create stunning spaces at margins that actually make sense. Best in the game.`,
    image: `/avatars/4.jpg`,
    date: `February 19, 2026`
  },
  {
    name: `Olivia W.`,
    position: `First-Time Homeowner | Chicago, IL`,
    review:
      `From bedroom sets to accent chairs, I've won it all here. The platform is easy to use and I love getting outbid notifications so I can jump back in.`,
    image: `/avatars/5.jpg`,
    date: `January 15, 2026`
  },
  {
    name: `Christopher L.`,
    position: `Antique Collector | Seattle, WA`,
    review:
      `I'm after specific eras and styles. ${otherData?.brandName}'s filtering makes it easy to find exactly what I want. Already won three vintage credenzas this month.`,
    image: `/avatars/6.jpg`,
    date: `March 10, 2026`
  },
  {
    name: `Amanda R.`,
    position: `Home Stylist | Denver, CO`,
    review:
      `I use ${otherData?.brandName} to find statement pieces for my clients. The auction format creates excitement, and the in-store pickup experience is seamless. A total game changer for my business.`,
    image: `/avatars/7.jpg`,
    date: `February 3, 2026`
  },
  {
    name: `Jonathan H.`,
    position: `Art & Furniture Collector | Portland, OR`,
    review:
      `I've collected everything from lighting to accent tables here. The platform attracts serious bidders who appreciate quality craftsmanship. No lowballs, just real bids.`,
    image: `/avatars/8.jpg`,
    date: `January 22, 2026`
  }
];

export default function TestimonialSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    slides: {
      perView: 3,
      spacing: 24,
    },
    breakpoints: {
      "(max-width: 1024px)": {
        slides: { perView: 2, spacing: 20 },
      },
      "(max-width: 640px)": {
        slides: { perView: 1, spacing: 16 },
      },
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
  });

  return (
    <section ref={sectionRef} className="pb-14 pt-10 bg-bg-secondary dark:bg-bg-primary overflow-hidden">
      <Container>
        <div className="w-full max-w-full mx-auto">
          {/* Header */}
          <div
            className={`text-left transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary dark:text-text-primary-dark">
                Loved by 10k+ People
              </h2>
              {/* Navigation Arrows */}
              {loaded && instanceRef.current && (
                <div className="hidden md:flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => instanceRef.current?.prev()}
                    className="h-10 w-10 rounded-lg bg-bg-primary dark:bg-bg-primary-light flex items-center justify-center cursor-pointer hover:bg-bg-primary-light dark:hover:bg-bg-primary-light/80 transition-all text-pure-white dark:text-pure-white"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => instanceRef.current?.next()}
                    className="h-10 w-10 rounded-lg bg-bg-primary dark:bg-bg-primary-light flex items-center justify-center cursor-pointer hover:bg-bg-primary-light dark:hover:bg-bg-primary-light/80 transition-all text-pure-white dark:text-pure-white"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm md:text-base text-text-secondary dark:text-text-secondary-dark mt-3 mb-8">
              From luxury collectors to seasoned resellers—{otherData?.brandName} is where the fashion-forward find their next piece.
            </p>
          </div>

          {/* Slider */}
          <div
            className={`mt-12 md:mt-6 transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
          >
            <div ref={sliderRef} className="keen-slider">
              {testimonials.map((t, i) => (
                <div key={i} className="keen-slider__slide">
                  <TestimonialCard {...t} />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Dots */}
          <div className="flex md:hidden items-center justify-center mt-5 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => instanceRef.current?.moveToIdx(index)}
                className={`w-3 h-3 rounded-full transition-all ${index === currentSlide
                    ? "bg-bg-primary dark:bg-bg-secondary"
                    : "bg-gray-300 dark:bg-gray-700"
                  }`}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
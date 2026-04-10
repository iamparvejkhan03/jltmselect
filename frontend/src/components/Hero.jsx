import { heroImg, otherData } from "../assets";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "lucide-react";
import Container from "./Container";

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-start text-left text-pure-white">

      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={heroImg}
          alt="Fashion Auction"
          className="absolute inset-0 w-full h-full object-center object-cover animate-slowZoom"
        />
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/80"></div>


      {/* Content */}
      <Container className="relative z-10 max-w-4xl px-6 animate-fadeUp">

        {/* Small Badge */}
        <div className="flex items-center gap-2 mb-6"><div className="h-px w-6 md:w-12 bg-secondary"></div><span className="text-secondary text-xs md:text-sm font-medium uppercase tracking-[0.2em]">Exclusive Membership</span></div>

        {/* Main Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-wide mb-6 font-medium">
          Welcome to <span className="text-secondary">{otherData?.brandName}</span> Membership
        </h2>

        {/* Description */}
        <p className="text-lg text-pure-white font-light max-w-2xl leading-relaxed mb-6">
          Your gateway to luxury furniture at extraordinary value. Enjoy exclusive daily auctions, premium in-store discounts, and behind-the-scenes content.
        </p>

        <div className="flex items-center justify-start gap-5 uppercase">
          <p className="inline-block">
            <Link to="/register" className="text-pure-white font-medium transition duration-300 flex items-center gap-2 group relative text-sm md:text-base hover:underline">
              <span className="">Join Now</span>
              <ArrowRightIcon className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </p>

          <p className="inline-block">
            <Link to="/auctions" className="text-pure-white font-medium transition duration-300 flex items-center gap-2 group relative text-sm md:text-base hover:underline">
              <span className="">View Auctions</span>
            </Link>
          </p>
        </div>

      </Container>

      <style>{`
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slowZoom {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.08);
  }
}

.animate-fadeUp {
  animation: fadeUp 1s ease forwards;
}

.animate-slowZoom {
  animation: slowZoom 20s ease-in-out infinite alternate;
}
`}</style>
    </section>
  );
}

export default Hero;
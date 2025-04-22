
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const HomepageCallToActionSection = () => (
  <section className="py-12 md:py-20">
    <div className="max-w-4xl mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold mb-6">Ready to Start Learning?</h2>
      <p className="text-lg text-clay-neutral-400 mb-8">
        Jump into the simulator or explore our educational resources to begin your journey into network security and cryptography.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/simulator"
          className="clay-button clay-button-primary flex items-center justify-center gap-2"
        >
          <span>Launch Simulator</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/about"
          className="clay-button flex items-center justify-center gap-2"
        >
          <span>Learn More</span>
        </Link>
      </div>
    </div>
  </section>
);

export default HomepageCallToActionSection;

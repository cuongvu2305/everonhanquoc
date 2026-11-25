import { Carousel } from "../../app/globals.jsx";
import { navigateToCategory } from "../../lib/runtime.js";

export const BANNER_AUTOPLAY_MS = 5000;

export function HomeBannerCarousel({ banners, ctaText, labelCategory = (category) => category }) {
  return (
    <section className="home-hero home-banner">
      <Carousel autoplay autoplaySpeed={BANNER_AUTOPLAY_MS} dots={{ className: "home-banner-dots" }} draggable>
        {banners.map((banner) => (
          <div key={`${banner.category}-${banner.image}`}>
            <button
              type="button"
              className="home-banner-slide"
              onClick={() => navigateToCategory(banner.category)}
              aria-label={`${banner.title} – ${labelCategory(banner.category)}`}
            >
              <img className="home-banner-image" src={banner.image} alt="" draggable={false} />
              <span className="home-banner-copy">
                <span className="home-banner-title">{banner.title}</span>
                {ctaText ? <span className="home-banner-cta">{ctaText}</span> : null}
              </span>
            </button>
          </div>
        ))}
      </Carousel>
    </section>
  );
}

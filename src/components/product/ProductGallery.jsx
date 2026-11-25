import { useEffect, useState } from "../../app/globals.jsx";
import { Icon } from "../icons/Icon.jsx";

function fill(text, params) {
  return String(text ?? "").replace(/\{(\w+)\}/g, (_, key) => params[key] ?? "");
}

/** Main image with previous/next controls and a thumbnail strip. Arrow keys move between images. */
export function ProductGallery({ images = [], alt = "", dict = {}, overlay = null }) {
  const [index, setIndex] = useState(0);
  const total = images.length;

  useEffect(() => {
    setIndex(0);
  }, [images]);

  if (!total) return null;
  const current = Math.min(index, total - 1);
  const go = (next) => setIndex((next + total) % total);

  return (
    <div
      className="product-gallery"
      role="group"
      aria-roledescription="carousel"
      aria-label={alt}
      onKeyDown={(event) => {
        if (total < 2) return;
        if (event.key === "ArrowRight") {
          event.preventDefault();
          go(current + 1);
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          go(current - 1);
        }
      }}
    >
      <div className="product-gallery-main">
        <img src={images[current]} alt={total > 1 ? `${alt} (${current + 1}/${total})` : alt} />
        {overlay}
        {total > 1 ? (
          <>
            <button type="button" className="product-gallery-nav is-prev" aria-label={dict.galleryPrev} onClick={() => go(current - 1)}>
              <Icon name="ChevronLeft" size={20} />
            </button>
            <button type="button" className="product-gallery-nav is-next" aria-label={dict.galleryNext} onClick={() => go(current + 1)}>
              <Icon name="ChevronRight" size={20} />
            </button>
            <span className="product-gallery-counter" aria-hidden="true">{current + 1}/{total}</span>
          </>
        ) : null}
      </div>
      {total > 1 ? (
        <div className="product-gallery-thumbs">
          {images.map((src, thumbIndex) => (
            <button
              key={src}
              type="button"
              className={`product-gallery-thumb${thumbIndex === current ? " is-active" : ""}`}
              aria-label={fill(dict.galleryThumb, { index: thumbIndex + 1, total })}
              aria-current={thumbIndex === current ? "true" : undefined}
              onClick={() => setIndex(thumbIndex)}
            >
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

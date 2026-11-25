import { Breadcrumb } from "../../app/globals.jsx";
import { navigateToTopPage } from "../../lib/runtime.js";

/**
 * "Trang chủ › … › current". `items` are the levels after home: { label, onClick? }.
 * The last item is the current page and is never a link.
 */
export function PageBreadcrumb({ dict, items = [] }) {
  const levels = [{ label: dict.topPages?.home, href: "/", onClick: () => navigateToTopPage("home") }, ...items];

  return (
    <nav className="page-breadcrumb" aria-label={dict.breadcrumbLabel || undefined}>
      <Breadcrumb
        items={levels.map((level, index) => {
          const isCurrent = index === levels.length - 1;
          if (isCurrent || !level.onClick) {
            return { title: <span aria-current={isCurrent ? "page" : undefined}>{level.label}</span> };
          }
          return {
            title: (
              <a
                href={level.href ?? "#"}
                onClick={(event) => {
                  event.preventDefault();
                  level.onClick();
                }}
              >
                {level.label}
              </a>
            ),
          };
        })}
      />
    </nav>
  );
}

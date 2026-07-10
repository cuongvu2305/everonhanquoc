function Icon({ name, size = 18 }) {
  const ref = React.useRef(null);

  useEffect(() => {
    if (!ref.current || !window.lucide || !window.lucide.icons[name]) return;
    const iconNode = window.lucide.createElement(window.lucide.icons[name]);
    iconNode.setAttribute("width", size);
    iconNode.setAttribute("height", size);
    iconNode.setAttribute("stroke-width", "2");
    ref.current.replaceChildren(iconNode);
  }, [name, size]);

  return <span className="lucide-icon" ref={ref} aria-hidden="true" />;
}


function BrandIcon({ name }) {
  if (name === "facebook") {
    return (
      <span className="brand-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M14.2 8.4V6.8c0-.7.5-.9.9-.9h2.2V2.2L14.2 2c-3.4 0-4.5 2-4.5 4.6v1.8H7v3.8h2.7V22h4.2v-9.8h3.1l.5-3.8h-3.3Z" />
        </svg>
      </span>
    );
  }

  if (name === "messenger") {
    return (
      <span className="brand-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M12 2C6.5 2 2.2 6 2.2 11.3c0 2.8 1.2 5.2 3.2 6.9V22l3.5-1.9c1 .3 2 .5 3.1.5 5.5 0 9.8-4 9.8-9.3S17.5 2 12 2Zm1 12.5-2.5-2.7-5 2.7 5.5-5.9 2.6 2.7 4.9-2.7-5.5 5.9Z" />
        </svg>
      </span>
    );
  }

  return (
    <span className="brand-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M21.6 7.1a3 3 0 0 0-2.1-2.1C17.6 4.5 12 4.5 12 4.5s-5.6 0-7.5.5a3 3 0 0 0-2.1 2.1A31.7 31.7 0 0 0 2 12a31.7 31.7 0 0 0 .4 4.9 3 3 0 0 0 2.1 2.1c1.9.5 7.5.5 7.5.5s5.6 0 7.5-.5a3 3 0 0 0 2.1-2.1A31.7 31.7 0 0 0 22 12a31.7 31.7 0 0 0-.4-4.9ZM10 15.4V8.6l5.8 3.4L10 15.4Z" />
      </svg>
    </span>
  );
}

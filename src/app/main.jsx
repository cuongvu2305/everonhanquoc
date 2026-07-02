// Runtime entry for the browser build.
// The current CDN/Babel setup loads public/app.jsx; build.mjs syncs it from src/app/App.jsx.
ReactDOM.createRoot(document.getElementById("root")).render(<App />);

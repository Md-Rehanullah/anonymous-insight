import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero">
      <div className="text-center text-white p-8 rounded-2xl shadow-glow max-w-2xl mx-4">
        <h1 className="mb-6 text-4xl md:text-6xl font-bold">404</h1>
        <p className="mb-8 text-xl opacity-90">Oops! This page doesn't exist</p>
        <p className="mb-8 text-lg opacity-75">
          The page you're looking for might have been moved, deleted, or never existed.
        </p>
        <a 
          href="/" 
          className="inline-flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg backdrop-blur-sm border border-white/30 transition-all duration-300 hover:scale-105"
        >
          ← Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;

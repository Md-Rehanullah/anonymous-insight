import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, Github, Instagram, Facebook, Twitter, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-gradient-card backdrop-blur-sm shadow-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Anonymous Q&A
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                to="/" 
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === "/" ? "text-primary" : "text-muted-foreground"
                )}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === "/about" ? "text-primary" : "text-muted-foreground"
                )}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === "/contact" ? "text-primary" : "text-muted-foreground"
                )}
              >
                Contact
              </Link>
              <Link 
                to="/collaborate" 
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === "/collaborate" ? "text-primary" : "text-muted-foreground"
                )}
              >
                Collaborate
              </Link>
            </nav>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="h-9 w-9 p-0"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-gradient-card mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4 bg-gradient-primary bg-clip-text text-transparent">
                Anonymous Q&A Platform
              </h3>
              <p className="text-sm text-muted-foreground">
                A place where anyone can ask questions, share knowledge, and connect with others anonymously.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="https://github.com/rehan" className="text-muted-foreground hover:text-primary transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="https://instagram.com/rehan" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://facebook.com/rehan" className="text-muted-foreground hover:text-primary transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://twitter.com/rehan" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">About</h4>
              <p className="text-sm text-muted-foreground">
                Created by Rehan and Company, established in 2095.
              </p>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2095 Rehan and Company. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <Button
        onClick={scrollToTop}
        size="sm"
        className={cn(
          "scroll-to-top fixed bottom-6 right-6 h-10 w-10 rounded-full p-0 shadow-glow",
          showScrollTop ? "visible" : ""
        )}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Layout;
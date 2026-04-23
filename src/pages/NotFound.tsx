"use client";

import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Only log in development mode to avoid information disclosure
    if (import.meta.env.DEV) {
      console.warn("404 attempted:", location.pathname);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <span className="text-8xl font-bold text-gradient">404</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Page introuvable</h1>
        <p className="text-muted-foreground mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <Link to="/">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
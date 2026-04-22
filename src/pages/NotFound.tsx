"use client";

import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
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
          <Button variant="outline" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
          <Button asChild>
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
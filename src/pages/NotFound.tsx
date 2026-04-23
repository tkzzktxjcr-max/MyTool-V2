"use client";

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <span className="text-8xl font-bold text-gradient">404</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Page introuvable</h1>
        <p className="text-muted-foreground mb-8">La page que vous recherchez n'existe pas.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Retour</Button></Link>
          <Link to="/"><Button><Home className="h-4 w-4 mr-2" />Accueil</Button></Link>
        </div>
      </div>
    </div>
  );
}
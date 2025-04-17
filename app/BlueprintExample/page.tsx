"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BlueprintExamplePage() {
  const router = useRouter();

  useEffect(() => {
    // Path to your PDF file
    const pdfPath = "/BlueprintExample.pdf";
    
    // Redirect to the PDF file
    window.location.href = pdfPath;
  }, []);

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh",
      flexDirection: "column",
      gap: "20px"
    }}>
      <h1>Redirecting to Blueprint Example...</h1>
      <p>If you are not redirected automatically, <a href="/BlueprintExample.pdf" style={{ color: "blue", textDecoration: "underline" }}>click here</a>.</p>
    </div>
  );
}
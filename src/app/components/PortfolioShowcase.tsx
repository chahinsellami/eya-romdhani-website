"use client";

import { useState } from "react";
import type { Portfolio } from "../../data/portfolio";
import PortfolioFilter, { type GalleryViewMode } from "./PortfolioFilter";
import GallerySection from "./GallerySection";

interface PortfolioShowcaseProps {
  data: Portfolio;
}

export default function PortfolioShowcase({ data }: PortfolioShowcaseProps) {
  const [viewMode, setViewMode] = useState<GalleryViewMode>("grid");

  return (
    <>
      <PortfolioFilter viewMode={viewMode} onViewModeChange={setViewMode} />
      <GallerySection data={data} viewMode={viewMode} />
    </>
  );
}

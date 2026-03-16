"use client";

import ReactCompareImage from "react-compare-image";

export default function BeforeAfterSlider() {
return ( <div className="max-w-4xl mx-auto py-20">


  <h2 className="text-3xl font-bold text-center mb-10">
    See The Difference
  </h2>

  <ReactCompareImage
    leftImage="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
    rightImage="https://images.unsplash.com/photo-1492724441997-5dc865305da7"
  />

</div>
);
}

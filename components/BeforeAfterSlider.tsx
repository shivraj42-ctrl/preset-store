"use client";

import ReactCompareImage from "react-compare-image";

interface Props {
  before: string;
  after: string;
}

export default function BeforeAfterSlider({ before, after }: Props) {
  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-lg">
      <ReactCompareImage
        leftImage={before}
        rightImage={after}
        sliderLineWidth={3}
      />
    </div>
  );
}
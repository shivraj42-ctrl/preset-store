"use client";

import { useState } from "react";

export default function ImageZoom({ image }) {

const [zoom, setZoom] = useState(false);

return (


<div
  className="overflow-hidden rounded-xl cursor-zoom-in"
  onMouseEnter={() => setZoom(true)}
  onMouseLeave={() => setZoom(false)}
>

  <img
    src={image}
    className={`w-full transition duration-500 ${
      zoom ? "scale-125" : "scale-100"
    }`}
  />

</div>


);

}

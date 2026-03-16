"use client";

const categories = ["All","Portrait","Travel","Cinematic","Street"];

export default function CategoryFilter({ active,setActive }) {

return ( <div className="flex gap-4 justify-center mb-10 flex-wrap">

  {categories.map((cat)=>(
    <button
      key={cat}
      onClick={()=>setActive(cat)}
      className={`px-4 py-2 rounded-lg ${
        active === cat
          ? "bg-white text-black"
          : "bg-zinc-900 text-white"
      }`}
    >
      {cat}
    </button>
  ))}

</div>
);
}

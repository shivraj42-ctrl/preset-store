import PresetCard from "../components/PresetCard"

export default function Home() {

  const presets = [
    {name:"Moody Portrait",price:49},
    {name:"Cinematic Dark",price:79},
    {name:"Bright Wedding",price:99},
  ]

  return (

    <main className="min-h-screen bg-black text-white p-10">

      <h1 className="text-4xl font-bold mb-10">
        Lightroom Presets
      </h1>

      <div className="grid grid-cols-3 gap-6">
        {presets.map((preset,i)=>(
          <PresetCard key={i} {...preset}/>
        ))}
      </div>

    </main>

  )
}
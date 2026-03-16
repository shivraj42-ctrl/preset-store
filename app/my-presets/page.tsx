"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { useAuth } from "@/context/AuthContext"

export default function MyPresets() {

 const { user } = useAuth()
 const [presets,setPresets] = useState([])

 useEffect(()=>{

   const fetchPresets = async () => {

     const snapshot = await getDocs(
       collection(db,"users",user.uid,"purchases")
     )

     setPresets(snapshot.docs.map(doc=>doc.data()))
   }

   if(user) fetchPresets()

 },[user])

 return (
   <div>
     <h1>My Presets</h1>

     {presets.map((preset)=>(
       <a href={preset.downloadURL} key={preset.id}>
         Download
       </a>
     ))}

   </div>
 )
}
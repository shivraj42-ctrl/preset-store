import { NextResponse } from "next/server"

export async function POST(req) {

 const { userId, presetId } = await req.json()

 // verify purchase

 if(!purchased){
   return NextResponse.json({error:"Not allowed"})
 }

 return NextResponse.json({downloadURL})
}

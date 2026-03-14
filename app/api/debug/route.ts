import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')
  
  const user = await prisma.user.findUnique({ 
    where: { username: username! } 
  })
  
  return NextResponse.json(user)
}
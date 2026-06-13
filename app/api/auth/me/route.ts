import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ admin: null });
  
  if (session.role === 'admin') {
    const adminData = db.getAdminById(session.id);
    if (adminData) {
      let parsedPermissions: string[] = [];
      try {
        parsedPermissions = JSON.parse(adminData.permissions || '[]');
      } catch {}

      return NextResponse.json({ 
        admin: { 
          ...session, 
          username: adminData.username,
          admin_role: adminData.admin_role,
          permissions: parsedPermissions 
        } 
      });
    }
  }

  return NextResponse.json({ admin: session });
}

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { requireAdmin } from '@/lib/middleware';
import { getAudioBucket } from '@/lib/cloudflare';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only audio files are allowed.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    // Upload to R2
    const bucket = getAudioBucket();
    const arrayBuffer = await file.arrayBuffer();
    
    await bucket.put(fileName, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // For development, we'll store just the filename
    // The audio will be served via a signed URL or R2 public URL
    // For now, use the R2 dev URL format or set up custom domain
    const audioUrl = `r2://podcast-audio/${fileName}`;

    return NextResponse.json({
      success: true,
      audioUrl,
      fileName,
      message: 'Audio uploaded successfully. Configure R2 public domain for production.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to upload audio' },
      { status: 500 }
    );
  }
}


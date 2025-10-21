import { getCloudflareContext } from '@opennextjs/cloudflare';

export function getCloudflareEnv() {
  try {
    const { env } = getCloudflareContext();
    return env as CloudflareEnv;
  } catch (error) {
    throw new Error('Failed to get Cloudflare context. Make sure you are running in a Cloudflare environment.');
  }
}

export function getDB() {
  const env = getCloudflareEnv();
  return env.DB;
}

export function getAudioBucket() {
  const env = getCloudflareEnv();
  return env.AUDIO_BUCKET;
}


'use client';

import { useAttachmentUrl } from '@/hooks/useAttachmentUrl';

export function SignedImage({
  path,
  alt,
  className,
  onClick,
}: {
  path: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}) {
  const url = useAttachmentUrl(path);
  if (!url) return <div className={className} />;
  return <img src={url} alt={alt} className={className} onClick={onClick} />;
}

export function SignedAudio({ path }: { path: string }) {
  const url = useAttachmentUrl(path);
  if (!url) return null;
  return url;
}

export function useResolvedUrl(path: string | undefined) {
  return useAttachmentUrl(path);
}

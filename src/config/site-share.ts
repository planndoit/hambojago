import type { Metadata } from "next";

/**
 * 링크 미리보기(OG·Twitter·카카오 등) 문구와 기본 썸네일 경로를 한곳에서 바꿉니다.
 *
 * 썸네일 파일: 프로젝트 루트의 `public` 폴더 아래에 두세요.
 *   경로: `public` + ogImagePath → 예) ogImagePath가 "/og/hambojago.png" 이면
 *   실제 파일 위치는 `public/og/hambojago.png` 입니다. (PNG 권장 1200×630 근처)
 */
export const siteShare = {
  siteName: "함보자고",
  defaultTitle: "함보자고 - 10초만에 약속 날짜 잡기",
  defaultDescription:
    "되는 날만 눌러주세요. 링크 하나로 참여자는 로그인 없이 고르고, 가장 많이 겹치는 날짜를 바로 확인하세요.",
  /** public 기준, 선행 슬래시 포함 */
  ogImagePath: "/og/hambojago.png",
  /** 약속 참여·결과 링크에 쓸 짧은 설명(이벤트 설명이 없을 때) */
  eventFallbackDescription: "가능한 날짜를 골라 주세요. 겹치는 날이 한눈에 보입니다."
} as const;

export function resolveSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  const vercel = process.env.VERCEL_URL?.trim();

  if (vercel) {
    return `https://${vercel.replace(/^https?:\/\//, "")}`;
  }

  return "http://localhost:3000";
}

export function buildRootMetadata(): Metadata {
  const base = resolveSiteOrigin();

  return {
    metadataBase: new URL(base),
    title: siteShare.defaultTitle,
    description: siteShare.defaultDescription,
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: siteShare.siteName,
      title: siteShare.defaultTitle,
      description: siteShare.defaultDescription,
      images: [
        {
          url: siteShare.ogImagePath,
          width: 1200,
          height: 630,
          alt: siteShare.siteName
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: siteShare.defaultTitle,
      description: siteShare.defaultDescription,
      images: [siteShare.ogImagePath]
    }
  };
}

export function buildEventShareMetadata(title: string, description: string | null): Metadata {
  const desc = (description?.trim() || siteShare.eventFallbackDescription).slice(0, 200);

  return {
    title: `${title} - ${siteShare.siteName}`,
    description: desc,
    openGraph: {
      title: `${title} - ${siteShare.siteName}`,
      description: desc,
      images: [{ url: siteShare.ogImagePath, width: 1200, height: 630, alt: title }]
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} - ${siteShare.siteName}`,
      description: desc,
      images: [siteShare.ogImagePath]
    }
  };
}

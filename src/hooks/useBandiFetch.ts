import { useState, useCallback } from "react";
import { BandiSource, BANDI_KEYWORDS } from "@/config/bandiSources";

export interface BandiItem {
  id: string;
  title: string;
  link: string;
  description: string;
  sourceId: string;
  sourceName: string;
  category: string;
  fetchedAt: string;
  isNew: boolean;
  error?: boolean;
}

interface RssItem {
  title?: string;
  link?: string;
  description?: string;
  pubDate?: string;
}

const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

const RSS2JSON_BASE = "https://api.rss2json.com/v1/api.json?rss_url=";

function matchesKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return BANDI_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

function isNewItem(fetchedAt: string): boolean {
  const diff = Date.now() - new Date(fetchedAt).getTime();
  return diff < 24 * 60 * 60 * 1000;
}

function extractItemsFromHtml(html: string, source: BandiSource): BandiItem[] {
  const items: BandiItem[] = [];
  const now = new Date().toISOString();

  const titleRegex = /<(?:h[1-4]|a|li|strong)[^>]*>([\s\S]*?)<\/(?:h[1-4]|a|li|strong)>/gi;
  const linkRegex = /href=["']([^"']+)["']/gi;

  const titles: string[] = [];
  const links: string[] = [];

  let match: RegExpExecArray | null;
  while ((match = titleRegex.exec(html)) !== null) {
    const clean = match[1].replace(/<[^>]+>/g, "").trim();
    if (clean.length > 10 && clean.length < 300) titles.push(clean);
  }
  while ((match = linkRegex.exec(html)) !== null) {
    if (match[1].startsWith("http")) links.push(match[1]);
  }

  const seen = new Set<string>();
  titles.forEach((title, i) => {
    if (matchesKeywords(title) && !seen.has(title)) {
      seen.add(title);
      items.push({
        id: `${source.id}-${i}`,
        title,
        link: links[i] || source.url,
        description: "",
        sourceId: source.id,
        sourceName: source.name,
        category: source.category,
        fetchedAt: now,
        isNew: true,
      });
    }
  });

  return items;
}

async function fetchWithTimeout(url: string, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchRssSource(source: BandiSource): Promise<BandiItem[]> {
  const url = `${RSS2JSON_BASE}${encodeURIComponent(source.url)}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
  const data = await res.json();

  if (data.status !== "ok" || !data.items) return [];

  const now = new Date().toISOString();
  return (data.items as RssItem[])
    .filter((item) => {
      const text = `${item.title || ""} ${item.description || ""}`;
      return matchesKeywords(text);
    })
    .map((item, i) => ({
      id: `${source.id}-${i}`,
      title: item.title || "Senza titolo",
      link: item.link || source.url,
      description: (item.description || "").replace(/<[^>]+>/g, "").substring(0, 200),
      sourceId: source.id,
      sourceName: source.name,
      category: source.category,
      fetchedAt: item.pubDate || now,
      isNew: isNewItem(item.pubDate || now),
    }));
}

async function fetchPageSource(source: BandiSource): Promise<BandiItem[]> {
  // Try multiple CORS proxies
  for (const proxy of CORS_PROXIES) {
    try {
      const url = proxy(source.url);
      const res = await fetchWithTimeout(url);
      if (!res.ok) continue;
      const data = await res.json();
      const html = data.contents || data;
      if (typeof html !== "string" || !html) continue;
      return extractItemsFromHtml(html, source);
    } catch {
      continue;
    }
  }
  throw new Error("All proxies failed");
}

export interface SourceStatus {
  id: string;
  status: "ok" | "error" | "loading";
}

export function useBandiFetch() {
  const [items, setItems] = useState<BandiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [sourceStatuses, setSourceStatuses] = useState<SourceStatus[]>([]);

  const fetchAll = useCallback(async (sources: BandiSource[]) => {
    const enabled = sources.filter((s) => s.enabled);
    setLoading(true);
    setSourceStatuses(enabled.map((s) => ({ id: s.id, status: "loading" })));

    const allItems: BandiItem[] = [];
    const statuses: SourceStatus[] = [];

    await Promise.allSettled(
      enabled.map(async (source) => {
        try {
          const result =
            source.type === "rss"
              ? await fetchRssSource(source)
              : await fetchPageSource(source);
          
          if (result.length > 0) {
            allItems.push(...result);
            statuses.push({ id: source.id, status: "ok" });
          } else {
            // No scraped results — show the source as a fallback entry
            allItems.push({
              id: `${source.id}-fallback`,
              title: source.name,
              link: source.url,
              description: source.description,
              sourceId: source.id,
              sourceName: source.name,
              category: source.category,
              fetchedAt: new Date().toISOString(),
              isNew: false,
            });
            statuses.push({ id: source.id, status: "ok" });
          }
        } catch {
          statuses.push({ id: source.id, status: "error" });
          // Show fallback with description even on error
          allItems.push({
            id: `${source.id}-fallback`,
            title: source.name,
            link: source.url,
            description: source.description,
            sourceId: source.id,
            sourceName: source.name,
            category: source.category,
            fetchedAt: new Date().toISOString(),
            isNew: false,
          });
        }
      })
    );

    setItems(allItems);
    setSourceStatuses(statuses);
    setLastUpdate(new Date());
    setLoading(false);
  }, []);

  return { items, loading, lastUpdate, sourceStatuses, fetchAll };
}

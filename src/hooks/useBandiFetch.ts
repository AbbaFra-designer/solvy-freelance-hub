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

const RSS2JSON_BASE = "https://api.rss2json.com/v1/api.json?rss_url=";
const ALLORIGINS_BASE = "https://api.allorigins.win/get?url=";

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

  // Extract text blocks separated by common separators
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

  // If no keyword matches found, add source as single entry
  if (items.length === 0) {
    const bodyText = html.replace(/<[^>]+>/g, " ").substring(0, 2000);
    if (matchesKeywords(bodyText)) {
      items.push({
        id: `${source.id}-page`,
        title: source.name,
        link: source.url,
        description: "Nuove opportunità disponibili – visita il sito per i dettagli.",
        sourceId: source.id,
        sourceName: source.name,
        category: source.category,
        fetchedAt: now,
        isNew: true,
      });
    }
  }

  return items;
}

async function fetchRssSource(source: BandiSource): Promise<BandiItem[]> {
  const url = `${RSS2JSON_BASE}${encodeURIComponent(source.url)}`;
  const res = await fetch(url);
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
  const url = `${ALLORIGINS_BASE}${encodeURIComponent(source.url)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Page fetch failed: ${res.status}`);
  const data = await res.json();
  if (!data.contents) return [];
  return extractItemsFromHtml(data.contents, source);
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
          allItems.push(...result);
          statuses.push({ id: source.id, status: "ok" });
        } catch {
          statuses.push({ id: source.id, status: "error" });
          // Add a placeholder item indicating source error
          allItems.push({
            id: `${source.id}-error`,
            title: source.name,
            link: source.url,
            description: "Fonte non disponibile al momento.",
            sourceId: source.id,
            sourceName: source.name,
            category: source.category,
            fetchedAt: new Date().toISOString(),
            isNew: false,
            error: true,
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

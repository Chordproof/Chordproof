import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase env variables. Check .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Helpers ────────────────────────────────────────────

const CHORD_RE = /^([A-G][#b]?(?:m|maj|min|dim|aug|sus|add|6|7|9|11|13|5|4|2|M)*\d*(?:\/[A-G][#b]?)?)$/;
const TAB_LINE_RE = /[eBGDAE]\|.*\|/;
const DIAGRAM_SYMBOLS = /^[○○×xN\/A\s]+$/i;

function isChordToken(token: string): boolean {
  return CHORD_RE.test(token.trim());
}

function isChordLine(line: string): boolean {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  return tokens.length > 0 && tokens.every(isChordToken);
}

function isDiagramLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  return DIAGRAM_SYMBOLS.test(trimmed);
}

function isTabLine(line: string): boolean {
  return TAB_LINE_RE.test(line);
}

function isSectionHeader(line: string): boolean {
  const t = line.trim();
  return t.startsWith("[") && t.endsWith("]");
}

function deduplicateChords(tokens: string[]): string[] {
  const result: string[] = [];
  let lastChord = "";
  for (const t of tokens) {
    if (t !== lastChord) {
      result.push(t);
      lastChord = t;
    }
  }
  return result;
}

function extractChordsFromLine(line: string): string[] {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  const chords: string[] = [];
  for (const t of tokens) {
    if (isChordToken(t)) {
      chords.push(t);
    }
  }
  return chords;
}

// ─── Main normalization logic ───────────────────────────

function normalizeContent(content: string, tablature: string): string {
  const lines = content.split("\n");
  const output: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] || "";
    const trimmed = line.trim();

    // Empty line — keep as separator
    if (!trimmed) {
      output.push("");
      i++;
      continue;
    }

    // Section header [Intro], [Verse 1], etc.
    if (isSectionHeader(line)) {
      output.push(trimmed);
      i++;
      continue;
    }

    // Tab line (e|---...---|) — keep as-is
    if (isTabLine(line)) {
      output.push(line);
      i++;
      continue;
    }

    // Diagram symbol line (○, ×, N/A) — SKIP
    if (isDiagramLine(line)) {
      i++;
      continue;
    }

    // Chord line (possibly mixed with diagram symbols)
    const chordsFromLine = extractChordsFromLine(line);

    if (chordsFromLine.length > 0) {
      // Check if this line is ONLY chords (possibly with diagram symbols mixed in)
      const nonChordTokens = trimmed.split(/\s+/).filter(Boolean).filter(t => !isChordToken(t));

      if (nonChordTokens.length === 0 || isDiagramLine(line) || chordsFromLine.length === trimmed.split(/\s+/).filter(Boolean).length) {
        // This is a pure chord line (possibly with diagram symbols)
        // Collect consecutive chord lines
        const allChords: string[] = [...chordsFromLine];
        let j = i + 1;

        while (j < lines.length) {
          const nextLine = lines[j] || "";
          const nextTrimmed = nextLine.trim();

          if (!nextTrimmed) break;
          if (isSectionHeader(nextLine)) break;
          if (isTabLine(nextLine)) break;

          // Skip diagram lines
          if (isDiagramLine(nextLine)) {
            j++;
            continue;
          }

          const nextChords = extractChordsFromLine(nextLine);
          const nextNonChords = nextTrimmed.split(/\s+/).filter(Boolean).filter(t => !isChordToken(t));

          if (nextChords.length > 0 && nextNonChords.length === 0) {
            // Another pure chord line
            allChords.push(...nextChords);
            j++;
          } else {
            break;
          }
        }

        // Deduplicate chords
        const deduped = deduplicateChords(allChords);

        // Check if next line is a lyric line
        const lyricLine = lines[j] || "";
        const lyricTrimmed = lyricLine.trim();

        if (lyricTrimmed && !isSectionHeader(lyricLine) && !isTabLine(lyricLine) && !isDiagramLine(lyricLine)) {
          // There's a lyric line after the chords
          // Put chords on one line, then lyric
          output.push(deduped.join(" "));
          output.push(lyricLine);
          i = j + 1;
        } else {
          // No lyric line — just output the chords
          output.push(deduped.join(" "));
          i = j;
        }
        continue;
      }
    }

    // Regular text line (lyrics, etc.)
    output.push(line);
    i++;
  }

  // Append tablature if it exists and isn't already in content
  if (tablature && tablature.trim()) {
    const tabLines = tablature.split("\n").filter(l => l.trim());

    // Check if tablature is already inline in content
    const contentHasTab = output.some(l => isTabLine(l));

    if (!contentHasTab && tabLines.length > 0) {
      output.push("");
      output.push("[Tablature]");
      for (const tl of tabLines) {
        output.push(tl);
      }
    }
  }

  // Clean up: remove excessive empty lines (max 2 consecutive)
  const cleaned: string[] = [];
  let emptyCount = 0;
  for (const l of output) {
    if (l.trim() === "") {
      emptyCount++;
      if (emptyCount <= 2) cleaned.push(l);
    } else {
      emptyCount = 0;
      cleaned.push(l);
    }
  }

  return cleaned.join("\n").trim();
}

// ─── Deduplication logic ───────────────────────────────

interface TabRecord {
  id: string;
  slug_artist: string;
  slug_song: string;
  song: string;
  artist: string;
  content: string;
  tablature: string;
  is_verified: boolean;
  created_at: string;
}

async function fetchAllTabs(): Promise<TabRecord[]> {
  const allTabs: TabRecord[] = [];
  let offset = 0;
  const pageSize = 100;

  while (true) {
    const { data, error } = await supabase
      .from("tabs")
      .select("id, slug_artist, slug_song, song, artist, content, tablature, is_verified, created_at")
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error("❌ Error fetching tabs:", error.message);
      break;
    }

    if (!data || data.length === 0) break;

    allTabs.push(...data as TabRecord[]);
    console.log(`  Fetched ${allTabs.length} tabs...`);

    if (data.length < pageSize) break;
    offset += pageSize;
  }

  return allTabs;
}

function findDuplicates(tabs: TabRecord[]): Map<string, TabRecord[]> {
  const groups = new Map<string, TabRecord[]>();

  for (const tab of tabs) {
    const key = `${tab.slug_artist}__${tab.slug_song}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(tab);
  }

  // Return only groups with more than 1 entry
  const duplicates = new Map<string, TabRecord[]>();
  for (const [key, group] of groups) {
    if (group.length > 1) {
      duplicates.set(key, group);
    }
  }

  return duplicates;
}

function pickBestVersion(tabs: TabRecord[]): { keep: TabRecord; delete: TabRecord[] } {
  // Sort by priority: verified first, then most content, then most recent
  const sorted = [...tabs].sort((a, b) => {
    // Verified first
    if (a.is_verified && !b.is_verified) return -1;
    if (!a.is_verified && b.is_verified) return 1;

    // More content = better
    const aLen = (a.content || "").length + (a.tablature || "").length;
    const bLen = (b.content || "").length + (b.tablature || "").length;
    if (aLen !== bLen) return bLen - aLen;

    // More recent
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return { keep: sorted[0], delete: sorted.slice(1) };
}

// ─── Main execution ────────────────────────────────────

async function main() {
  console.log("🚀 Starting tab normalization...\n");

  // 1. Fetch all tabs
  console.log("📥 Fetching all tabs from Supabase...");
  const tabs = await fetchAllTabs();
  console.log(`   Found ${tabs.length} tabs total.\n`);

  if (tabs.length === 0) {
    console.log("No tabs found. Exiting.");
    return;
  }

  // 2. Find and handle duplicates
  console.log("🔍 Checking for duplicate songs...");
  const duplicates = findDuplicates(tabs);

  if (duplicates.size > 0) {
    console.log(`   Found ${duplicates.size} duplicate groups.\n`);

    let totalDeleted = 0;

    for (const [key, group] of duplicates) {
      const { keep, delete: toDelete } = pickBestVersion(group);
      console.log(`   "${keep.song}" by ${keep.artist}: keeping 1, deleting ${toDelete.length} duplicate(s)`);

      for (const dup of toDelete) {
        const { error } = await supabase.from("tabs").delete().eq("id", dup.id);
        if (error) {
          console.error(`   ❌ Failed to delete ${dup.id}: ${error.message}`);
        } else {
          totalDeleted++;
        }
      }
    }

    console.log(`   ✅ Deleted ${totalDeleted} duplicate tabs.\n`);
  } else {
    console.log("   No duplicates found.\n");
  }

  // 3. Normalize content for all remaining tabs
  console.log("🔧 Normalizing content for all tabs...\n");

  let normalized = 0;
  let skipped = 0;
  let failed = 0;

  // Re-fetch after deletions
  const remainingTabs = await fetchAllTabs();

  for (const tab of remainingTabs) {
    const originalContent = tab.content || "";
    const tablature = tab.tablature || "";

    const normalizedContent = normalizeContent(originalContent, tablature);

    // Only update if content changed
    if (normalizedContent !== originalContent) {
      const { error } = await supabase
        .from("tabs")
        .update({
          content: normalizedContent,
          tablature: null, // Clear separate tablature field since it's now inline
        })
        .eq("id", tab.id);

      if (error) {
        console.error(`   ❌ Failed to normalize "${tab.song}" by ${tab.artist}: ${error.message}`);
        failed++;
      } else {
        console.log(`   ✅ Normalized: "${tab.song}" by ${tab.artist}`);
        normalized++;
      }
    } else {
      skipped++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Total tabs: ${remainingTabs.length}`);
  console.log(`   Normalized: ${normalized}`);
  console.log(`   Already OK: ${skipped}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Duplicates deleted: ${duplicates.size > 0 ? "(see above)" : "0"}`);
  console.log("\n✅ Done!");
}

main().catch(console.error);

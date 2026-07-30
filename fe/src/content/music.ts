export interface Song {
  id: string;
  title: string;
  artist: string;
  description: string;
  duration: number;
  backlink?: string;
}

export async function fetchSongs(): Promise<Song[]> {
  const response = await fetch("/songs");
  if (!response.ok) throw new Error("Network response was not ok!");
  const data = await response.json();
  return data || [];
}

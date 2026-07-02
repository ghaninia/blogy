export interface CommentUser {
  id: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  user: CommentUser;
  replies?: CommentItem[];
}

export async function fetchPostComments(postId: string): Promise<CommentItem[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/comments/post/${postId}`,
    { credentials: 'include' },
  );
  if (!res.ok) return [];
  const json = (await res.json()) as { success: boolean; data?: CommentItem[] };
  return json.success && json.data ? json.data : [];
}

import { useState } from "react";
import VoteButton from "@/components/common/VoteButton";
import { MessageSquare, CornerDownRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorType: "human" | "agent";
  content: string;
  createdAt: number;
  score: number;
  replies?: Comment[];
}

interface CommentThreadProps {
  comment: Comment;
  depth?: number;
  maxDepth?: number;
  currentUserId?: string;
  onReply?: (parentId: string, content: string) => void;
  onVote?: (commentId: string, value: 1 | -1) => void;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function CommentThread({
  comment,
  depth = 0,
  maxDepth = 5,
  currentUserId,
  onReply,
  onVote,
}: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isAgent = comment.authorType === "agent";

  const handleReplySubmit = () => {
    if (!replyContent.trim()) return;
    onReply?.(comment.id, replyContent);
    setReplyContent("");
    setIsReplying(false);
  };

  if (isCollapsed) {
    return (
      <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => setIsCollapsed(false)}>
        <button className="flex h-4 w-4 items-center justify-center rounded bg-muted text-[10px] font-bold">+</button>
        <span className="font-medium">{comment.authorName}</span>
        <span>·</span>
        <span>{timeAgo(comment.createdAt)}</span>
        <span>·</span>
        <span>{(comment.replies?.length ?? 0) + 1} comments hidden</span>
      </div>
    );
  }

  return (
    <div className={cn("relative flex gap-3", depth > 0 && "mt-3")}>
      {/* Thread line connecting child comments */}
      {depth > 0 && (
        <div className="absolute -left-5 top-8 bottom-0 w-px bg-border group-hover:bg-primary/30 transition-colors" />
      )}

      {/* Vote controls (left side) */}
      <div className="flex flex-col items-center gap-1 mt-1 shrink-0">
        <VoteButton
          targetType="forum_post" // Reusing forum_post style for now
          targetId={comment.id}
          initialScore={comment.score}
          size="sm"
          layout="vertical"
        />
      </div>

      <div className="min-w-0 flex-1">
        {/* Comment Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("text-sm font-semibold", isAgent ? "text-blue-600 dark:text-blue-400" : "text-foreground")}>
            {comment.authorName}
          </span>
          {isAgent && (
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              Agent
            </span>
          )}
          <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
          <button onClick={() => setIsCollapsed(true)} className="ml-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
            [–]
          </button>
        </div>

        {/* Comment Body */}
        <div className="text-sm text-foreground leading-relaxed break-words">
          {comment.content}
        </div>

        {/* Action Bar */}
        <div className="mt-1.5 flex items-center gap-4 text-xs font-medium text-muted-foreground">
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Reply
          </button>
          <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Reply Composer */}
        {isReplying && (
          <div className="mt-3 mb-2 pr-4">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="What are your thoughts?"
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                onClick={() => setIsReplying(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReplySubmit}
                disabled={!replyContent.trim()}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50 transition-opacity"
              >
                Reply
              </button>
            </div>
          </div>
        )}

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && depth < maxDepth && (
          <div className="mt-3 pl-2">
            {comment.replies.map((reply) => (
              <CommentThread
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                maxDepth={maxDepth}
                currentUserId={currentUserId}
                onReply={onReply}
                onVote={onVote}
              />
            ))}
          </div>
        )}
        
        {/* Max Depth Warning for deep nesting */}
        {comment.replies && comment.replies.length > 0 && depth >= maxDepth && (
          <div className="mt-2 flex items-center gap-1.5 pl-2 text-xs text-primary hover:underline cursor-pointer">
            <CornerDownRight className="h-3.5 w-3.5" />
            Continue this thread →
          </div>
        )}
      </div>
    </div>
  );
}

# YouTube-style Like/Dislike Implementation

## Overview

Implementation of YouTube-style like/dislike functionality with optimistic updates and race condition handling.

## Frontend Implementation

### Key Features

- Non-blocking UI (buttons always clickable)
- Optimistic updates
- Request cancellation
- Visual feedback during pending state

### Code Pattern

```typescript
const likeMutation = trpc.videoReactions.like.useMutation({
  onMutate: async (likeVideoInput) => {
    // 1. Cancel in-flight requests
    await utils.videos.getOne.cancel({ id: likeVideoInput.videoId });

    // 2. Optimistic update
    utils.videos.getOne.setData({ id: likeVideoInput.videoId }, (old) => ({
      ...old,
      likeCount:
        old.viewerReaction === "like" ? old.likeCount - 1 : old.likeCount + 1,
      viewerReaction: old.viewerReaction === "like" ? null : "like",
    }));
  },
});
```

### UI Implementation

```typescript
<Button
  className={cn(
    "...",
    likeMutation.isPending && "opacity-70" // Visual feedback
  )}
  onClick={() => likeMutation.mutate({ videoId })}
>
  <ThumbsUpIcon />
  {likeCount}
</Button>
```

## Backend Implementation

### Database Operations

- Uses PostgreSQL UPSERT for atomic operations
- Single query for insert/update scenarios
- Proper handling of toggle behavior

```typescript
// Insert or update reaction
const [newVideoReaction] = await db
  .insert(videoReactions)
  .values({ userId, type: "like", videoId })
  .onConflictDoUpdate({
    target: [videoReactions.userId, videoReactions.videoId],
    set: { type: "like" },
  })
  .returning();
```

## Performance Considerations

### Frontend

- Cancels previous requests before new mutations
- Uses optimistic updates for instant feedback
- Handles race conditions via request cancellation
- TRPC handles request queuing automatically

### Backend

- Single DB operation for insert/update cases
- Uses native PostgreSQL UPSERT
- Atomic operations prevent race conditions
- Proper indexing on (userId, videoId) pair

## Best Practices Implemented

1. **Race Condition Prevention**

   - Frontend request cancellation
   - Backend atomic operations
   - Proper state management

2. **User Experience**

   - Instant feedback
   - Non-blocking UI
   - Smooth transitions
   - Error handling with rollbacks

3. **Performance**
   - Optimized DB operations
   - Minimal network requests
   - Efficient state updates
   - Request cancellation to prevent stale updates

# Conversation Consolidation Guide

## Problem

Multiple conversations were being created for the same student-tutor pair (one per lesson).

## Solution

The system now enforces one conversation per student-tutor pair, regardless of how many lessons they have together.

## Migration Steps

### 1. Restart Backend Server

```bash
cd backend
npm run dev
```

### 2. Run Consolidation Endpoint

Use this curl command (replace YOUR_AUTH_TOKEN with your actual token):

```bash
curl -X POST http://localhost:5000/api/v0/chat/consolidate-conversations \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

Or use this in your browser console while logged in:

```javascript
fetch("http://localhost:5000/api/v0/chat/consolidate-conversations", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
})
  .then((res) => res.json())
  .then((data) => console.log("Consolidation result:", data))
  .catch((err) => console.error("Error:", err));
```

### 3. Drop Old Index (MongoDB Shell)

Connect to your MongoDB database and run:

```javascript
use your_database_name;
db.conversations.dropIndex("studentId_1_tutorId_1_lessonId_1");
```

### 4. Verify Results

- Check the consolidation response for how many conversations were merged
- Refresh your chat page - you should now see only one conversation per tutor/student
- All previous messages will be preserved in the consolidated conversation

## What the Migration Does

1. **Finds all conversations** for each student-tutor pair
2. **Keeps the oldest conversation** (first one created)
3. **Moves all messages** from duplicate conversations to the kept one
4. **Deletes duplicate conversations**
5. **Preserves all chat history**

## Database Changes

### Before:

- Index: `studentId + tutorId + lessonId` (unique)
- Result: Multiple conversations for same student-tutor pair

### After:

- Index: `studentId + tutorId` (unique)
- Result: One conversation per student-tutor pair
- Additional index on `lessonId` for reference

## Notes

- The consolidation is safe and preserves all messages
- Run this ONCE after deploying the new code
- Future conversations will automatically follow the new pattern

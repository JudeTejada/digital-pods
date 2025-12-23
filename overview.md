# Implementation Overview
A  overview of the Text Widget System implementation for Trumpet Pods.

---

## Technology Choices

| Category | Choice | Why |
|----------|--------|-----|
| Framework | Next.js 16 (App Router) | Modern React patterns, built-in API routes |
| API Layer | Hono | Lightweight, type-safe, middleware-ready |
| Stlyling | Taiwind CSS | Rapid UI development,|
| Testing | Vitest + Testing Library | Fast, modern, React-friendly |
| Code Quality | Biome | All-in-one linting and formatting |
| Package Manager | pnpm | Fast installs, strict dependency resolution |

---

## Key Design Choices

### 1. Context-Based State Management

**Choice**: React Context with a custom `useWidgetsState` hook rather than a global state library.

**Rationale**:
- Lightweight solution without additional dependencies
- Sufficient for the scope of single-pod widget management
- Easy to extend to React Query if needed (noted in code comments)

```tsx
// Separation of state logic and provider
export const useWidgetsState = () => { /* state logic */ };
export const WidgetsProviderRoot = ({ children }) => {
  const state = useWidgetsState();
  return <WidgetsProvider value={state}>{children}</WidgetsProvider>;
};
```

### 2. Optimistic UI Updates

**Choice**: Update local state immediately, then sync with server.

**Rationale**:
- Provides instant feedback for better UX
- Rollback on error preserves data integrity

```tsx
const handleDeleteWidget = async (id: string) => {
  const previousWidgets = widgets;
  setWidgets(widgets.filter((w) => w.id !== id)); // Optimistic
  try {
    await api.deleteWidget(id);
  } catch {
    setWidgets(previousWidgets); // Rollback on failure
  }
};
```

### 3. Save-on-Blur Pattern

**Choice**: Persist widget content when the textarea loses focus, not on every keystroke.

**Rationale**:
- Reduces API calls significantly
- Avoids save race conditions during rapid typing
- Simple implementation without debounce complexity

```tsx
const handleBlur = () => {
  if (text !== widget?.text && widget) {
    handleUpdateWidget({ ...widget, text });
  }
};
```

### 4. Hono for API Routes

**Choice**: Hono framework inside Next.js API routes instead of raw route handlers.

**Rationale**:
- Cleaner routing syntax and better DX
- Built-in type safety for request/response

```tsx
const app = new Hono().basePath("/api");
app.get("/widgets", (c) => c.json([...widgets.values()]));
app.post("/widgets", async (c) => { /* ... */ });
app.delete("/widgets/:id", (c) => { /* ... */ });
```

### 5. Component-Local State with Context Sync

**Choice**: Widget maintains local `text` state, synced from context on external updates.

**Rationale**:
- Enables smooth typing experience without re-renders from context
- Pattern using `prevWidget` comparison avoids stale closure issues

```tsx
const [text, setText] = useState("");
const [prevWidget, setPrevWidget] = useState<typeof widget | null>(null);

// reference: https://react.dev/learn/you-might-not-need-an-effect
// Sync during render when widget changes externally
if (widget?.text !== prevWidget?.text) {
  setPrevWidget(widget);
  setText(widget?.text ?? "");
}
```

---

## Testing Strategy

| Test Type | Coverage |
|-----------|----------|
| **Unit Tests** | Widget component behavior, state updates, blur handling |
| **Integration Tests** | API routes (GET/POST/DELETE), error scenarios |
| **Mock Strategy** | API module mocked for isolated component testing |

Key test scenarios:
- ✅ Independent widget state management
- ✅ Save triggers only on actual changes
- ✅ Delete button functionality
- ✅ Empty state handling

---

## Tradeoffs

1. **In-Memory Storage**: Uses a `Map<string, Widget>` for persistence. Data resets on server restart. This was chosen for simplicity and alignment with the challenge requirements.

2. **Save on Blur**: Content is saved when the user finishes typing (on blur) rather than autosaving. This reduces unnecessary API calls but means data isn't saved mid-typing.

3. **No Input Sanitization**: The API accepts raw text input without sanitization. This was omitted for simplicity but should be added before any production deployment with untrusted users. Consider:
   - Truncating text to reasonable length limits
   - Escaping or stripping HTML/script tags
   - Rate limiting to prevent abuse

4. **No Rich Text**: Only plain text editing is supported. Rich text formatting (bold, italics, etc.) is not included.

## Future Extensibility

The architecture supports these enhancements without major refactoring:

1. **Database Persistence** — Replace the `Map` with a database adapter
2. **Real-time Sync** — Add WebSocket layer to `useWidgetsState`
3. **React Query Migration** — The hook structure is ready for `useQuery`/`useMutation`
4. **Widget Polymorphism** — Add `type` field to `Widget` for images, embeds, etc.
5. **Drag & Drop** — Widget IDs enable stable reordering

## Feature Request: The Liquid Messenger (Floating Widget)

**Goal:** Create a fixed floating action button (FAB) that expands into a chat widget.
**Location:** Fixed position, `bottom-6 right-6` (z-index: 50).
**Base Component:** Use `LiquidGlassCard` for both the button and the expanded window.

### 1. State Management
* `isOpen` (boolean): Toggles between the Button view and the Window view.
* `activeTab` ('contact' | 'ai'): Switches between the Contact Form and AI Chat interface.

### 2. UI/UX Specifications

#### A. The Trigger Button (When `!isOpen`)
* **Shape:** Circle (`rounded-full`), size `w-16 h-16`.
* **Style:** High blur (`blurIntensity='xl'`), strong glow (`glowIntensity='lg'`).
* **Icon:** Use `MessageSquare` or `Bot` icon (Lucide React).
* **Animation:** Must use `motion.div` with `layoutId="messenger-container"` to ensure smooth morphing when expanding.

#### B. The Widget Window (When `isOpen`)
* **Shape:** Rectangle (`rounded-3xl`), size `w-[350px] h-[500px]` (responsive on mobile).
* **Header:**
    * Title: "Connect with Thien".
    * Tabs: Segmented control to switch between "Email Me" vs "Chat AI".
    * Close Button: An 'X' icon that sets `isOpen(false)`.
* **Body Content (Conditional Render):**
    * **Mode 'Email Me':**
        * Inputs: Email, Subject, Message.
        * Style: Inputs should have `bg-white/10` and `backdrop-blur-sm`.
    * **Mode 'Chat AI':**
        * Chat Area: Scrollable area with message bubbles.
        * User Bubble: `bg-white/20`.
        * Bot Bubble: `bg-primary/50` (Glass style).
        * Input Area: Text input + Send button.

### 3. Implementation Logic (Pseudo-code)
```tsx
<AnimatePresence>
  {isOpen ? (
    <LiquidGlassCard
       layoutId="messenger-container"
       className="fixed bottom-6 right-6 w-[350px] h-[500px] flex flex-col"
    >
       {/* Header with Tabs & Close Btn */}
       {/* Body: Switch(activeTab) case 'contact' / case 'ai' */}
    </LiquidGlassCard>
  ) : (
    <LiquidGlassCard
       layoutId="messenger-container"
       className="fixed bottom-6 right-6 w-16 h-16 rounded-full flex items-center justify-center cursor-pointer"
       onClick={() => setIsOpen(true)}
    >
       <BotIcon className="text-white" />
    </LiquidGlassCard>
  )}
</AnimatePresence>

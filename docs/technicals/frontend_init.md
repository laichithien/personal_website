Đây là tài liệu **Frontend Architecture Document (FAD)**. Tài liệu này quy định cấu trúc dự án Next.js, hệ thống Component và cách xử lý hiệu ứng hình ảnh phức tạp (Liquid Glass).

Lưu file này tại: `docs/frontend-architecture.md`

---

# Frontend Architecture Document

**Project:** The Transparent Core (Web Client)
**Tech Stack:** Next.js 14+ (App Router), Tailwind CSS, shadcn/ui, Framer Motion.
**Design System:** Liquid Glass (Glassmorphism + Distortion).

---

## 1. Technology Stack & Key Libraries

* **Core Framework:** **Next.js 14 (App Router)**
* Sử dụng React Server Components (RSC) mặc định để tối ưu SEO và Initial Load.
* Sử dụng `'use client'` cho các components có hiệu ứng kính/tương tác.


* **Styling:**
* **Tailwind CSS:** Utility-first styling.
* **shadcn/ui:** Base components (Button, Dialog, Form, Input).
* **clsx / tailwind-merge:** Xử lý logic class động.


* **Animation & Effects:**
* **Framer Motion (`motion/react`):** Quản lý layout animations (`layoutId` cho hiệu ứng mở rộng card), gesture (drag), và spring physics.
* **SVG Filters:** Sử dụng SVG `<filter>` custom để tạo hiệu ứng méo (distortion) cho Liquid Glass.


* **Icons:** **Lucide React**.
* **State Management:**
* **React Context:** Quản lý UI State đơn giản (Theme, Global Audio Player status).
* **TanStack Query (React Query):** Quản lý data từ API (Chatbot history, Project fetch).



---

## 2. Project Structure (App Router)

Cấu trúc thư mục được tổ chức theo tính năng (Feature-based).

```bash
apps/web/
├── app/
│   ├── layout.tsx             # Root Layout (Font, Metadata, Providers)
│   ├── page.tsx               # Main SPA Entry (Các sections được import vào đây)
│   ├── globals.css            # Tailwind directives + Global CSS Variables
│   └── api/                   # Internal API Routes (Proxy request sang Python backend)
│
├── components/
│   ├── ui/                    # shadcn/ui components (Button, Input, Dialog...)
│   │   └── liquid-glass.tsx   # CORE COMPONENT: Thẻ kính lỏng
│   │
│   ├── features/              # Các khối chức năng lớn
│   │   ├── hero/              # Hero Section components
│   │   ├── bento/             # Grid Layout & Widgets (TechStack, Homelab...)
│   │   ├── soul/              # Music Player, Lifestyle Code
│   │   └── chat/              # Chatbot Widget (Button + Window)
│   │
│   └── shared/                # Navbar, Footer, BackgroundMesh
│
├── lib/
│   ├── utils.ts               # cn() helper
│   ├── api-client.ts          # Axios/Fetch instance gọi sang Backend
│   └── types.ts               # TypeScript interfaces
│
├── config/
│   └── portfolio.ts           # [V1 Data] File chứa text/content tĩnh (CV, Projects)
│
└── public/                    # Images, Fonts, SVG Filters

```

---

## 3. Core Design System: "Liquid Glass"

Đây là linh hồn của giao diện. Mọi component chính đều kế thừa từ `LiquidGlassCard`.

### 3.1. `LiquidGlassCard` Specification

Component này phải xử lý được 3 lớp layer chồng lên nhau để tạo ảo giác quang học:

1. **Back Layer (Refraction):** Sử dụng `backdrop-filter: blur()` kết hợp với SVG Filter `feDisplacementMap` để làm méo hình nền phía sau.
2. **Middle Layer (Surface):** Màu nền bán trong suốt (`bg-white/10` hoặc `bg-black/20`) + Border mỏng (`border-white/20`).
3. **Top Layer (Highlight/Glow):** Gradient trắng mờ chạy qua hoặc đốm sáng (`box-shadow`) để tạo cảm giác độ dày của kính.

### 3.2. Background Strategy

Để kính "nổi", nền phải có độ tương phản và chi tiết.

* **Giải pháp:** Sử dụng một **Mesh Gradient** tối màu (Dark Purple/Deep Blue) có animation trôi nhẹ (floating) ở `z-index: -1`.
* Tránh dùng màu nền đơn sắc (Solid Color) vì hiệu ứng kính sẽ biến mất.

---

## 4. Key Features Implementation

### 4.1. The Bento Grid (Tech & Lab Section)

* **Layout:** Sử dụng CSS Grid (`grid-template-areas` hoặc Tailwind `grid-cols`).
* **Responsive:**
* **Mobile:** `grid-cols-1` (Xếp chồng dọc).
* **Tablet:** `grid-cols-2`.
* **Desktop:** `grid-cols-4`.


* **Interaction:**
* Mỗi ô (Cell) là một `LiquidGlassCard`.
* **Click:** Mở `Dialog` (shadcn) hiển thị chi tiết nội dung.



### 4.2. The Liquid Messenger (Chatbot)

Đây là component phức tạp nhất về mặt State và Animation.

* **State:** `isOpen` (boolean).
* **Animation Logic (Framer Motion):**
* Sử dụng `layoutId="messenger-box"` cho cả Nút tròn (Collapsed) và Cửa sổ chat (Expanded).
* Khi `isOpen` đổi, React sẽ tự động animate biến hình giữa 2 trạng thái này (Shared Element Transition).


* **Chat Interface:**
* **Streaming Text:** Khi AI trả lời, text hiện ra dần dần (Typewriter effect). Cần xử lý việc parse Markdown trong tin nhắn AI.



### 4.3. Navigation

* **Floating Dock:** Một thanh menu nhỏ, kính trong suốt, trôi nổi ở dưới cùng hoặc trên cùng màn hình (`fixed`).
* **Scroll to Section:** Sử dụng `window.scrollTo` hoặc thẻ `<a>` với ID (`#hero`, `#tech`) để cuộn mượt (`scroll-behavior: smooth`).

---

## 5. Integration Strategy (Data Fetching)

### 5.1. Content Data (Static/Config)

* **Nguồn:** `config/portfolio.ts`.
* **Cách lấy:** Import trực tiếp vào Server Component (`app/page.tsx`) và truyền xuống Client Component qua Props.
* **Lý do:** Nhanh, không cần API call cho dữ liệu ít thay đổi.

### 5.2. Dynamic Data (Chatbot & System Status)

* **Nguồn:** FastAPI Backend (`api.thien.dev`).
* **Cách lấy:** React Query (Client-side).
* `useQuery`: Lấy lịch sử chat.
* `useMutation`: Gửi tin nhắn mới.
* `useQuery` (polling): Lấy trạng thái Homelab (nếu có làm realtime).



---

## 6. Performance Optimization

* **GPU Heavy:** Các hiệu ứng `backdrop-filter` và `box-shadow` rất ngốn GPU.
* *Giải pháp:* Sử dụng `will-change: transform` hoặc `transform: translateZ(0)` để đưa component vào layer riêng của GPU.


* **Mobile:** Có thể cần giảm bớt hiệu ứng `distortion` (méo hình) trên mobile để đảm bảo FPS mượt mà (chỉ giữ lại `blur`).
* **Lazy Loading:**
* Component Chatbot chỉ nên load code (`next/dynamic`) khi người dùng thực sự bấm vào nút hoặc sau khi trang load xong 3s.



---

## 7. Development Phases (Frontend)

1. **Phase 1: Skeleton & Background:** Dựng layout, setup Tailwind theme, Mesh Gradient background.
2. **Phase 2: The Glass Factory:** Code hoàn thiện `LiquidGlassCard` component.
3. **Phase 3: Building Blocks:** Ghép các section Hero, Bento Grid dùng data giả.
4. **Phase 4: Liquid Messenger:** Code UI chat, animation đóng/mở.
5. **Phase 5: Wiring:** Kết nối API Chatbot.
6. **Phase 6: Polish:** Responsive check, dark mode tuning.

---

**Note:** frontend sẽ không trực tiếp gọi database. Mọi giao tiếp dữ liệu động phải thông qua API Route của Next.js (làm Proxy) hoặc gọi thẳng sang FastAPI (nếu config CORS cho phép). Ở đây khuyến nghị gọi thẳng sang FastAPI subdomain để giảm tải cho Next.js server.

Đây là tài liệu **Product Requirements Document (PRD)** chính thức cho dự án. Bạn có thể lưu file này dưới tên `docs/product-requirements.md` để làm kim chỉ nam cho toàn bộ quá trình phát triển.

---

# Product Requirements Document (PRD)

**Project Name:** The Transparent Core
**Version:** 1.0
**Status:** Planning
**Type:** Personal Portfolio / Digital Garden

---

## 1. Executive Summary (Tổng quan)

**"The Transparent Core"** không chỉ là một trang web hiển thị CV. Đây là một định danh kỹ thuật số (Digital Identity) của một AI Engineer: hiện đại, minh bạch và đa chiều.

Dự án kết hợp giữa **Technical Mastery** (Khả năng làm chủ công nghệ: AI, Homelab, System) và **Artistic Soul** (Tâm hồn nghệ thuật: Music, Game Dev, Entrepreneurship). Giao diện sử dụng ngôn ngữ thiết kế **Liquid Glass** để ẩn dụ cho sự "xuyên thấu" vào các khía cạnh của con người thật.

## 2. Design Philosophy (Triết lý thiết kế)

* **Core Concept:** **"Liquid Glass"** (Kính lỏng).
* **Visual Language:**
* **Transparency & Depth:** Sử dụng các lớp kính mờ (blur), hiệu ứng khúc xạ (refraction) và bóng đổ (shadow) để tạo chiều sâu 3D trên nền 2D.
* **Dark Mode Native:** Nền tối (Deep gradients: Midnight Blue/Purple/Neon) để làm nổi bật độ trong suốt của các tấm kính.
* **Bento Grid:** Bố cục dạng lưới ô vuông/chữ nhật, gọn gàng, hiện đại, lấy cảm hứng từ Apple/Linear design.


* **User Feeling:** Tương lai (Futuristic), Cao cấp (Premium), và "Geek" (Đậm chất công nghệ).

## 3. Product Architecture (Cấu trúc sản phẩm)

Website hoạt động theo mô hình **Single Page Application (SPA)** với khả năng cuộn dọc vô tận (Infinite Scroll feeling).

### 3.1. Main Flow (Luồng chính)

Người dùng truy cập trang chủ -> Cuộn xem các "Layer" thông tin -> Tương tác mở rộng (Expand) để xem chi tiết -> Sử dụng Chatbot để hỏi đáp.

### 3.2. Content Hierarchy (Phân cấp nội dung)

1. **Hero:** Định danh (Who am I?).
2. **The Grid:** Kỹ năng & Dự án (What I do?).
3. **The Soul:** Đời sống & Sở thích (Who I really am?).
4. **Connect:** Kết nối & AI Agent (Contact me).

---

## 4. Key Features & Specifications (Tính năng chi tiết)

### 4.1. Section: The Hero (Liquid Identity)

* **Mục tiêu:** Gây ấn tượng thị giác mạnh mẽ ngay lập tức.
* **Thiết kế:** Một thẻ Liquid Glass lớn (Highlight Card).
* **Nội dung:**
* Avatar (Ảnh thật, chất lượng cao).
* Headline & Tagline (AI Engineer @ Vexere).
* Primary CTA: Điều hướng nhanh xuống phần Tech hoặc Art.



### 4.2. Section: The Engineer & Lab (Bento Grid Layout)

* **Mục tiêu:** Trình diễn năng lực kỹ thuật và tư duy khởi nghiệp.
* **Các Module (Widgets):**
* **The Arsenal (Tech Stack):** Hiển thị logo/icon các công nghệ (Python, PySpark, Agentic AI, RAG). Hiệu ứng trôi nổi trong kính.
* **Homelab Status:** Widget hiển thị trạng thái server giả lập (hoặc realtime) của hệ thống Self-hosted.
* **Startup Incubator:** Danh sách các ý tưởng (Idea Cards). Dạng lật hoặc hover để xem tóm tắt ý tưởng (Lottery App, Content Gen Agent).
* **Game Dev Corner:** Showcase dự án game 8-bit/Healing.



### 4.3. Section: Side Quests (Lifestyle)

* **Mục tiêu:** Thể hiện khía cạnh con người, tạo sự gần gũi.
* **Các Module:**
* **Music Player Widget:** Giả lập trình phát nhạc (Glassmorphism), hiển thị bài hát/nhạc cụ đang chơi.
* **Life Algorithm:** Hiển thị thói quen (Routine, Cooking, Skincare) dưới dạng các dòng code giả (Pseudo-code) trên nền Terminal trong suốt.



### 4.4. Feature: The Liquid Messenger (AI Agent Integration)

* **Vị trí:** Nút nổi (Floating Action Button) góc dưới bên phải màn hình.
* **Trạng thái:**
* *Collapsed:* Hình giọt nước tròn, hiệu ứng glow.
* *Expanded:* Mở rộng thành cửa sổ hội thoại (Dialog).


* **Chức năng (Hybrid Mode):**
* **Tab 1 - Contact Form:** Form gửi tin nhắn/email truyền thống cho Recruiter.
* **Tab 2 - Chat with AI:** Cửa sổ chat với Trợ lý ảo.
* AI có khả năng truy xuất thông tin từ CV, dự án.
* Hiệu ứng "Thinking" khi AI đang xử lý (gọi Tools).





### 4.5. Navigation & Interaction

* **Navigation:** Thanh menu dính (Sticky Header) hoặc Floating Dock ẩn hiện khi cuộn.
* **Project Detail:** Khi bấm vào một dự án trong Grid, không chuyển trang mà mở một **Modal/Overlay** phủ lên trên để hiển thị chi tiết (Case study, Tech used, Screenshots).

---

## 5. Technical Constraints (Ràng buộc kỹ thuật)

* **Performance:** Ưu tiên tối ưu hóa FPS. Hạn chế lạm dụng quá nhiều layer `backdrop-filter: blur` chồng chéo nhau gây lag trên mobile.
* **Responsive:** Thiết kế **Mobile-First**. Bento Grid phải tự động chuyển thành dạng danh sách dọc (Stack) trên màn hình nhỏ.
* **SEO:** Cấu trúc HTML Semantic chuẩn để Google Index tốt (dù là SPA).
* **Accessibility:** Đảm bảo độ tương phản (Contrast) của chữ trên nền kính đủ để đọc được.

## 6. Infrastructure Overview (Hạ tầng tổng quan)

* **Hosting:** Self-hosted (Home Server).
* **Exposure:** Cloudflare Tunnel (SSL/DDNS).
* **Backend Architecture:** Microservices.
* **Frontend Service:** Next.js (UI).
* **AI Service:** FastAPI (Agent Logic).
* **Database:** Shared PostgreSQL + pgvector (Data & Memory).



## 7. Roadmap (Lộ trình phát triển)

* **Phase 1 (MVP):** Hoàn thiện UI Liquid Glass, Bento Grid, và Config-based Content. Chatbot cơ bản (Mock data hoặc Basic RAG).
* **Phase 2 (Dynamic):** Kết nối Database, xây dựng hệ thống Admin (nếu cần), nâng cấp AI Agent với Tools phức tạp.
* **Phase 3 (Expansion):** Thêm Blog page, tối ưu hóa SEO sâu.

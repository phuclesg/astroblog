const ALLOWED_ORIGIN = "https://namkyxua.com"; // đổi thành domain Astro thật của bạn, hoặc "*" nếu muốn mở cho mọi domain

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=UTF-8",
  };
}

// Escape HTML để chống XSS/HTML injection trong nội dung email
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Validate email cơ bản
function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default {
  async fetch(request, env) {
    const origin = ALLOWED_ORIGIN;

    // Xử lý preflight CORS
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ status: "error", message: "Method not allowed" }), {
        status: 405,
        headers: corsHeaders(origin),
      });
    }

    // Giới hạn kích thước body để tránh payload quá lớn
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 20_000) {
      return new Response(JSON.stringify({ status: "error", message: "Payload too large" }), {
        status: 413,
        headers: corsHeaders(origin),
      });
    }

    let formData;
    try {
      formData = await request.json();
    } catch {
      return new Response(JSON.stringify({ status: "error", message: "Invalid JSON" }), {
        status: 400,
        headers: corsHeaders(origin),
      });
    }

    const { name, email, message, title, link } = formData || {};

    // Validate input bắt buộc
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ status: "error", message: "Thiếu thông tin bắt buộc (name, email, message)" }),
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ status: "error", message: "Email không hợp lệ" }), {
        status: 400,
        headers: corsHeaders(origin),
      });
    }

    // Giới hạn độ dài để tránh spam / abuse
    if (String(name).length > 200 || String(message).length > 5000) {
      return new Response(JSON.stringify({ status: "error", message: "Nội dung quá dài" }), {
        status: 400,
        headers: corsHeaders(origin),
      });
    }

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Liên lạc từ <phuc@namkyxua.com>",
          to: ["phucga.lhp@gmail.com"],
          reply_to: email, // để bạn có thể reply trực tiếp cho người gửi
          subject: "Tin nhắn mới từ web Namkyxua.com",
          html: `<p><strong>Người gửi:</strong> ${escapeHtml(name)}</p>
                 <p><strong>Email:</strong> ${escapeHtml(email)}</p>
                 <p><strong>Nội dung:</strong> ${escapeHtml(message)}</p>
                 <p><strong>Gửi từ bài viết:</strong> ${escapeHtml(title)}</p>
                 <p><strong>Link:</strong> ${escapeHtml(link)}</p>`,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Resend error:", errText);
        return new Response(JSON.stringify({ status: "error", message: "Không gửi được email" }), {
          status: 502,
          headers: corsHeaders(origin),
        });
      }

      return new Response(JSON.stringify({ status: "success" }), {
        headers: corsHeaders(origin),
      });
    } catch (err) {
      console.error("Worker error:", err);
      return new Response(JSON.stringify({ status: "error", message: "Lỗi server" }), {
        status: 500,
        headers: corsHeaders(origin),
      });
    }
  },
};
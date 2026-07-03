import fs from "node:fs";
import path from "node:path";

const BLOG = "./src/content/blog";

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (entry.name !== "index.mdx") continue;

    let content = fs.readFileSync(fullPath, "utf8");

    // Lấy body (bỏ frontmatter)
    const body = content.replace(/^---\n[\s\S]*?\n---\n?/, "");

    // Đếm từ
    const words = body.trim().split(/\s+/).filter(Boolean).length;

    // 200 từ/phút, tối thiểu 1 phút
    const readingTime = Math.max(1, Math.ceil(words / 200));

    // Cập nhật readingTime nếu đã có
    if (/^readingTime:/m.test(content)) {
      content = content.replace(
        /^readingTime:.*$/m,
        `readingTime: ${readingTime}`
      );
    } else {
      // Chèn vào frontmatter nếu chưa có
      content = content.replace(
        /^---\n([\s\S]*?)\n---/,
        (_, frontmatter) => `---
${frontmatter}
readingTime: ${readingTime}
---`
      );
    }

    fs.writeFileSync(fullPath, content, "utf8");

    console.log(`✅ ${fullPath} -> ${readingTime} phút`);
  }
}

walk(BLOG);

console.log("\n🎉 Đã cập nhật readingTime cho tất cả bài viết!");
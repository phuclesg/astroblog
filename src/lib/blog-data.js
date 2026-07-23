import { getCollection } from "astro:content";

const siteUrl = (
  import.meta.env.SITE_URL ||
  import.meta.env.PUBLIC_SITE_URL ||
  "https://namkyxua.com"
).replace(/\/$/, "");

export const authors = [
  {
    slug: "phuc-map",
    name: "Phúc Mập",
    bio: "Viết về cuộc sống thường ngày ở Miền Nam",
    avatar: "https://media.namkyxua.com/images/avatar-map.png",
  }
];

export const categories = [
  { slug: "nhan-vat", name: "Nhân vật" },
  { slug: "doi-song", name: "Đời sống" },
  { slug: "mon-ngon", name: "Món ngon" },
];

export const tags = [
  { slug: "nam-bo", name: "Nam Bộ"  },
  { slug: "khai-pha", name: "Khai Phá"  },
  { slug: "mien-tay", name: "Miền Tây" },
  { slug: "dan-gian",name: "Dân gian" },

  { slug: "ky-uc", name: "Ký ức" },
  { slug: "thoi-xua", name: "Thời xưa" },
  { slug: "sai-gon-xua", name: "Sài Gòn Xưa" },

  { slug: "dac-san", name: "Đặc sản"  },
  { slug: "duong-pho", name: "Món đường phố" },

  { slug: "hinh-anh", name: "Hình ảnh" },
  { slug:"hinh-sai-gon-xua", name: "Hình Sài Gòn xưa" },
];

const isoDate = (date) =>  {
  if (!date) return undefined;
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
};;

export const imageSrc = (image) => (typeof image === "string" ? image : image?.src);

export const normalizePost = (entry) => ({
  slug: entry.id,
  ...entry.data,
  date: isoDate(entry.data.date),
  updated: isoDate(entry.data.updated),
});

export const posts = async () => (await getCollection("blog")).map(normalizePost);

export const getPost = async (slug) => (await posts()).find((post) => post.slug === slug);
export const getAuthor = (slug) => authors.find((author) => author.slug === slug);
export const getCategory = (slug) => categories.find((category) => category.slug === slug);
export const getTag = (slug) => tags.find((tag) => tag.slug === slug);
export const postsByCategory = async (slug) =>
  (await sortedPosts()).filter((post) => post.category === slug);
export const postsByTag = async (slug) =>
  (await sortedPosts()).filter((post) => post.tags.includes(slug));
export const postsByAuthor = async (slug) =>
  (await sortedPosts()).filter((post) => post.author === slug);
export const sortedPosts = async () =>
  [...(await posts())].sort((a, b) => (a.date < b.date ? 1 : -1));
export const featuredPost = async () => {
  const sorted = await sortedPosts();
  return sorted.find((post) => post.featured) ?? sorted[0];
};
export const popularPosts = async () => (await sortedPosts()).slice(0, 4);
export const relatedPosts = async (post, n = 3) =>
  (await sortedPosts())
    .filter((candidate) => candidate.slug !== post.slug)
    .sort((a, b) => {
      const score = (candidate) =>
        (candidate.category === post.category ? 2 : 0) +
        candidate.tags.filter((tag) => post.tags.includes(tag)).length;
      return score(b) - score(a);
    })
    .slice(0, n);

export const adjacentPosts = async (post) => {
  const sorted = await sortedPosts();
  const index = sorted.findIndex((candidate) => candidate.slug === post.slug);
  return { prev: sorted[index + 1], next: sorted[index - 1] };
};

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const SITE = {
  name: "Nam Kỳ Xưa",
  description:
    "Nơi quá khứ gặp gỡ hiện tại - Nơi ký ức trở thành bất tử",
  url: siteUrl,
};

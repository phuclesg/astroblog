const posts = [
  { id: 1, title: "JavaScript" },
  { id: 2, title: "Astro" },
  { id: 3, title: "Node.js" },
];

function findPostById(posts) {
  return posts.find((nl) => nl.id === 2);
}
console.log(findPostById(posts));

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const IMG = (name: string) => `/images/${name}.jpg`;

type SeedProduct = {
  name: string;
  category: string;
  image: string;
  description: string;
  price: number;
  comparePrice?: number;
  stock?: number;
  featured?: boolean;
  weight?: number;
  variants?: { name: string; price: number; stock: number }[];
};

const categories = [
  { name: "Biji Kopi", slug: "biji-kopi", description: "Biji kopi single origin dan blend, disangrai segar." },
  { name: "Kopi Bubuk", slug: "kopi-bubuk", description: "Kopi giling siap seduh untuk berbagai metode." },
  { name: "Kopi Siap Minum", slug: "kopi-siap-minum", description: "Cold brew dan minuman kopi botolan." },
  { name: "Alat Seduh", slug: "alat-seduh", description: "Peralatan seduh manual untuk di rumah." },
  { name: "Merchandise", slug: "merchandise", description: "Perlengkapan dan suvenir khas Wazzopi." },
];

const products: SeedProduct[] = [
  {
    name: "Arabica Gayo Wine Process",
    category: "biji-kopi",
    image: IMG("p-arabica-gayo"),
    description:
      "Kopi arabika dari dataran tinggi Gayo, Aceh, dengan proses fermentasi wine. Catatan rasa: anggur merah, dark chocolate, dan aftertaste manis yang panjang.",
    price: 95000,
    featured: true,
    variants: [
      { name: "250g - Biji Utuh", price: 95000, stock: 40 },
      { name: "250g - Bubuk", price: 95000, stock: 35 },
      { name: "500g - Biji Utuh", price: 180000, stock: 20 },
      { name: "1kg - Biji Utuh", price: 340000, stock: 10 },
    ],
  },
  {
    name: "Toraja Sapan",
    category: "biji-kopi",
    image: IMG("p-toraja"),
    description:
      "Arabika Toraja dari kebun Sapan, Sulawesi Selatan. Body tebal, keasaman rendah, dengan nuansa rempah, karamel, dan kayu manis.",
    price: 105000,
    featured: true,
    variants: [
      { name: "250g - Biji Utuh", price: 105000, stock: 30 },
      { name: "500g - Biji Utuh", price: 200000, stock: 15 },
    ],
  },
  {
    name: "Kintamani Bali Natural",
    category: "biji-kopi",
    image: IMG("p-kintamani"),
    description:
      "Arabika Kintamani proses natural dengan rasa buah jeruk, gula aren, dan keasaman cerah yang menyegarkan.",
    price: 98000,
    featured: true,
    variants: [
      { name: "250g - Biji Utuh", price: 98000, stock: 28 },
      { name: "500g - Biji Utuh", price: 185000, stock: 12 },
    ],
  },
  {
    name: "Flores Bajawa",
    category: "biji-kopi",
    image: IMG("p-arabica-gayo"),
    description: "Arabika Flores Bajawa dengan karakter nutty, cokelat susu, dan body medium yang seimbang.",
    price: 92000,
    variants: [
      { name: "250g - Biji Utuh", price: 92000, stock: 25 },
      { name: "500g - Biji Utuh", price: 175000, stock: 8 },
    ],
  },
  {
    name: "Robusta Lampung Premium",
    category: "kopi-bubuk",
    image: IMG("p-robusta"),
    description:
      "Robusta pilihan dari Lampung Barat, digiling sedang. Pahit yang tegas, body tebal, cocok untuk kopi tubruk dan kopi susu.",
    price: 55000,
    variants: [
      { name: "250g", price: 55000, stock: 60 },
      { name: "500g", price: 100000, stock: 30 },
    ],
  },
  {
    name: "Espresso Blend Wazzopi",
    category: "kopi-bubuk",
    image: IMG("p-espresso-blend"),
    description:
      "Racikan khas Wazzopi: 70% arabika Gayo dan 30% robusta Lampung. Crema tebal, manis karamel, ideal untuk espresso dan latte.",
    price: 85000,
    featured: true,
    variants: [
      { name: "250g - Biji Utuh", price: 85000, stock: 45 },
      { name: "250g - Bubuk Espresso", price: 85000, stock: 30 },
      { name: "1kg - Biji Utuh", price: 310000, stock: 12 },
    ],
  },
  {
    name: "Cold Brew Original 250ml",
    category: "kopi-siap-minum",
    image: IMG("p-cold-brew"),
    description: "Cold brew arabika yang diseduh dingin selama 18 jam. Halus, rendah asam, tanpa gula tambahan.",
    price: 28000,
    stock: 80,
    featured: true,
    weight: 300,
  },
  {
    name: "Cold Brew Susu Aren 250ml",
    category: "kopi-siap-minum",
    image: IMG("p-cold-brew"),
    description: "Perpaduan cold brew, susu segar, dan gula aren asli. Manis yang pas untuk menemani hari.",
    price: 32000,
    comparePrice: 35000,
    stock: 70,
    weight: 300,
  },
  {
    name: "Drip Bag Nusantara isi 10",
    category: "kopi-bubuk",
    image: IMG("p-drip-bag"),
    description: "Sepuluh drip bag dari lima origin Nusantara. Praktis diseduh di mana saja, cukup air panas.",
    price: 75000,
    stock: 50,
    featured: true,
    weight: 150,
  },
  {
    name: "Dripper Keramik V60",
    category: "alat-seduh",
    image: IMG("p-v60"),
    description: "Dripper keramik ukuran 02 dengan alur spiral untuk ekstraksi yang merata.",
    price: 185000,
    stock: 15,
    weight: 500,
  },
  {
    name: "French Press 600ml",
    category: "alat-seduh",
    image: IMG("p-french-press"),
    description: "French press kaca borosilikat dengan saringan stainless ganda. Kapasitas 600ml.",
    price: 245000,
    comparePrice: 275000,
    stock: 6,
    weight: 800,
  },
  {
    name: "Mug Keramik Wazzopi",
    category: "merchandise",
    image: IMG("p-mug"),
    description: "Mug keramik 350ml berwarna krem dengan finishing matte, nyaman digenggam.",
    price: 79000,
    stock: 40,
    weight: 400,
  },
];

const firstNames = ["Andi", "Budi", "Citra", "Dewi", "Eka", "Fajar", "Gita", "Hana", "Indra", "Joko", "Kartika", "Lina", "Made", "Nadia", "Oki", "Putri", "Rizky", "Sari", "Teguh", "Utami", "Vina", "Wahyu", "Yoga", "Zahra"];
const lastNames = ["Pratama", "Saputra", "Wijaya", "Lestari", "Hidayat", "Kusuma", "Nugroho", "Permata", "Santoso", "Rahmawati"];
const cities = [
  { city: "Jakarta Selatan", province: "DKI Jakarta", postal: "12190" },
  { city: "Bandung", province: "Jawa Barat", postal: "40115" },
  { city: "Surabaya", province: "Jawa Timur", postal: "60271" },
  { city: "Yogyakarta", province: "DI Yogyakarta", postal: "55281" },
  { city: "Denpasar", province: "Bali", postal: "80234" },
  { city: "Medan", province: "Sumatera Utara", postal: "20112" },
  { city: "Makassar", province: "Sulawesi Selatan", postal: "90111" },
  { city: "Semarang", province: "Jawa Tengah", postal: "50241" },
];
const shippings = [
  { name: "JNE Reguler", cost: 18000 },
  { name: "J&T Express", cost: 17000 },
  { name: "SiCepat BEST", cost: 25000 },
];

function rand<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("Membersihkan data...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.heroSlide.deleteMany();
  await prisma.setting.deleteMany();

  console.log("Membuat user...");
  const [adminPw, staffPw, custPw] = await Promise.all([
    bcrypt.hash("admin123", 10),
    bcrypt.hash("karyawan123", 10),
    bcrypt.hash("customer123", 10),
  ]);
  await prisma.user.create({ data: { name: "Administrator", email: "admin@wazzopi.com", password: adminPw, role: "ADMIN", phone: "081200000001" } });
  await prisma.user.create({ data: { name: "Karyawan Wazzopi", email: "karyawan@wazzopi.com", password: staffPw, role: "KARYAWAN", phone: "081200000002" } });

  const customers = [];
  customers.push(
    await prisma.user.create({
      data: {
        name: "Customer Demo",
        email: "customer@wazzopi.com",
        password: custPw,
        role: "CUSTOMER",
        phone: "081234567890",
        address: "Jl. Merdeka No. 10",
        city: "Bandung",
        province: "Jawa Barat",
        postalCode: "40115",
      },
    }),
  );
  for (let i = 0; i < 24; i++) {
    const name = `${firstNames[i]} ${rand(lastNames)}`;
    const loc = rand(cities);
    customers.push(
      await prisma.user.create({
        data: {
          name,
          email: `${firstNames[i].toLowerCase()}${i}@contoh.com`,
          password: custPw,
          role: "CUSTOMER",
          phone: `08${randInt(1000000000, 9999999999)}`,
          address: `Jl. ${rand(["Melati", "Kenanga", "Mawar", "Anggrek", "Cempaka"])} No. ${randInt(1, 120)}`,
          city: loc.city,
          province: loc.province,
          postalCode: loc.postal,
          createdAt: new Date(Date.now() - randInt(30, 420) * 86400000),
        },
      }),
    );
  }

  console.log("Membuat kategori & produk...");
  const catMap: Record<string, string> = {};
  for (const c of categories) {
    const created = await prisma.category.create({ data: c });
    catMap[c.slug] = created.id;
  }

  const createdProducts = [];
  for (const p of products) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const hasVariants = !!p.variants?.length;
    const created = await prisma.product.create({
      data: {
        name: p.name,
        slug,
        description: p.description,
        image: p.image,
        price: hasVariants ? Math.min(...p.variants!.map((v) => v.price)) : p.price,
        comparePrice: p.comparePrice,
        stock: hasVariants ? p.variants!.reduce((a, v) => a + v.stock, 0) : p.stock ?? 0,
        sku: `WZ-${slug.slice(0, 6).toUpperCase()}`,
        weight: p.weight ?? 250,
        hasVariants,
        featured: !!p.featured,
        categoryId: catMap[p.category],
        variants: hasVariants
          ? { create: p.variants!.map((v, i) => ({ ...v, sku: `WZ-${slug.slice(0, 6).toUpperCase()}-${i + 1}` })) }
          : undefined,
      },
      include: { variants: true },
    });
    createdProducts.push(created);
  }

  console.log("Membuat hero slides...");
  await prisma.heroSlide.createMany({
    data: [
      {
        title: "Satu Teguk, Banyak Cerita",
        subtitle: "Kopi pilihan dari dataran tinggi Nusantara, disangrai segar setiap minggu untuk menemani setiap ceritamu.",
        image: IMG("hero-1"),
        ctaLabel: "Belanja Sekarang",
        ctaLink: "/products",
        sortOrder: 1,
      },
      {
        title: "Espresso Blend Khas Wazzopi",
        subtitle: "Racikan arabika Gayo dan robusta Lampung dengan crema tebal dan manis karamel yang seimbang.",
        image: IMG("hero-2"),
        ctaLabel: "Lihat Espresso Blend",
        ctaLink: "/products/espresso-blend-wazzopi",
        sortOrder: 2,
      },
      {
        title: "Seduh Manual di Rumah",
        subtitle: "Lengkapi ritual pagimu dengan alat seduh pilihan dan biji kopi single origin terbaik.",
        image: IMG("hero-3"),
        ctaLabel: "Jelajahi Alat Seduh",
        ctaLink: "/products?category=alat-seduh",
        sortOrder: 3,
      },
    ],
  });

  console.log("Membuat order contoh (14 bulan)...");
  const now = Date.now();
  let counter = 0;
  for (let dayAgo = 420; dayAgo >= 0; dayAgo--) {
    // tren naik + variasi akhir pekan
    const base = 0.4 + (420 - dayAgo) / 420;
    const date = new Date(now - dayAgo * 86400000);
    const weekend = date.getDay() === 0 || date.getDay() === 6 ? 0.8 : 0;
    const count = Math.max(0, Math.round(base + weekend + Math.random() * 1.6 - 0.5));
    for (let n = 0; n < count; n++) {
      counter++;
      const cust = rand(customers);
      const ship = rand(shippings);
      const itemCount = randInt(1, 3);
      const items = [];
      const used = new Set<string>();
      for (let k = 0; k < itemCount; k++) {
        const prod = rand(createdProducts);
        if (used.has(prod.id)) continue;
        used.add(prod.id);
        const variant = prod.hasVariants ? rand(prod.variants) : null;
        const price = variant ? variant.price : prod.price;
        const quantity = randInt(1, 3);
        items.push({
          productId: prod.id,
          variantId: variant?.id,
          productName: prod.name,
          variantName: variant?.name,
          price,
          quantity,
          total: price * quantity,
        });
      }
      const subtotal = items.reduce((a, i) => a + i.total, 0);
      const shippingCost = subtotal >= 300000 ? 0 : ship.cost;
      const r = Math.random();
      let status = "COMPLETED";
      if (dayAgo <= 2) status = rand(["PENDING", "PAID", "PROCESSING"]);
      else if (dayAgo <= 6) status = rand(["PROCESSING", "SHIPPED", "COMPLETED"]);
      else if (r < 0.06) status = "CANCELLED";
      const created = new Date(date);
      created.setHours(randInt(7, 22), randInt(0, 59), randInt(0, 59));
      const ymd = `${String(created.getFullYear()).slice(2)}${String(created.getMonth() + 1).padStart(2, "0")}${String(created.getDate()).padStart(2, "0")}`;
      await prisma.order.create({
        data: {
          orderNo: `WZ${ymd}-${String(counter).padStart(5, "0")}`,
          userId: cust.id,
          customerName: cust.name,
          customerEmail: cust.email,
          customerPhone: cust.phone ?? "",
          address: cust.address ?? "",
          city: cust.city ?? "",
          province: cust.province ?? "",
          postalCode: cust.postalCode ?? "",
          shippingMethod: ship.name,
          shippingCost,
          paymentMethod: Math.random() < 0.75 ? "bank_transfer" : "cod",
          subtotal,
          total: subtotal + shippingCost,
          status,
          createdAt: created,
          items: { create: items },
        },
      });
    }
  }
  console.log(`Selesai. ${counter} order dibuat.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

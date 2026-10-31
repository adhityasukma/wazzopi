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
  { name: "Coffee Beans", slug: "coffee-beans", description: "Freshly roasted single-origin and signature artisan blends." },
  { name: "Ground Coffee", slug: "ground-coffee", description: "Precision ground coffee ready to brew for various methods." },
  { name: "Cold Brew & Drinks", slug: "cold-brew", description: "Slow-steeped 18-hour cold brew and ready-to-drink bottled coffee." },
  { name: "Brewing Gear", slug: "brewing-gear", description: "Manual brewing equipment, drippers, and accessories for home baristas." },
  { name: "Merchandise", slug: "merchandise", description: "Curated lifestyle gear, ceramic mugs, and apparel by Wazzopi." },
];

const products: SeedProduct[] = [
  {
    name: "Arabica Gayo Wine Process",
    category: "coffee-beans",
    image: IMG("p-arabica-gayo"),
    description:
      "Specialty Arabica coffee from Gayo Highlands, Aceh, fermented through an anaerobic natural wine process. Flavor notes: red wine, dark chocolate, and a lingering sweet stone-fruit finish.",
    price: 95000,
    featured: true,
    variants: [
      { name: "250g - Whole Bean", price: 95000, stock: 40 },
      { name: "250g - Ground", price: 95000, stock: 35 },
      { name: "500g - Whole Bean", price: 180000, stock: 20 },
      { name: "1kg - Whole Bean", price: 340000, stock: 10 },
    ],
  },
  {
    name: "Toraja Sapan Reserve",
    category: "coffee-beans",
    image: IMG("p-toraja"),
    description:
      "Highland Toraja Arabica from Sapan village, South Sulawesi. Full-bodied with low acidity, featuring complex notes of warm baking spices, brown sugar, and cinnamon.",
    price: 105000,
    featured: true,
    variants: [
      { name: "250g - Whole Bean", price: 105000, stock: 30 },
      { name: "500g - Whole Bean", price: 200000, stock: 15 },
    ],
  },
  {
    name: "Bali Kintamani Natural",
    category: "coffee-beans",
    image: IMG("p-kintamani"),
    description:
      "Naturally processed Arabica from Mount Batur volcanic slopes in Kintamani, Bali. Refreshing sweet orange citrus acidity paired with palm sugar sweetness.",
    price: 98000,
    featured: true,
    variants: [
      { name: "250g - Whole Bean", price: 98000, stock: 28 },
      { name: "500g - Whole Bean", price: 185000, stock: 12 },
    ],
  },
  {
    name: "Flores Bajawa",
    category: "coffee-beans",
    image: IMG("p-arabica-gayo"),
    description: "Shade-grown volcanic Arabica from Bajawa plateau, Flores. Balanced medium body with notes of roasted hazelnuts, sweet milk chocolate, and floral hints.",
    price: 92000,
    variants: [
      { name: "250g - Whole Bean", price: 92000, stock: 25 },
      { name: "500g - Whole Bean", price: 175000, stock: 8 },
    ],
  },
  {
    name: "Papua Wamena Organic",
    category: "coffee-beans",
    image: IMG("p-toraja"),
    description: "Organically grown Arabica in Baliem Valley, Papua. Exceptionally smooth body, delicate floral notes, and clean nutty chocolate finish.",
    price: 110000,
    variants: [
      { name: "250g - Whole Bean", price: 110000, stock: 20 },
      { name: "500g - Whole Bean", price: 210000, stock: 10 },
    ],
  },
  {
    name: "Wazzopi Signature Espresso Blend",
    category: "coffee-beans",
    image: IMG("p-espresso-blend"),
    description: "Our signature roastery blend combining Gayo Arabica and fine Java Robusta. Produces dense hazelnut crema, bold dark cocoa body, and sweet caramel finish. Ideal for espresso & milk drinks.",
    price: 85000,
    featured: true,
    variants: [
      { name: "250g - Whole Bean", price: 85000, stock: 45 },
      { name: "250g - Fine Ground", price: 85000, stock: 30 },
      { name: "1kg - Whole Bean", price: 310000, stock: 12 },
    ],
  },
  {
    name: "Cold Brew Original 250ml",
    category: "cold-brew",
    image: IMG("p-cold-brew"),
    description: "Pure single-origin Arabica cold brewed for 18 hours. Exceptionally smooth, naturally sweet, low-acid, and refreshing with zero added sugar.",
    price: 28000,
    stock: 80,
    featured: true,
    weight: 300,
  },
  {
    name: "Cold Brew Oat Latte 250ml",
    category: "cold-brew",
    image: IMG("p-cold-brew"),
    description: "Harmonious blend of slow-steeped cold brew, creamy oat milk, and organic palm sugar. Silky, dairy-free, and delicious.",
    price: 32000,
    comparePrice: 35000,
    stock: 70,
    weight: 300,
  },
  {
    name: "Heritage Drip Bag Box (10 Packs)",
    category: "ground-coffee",
    image: IMG("p-drip-bag"),
    description: "Ten convenient single-serve pour-over drip bags featuring five distinct Indonesian origins. Enjoy specialty coffee anywhere, anytime with just hot water.",
    price: 75000,
    stock: 50,
    featured: true,
    weight: 150,
  },
  {
    name: "Ceramic V60 Dripper 02",
    category: "brewing-gear",
    image: IMG("p-v60"),
    description: "High-fired ceramic pour-over cone dripper with spiral interior ribs for optimal water flow and balanced extraction. Size 02 (1-4 cups).",
    price: 185000,
    stock: 15,
    weight: 500,
  },
  {
    name: "Borosilicate French Press 600ml",
    category: "brewing-gear",
    image: IMG("p-french-press"),
    description: "Heat-resistant borosilicate glass coffee press with dual-layer stainless steel micro-filter. Clean sediment-free full-bodied brew.",
    price: 245000,
    comparePrice: 275000,
    stock: 6,
    weight: 800,
  },
  {
    name: "Artisan Ceramic Mug 350ml",
    category: "merchandise",
    image: IMG("p-mug"),
    description: "Handcrafted stoneware coffee mug finished in matte charcoal espresso glaze. Comfortable ergonomic handle and heat retention.",
    price: 85000,
    stock: 35,
    weight: 400,
  },
];

const firstNames = [
  "Alexander", "Emily", "Michael", "Sophia", "Daniel", "Olivia",
  "James", "Isabella", "William", "Mia", "Benjamin", "Charlotte",
  "Lucas", "Amelia", "Henry", "Harper", "Ethan", "Evelyn",
  "Oliver", "Abigail", "Sebastian", "Emily", "Jack", "Ella"
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller",
  "Davis", "Wilson", "Anderson", "Taylor", "Thomas", "Moore"
];

const cities = [
  { city: "Jakarta Selatan", province: "DKI Jakarta", postal: "12190" },
  { city: "Bandung", province: "Jawa Barat", postal: "40115" },
  { city: "Surabaya", province: "Jawa Timur", postal: "60271" },
  { city: "Denpasar", province: "Bali", postal: "80232" },
  { city: "Yogyakarta", province: "DI Yogyakarta", postal: "55281" },
  { city: "Medan", province: "Sumatera Utara", postal: "20111" },
  { city: "Semarang", province: "Jawa Tengah", postal: "50134" },
  { city: "Tangerang", province: "Banten", postal: "15111" },
];

const shippings = [
  { name: "Standard Delivery (2-3 Days)", cost: 18000 },
  { name: "Express Courier (Next Day)", cost: 25000 },
  { name: "Instant Same-Day", cost: 35000 },
];

function rand<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("Cleaning existing database records...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.heroSlide.deleteMany();
  await prisma.setting.deleteMany();

  console.log("Creating default users (Admin, Staff, Customer)...");
  const [adminPw, staffPw, custPw] = await Promise.all([
    bcrypt.hash("admin123", 10),
    bcrypt.hash("staff123", 10),
    bcrypt.hash("customer123", 10),
  ]);

  await prisma.user.create({
    data: {
      name: "Administrator",
      email: "admin@wazzopi.com",
      password: adminPw,
      role: "ADMIN",
      phone: "+1234567890",
    },
  });

  await prisma.user.create({
    data: {
      name: "Store Staff",
      email: "staff@wazzopi.com",
      password: staffPw,
      role: "KARYAWAN",
      phone: "+1234567891",
    },
  });

  const customers = [];
  customers.push(
    await prisma.user.create({
      data: {
        name: "Demo Customer",
        email: "customer@wazzopi.com",
        password: custPw,
        role: "CUSTOMER",
        phone: "+1234567892",
        address: "742 Evergreen Terrace",
        city: "Jakarta Selatan",
        province: "DKI Jakarta",
        postalCode: "12190",
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
          email: `${firstNames[i].toLowerCase()}${i}@example.com`,
          password: custPw,
          role: "CUSTOMER",
          phone: `+628${randInt(100000000, 999999999)}`,
          address: `Pine Avenue Suite ${randInt(1, 150)}`,
          city: loc.city,
          province: loc.province,
          postalCode: loc.postal,
          createdAt: new Date(Date.now() - randInt(30, 420) * 86400000),
        },
      }),
    );
  }

  console.log("Creating categories & products...");
  const catMap = new Map<string, string>();
  for (const c of categories) {
    const record = await prisma.category.create({ data: c });
    catMap.set(c.slug, record.id);
  }

  const createdProducts = [];
  for (const p of products) {
    const categoryId = catMap.get(p.category);
    if (!categoryId) continue;
    const slug = p.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const created = await prisma.product.create({
      data: {
        name: p.name,
        slug,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice,
        stock: p.stock ?? 100,
        featured: p.featured ?? false,
        image: p.image,
        weight: p.weight ?? 250,
        hasVariants: Boolean(p.variants?.length),
        categoryId,
        variants: p.variants ? { create: p.variants } : undefined,
      },
      include: { variants: true },
    });
    createdProducts.push(created);
  }

  console.log("Creating hero slider banners...");
  await prisma.heroSlide.createMany({
    data: [
      {
        title: "One Sip, Endless Stories",
        subtitle: "Handpicked specialty coffee from pristine heritage farms, roasted fresh every week.",
        image: IMG("hero-1"),
        ctaLabel: "Shop Fresh Beans",
        ctaLink: "/products",
        sortOrder: 1,
      },
      {
        title: "Artisan Espresso Blend",
        subtitle: "A balanced craft blend of sweet Gayo Arabica and rich Java Robusta with persistent crema.",
        image: IMG("hero-2"),
        ctaLabel: "View Espresso Blend",
        ctaLink: "/products/wazzopi-signature-espresso-blend",
        sortOrder: 2,
      },
      {
        title: "Manual Home Brewing",
        subtitle: "Elevate your morning coffee routine with premium drippers, presses, and single origins.",
        image: IMG("hero-3"),
        ctaLabel: "Explore Gear",
        ctaLink: "/products?category=brewing-gear",
        sortOrder: 3,
      },
    ],
  });

  console.log("Generating sample order history for analytics...");
  const now = Date.now();
  let counter = 0;
  for (let dayAgo = 420; dayAgo >= 0; dayAgo--) {
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
          paymentMethod: Math.random() < 0.5 ? "stripe" : Math.random() < 0.8 ? "paypal" : "bank_transfer",
          subtotal,
          total: subtotal + shippingCost,
          status,
          createdAt: created,
          items: { create: items },
        },
      });
    }
  }

  console.log(`Database seeding completed successfully. Generated ${counter} sample orders.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

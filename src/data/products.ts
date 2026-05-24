import { Product } from '../types';

export const AMAZON_PRODUCTS: Product[] = [
  {
    id: 1,
    title: "AuraSound Over-Ear Wireless ANC Headphones - Carbon Black",
    category: "Electronics",
    description: "Experience music in pure, uninterrupted state with active noise cancellation, deep bass, and comfortable memory foam earmuffs. Features rapid-charge USB-C yielding 40 hours of playtime.",
    price: 149.99,
    originalPrice: 199.99,
    discountPercentage: 25,
    rating: 4.8,
    reviewCount: 3421,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d35e?auto=format&fit=crop&w=600&q=80",
    isBestSeller: true,
    isPrime: true,
    stock: 14,
    specs: {
      "Connectivity": "Bluetooth 5.2 / Aux Mode",
      "Battery Life": "Up to 48 Hours with ANC Off",
      "ANC Depth": "Up to -38dB silencing",
      "Drivers": "40mm Bio-cellulose drivers"
    }
  },
  {
    id: 2,
    title: "SpectraWatch OLED Pro Smartwatch & Fitness Tracker",
    category: "Electronics",
    description: "Your health concierge. Features always-on OLED ambient screen, real-time stress monitoring, ECG, blood oxygen estimation, and 5-ATM swim-proofing. Seamless iOS & Android pairing.",
    price: 189.00,
    originalPrice: 249.00,
    discountPercentage: 24,
    rating: 4.6,
    reviewCount: 1982,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    isDealOfTheDay: true,
    isPrime: true,
    stock: 8,
    specs: {
      "Display": "1.78\" Always-On Curved LTPO OLED",
      "Battery Life": "7 Days standard active use",
      "Sensors": "Heart rate, Stress, SpO2, Accelerometer",
      "Waterproof": "50m Depth (5 ATM Rating)"
    }
  },
  {
    id: 3,
    title: "SummitBook Elite Ultra-Thin 14\" Developer Laptop",
    category: "Electronics",
    description: "Supercharged for professional workloads. Equipped with robust computing architecture, 16GB DDR5 RAM, and 512GB PCIe Gen4 SSD. Encased in a beautiful aerospace-grade aluminum chassis.",
    price: 899.00,
    originalPrice: 1199.00,
    discountPercentage: 25,
    rating: 4.9,
    reviewCount: 456,
    image: "https://images.unsplash.com/photo-1496181130207-102410a51967?auto=format&fit=crop&w=600&q=80",
    isBestSeller: false,
    isPrime: true,
    stock: 5,
    specs: {
      "Processor": "High-Efficiency Quad-Core Max Boost",
      "Memory": "16GB LPDDR5 Dual-Channel",
      "Storage": "512GB M.2 NVMe SSD",
      "Weight": "1.24 Kilograms"
    }
  },
  {
    id: 4,
    title: "TactilePro Custom Mechanical Backlit Keyboard (Lubed)",
    category: "Electronics",
    description: "A typist's dream. Standard hot-swappable tactile switches, pre-lubed stabilizers, double-shot PBT keycaps and sound dampening foam lines. Beautiful customizable RGB spectrum patterns.",
    price: 79.50,
    originalPrice: 99.00,
    discountPercentage: 20,
    rating: 4.7,
    reviewCount: 1215,
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80",
    isPrime: true,
    stock: 19,
    specs: {
      "Layout": "75% Minimal Tenkeyless Layout",
      "Switch Type": "Pre-lubed Brown Linear Tactile",
      "Case Material": "Textured Polycarbonate & Metal plate",
      "Interface": "Detachable Coiled Type-C Cable"
    }
  },
  {
    id: 5,
    title: "Prestige Barista Automatic Espresso & Cappuccino Maker",
    category: "Home & Kitchen",
    description: "Drip or pressure style, bring premium cafe culture home. Features a PID thermal controller tracking gold-standard pressure levels, built-in milk frothing wand, and dedicated single-touch americano buttons.",
    price: 299.00,
    originalPrice: 399.00,
    discountPercentage: 25,
    rating: 4.5,
    reviewCount: 894,
    image: "https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?auto=format&fit=crop&w=600&q=80",
    isBestSeller: true,
    isPrime: false,
    stock: 3,
    specs: {
      "Pump Pressure": "15-Bar Italian Electromagnetic Pump",
      "Reservoir Specs": "2.2 Liters Detachable Tank",
      "Heating Elements": "Thermoblock Dual-Pipe System",
      "Frame Type": "Brushed Stainless Metal Alloys"
    }
  },
  {
    id: 6,
    title: "Velocity Aero-K6 Lightweight Running Sneakers",
    category: "Fashion",
    description: "Run on clouds. Engineered with breathable mesh weaving, high-absorption responsive foam inserts, and reactive rubber grid treading for extreme shock containment and stability.",
    price: 64.00,
    originalPrice: 80.00,
    discountPercentage: 20,
    rating: 4.4,
    reviewCount: 1530,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    isBestSeller: false,
    isPrime: true,
    stock: 22,
    specs: {
      "Arch Profile": "Standard Adaptive Mid-arch support",
      "Fabric": "Recycled Aero-weave yarns",
      "Cushioning": "Airflow cell shock protection",
      "Weight": "280g per shoe"
    }
  },
  {
    id: 7,
    title: "Horizon Classic Retro Acetate Frame polarized Sunglasses",
    category: "Fashion",
    description: "Protection meets iconic vintage aesthetics. Offers absolute 100% UV400 radiation shielding with premium scratch-resistant polarized polycarbonate lenses and robust reinforcement hinges.",
    price: 36.00,
    originalPrice: 45.00,
    discountPercentage: 20,
    rating: 4.7,
    reviewCount: 228,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80",
    isDealOfTheDay: true,
    isPrime: true,
    stock: 45,
    specs: {
      "Lens Guard": "UV400 Polarized Protection",
      "Hinges": "Dual-Spring Stainless Joints",
      "Bridge Width": "21 Millimeters",
      "Case": "Includes leather magnetic case and cloth"
    }
  },
  {
    id: 8,
    title: "EvoShield Double-Stitched Cotton Comfort Hoodie",
    category: "Fashion",
    description: "The ultimate cold-weather layering item. Made with ultra-soft organic ring-spun cotton fleece lining. Features detailed reinforced cuff ribbing and kangaroo deep utility pockets.",
    price: 44.00,
    originalPrice: 55.00,
    discountPercentage: 20,
    rating: 4.6,
    reviewCount: 974,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80",
    isBestSeller: true,
    isPrime: true,
    stock: 2, // Low stock warning
    specs: {
      "Material blend": "85% Organic Cotton, 15% Polyester",
      "Fabric Weight": "400 GSM heavy-woven feel",
      "Safe Care": "Machine Wash warm / Hang to dry",
      "Sizing": "Relaxed comfort fit"
    }
  },
  {
    id: 9,
    title: "PureFlow HEPA H13 Smart Air Purifier & Ionizer",
    category: "Home & Kitchen",
    description: "Eliminates 99.97% of airborne mold spores, pet dander, common allergens, and kitchen fumes. Ideal for small rooms and offices. Integrates beautiful real-time air quality indicator halo rings.",
    price: 119.00,
    originalPrice: 149.00,
    discountPercentage: 20,
    rating: 4.8,
    reviewCount: 651,
    image: "https://images.unsplash.com/photo-1585133036326-e2fc482a2119?auto=format&fit=crop&w=600&q=80",
    isPrime: true,
    stock: 15,
    specs: {
      "Coverage": "Up to 340 sq ft hourly filtration",
      "Filter Class": "Original Medical Grade HEPA H13",
      "Noise Level": "22dB Sleep Mode ultra-silent",
      "Sensors": "Dynamic Laser Particulate PM2.5 scanner"
    }
  },
  {
    id: 10,
    title: "ProCoder Thermal Ceramic Minimalist Coffee Mug",
    category: "Home & Kitchen",
    description: "Keep your workspace drinks warm during long compilation routines. Features thick double-fire clay, comfort thumb rest, and high-efficiency thermal conservation glazes with scratch-resistant matte.",
    price: 18.00,
    originalPrice: 22.50,
    discountPercentage: 20,
    rating: 4.9,
    reviewCount: 1580,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
    isPrime: true,
    stock: 60,
    specs: {
      "Capacity": "16 Fluid Ounces / 475ml",
      "Compatibility": "Dishwasher & Microwave immune",
      "Base Core": "Non-slip integrated cork base",
      "Lid Style": "Splash-proof silicone trigger slide"
    }
  },
  {
    id: 11,
    title: "Software Architecture & System Design Blueprint (Hardcover)",
    category: "Books",
    description: "The gold-standard handbook detailing modern microservices, event streams, real-time sync systems, message brokers, caching nodes, and reliable cloud deployments. Written by industry leaders.",
    price: 39.99,
    originalPrice: 49.99,
    discountPercentage: 20,
    rating: 4.9,
    reviewCount: 512,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    isBestSeller: true,
    isPrime: true,
    stock: 12,
    specs: {
      "Format": "Hardcover Book / Case Laminate",
      "Pages Count": "640 Fully illustrated pages",
      "Audience": "Senior SWE, Cloud Architect, Technical Lead",
      "Publisher": "O'Reilly & Academic Pro"
    }
  },
  {
    id: 12,
    title: "Titanium SoundWave ANC Waterproof Earbuds",
    category: "Electronics",
    description: "Premium audiophile grade earbuds featuring customized magnetic graphene transducers. Achieves superb deep sub-bass and crisp stellar trebles. IPX7 waterproof rating.",
    price: 89.99,
    originalPrice: 119.99,
    discountPercentage: 25,
    rating: 4.7,
    reviewCount: 439,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80",
    isBestSeller: false,
    isPrime: true,
    stock: 25,
    specs: {
      "Impedance": "32 Ohms Graphene film",
      "Codec Support": "AAC, SBC, aptX Adaptive",
      "Playback Time": "8h Earbud / 30h with charging case",
      "Waterproofing": "IPX7 Hydrophobic Nano-coating"
    }
  },
  {
    id: 13,
    title: "Projector Nebula Core Ultra-HD Portable Cinema",
    category: "Electronics",
    description: "Turn any dark room into a state-of-the-art cinematic theatre. Emits 800 ANSI Lumens of HDR10 brilliance. Integrates dual Dolby Digital audio modules and direct HDMI streaming feeds.",
    price: 349.00,
    originalPrice: 499.00,
    discountPercentage: 30,
    rating: 4.8,
    reviewCount: 165,
    image: "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=600&q=80",
    isDealOfTheDay: true,
    isPrime: true,
    stock: 6,
    specs: {
      "Native Resolution": "1920x1080 (Supports 4K Decode)",
      "Brightness Output": "800 ANSI Lumens projection",
      "Contrast Ratio": "4000:1 Dynamic depth",
      "Operating System": "Android Smart TV ecosystem"
    }
  },
  {
    id: 14,
    title: "AeroTech Breathable Active Athletic Windbreaker",
    category: "Fashion",
    description: "Engineered ultra-light windbreaker designed specifically for high-mobility activities. Complete weather-repellent membrane, custom ventilation ports, and zipper safe compartments.",
    price: 52.00,
    originalPrice: 65.00,
    discountPercentage: 20,
    rating: 4.5,
    reviewCount: 78,
    image: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=600&q=80",
    isBestSeller: true,
    isPrime: true,
    stock: 12,
    specs: {
      "Material Composition": "100% Ripstop Matte Nylon yarn",
      "Pockets": "2 Waterproof handwarmer / 1 Chest utility",
      "Weather resistance": "Durable Water Repellent (DWR) finish",
      "Ventilation": "Underarm zipper mesh openings"
    }
  },
  {
    id: 15,
    title: "Urban Minimalist Heavy-Duty Waterproof Backpack",
    category: "Fashion",
    description: "Minimalist backpack featuring ergonomic weight-dispersal lumbar structures and secure hidden luggage strap channels. Protect laptop configurations in deep velvet layered pockets safely.",
    price: 68.00,
    originalPrice: 85.00,
    discountPercentage: 20,
    rating: 4.8,
    reviewCount: 912,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    isPrime: true,
    stock: 18,
    specs: {
      "Laptop fitting": "Sized up to 16-inch laptops",
      "Volume capacity": "24 Liters expandability",
      "Outer layer": "900D Ballistic Tech polyester weave",
      "Ergonomics": "S-curve contoured shoulder strap padding"
    }
  },
  {
    id: 16,
    title: "VividMojo Smart Ultrasonic Silent Humidifier Aura",
    category: "Home & Kitchen",
    description: "Quietly adjust living room moisture levels with this ultrasonic vapor generator. Features an automatic moisture sensor tracking optimal respiratory comfort and color-changing LED halos.",
    price: 49.00,
    originalPrice: 59.00,
    discountPercentage: 17,
    rating: 4.6,
    reviewCount: 204,
    image: "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=600&q=80",
    isBestSeller: false,
    isPrime: true,
    stock: 30,
    specs: {
      "Mist Delivery": "Up to 280ml per hour adjustable output",
      "Tank Volume": "3.5 Liters (Up to 24h operation)",
      "Noise profile": "Failsafe whisper quiet (<24dB)",
      "Safety mechanisms": "Auto-shutoff on reservoir drainage"
    }
  },
  {
    id: 17,
    title: "ChefPro Precision Tempered Glass Kitchen Food Scale",
    category: "Home & Kitchen",
    description: "Perfect cooking proportions. High-precision weight sensors calculate grams, ounces, milliliters and pounds immediately. Water-resistant tempered glass surface makes wipes easy.",
    price: 19.99,
    originalPrice: 24.99,
    discountPercentage: 20,
    rating: 4.7,
    reviewCount: 1420,
    image: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=600&q=80",
    isBestSeller: true,
    isPrime: true,
    stock: 45,
    specs: {
      "Precision step": "Accurate tracking down to 1g / 0.05oz",
      "Weight capacity": "Up to 11 lbs / 5 kilograms max load",
      "Display layout": "Backlit LCD digits",
      "Tare mode": "Zero-out subtract container weight"
    }
  },
  {
    id: 18,
    title: "Designing Secure APIs & Web Ecosystems (Hardcover)",
    category: "Books",
    description: "Learn professional architecture, modern JWT authentication strategies, Rate-limiting, DDoS mitigation techniques, and standard REST/GraphQL structures. Heavy focus on full stack security.",
    price: 47.99,
    originalPrice: 59.99,
    discountPercentage: 20,
    rating: 4.9,
    reviewCount: 231,
    image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=600&q=80",
    isBestSeller: false,
    isPrime: true,
    stock: 15,
    specs: {
      "Format type": "Hardcover luxury publication",
      "Total Page count": "512 authoritative pages",
      "Subject guide": "TypeScript, Go, Rust micro-architectures",
      "Included assets": "Complimentary digital source access"
    }
  }
];

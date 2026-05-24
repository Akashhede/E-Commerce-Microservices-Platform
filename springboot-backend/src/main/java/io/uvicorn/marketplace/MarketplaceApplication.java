package io.uvicorn.marketplace;

import io.uvicorn.marketplace.model.Product;
import io.uvicorn.marketplace.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@SpringBootApplication
public class MarketplaceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MarketplaceApplication.class, args);
    }

    /**
     * Set up global CORS mappings to permit modern React frontend requests
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
            }
        };
    }

    /**
     * Seeds initial Uvicorn marketplace catalog dataset if database is empty on start
     */
    @Bean
    public CommandLineRunner demoDatabaseSeeder(ProductRepository productRepository) {
        return args -> {
            if (productRepository.count() == 0) {
                System.out.println("⏳ Seeding initial database tables with Uvicorn premium product listings...");

                // Earbuds product
                Product earbuds = new Product();
                earbuds.setId(12L);
                earbuds.setTitle("Titanium SoundWave ANC Waterproof Earbuds");
                earbuds.setCategory("Electronics");
                earbuds.setDescription("Premium audiophile grade earbuds featuring customized magnetic graphene transducers. Achieves superb deep sub-bass and crisp stellar trebles. IPX7 waterproof rating.");
                earbuds.setPrice(89.99);
                earbuds.setOriginalPrice(119.99);
                earbuds.setDiscountPercentage(25.0);
                earbuds.setRating(4.7);
                earbuds.setReviewCount(439);
                earbuds.setImage("https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80");
                earbuds.setIsBestSeller(false);
                earbuds.setIsPrime(true);
                earbuds.setIsDealOfTheDay(false);
                earbuds.setStock(25);
                
                Map<String, String> earbudSpecs = new HashMap<>();
                earbudSpecs.put("Impedance", "32 Ohms Graphene film");
                earbudSpecs.put("Codec Support", "AAC, SBC, aptX Adaptive");
                earbudSpecs.put("Playback Time", "8h Earbud / 30h with charging case");
                earbudSpecs.put("Waterproofing", "IPX7 Hydrophobic Nano-coating");
                earbuds.setSpecs(earbudSpecs);
                
                productRepository.save(earbuds);

                // Projector product
                Product projector = new Product();
                projector.setId(13L);
                projector.setTitle("Projector Nebula Core Ultra-HD Portable Cinema");
                projector.setCategory("Electronics");
                projector.setDescription("Turn any dark room into a state-of-the-art cinematic theatre. Emits 800 ANSI Lumens of HDR10 brilliance. Integrates dual Dolby Digital audio modules.");
                projector.setPrice(349.00);
                projector.setOriginalPrice(499.00);
                projector.setDiscountPercentage(30.0);
                projector.setRating(4.8);
                projector.setReviewCount(165);
                projector.setImage("https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=600&q=80");
                projector.setIsBestSeller(false);
                projector.setIsPrime(true);
                projector.setIsDealOfTheDay(true);
                projector.setStock(6);

                Map<String, String> projSpecs = new HashMap<>();
                projSpecs.put("Native Resolution", "1920x1080 (Supports 4K Decode)");
                projSpecs.put("Brightness Output", "800 ANSI Lumens projection");
                projSpecs.put("Operating System", "Android Smart TV ecosystem");
                projector.setSpecs(projSpecs);

                productRepository.save(projector);

                // Backpack product
                Product backpack = new Product();
                backpack.setId(15L);
                backpack.setTitle("Urban Minimalist Heavy-Duty Waterproof Backpack");
                backpack.setCategory("Fashion");
                backpack.setDescription("Minimalist backpack featuring ergonomic weight-dispersal lumbar structures and secure hidden luggage strap channels. Protect laptops in deep velvet pockets.");
                backpack.setPrice(68.00);
                backpack.setOriginalPrice(85.00);
                backpack.setDiscountPercentage(20.0);
                backpack.setRating(4.8);
                backpack.setReviewCount(912);
                backpack.setImage("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80");
                backpack.setIsBestSeller(true);
                backpack.setIsPrime(true);
                backpack.setIsDealOfTheDay(false);
                backpack.setStock(18);

                Map<String, String> backSpecs = new HashMap<>();
                backSpecs.put("Laptop fitting", "Sized up to 16-inch laptops");
                backSpecs.put("Volume capacity", "24 Liters expandability");
                backSpecs.put("Outer layer", "900D Ballistic Tech polyester weave");
                backpack.setSpecs(backSpecs);

                productRepository.save(backpack);

                System.out.println("✅ Spring Boot Context fully prepared with " + productRepository.count() + " indexed product entities.");
            }
        };
    }
}

package io.uvicorn.marketplace.controller;

import io.uvicorn.marketplace.model.Product;
import io.uvicorn.marketplace.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductRepository productRepository;

    @Autowired
    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Retrieve all catalog items or filter them by category or search queries
     */
    @GetMapping
    public ResponseEntity<List<Product>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean bestseller) {
        
        if (category != null && !category.equalsIgnoreCase("All")) {
            return ResponseEntity.ok(productRepository.findByCategoryIgnoreCase(category));
        }
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(productRepository.findByTitleContainingIgnoreCase(search));
        }
        if (bestseller != null && bestseller) {
            return ResponseEntity.ok(productRepository.findByIsBestSellerTrue());
        }
        
        return ResponseEntity.ok(productRepository.findAll());
    }

    /**
     * Retrieve details of a single product item
     */
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Optional<Product> product = productRepository.findById(id);
        return product.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Create or edit a product entity (admin utility support)
     */
    @PostMapping
    public ResponseEntity<Product> saveProduct(@RequestBody Product product) {
        Product saved = productRepository.save(product);
        return ResponseEntity.ok(saved);
    }
}

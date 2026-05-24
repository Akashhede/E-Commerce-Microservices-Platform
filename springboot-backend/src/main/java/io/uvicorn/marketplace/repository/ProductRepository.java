package io.uvicorn.marketplace.repository;

import io.uvicorn.marketplace.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    /**
     * Find products belonging to a specific department or category
     */
    List<Product> findByCategoryIgnoreCase(String category);

    /**
     * Search products whose titles contain the search string (case insensitive)
     */
    List<Product> findByTitleContainingIgnoreCase(String searchWord);
    
    /**
     * Fetch products marked as bestseller
     */
    List<Product> findByIsBestSellerTrue();
}

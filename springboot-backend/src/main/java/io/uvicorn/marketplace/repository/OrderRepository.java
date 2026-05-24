package io.uvicorn.marketplace.repository;

import io.uvicorn.marketplace.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    
    /**
     * Find order histories sorted by timestamp date desc
     */
    List<Order> findAllByOrderByDateDesc();
}

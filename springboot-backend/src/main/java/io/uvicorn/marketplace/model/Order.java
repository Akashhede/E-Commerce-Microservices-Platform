package io.uvicorn.marketplace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customer_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @Column(nullable = false, length = 100)
    private String id; // Matches UUID generated or provided by the client

    @Column(nullable = false)
    private String date;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "total_savings")
    private Double totalSavings;

    @Column(name = "payment_method", nullable = false)
    private String paymentMethod; // "cod" | "upi" | "card"

    @Column(name = "upi_handle")
    private String upiHandle;

    @Embedded
    private ShippingDetails shippingDetails;

    @Column(nullable = false)
    private String status = "placed"; // "pending" | "placed" | "shipped" | "out_for_delivery" | "delivered"

    @Column(name = "current_tracking_step")
    private Integer currentTrackingStep = 1;

    // Simple JSON-like or comma-separated representation of line items for simplicity in H2 demo environments
    @Column(name = "serialized_items", columnDefinition = "TEXT")
    private String serializedItems;

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShippingDetails {
        @Column(name = "full_name", nullable = false)
        private String fullName;

        @Column(nullable = false)
        private String address;

        @Column(nullable = false)
        private String city;

        @Column(nullable = false)
        private String state;

        @Column(name = "postal_code", nullable = false)
        private String postalCode;

        private String phone;
    }
}

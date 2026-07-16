package com.example.fashionstore.repository;

import com.example.fashionstore.entity.CustomerCoupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerCouponRepository extends JpaRepository<CustomerCoupon, Long> {
    List<CustomerCoupon> findByCustomerId(Long customerId);
    Optional<CustomerCoupon> findByCustomerIdAndCouponId(Long customerId, Long couponId);
    boolean existsByCustomerIdAndCouponId(Long customerId, Long couponId);
}

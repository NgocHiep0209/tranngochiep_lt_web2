package com.example.fashionstore.service;

import com.example.fashionstore.entity.Category;
import com.example.fashionstore.entity.Product;
import com.example.fashionstore.exception.ResourceNotFoundException;
import com.example.fashionstore.repository.CategoryRepository;
import com.example.fashionstore.repository.OrderDetailRepository;
import com.example.fashionstore.repository.ProductRepository;
import com.example.fashionstore.repository.ProductSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final OrderDetailRepository orderDetailRepository;

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Optional<Product> findById(Long id) {
        return productRepository.findById(id);
    }

    public List<Product> findByCategoryId(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    public List<Product> search(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword);
    }

    public Product save(Product product) {
        if (product.getCategory() != null && product.getCategory().getId() != null) {
            Category category = categoryRepository.findById(product.getCategory().getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy danh mục với id: " + product.getCategory().getId()));
            product.setCategory(category);
        }
        return productRepository.save(product);
    }

    public Product update(Long id, Product updated) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với id: " + id));

        existing.setName(updated.getName());
        existing.setPrice(updated.getPrice());
        existing.setOldPrice(updated.getOldPrice());
        existing.setStockQuantity(updated.getStockQuantity());
        existing.setSize(updated.getSize());
        existing.setColor(updated.getColor());
        existing.setMaterial(updated.getMaterial());
        existing.setImageUrl(updated.getImageUrl());
        existing.setDescription(updated.getDescription());

        if (updated.getCategory() != null && updated.getCategory().getId() != null) {
            Category category = categoryRepository.findById(updated.getCategory().getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy danh mục với id: " + updated.getCategory().getId()));
            existing.setCategory(category);
        }

        return productRepository.save(existing);
    }

    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với id: " + id);
        }
        productRepository.deleteById(id);
    }
    /**
     * Lọc & sắp xếp nâng cao cho trang sản phẩm.
     * sort chấp nhận: "newest" (mặc định), "price_asc", "price_desc", "bestselling"
     */
    public Page<Product> findPaged(int page, int size, Long categoryId, String keyword,
                                    Double minPrice, Double maxPrice, String sort) {
        var spec = ProductSpecification.filter(categoryId, keyword, minPrice, maxPrice);

        // "Bán chạy nhất" cần sắp xếp theo tổng số lượng đã bán (tính từ order_details),
        // không phải một cột có sẵn trên bảng products nên phải gộp dữ liệu ở tầng service.
        if ("bestselling".equalsIgnoreCase(sort)) {
            return findPagedBestSelling(spec, page, size);
        }

        Sort sortOrder = switch (sort == null ? "" : sort) {
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            default -> Sort.by(Sort.Direction.DESC, "id"); // "newest": id lớn nhất = tạo gần đây nhất
        };

        Pageable pageable = PageRequest.of(page, size, sortOrder);
        return productRepository.findAll(spec, pageable);
    }

    private Page<Product> findPagedBestSelling(org.springframework.data.jpa.domain.Specification<Product> spec,
                                                int page, int size) {
        // Danh sách productId theo thứ tự bán chạy giảm dần
        Map<Long, Long> soldQtyByProductId = new LinkedHashMap<>();
        orderDetailRepository.findBestSellingProductIds()
                .forEach(row -> soldQtyByProductId.put(row.getProductId(), row.getTotalQty()));

        // Lấy toàn bộ sản phẩm khớp bộ lọc (category/keyword/khoảng giá), không phân trang ở DB
        List<Product> filtered = productRepository.findAll(spec);

        // Sản phẩm có lượt bán lên trước (theo thứ tự đã bán), sản phẩm chưa bán ai đưa xuống cuối
        filtered.sort(Comparator.comparingLong(
                (Product p) -> soldQtyByProductId.getOrDefault(p.getId(), 0L)
        ).reversed());

        int total = filtered.size();
        int from = Math.min(page * size, total);
        int to = Math.min(from + size, total);
        List<Product> pageContent = new ArrayList<>(filtered.subList(from, to));

        return new PageImpl<>(pageContent, PageRequest.of(page, size), total);
    }
}

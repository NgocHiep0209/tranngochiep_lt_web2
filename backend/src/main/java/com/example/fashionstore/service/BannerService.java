package com.example.fashionstore.service;

import com.example.fashionstore.entity.Banner;
import com.example.fashionstore.exception.ResourceNotFoundException;
import com.example.fashionstore.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BannerService {

    private final BannerRepository bannerRepository;

    public List<Banner> findAll() {
        return bannerRepository.findAllByOrderByDisplayOrderAsc();
    }

    public List<Banner> findActive() {
        return bannerRepository.findByActiveTrueOrderByDisplayOrderAsc();
    }

    public Optional<Banner> findById(Long id) {
        return bannerRepository.findById(id);
    }

    public Banner save(Banner banner) {
        if (banner.getDisplayOrder() == null) {
            banner.setDisplayOrder(0);
        }
        if (banner.getActive() == null) {
            banner.setActive(true);
        }
        return bannerRepository.save(banner);
    }

    public Banner update(Long id, Banner updated) {
        Banner existing = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy banner với id: " + id));

        existing.setTitle(updated.getTitle());
        existing.setSubtitle(updated.getSubtitle());
        existing.setImageUrl(updated.getImageUrl());
        existing.setLinkUrl(updated.getLinkUrl());
        existing.setDisplayOrder(updated.getDisplayOrder() != null ? updated.getDisplayOrder() : 0);
        existing.setActive(updated.getActive() != null ? updated.getActive() : true);

        return bannerRepository.save(existing);
    }

    public void delete(Long id) {
        if (!bannerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy banner với id: " + id);
        }
        bannerRepository.deleteById(id);
    }
}

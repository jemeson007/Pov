package com.peak.tip.repository;

import org.springframework.data.repository.PagingAndSortingRepository;

import com.peak.tip.model.Tip;

public interface TipRepository extends PagingAndSortingRepository<Tip, Long>{

}

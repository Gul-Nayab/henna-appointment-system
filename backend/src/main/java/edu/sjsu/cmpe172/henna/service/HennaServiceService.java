package edu.sjsu.cmpe172.henna.service;

import edu.sjsu.cmpe172.henna.model.HennaService;
import edu.sjsu.cmpe172.henna.repository.HennaServiceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HennaServiceService {

    private final HennaServiceRepository hennaServiceRepository;

    public HennaServiceService(HennaServiceRepository hennaServiceRepository) {
        this.hennaServiceRepository = hennaServiceRepository;
    }

    public List<HennaService> getAllServices() {
        return hennaServiceRepository.findAll();
    }

    public HennaService getServiceById(Integer id) {
        return hennaServiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + id));
    }
}
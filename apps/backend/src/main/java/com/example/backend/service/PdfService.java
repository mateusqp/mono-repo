package com.example.backend.service;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class PdfService {

    private final WebClient gotenbergWebClient;

    public PdfService(WebClient gotenbergWebClient) {
        this.gotenbergWebClient = gotenbergWebClient;
    }

    public byte[] generatePdfFromHtml(String html) {
        return gotenbergWebClient.post()
                .uri("/forms/chromium/convert/html")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("files", new ByteArrayResource(html.getBytes()) {
                    @Override
                    public String getFilename() {
                        return "index.html";
                    }
                }))
                .retrieve()
                .bodyToMono(byte[].class)
                .block();
    }

    public byte[] generatePdfFromUrl(String url) {
        return gotenbergWebClient.post()
                .uri("/forms/chromium/convert/url")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("url", url))
                .retrieve()
                .bodyToMono(byte[].class)
                .block();
    }
}

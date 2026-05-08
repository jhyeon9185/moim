package com.moim.ai.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter @Setter
public class MomiChatRequest {
    private String message;
    private List<Map<String, String>> history;
    private String date;
    private String location;
    private String title;
}

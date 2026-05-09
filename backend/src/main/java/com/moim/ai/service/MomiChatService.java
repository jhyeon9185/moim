package com.moim.ai.service;

import com.moim.ai.dto.MomiChatRequest;
import com.moim.config.OpenAiConfig;
import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.service.OpenAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MomiChatService {

    private final OpenAiConfig openAiConfig;
    private final RestTemplate restTemplate = new RestTemplate();

    public String chat(MomiChatRequest req) {
        String weatherCtx = getWeatherContext(req.getDate(), req.getLocation());
        String systemPrompt = buildSystemPrompt(req.getDate(), req.getLocation(), req.getTitle(), weatherCtx);

        OpenAiService service = openAiConfig.openAiService();
        if (service == null) throw new IllegalArgumentException("AI 서비스가 설정되지 않았습니다.");

        List<ChatMessage> messages = new ArrayList<>();
        messages.add(new ChatMessage("system", systemPrompt));
        if (req.getHistory() != null) {
            for (Map<String, String> h : req.getHistory()) {
                messages.add(new ChatMessage(h.get("role"), h.get("content")));
            }
        }
        messages.add(new ChatMessage("user", req.getMessage()));

        ChatCompletionRequest chatReq = ChatCompletionRequest.builder()
                .model("gpt-4o-mini")
                .messages(messages)
                .maxTokens(400)
                .build();

        return service.createChatCompletion(chatReq)
                .getChoices().get(0).getMessage().getContent();
    }

    private String getWeatherContext(String date, String location) {
        if (date == null || date.isBlank()) return "";
        try {
            LocalDate target = LocalDate.parse(date);
            long daysUntil = ChronoUnit.DAYS.between(LocalDate.now(), target);
            double[] coords = geocode(location);

            if (daysUntil < -1) {
                return "※ 과거 날짜입니다.";
            } else if (daysUntil <= 16) {
                String forecast = getForecast(coords[0], coords[1], date);
                String air = daysUntil <= 7 ? getAirQuality(coords[0], coords[1], date) : "";
                return "=== 실제 기상 예보 (Open-Meteo) ===\n" + forecast + (air.isBlank() ? "" : "\n" + air);
            } else {
                String historical = getHistoricalReference(coords[0], coords[1], target);
                return "=== 작년 같은 시기 참고 데이터 (예보 아님) ===\n" + historical;
            }
        } catch (Exception e) {
            return "날씨 데이터 조회 실패";
        }
    }

    private double[] geocode(String location) {
        if (location != null && !location.isBlank()) {
            try {
                URI uri = UriComponentsBuilder
                        .fromHttpUrl("https://geocoding-api.open-meteo.com/v1/search")
                        .queryParam("name", location)
                        .queryParam("count", 1)
                        .queryParam("language", "ko")
                        .queryParam("format", "json")
                        .build().toUri();
                Map<?, ?> result = restTemplate.getForObject(uri, Map.class);
                if (result != null) {
                    List<?> results = (List<?>) result.get("results");
                    if (results != null && !results.isEmpty()) {
                        Map<?, ?> r = (Map<?, ?>) results.get(0);
                        return new double[]{
                                ((Number) r.get("latitude")).doubleValue(),
                                ((Number) r.get("longitude")).doubleValue()
                        };
                    }
                }
            } catch (Exception ignored) {}
        }
        return new double[]{37.5665, 126.9780}; // Seoul fallback
    }

    private String getForecast(double lat, double lon, String targetDate) {
        try {
            URI uri = UriComponentsBuilder
                    .fromHttpUrl("https://api.open-meteo.com/v1/forecast")
                    .queryParam("latitude", lat)
                    .queryParam("longitude", lon)
                    .queryParam("daily", "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode,windspeed_10m_max")
                    .queryParam("timezone", "Asia/Seoul")
                    .queryParam("forecast_days", 16)
                    .build().toUri();

            Map<?, ?> data = restTemplate.getForObject(uri, Map.class);
            if (data == null) return "예보 없음";

            Map<?, ?> daily = (Map<?, ?>) data.get("daily");
            List<?> times = (List<?>) daily.get("time");
            List<?> tempMax = (List<?>) daily.get("temperature_2m_max");
            List<?> tempMin = (List<?>) daily.get("temperature_2m_min");
            List<?> precipProb = (List<?>) daily.get("precipitation_probability_max");
            List<?> precipSum = (List<?>) daily.get("precipitation_sum");
            List<?> weatherCode = (List<?>) daily.get("weathercode");
            List<?> windSpeed = (List<?>) daily.get("windspeed_10m_max");

            for (int i = 0; i < times.size(); i++) {
                if (targetDate.equals(times.get(i))) {
                    double maxT = ((Number) tempMax.get(i)).doubleValue();
                    double minT = ((Number) tempMin.get(i)).doubleValue();
                    int prob = precipProb != null ? ((Number) precipProb.get(i)).intValue() : 0;
                    double precip = precipSum != null ? ((Number) precipSum.get(i)).doubleValue() : 0;
                    int wmo = weatherCode != null ? ((Number) weatherCode.get(i)).intValue() : 0;
                    double wind = windSpeed != null ? ((Number) windSpeed.get(i)).doubleValue() : 0;
                    return String.format("날씨: %s\n최고: %.0f°C / 최저: %.0f°C\n강수확률: %d%%\n바람: %s",
                            wmoToDesc(wmo), maxT, minT, prob, windLevel(wind));
                }
            }
            return "해당 날짜 예보 없음";
        } catch (Exception e) {
            return "예보 조회 실패";
        }
    }

    private String getAirQuality(double lat, double lon, String targetDate) {
        try {
            URI uri = UriComponentsBuilder
                    .fromHttpUrl("https://air-quality-api.open-meteo.com/v1/air-quality")
                    .queryParam("latitude", lat)
                    .queryParam("longitude", lon)
                    .queryParam("hourly", "pm10,pm2_5")
                    .queryParam("timezone", "Asia/Seoul")
                    .queryParam("forecast_days", 7)
                    .build().toUri();

            Map<?, ?> data = restTemplate.getForObject(uri, Map.class);
            if (data == null) return "";

            Map<?, ?> hourly = (Map<?, ?>) data.get("hourly");
            List<?> times = (List<?>) hourly.get("time");
            List<?> pm25List = (List<?>) hourly.get("pm2_5");
            List<?> pm10List = (List<?>) hourly.get("pm10");

            double pm25Sum = 0, pm10Sum = 0;
            int count = 0;
            for (int i = 0; i < times.size(); i++) {
                if (((String) times.get(i)).startsWith(targetDate)) {
                    if (pm25List.get(i) != null) pm25Sum += ((Number) pm25List.get(i)).doubleValue();
                    if (pm10List.get(i) != null) pm10Sum += ((Number) pm10List.get(i)).doubleValue();
                    count++;
                }
            }
            if (count == 0) return "";

            double pm25Avg = pm25Sum / count;
            double pm10Avg = pm10Sum / count;
            return String.format("미세먼지(PM10): 약 %d / 초미세먼지(PM2.5): 약 %d (등급: %s)",
                    (int) Math.round(pm10Avg), (int) Math.round(pm25Avg),
                    pm25Level(pm25Avg));
        } catch (Exception e) {
            return "";
        }
    }

    private String getHistoricalReference(double lat, double lon, LocalDate target) {
        try {
            LocalDate lastYear = target.minusYears(1);
            URI uri = UriComponentsBuilder
                    .fromHttpUrl("https://archive-api.open-meteo.com/v1/archive")
                    .queryParam("latitude", lat)
                    .queryParam("longitude", lon)
                    .queryParam("start_date", lastYear.minusDays(3).toString())
                    .queryParam("end_date", lastYear.plusDays(3).toString())
                    .queryParam("daily", "temperature_2m_max,temperature_2m_min,precipitation_sum")
                    .queryParam("timezone", "Asia/Seoul")
                    .build().toUri();

            Map<?, ?> data = restTemplate.getForObject(uri, Map.class);
            if (data == null) return "참고 데이터 없음";

            Map<?, ?> daily = (Map<?, ?>) data.get("daily");
            double maxAvg = average((List<?>) daily.get("temperature_2m_max"));
            double minAvg = average((List<?>) daily.get("temperature_2m_min"));
            double precipAvg = average((List<?>) daily.get("precipitation_sum"));

            return String.format("작년 같은 시기 평균: 최고 %.0f°C / 최저 %.0f°C / 강수량 %.1fmm/day",
                    maxAvg, minAvg, precipAvg);
        } catch (Exception e) {
            return "참고 데이터 없음";
        }
    }

    private double average(List<?> list) {
        if (list == null || list.isEmpty()) return 0;
        double sum = 0;
        int count = 0;
        for (Object v : list) {
            if (v != null) { sum += ((Number) v).doubleValue(); count++; }
        }
        return count > 0 ? sum / count : 0;
    }

    private String wmoToDesc(int code) {
        if (code == 0) return "맑음 ☀️";
        if (code <= 3) return "구름 조금~흐림 ⛅";
        if (code == 45 || code == 48) return "안개 🌫️";
        if (code >= 51 && code <= 55) return "가랑비 🌦️";
        if (code >= 61 && code <= 65) return "비 🌧️";
        if (code >= 71 && code <= 75) return "눈 ❄️";
        if (code >= 80 && code <= 82) return "소나기 🌦️";
        if (code >= 95) return "뇌우 ⛈️";
        return "흐림 ☁️";
    }

    private String windLevel(double kmh) {
        if (kmh < 10) return "약한 바람";
        if (kmh < 30) return "바람 있음";
        if (kmh < 50) return "강한 바람";
        return "매우 강한 바람";
    }

    private String pm25Level(double v) {
        if (v <= 15) return "좋음";
        if (v <= 35) return "보통";
        if (v <= 75) return "나쁨";
        return "매우나쁨";
    }

    private String pm10Level(double v) {
        if (v <= 30) return "좋음";
        if (v <= 80) return "보통";
        if (v <= 150) return "나쁨";
        return "매우나쁨";
    }

    private String buildSystemPrompt(String date, String location, String title, String weatherCtx) {
        return """
당신은 '모미'입니다. MOIM 앱의 친근한 일정 도우미 AI입니다.
사용자의 일정에 대한 날씨, 미세먼지 등 정보를 짧고 친근하게 알려드립니다.

현재 일정 정보:
- 제목: %s
- 날짜: %s
- 장소: %s

%s

답변 규칙:
- 항상 한국어로
- 이모지를 자연스럽게 활용
- 2~3문장으로 짧고 친근하게
- 작년 참고 데이터인 경우 "정확한 예보는 없지만, 작년 이 시기엔~" 식으로 안내
- 미세먼지는 PM2.5·PM10·μg/m³ 등 전문 용어 절대 금지. "미세먼지 수치 약 OO으로 좋은 편이에요" 처럼 숫자를 자연스럽게 녹여서 표현
- 날씨·미세먼지 외 질문은 "저는 일정 날씨 도우미라 잘 모르겠어요 😅" 안내
""".formatted(
                title != null ? title : "미정",
                date != null ? date : "미정",
                (location != null && !location.isBlank()) ? location : "미정",
                weatherCtx.isBlank() ? "날씨 데이터 없음 (날짜를 먼저 입력해주세요)" : weatherCtx
        );
    }
}

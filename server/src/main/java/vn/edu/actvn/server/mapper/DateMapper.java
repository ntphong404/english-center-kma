package vn.edu.actvn.server.mapper;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.YearMonth;

@Component
public class DateMapper {
    public YearMonth toYearMonth(LocalDate date) {
        return date != null ? YearMonth.from(date) : null;
    }

    public LocalDate toLocalDate(YearMonth yearMonth) {
        return yearMonth != null ? yearMonth.atDay(1) : null;
    }
}

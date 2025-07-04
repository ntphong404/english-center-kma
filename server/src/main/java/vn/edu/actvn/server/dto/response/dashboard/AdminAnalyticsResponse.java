package vn.edu.actvn.server.dto.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminAnalyticsResponse {

    private int studentCount;
    private int classCount;
    private int teacherCount;
    private int currentYear;

    private BigDecimal totalTeacherSalary;
    private int retentionRate;
    private int studentsNoClass;

    private List<Integer> revenueByMonth;
    private List<Integer> revenueByQuarter;

    private List<Integer> teacherSalaryByMonth;
    private List<Integer> teacherSalaryByQuarter;

    private List<Integer> studentsNoClassByMonth;
    private List<Integer> studentsCreatedByMonth;

    private List<LevelDistributionDto> levelDist;
}

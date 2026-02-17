namespace PosSystem.Models
{

    public class ShiftDto
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public decimal OpeningCash { get; set; }
        public decimal? ClosingCash { get; set; }
        public string Status { get; set; } = "Open";
    }
    public class OpenShiftRequest
    {
        public decimal OpeningCash { get; set; }
    }

    public class CloseShiftRequest
    {
        public decimal ClosingCash { get; set; }
    }

    public class CashDrawerDto
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public decimal OpeningCash { get; set; }
        public decimal? ClosingCash { get; set; }
        public string Status { get; set; } = "Open";
    }
}

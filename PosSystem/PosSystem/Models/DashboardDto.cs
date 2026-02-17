    namespace PosSystem.Models
{
    public class DashboardStats
    {
        public decimal TodaySales { get; set; }
        public int TodayOrders { get; set; }
        public List<LowStockProduct> LowStockProducts { get; set; } = new();
    }


    public class LowStockProduct
    {
        public string Name { get; set; } = null!;
        public string Sku { get; set; } = null!;
        public int Quantity { get; set; }
        public int MinQuantity { get; set; }
    }
}

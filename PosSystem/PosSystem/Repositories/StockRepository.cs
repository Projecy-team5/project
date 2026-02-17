namespace PosSystem.Repositories
{
    using Dapper;
    using System.Data;

    public class StockRepository : IStockRepository
    {
        private readonly IDbConnection _db;

        public StockRepository(IConfiguration config)
        {
            _db = new Microsoft.Data.SqlClient.SqlConnection(config.GetConnectionString("DefaultConnection"));
        }

        public async Task UpdateQuantityAsync(long productId, int newQuantity)
        {
            var sql = "UPDATE Stock SET Quantity = @NewQuantity, UpdatedAt = GETDATE() WHERE ProductId = @ProductId";
            await _db.ExecuteAsync(sql, new { ProductId = productId, NewQuantity = newQuantity });
        }
    }
}

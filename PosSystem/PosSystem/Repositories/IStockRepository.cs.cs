namespace PosSystem.Repositories
{
    public interface IStockRepository
    {
        Task UpdateQuantityAsync(long productId, int newQuantity);
    }
}

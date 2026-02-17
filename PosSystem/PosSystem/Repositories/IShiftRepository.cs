using PosSystem.Models;

namespace PosSystem.Repositories;

public interface IShiftRepository
{
    Task<ShiftDto?> GetCurrentShiftAsync(long userId);
    Task<ShiftDto> OpenShiftAsync(long userId, decimal openingCash);
    Task<ShiftDto?> CloseShiftAsync(long shiftId, decimal closingCash);
}
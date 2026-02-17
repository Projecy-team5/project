// File: Services/ShiftService.cs
using PosSystem.Models;
using PosSystem.Repositories;

namespace PosSystem.Services;

public class ShiftService
{
    private readonly IShiftRepository _shiftRepo;

    public ShiftService(IShiftRepository shiftRepo)
    {
        _shiftRepo = shiftRepo;
    }

    public async Task<ShiftDto?> GetCurrentShiftAsync(long userId)
    {
        return await _shiftRepo.GetCurrentShiftAsync(userId);
    }

    public async Task<ShiftDto> OpenAsync(long userId, decimal openingCash)
    {
        // Check if a shift is already open
        var existing = await _shiftRepo.GetCurrentShiftAsync(userId);
        if (existing != null) return existing;

        return await _shiftRepo.OpenShiftAsync(userId, openingCash);
    }

    public async Task<ShiftDto?> CloseAsync(long userId, decimal closingCash)
    {
        var current = await _shiftRepo.GetCurrentShiftAsync(userId);
        if (current == null) return null;

        return await _shiftRepo.CloseShiftAsync(current.Id, closingCash);
    }
}
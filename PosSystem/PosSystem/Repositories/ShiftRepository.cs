using Dapper;
using Microsoft.Data.SqlClient;
using PosSystem.Models;
using System.Data;

namespace PosSystem.Repositories;

public class ShiftRepository : IShiftRepository
{
    private readonly string _connectionString;

    public ShiftRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("DefaultConnection")
            ?? throw new ArgumentNullException("Connection string missing");
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    public async Task<ShiftDto?> GetCurrentShiftAsync(long userId)
    {
        using var db = CreateConnection();
        // Standard SQL check for an open shift
        return await db.QuerySingleOrDefaultAsync<ShiftDto>(
            "SELECT * FROM Shifts WHERE UserId = @userId AND Status = 'Open'",
            new { userId });
    }

    public async Task<ShiftDto> OpenShiftAsync(long userId, decimal openingCash)
    {
        using var db = CreateConnection();
        var sql = @"
            INSERT INTO Shifts (UserId, StartTime, OpeningCash, Status)
            VALUES (@userId, GETDATE(), @openingCash, 'Open');
            SELECT CAST(SCOPE_IDENTITY() as bigint);";

        var id = await db.ExecuteScalarAsync<long>(sql, new { userId, openingCash });

        return new ShiftDto
        {
            Id = id,
            UserId = userId,
            OpeningCash = openingCash,
            StartTime = DateTime.Now,
            Status = "Open"
        };
    }

    public async Task<ShiftDto?> CloseShiftAsync(long shiftId, decimal closingCash)
    {
        using var db = CreateConnection();

        // Ensure parameters @closingCash and @shiftId match the anonymous object
        var sql = @"
            UPDATE Shifts 
            SET EndTime = GETDATE(), 
                ClosingCash = @closingCash, 
                Status = 'Closed'
            WHERE Id = @shiftId;
            
            SELECT * FROM Shifts WHERE Id = @shiftId;";

        return await db.QuerySingleOrDefaultAsync<ShiftDto>(sql, new
        {
            shiftId,
            closingCash
        });
    }
}
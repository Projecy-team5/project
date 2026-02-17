using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PosSystem.Models;
using PosSystem.Repositories;
using PosSystem.Services;

namespace PosSystem.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ShiftsController : ControllerBase
    {
        private readonly ShiftService _shiftService;

        public ShiftsController(ShiftService shiftService) => _shiftService = shiftService;

        private long UserId => long.Parse(User.FindFirst("userId")?.Value ?? "1");

        // File: Controllers/ShiftsController.cs
        [HttpGet("current")]
        public async Task<ActionResult<ShiftDto>> GetCurrent()
        {
            var userId = long.Parse(User.FindFirst("userId")?.Value!);
            var shift = await _shiftService.GetCurrentShiftAsync(userId);
            return shift == null ? NotFound() : Ok(shift);
        }

        [HttpPost("close")]
        public async Task<ActionResult<ShiftDto>> Close(CloseShiftRequest req)
        {
            var userId = long.Parse(User.FindFirst("userId")?.Value!);
            var result = await _shiftService.CloseAsync(userId, req.ClosingCash);
            return result == null ? BadRequest("No open shift found") : Ok(result);
        }

        [HttpPost("open")]
        public async Task<ActionResult<ShiftDto>> Open(OpenShiftRequest req)
        {
            var shift = await _shiftService.OpenAsync(UserId, req.OpeningCash);
            return Ok(shift);
        }
    }
}

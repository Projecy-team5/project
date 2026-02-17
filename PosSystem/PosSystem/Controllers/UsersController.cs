using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PosSystem.Models;
using PosSystem.Repositories;
using Dapper;

namespace PosSystem.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _userRepo;

        public UsersController(IUserRepository userRepo)
        {
            _userRepo = userRepo;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
        {
            return Ok(await _userRepo.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> Get(long id)
        {
            var user = await _userRepo.GetByIdAsync(id);
            return user == null ? NotFound() : Ok(user);
        }

        [HttpPost]
        public async Task<ActionResult<UserDto>> Create(CreateUserRequest req)
        {
            // Optional: check username/email unique
            var existing = await _userRepo.GetByUsernameAsync(req.Username);
            if (existing != null) return BadRequest("Username already exists");

            var user = await _userRepo.CreateAsync(req);
            return CreatedAtAction(nameof(Get), new { id = user.Id }, user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, UpdateUserRequest req)
        {
            await _userRepo.UpdateAsync(id, req);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Disable(long id)
        {
            await _userRepo.DisableAsync(id);
            return NoContent();
        }
    }
}

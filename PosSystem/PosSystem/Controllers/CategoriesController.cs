using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PosSystem.Models;
using PosSystem.Repositories;

namespace PosSystem.Controllers
{
    [Authorize(Roles = "Admin,Manager")]
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryRepository _catRepo;

        public CategoriesController(ICategoryRepository catRepo) => _catRepo = catRepo;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAll() => Ok(await _catRepo.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> Get(long id)
        {
            var cat = await _catRepo.GetByIdAsync(id);
            return cat == null ? NotFound() : Ok(cat);
        }

        [HttpPost]
        public async Task<ActionResult<CategoryDto>> Create(CreateCategoryRequest req)
        {
            var cat = await _catRepo.CreateAsync(req);
            return CreatedAtAction(nameof(Get), new { id = cat.Id }, cat);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, UpdateCategoryRequest req)
        {
            await _catRepo.UpdateAsync(id, req);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            await _catRepo.DeleteAsync(id);
            return NoContent();
        }
    }
}

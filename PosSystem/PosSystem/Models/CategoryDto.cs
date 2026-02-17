namespace PosSystem.Models
{
    public class CategoryDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = null!;
        public long? ParentId { get; set; }
        public string? ParentName { get; set; }  // for display
        public string Status { get; set; } = "Active";
    }

    public class CreateCategoryRequest
    {
        public string Name { get; set; } = null!;
        public long? ParentId { get; set; }
    }

    public class UpdateCategoryRequest : CreateCategoryRequest { }
}

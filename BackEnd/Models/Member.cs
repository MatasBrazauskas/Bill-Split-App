namespace BackEnd.Models
{
    public class Member
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public string Name { get ; set; }
        public string InDepth { get; set; }
        public decimal OwedAmount { get; set; }
    } 
}

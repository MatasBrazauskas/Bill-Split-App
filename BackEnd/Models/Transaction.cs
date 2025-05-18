namespace BackEnd.Models
{
    public class Transaction
    {
        public Transaction() { }
        public Transaction(int groupId, string v1, string v2, decimal v3)
        {
            GroupId = groupId;
            PayersName = v1;
            PayeeName = v2;
            TotalAmount = v3;
        }

        public int Id { get; set; }
        public int GroupId { get; set; }
        public string PayersName { get; set; }
        public string PayeeName { get; set; }
        public decimal TotalAmount { get; set; }
    }
}

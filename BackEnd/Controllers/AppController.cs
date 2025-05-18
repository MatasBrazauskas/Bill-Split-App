using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using BackEnd.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace BackEnd.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppController : ControllerBase
    {
        private readonly AppDbContext _appService;
        public AppController(AppDbContext appService)
        {
            _appService = appService;
        }

        [HttpGet("group")]
        public async Task<ActionResult<IEnumerable<Group>>> GetGroups()
        {
            if (_appService == null)
            {
                return NotFound();
            }
            return await _appService.Groups.ToListAsync();
        }

        [HttpGet("group/{id}")]
        public async Task<ActionResult<Group>> GetGroup(int id)
        {
            var group = await _appService.Groups.FindAsync(id);
            if (group == null)
            {
                return NotFound();
            }
            return group;
        }

        [HttpGet("members/{groupId}")]
        public async Task<ActionResult<IEnumerable<Member>>> GetMembersByGroupId(int groupId)
        {
            var members = await _appService.Members.Where(m => m.GroupId == groupId).ToListAsync();

            if (members == null)
            {
                return NotFound();
            }

            return members;
        }

        [HttpGet("members/payers_sum/{groupId}")]
        public async Task<ActionResult<decimal>> PayersSum(int groupId)
        {
            return await _appService.Members.Where(x => x.InDepth.Equals("1") && x.GroupId == groupId).SumAsync(x => x.OwedAmount);
        }

        [HttpGet("members/owner_sum/{groupId}")]
        public async Task<ActionResult<decimal>> OwnerSum(int groupId)
        {
            return await _appService.Members.Where(x => x.InDepth.Equals("0") && x.GroupId == groupId).SumAsync(x => x.OwedAmount);
        }

        [HttpGet("transactions/is_finalized/{groupId}")]
        public async Task<ActionResult<bool>> IsGroupFinalized(int groupId)
        {
            var obj = await _appService.Transactions.FirstOrDefaultAsync(x => x.GroupId == groupId && x.PayersName == "!" && x.PayeeName == "!");

            if (obj == null)
            {
                return false;
            }
            return true;
        }

        [HttpGet("transactions/{groupId}")]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactionsByGroupId(int groupId)
        {
            var transactions = await _appService.Transactions.Where(x => x.GroupId == groupId && x.PayeeName != "!" && x.PayersName != "!").ToListAsync();

            if (transactions == null)
            {
                return NotFound();
            }
            return transactions;
        }

        [HttpGet("members/payers/{groupId}")]
        public async Task<ActionResult<IEnumerable<Member>>> GetAllPayers(int groupId)
        {
            var transactions = await _appService.Members.Where(x => x.InDepth.Equals("1") && x.GroupId == groupId).ToListAsync();
            if (transactions == null)
            {
                return NotFound();
            }
            return transactions;
        }

        [HttpGet("members/payees/{groupId}")]
        public async Task<ActionResult<IEnumerable<Member>>> GetAllPayees(int groupId)
        {
            var transactions = await _appService.Members.Where(x => x.InDepth.Equals("0") && x.GroupId == groupId).ToListAsync();
            if (transactions == null)
            {
                return NotFound();
            }
            return transactions;
        }

        [HttpPost("group")]
        public async Task<ActionResult<Group>> AddGroup(Group newGroup)
        {
            if (newGroup == null)
            {
                return BadRequest();
            }

            _appService.Groups.Add(newGroup);
            await _appService.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGroups), new { id = newGroup.Id }, newGroup);
        }

        [HttpPost("members")]
        public async Task<ActionResult<Member>> AddMember(Member member)
        {
            if (member == null)
            {
                return BadRequest("Member is null");
            }

            _appService.Members.Add(member);
            await _appService.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGroups), new { id = member.Id }, member);
        }

        [HttpPost("members/{groupId}")]
        public async Task<ActionResult<Member>> AddNewMember(int groupId, Member member)
        {
            if (member == null)
                return BadRequest("Member is not existing");

            bool exists = await _appService.Members.AnyAsync(x => x.GroupId == groupId && x.Name == member.Name);

            if (exists == true)
            {
                return BadRequest("Member already exists.");
            }

            member.GroupId = groupId;
            _appService.Members.Add(member);
            await _appService.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetMembersByGroupId),
                new { groupId = member.GroupId },
                member
            );
        }

        [HttpPost("transactions/finalize/{groupId}")]
        public async Task<ActionResult> FinalizeTransaction([FromRoute] int groupId)
        {
            var tran = new Transaction(groupId, "!", "!", 0.0m);

            await _appService.Transactions.AddAsync(tran);
            await _appService.SaveChangesAsync();

            return Ok("Transaction finalized.");
        }

        [HttpDelete("group/{id}")]
        public async Task<ActionResult<Group>> DeleteGroup(int id)
        {
            var group = await _appService.Groups.FindAsync(id);
            var members = await _appService.Members.Where(m => m.GroupId == id).ToListAsync();
            var transactions = await _appService.Transactions.Where(t => t.GroupId == id).ToListAsync();

            if (group == null)
            {
                return NotFound("Group is nulls");
            }

            _appService.Members.RemoveRange(members);
            _appService.Groups.Remove(group);
            _appService.Transactions.RemoveRange(transactions);

            await _appService.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("transactions/sumbit/{groupId}")]
        public async Task<ActionResult> MakeTransaction(int groupId, string payersName, string payeesName, int amount)
        {
            var payer = await _appService.Members.FirstOrDefaultAsync(x => x.GroupId == groupId && x.Name == payersName);
            var payee = await _appService.Members.FirstOrDefaultAsync(x => x.GroupId == groupId && x.Name == payeesName);

            if (payer == null || payee == null)
            {
                return BadRequest("Payer or Payee not found.");
            }

            int maxAmount = Math.Min(amount, (int)Math.Min(payer.OwedAmount, payee.OwedAmount));

            payer.OwedAmount = Math.Max(0, payer.OwedAmount - maxAmount);
            payee.OwedAmount = Math.Max(0, payee.OwedAmount - maxAmount);

            var transaction = new Transaction(groupId, payersName, payeesName, maxAmount);

            _appService.Transactions.Add(transaction);
            await _appService.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("members/{groupId}/{name}")]
        public async Task<ActionResult> DeleteMember(int groupId, string name)
        {
            var member = await _appService.Members
                .FirstOrDefaultAsync(x => x.GroupId == groupId && x.Name == name);

            if (member == null)
            {
                return NotFound("Member not found.");
            }

            _appService.Members.Remove(member);
            await _appService.SaveChangesAsync();

            return Ok("Member deleted successfully.");
        }

        [HttpPut("group/{updatedGroup.Id}")]
        public async Task<ActionResult> UpdateGroup(Group updatedGroup)
        {
            if (updatedGroup == null)
            {
                return BadRequest("Invalid group data or mismatched ID.");
            }

            var group = await _appService.Groups.FirstOrDefaultAsync(x => updatedGroup.Id == x.Id);

            if (group == null)
            {
                return NotFound("Group not found.");
            }

            if (!int.TryParse(updatedGroup.OweMoney, out int val) || val <= 0)
            {
                return BadRequest("OweMoney must be a number greater than 0.");
            }

            group.OweMoney = val.ToString();
            await _appService.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("members/dynamic/{groupId}")]
        public async Task<ActionResult> UpdateMembersMoney(int groupId, string name, string newValue)
        {
            var member = await _appService.Members.FirstOrDefaultAsync(x => x.GroupId == groupId && x.Name == name);

            if (member == null)
            {
                return BadRequest("Member not found.");
            }

            if (uint.TryParse(newValue, out uint val) == false)
            {
                return BadRequest("OweMoney must be a number greater than 0.");
            }

            member.OwedAmount = val;
            await _appService.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("members/equally/{groupId}")]
        public async Task<ActionResult> SplitBillEqually(int groupId, [FromBody] int amount)
        {
            var membersInDept = await _appService.Members.Where(x => x.InDepth.Equals("1") && x.GroupId.Equals(groupId)).ToListAsync();
            var payers = await _appService.Members.Where(x => x.InDepth.Equals("0") && x.GroupId.Equals(groupId)).ToListAsync();

            int membersCount = membersInDept.Count;
            int payersCount = payers.Count;

            if (membersCount == 0 || payersCount == 0 || amount <= 0)
            {
                return BadRequest("No members found to split the bill.");
            }

            int membersWholePart = amount / membersCount;
            int membersRemainder = amount % membersCount;

            int payersWholePart = amount / payersCount;
            int payersRemainder = amount % payersCount;

            for (int i = 0; i < membersCount; i++)
            {
                membersInDept[i].OwedAmount = membersWholePart;
                if (i < membersRemainder)
                {
                    membersInDept[i].OwedAmount += 1;
                }
            }

            for (int i = 0; i < payersCount; i++)
            {
                payers[i].OwedAmount = payersWholePart;
                if (i < payersRemainder)
                {
                    payers[i].OwedAmount += 1;
                }
            }

            await _appService.SaveChangesAsync();

            return Ok("Bill split equally.");
        }

        [HttpPut("members/procent/{groupId}")]
        public async Task<ActionResult> SplitBillByProcent(int groupId, Member member, int amount, int procent)
        {
            if (procent < 0 || procent > 100)
            {
                return BadRequest("Procent must be between 0 and 100.");
            }

            var obj = await _appService.Members.FirstOrDefaultAsync(x => x.GroupId == groupId && x.Name == member.Name);

            if (obj == null)
            {
                return BadRequest("Member is not in the database.");
            }

            obj.OwedAmount = (int)(amount * procent / 100.0);

            await _appService.SaveChangesAsync();

            return Ok($"Owed amount set to {obj.OwedAmount} for member {obj.Name}.");
        }
    }
}

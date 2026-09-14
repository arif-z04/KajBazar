using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using KajBazar.Core.DTOs;
using KajBazar.Core.Interfaces;

namespace KajBazar.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GeographyController : ControllerBase
    {
        private readonly IGeographyRepository _geographyRepository;

        public GeographyController(IGeographyRepository geographyRepository)
        {
            _geographyRepository = geographyRepository;
        }

        [HttpGet("districts")]
        public async Task<IActionResult> GetDistricts()
        {
            var districts = await _geographyRepository.GetAllDistrictsAsync();

            var result = districts.Select(d => new DistrictDto
            {
                DistrictId = d.DistrictId,
                DistrictName = d.DistrictName,
                Upazilas = d.Upazilas.Select(u => new UpazilaDto
                {
                    UpazilaId = u.UpazilaId,
                    DistrictId = u.DistrictId,
                    UpazilaName = u.UpazilaName
                }).OrderBy(u => u.UpazilaName).ToList()
            }).ToList();

            return Ok(result);
        }

        [HttpGet("upazilas/{districtId:int}")]
        public async Task<IActionResult> GetUpazilas(int districtId)
        {
            var upazilas = await _geographyRepository.GetUpazilasByDistrictIdAsync(districtId);

            var result = upazilas.Select(u => new UpazilaDto
            {
                UpazilaId = u.UpazilaId,
                DistrictId = u.DistrictId,
                UpazilaName = u.UpazilaName
            }).ToList();

            return Ok(result);
        }
    }
}

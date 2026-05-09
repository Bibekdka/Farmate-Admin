from mcp.server.fastmcp import FastMCP

# Initialize FastMCP server
mcp = FastMCP("FarmUtilities")

@mcp.tool()
def calculate_seed_requirement(crop_name: str, area_sq_meters: float) -> str:
    """
    Calculates the approximate amount of seeds required for a given crop and area.
    """
    # Simple estimation logic
    seed_rates = {
        "wheat": 0.0125,  # kg per sq meter
        "rice": 0.005,
        "corn": 0.002,
        "soybean": 0.007
    }
    
    rate = seed_rates.get(crop_name.lower(), 0.005) # Default rate
    total_seeds = rate * area_sq_meters
    
    return f"For {area_sq_meters} sq meters of {crop_name}, you will approximately need {total_seeds:.2f} kg of seeds."

@mcp.tool()
def identify_pest_risk(temperature: float, humidity: float) -> str:
    """
    Identifies potential pest risks based on environmental conditions.
    """
    if temperature > 25 and humidity > 70:
        return "HIGH RISK: High temperature and humidity are ideal for fungal growth and aphid outbreaks. Monitor crops closely."
    elif temperature < 15:
        return "LOW RISK: Most pests are inactive at lower temperatures. Check for cold-resistant mold."
    else:
        return "MODERATE RISK: Standard monitoring recommended."

if __name__ == "__main__":
    mcp.run()

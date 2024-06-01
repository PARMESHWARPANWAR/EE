const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WeatherFunctions", function () {
  let weatherFunctions, owner;
  const city = "London";

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    // Deploy WeatherFunctions
    const WeatherFunctionsContract = await ethers.getContractFactory("WeatherFunctions");
    weatherFunctions = await WeatherFunctionsContract.deploy(123); // Replace 123 with your actual subscriptionId
  });

  it("Should get the temperature for a city", async function () {
    const requestId = await weatherFunctions.connect(owner).getTemperature(city);

    // Simulate the response from the Chainlink Functions
    const response = ethers.utils.formatBytes32String("It is 20°C in London");
    await weatherFunctions.fulfillRequest(requestId, response, "0x");

    const cityData = await weatherFunctions.getCity(city);
    expect(cityData.name).to.equal(city);
    expect(cityData.temperature).to.equal("It is 20°C in London");
  });

  it("Should list all cities", async function () {
    const requestId1 = await weatherFunctions.connect(owner).getTemperature(city);
    const requestId2 = await weatherFunctions.connect(owner).getTemperature("Paris");

    // Simulate the responses from Chainlink Functions
    const response1 = ethers.utils.formatBytes32String("It is 20°C in London");
    const response2 = ethers.utils.formatBytes32String("It is 25°C in Paris");
    await weatherFunctions.fulfillRequest(requestId1, response1, "0x");
    await weatherFunctions.fulfillRequest(requestId2, response2, "0x");

    const allCities = await weatherFunctions.listAllCities();
    expect(allCities.length).to.equal(2);
    expect(allCities[0].name).to.equal(city);
    expect(allCities[0].temperature).to.equal("It is 20°C in London");
    expect(allCities[1].name).to.equal("Paris");
    expect(allCities[1].temperature).to.equal("It is 25°C in Paris");
  });

  it("Should list cities within a range", async function () {
    const requestId1 = await weatherFunctions.connect(owner).getTemperature(city);
    const requestId2 = await weatherFunctions.connect(owner).getTemperature("Paris");
    const requestId3 = await weatherFunctions.connect(owner).getTemperature("New York");

    // Simulate the responses from Chainlink Functions
    const response1 = ethers.utils.formatBytes32String("It is 20°C in London");
    const response2 = ethers.utils.formatBytes32String("It is 25°C in Paris");
    const response3 = ethers.utils.formatBytes32String("It is 30°C in New York");
    await weatherFunctions.fulfillRequest(requestId1, response1, "0x");
    await weatherFunctions.fulfillRequest(requestId2, response2, "0x");
    await weatherFunctions.fulfillRequest(requestId3, response3, "0x");

    const citiesInRange = await weatherFunctions.listCities(1, 2);
    expect(citiesInRange.length).to.equal(2);
    expect(citiesInRange[0].name).to.equal("Paris");
    expect(citiesInRange[0].temperature).to.equal("It is 25°C in Paris");
    expect(citiesInRange[1].name).to.equal("New York");
    expect(citiesInRange[1].temperature).to.equal("It is 30°C in New York");
  });
});
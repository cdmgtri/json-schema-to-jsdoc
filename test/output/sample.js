
/**
 * @typedef {Object} PersonType
 *
 * Information about a person
 *
 * @property {string} name - A person's name 
 * @property {integer} [age] - A person's age 
 * @property {object} [location] -  
 * @property {string} [location.street] - A street address 
 * @property {string} [location.city] - A city name 
 * @property {"CA"|"NY"|"TX"|"FL"} [location.state] - A state code 
 * @property {string} [location.zip] - A zip code 
 * @property {"home"|"work"|"cell"|"other"} [contactCodes] -  
 */

/** @type {PersonType} */ 
let Person = {}; 


/**
 * @typedef {Object} LocationType
 *
 * @property {string} [street] - A street address 
 * @property {string} [city] - A city name 
 * @property {"CA"|"NY"|"TX"|"FL"} [state] - A state code 
 * @property {string} [zip] - A zip code 
 */

/** @type {LocationType} */ 
let Location = {}; 

/** @typedef {"home"|"work"|"cell"|"other"} ContactCodesType - undefined *//** @type {ContactCodesType} */ 
let ContactCodes = {}; 

module.exports = { Person, Location, ContactCodes }


const fs = require('fs-extra');
const debug = require("debug")("jsdoc");
const RefParser = require("json-schema-ref-parser");

class JSONSchemaToJSDoc {

  /**
   * Generates JSDoc typedefs for all properties in the given JSON schema.
   * Writes the JSDoc file to the given jsdocPath.
   *
   * @static
   * @param {string} schemaPath
   * @param {string} jsdocPath
   * @returns {void}
   */
  static async generateFile(schemaPath, jsdocPath) {

    let jsonSchema = fs.readJSONSync(schemaPath);
    jsonSchema = await RefParser.dereference(jsonSchema);

    /** @type {string[]} */
    let exportObjects = [];

    let jsdoc = "";

    for (let propertyKey in jsonSchema.properties) {

      let property = jsonSchema.properties[propertyKey];

      debug(propertyKey);

      if (propertyKey === "$schema") {
        continue;
      }

      let elementName = propertyKey;
      let typeName = propertyKey + "Type";

      // Get the JSDoc representation of the schema definition
      jsdoc += JSONSchemaToJSDoc.generateComponent(property, {name: typeName});

      // Create an element with the new JSDoc type
      jsdoc += `/** @type {${typeName}} */ \n`;
      jsdoc += `let ${elementName} = {}; \n\n`;

      exportObjects.push(elementName);
    }

    jsdoc += `module.exports = { ${exportObjects.join(", ")} }\n`;

    fs.outputFileSync(jsdocPath, jsdoc);
    debug("\n%s\n", jsdoc);
  }

  /**
   * Generate a JSDoc typedef for the given JSON schema property (dereferenced).
   *
   * @static
   * @param {Object} componentSchema
   * @param {Object} [options]
   * @param {string} [options.name] - The name of the typedef
   * @returns
   */
  static generateComponent(componentSchema, options = {}) {

    if (!componentSchema || Object.keys(componentSchema).length === 0) {
      // Handle invalid input
      return "";
    }
    else if (componentSchema.enum) {
      // Handle a simple enumeration type
      return processEnumSchema(componentSchema, options.name);
    }

    let jsdoc = `\n`;

    jsdoc += `/**\n`;
    jsdoc += getTypedefHeader(componentSchema, options.name);
    jsdoc += processProperties(componentSchema, options);
    jsdoc += ' */\n\n';

    return jsdoc;
  }
}


/**
 * Returns JSDoc lines for the properties of a component schema.
 * Handles sub-properties.
 *
 * @param {Object} componentSchema
 * @param {Object} [options={}]
 * @returns
 */
function processProperties(componentSchema, options = {}) {

  let text = '';

  // Deep copy properties
  const properties = JSON.parse( JSON.stringify(componentSchema.properties) );
  const required = componentSchema.required || [];

  for (let currentPropertyKey in properties) {

    debug("--" + currentPropertyKey);

    let currentProperty = properties[currentPropertyKey];

    if (Array.isArray(options.ignore) && options.ignore.includes(currentProperty)) {
      continue;
    }

    let newSubs = {};
    if (currentProperty.properties) {
      for (let subPropertyKey in currentProperty.properties) {
        debug("----" + subPropertyKey);
        let subProperty = currentProperty.properties[subPropertyKey];
        newSubs[currentPropertyKey + "." + subPropertyKey] = subProperty
      }
      currentProperty.properties = newSubs;
    }

    if (currentProperty.type === 'object' && currentProperty.properties) {
      text += writeParam('object', currentPropertyKey, currentProperty.description, true);
      text += processProperties(currentProperty, true);
    }
    else {
      let optional = !required.includes(currentPropertyKey);
      let type = getType(currentProperty) || upperFirst(currentPropertyKey);

      let description = currentProperty.description;
      if (!description && currentProperty.example) {
        description = "Example: " + currentProperty.example;
      }
      text += writeParam(type, currentPropertyKey, description, optional);
    }
  }

  return text;
}

/**
 * Generates a typedef for a simple component with a set of enums.
 *
 * @param {Object} componentSchema
 * @param {string} componentName
 * @returns
 */
function processEnumSchema(componentSchema, name) {

  let enums = generateEnums(componentSchema.enum);
  let description = componentSchema.description || "";

  let jsdoc = "";
  jsdoc += `/**\n`;
  jsdoc += ` * @typedef {${enums}} ${name}\n`;
  if (description) {
    jsdoc += ` *\n`;
    jsdoc += ` * ${description} */\n\n`;
  }
  jsdoc += ` */\n\n`;

  return jsdoc;
}

/**
 * Returns the header lines for the JSDoc, creating a named typedef.
 * Adds the description field if available.
 *
 * @param {Object} componentSchema
 * @param {string} componentName
 * @returns
 */
function getTypedefHeader(componentSchema, componentName) {

  let text = "";
  text += ` * @typedef {Object} ${componentName}\n`;
  text += ` *\n`;

  if (componentSchema.description) {
    text += ` * ${componentSchema.description}\n`;
    text += ` *\n`;
  }

  return text;
}

/**
 * Returns the JSDoc line for a parameter.
 *
 * @param {string} [type='']
 * @param {string} field
 * @param {string} [description='']
 * @param {boolean} optional
 * @returns {string}
 */
function writeParam(type = '', field, description = '', optional) {
  const fieldTemplate = optional ? `[${field}]` : field;
  return ` * @property {${type}} ${fieldTemplate} - ${description} \n`;
}

/**
 * Returns the corresponding JSDoc type string for the given schema type.
 *
 * @param {Object} componentSchema
 * @returns {string}
 */
function getType(componentSchema) {

  if (componentSchema.enum) {
    return generateEnums(componentSchema.enum);
  }

  if (Array.isArray(componentSchema.type)) {
    if (componentSchema.type.includes('null')) {
      return `?${componentSchema.type[0]}`;
    } else {
      return componentSchema.type.join('|');
    }
  }

  return componentSchema.type;
}

function upperFirst(str = '') {
  return str.substr(0,1).toUpperCase() + str.substr(1);
}

/**
 * Returns a JSDoc enumeration string, e.g., `"Enum1"|"Enum2"|"Enum3"`
 * from a string array if there are less than 30 enums.
 * Returns "string" otherwise.
 *
 * @param {string[]} enums
 * @returns {string}
 */
function generateEnums(enums) {
  if (enums.length > 30) {
    return "string";
  }

  /** @type {string[]} */
  let quotedEnums = enums.map( enumeration => "\"" + enumeration + "\"");
  return quotedEnums.join("|");
}

module.exports = JSONSchemaToJSDoc;

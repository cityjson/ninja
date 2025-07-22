import init, { cjseqToCj } from '@cityjson/cjseq';


export class CityJSONSeqUtils {

  constructor() {

    this._wasmInitialized = false;

  }

  static validateCityJSONSeq(data) {

    // Split the content into lines and get the first non-empty line
    const lines = data.split('\n');
    let firstLine = null;

    for (const line of lines) {

      const trimmedLine = line.trim();
      if (trimmedLine.length > 0) {

        firstLine = trimmedLine;
        break;

      }

    }

    if (!firstLine) {

      this.error_message = "The file appears to be empty!";
      return false;

    }

    try {

      const firstObject = JSON.parse(firstLine);

      if (firstObject.type !== "CityJSON") {

        this.error_message = "This is not a CityJSONSeq file! First line must contain a CityJSON header.";
        return false;

      }

      return true;

    } catch (error) {

      this.error_message = "Invalid JSON format in the first line of the file!";
      return false;

    }

  }


  /**
 * Convert Map objects to plain JSON objects recursively
 * @param {*} obj - Object that may contain Maps
 * @returns {*} Object with Maps converted to plain objects
 * @private
 */
  _convertMapToJson(obj) {

    if (obj instanceof Map) {

      const result = {};
      for (const [key, value] of obj) {

        result[key] = this._convertMapToJson(value);

      }

      return result;

    } else if (Array.isArray(obj)) {

      return obj.map(item => this._convertMapToJson(item));

    } else if (obj !== null && typeof obj === 'object') {

      const result = {};
      for (const [key, value] of Object.entries(obj)) {

        result[key] = this._convertMapToJson(value);

      }

      return result;

    }

    return obj;

  }

  /**
   * Initialize WASM module if not already initialized
   * @private
   */
  async _initWasm() {

    if (!this._wasmInitialized) {

      await init();
      this._wasmInitialized = true;

    }

  }

  /**
   * Load CityJSONSeq data
   * @param {string|Array} data - CityJSONSeq data as string (newline-delimited JSON) or array of parsed objects
   */
  async toCityJSON(data) {


    // Initialize WASM module
    await this._initWasm();

    let parsedLines;

    // If data is a string, parse it as newline-delimited JSON
    if (typeof data === 'string') {

      parsedLines = this.parseCityJSONSeq(data);

    } else if (Array.isArray(data)) {

      // If data is already an array of parsed objects, use it directly
      parsedLines = data;

    } else {

      throw new Error('CityJSONSeq data must be either a string or an array of objects');

    }

    if (parsedLines.length === 0) {

      throw new Error('CityJSONSeq data is empty');

    }

    // First line should be the base CityJSON metadata
    const baseCityJSON = parsedLines[0];

    // Remaining lines are CityJSONFeature objects
    const features = parsedLines.slice(1);



    // Convert CityJSONSeq to CityJSON using the cjseq package
    const rawCityJSONData = cjseqToCj(baseCityJSON, features);

    // Convert any Map objects to plain JSON objects
    const cityJSONData = this._convertMapToJson(rawCityJSONData);

    return cityJSONData;

  }

  /**
 * Parse CityJSONSeq string into array of JSON objects
 * @param {string} data - CityJSONSeq data as newline-delimited JSON string
 * @returns {Array} Array of parsed JSON objects
 */
  parseCityJSONSeq(data) {

    const lines = data.trim().split('\n');
    const parsedLines = [];

    for (let i = 0; i < lines.length; i++) {

      const line = lines[i].trim();

      // Skip empty lines
      if (line === '') continue;

      try {

        const parsed = JSON.parse(line);
        parsedLines.push(parsed);

      } catch (error) {

        throw new Error(`Failed to parse line ${i + 1} of CityJSONSeq: ${error.message}`);

      }

    }

    return parsedLines;

  }

  /**
   * Load CityJSONSeq from a URL
   * @param {string} url - URL to fetch CityJSONSeq data from
   * @returns {Promise} Promise that resolves when loading is complete
   */
  async loadFromURL(url) {

    try {

      const response = await fetch(url);

      if (!response.ok) {

        throw new Error(`Failed to fetch CityJSONSeq from ${url}: ${response.statusText}`);

      }

      const text = await response.text();
      await this.load(text);

    } catch (error) {

      throw new Error(`Error loading CityJSONSeq from URL: ${error.message}`);

    }

  }

}

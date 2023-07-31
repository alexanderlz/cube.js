const { Pool } = require('vertica-nodejs');
const { types } = require('pg');
const { BaseDriver } = require('@cubejs-backend/query-orchestrator');

const defaultGenericType = 'text';
const GenericTypeToVertica = {
  string: 'varchar',
  text: 'long varchar',
  int: 'integer',
  bigint: 'bigint',
  double: 'float',
  decimal: 'decimal',
  boolean: 'boolean',
  date: 'date',
  timestamp: 'timestamp'
};

const NativeTypeToVerticaType = {};

Object.entries(types.builtins).forEach(([key, value]) => {
  NativeTypeToVerticaType[value] = key;
});

const VerticaTypeToGenericType = {
  // char is similar to bpchar in Vertica
  char: 'varchar',
  varchar: 'string',
  integer: 'int',
  bigint: 'bigint',
  float: 'double',
  decimal: 'decimal',
  boolean: 'boolean',
  date: 'date',
  timestamp: 'timestamp'
};

class VerticaDriver extends BaseDriver {
  constructor(config) {
    super();
    this.pool = new Pool({
      max:
        process.env.CUBEJS_DB_MAX_POOL && parseInt(process.env.CUBEJS_DB_MAX_POOL, 10) ||
        config.maxPoolSize || 8,
      host: process.env.CUBEJS_DB_HOST,
      database: process.env.CUBEJS_DB_NAME,
      port: process.env.CUBEJS_DB_PORT,
      user: process.env.CUBEJS_DB_USER,
      password: process.env.CUBEJS_DB_PASS,
      ssl: this.getSslOptions(),
      ...config,
    });
  }

  async query(query, values) {
    const queryResult = await this.pool.query(query, values);
    return queryResult.rows;
  }


  async downloadQueryResults(query, values, options){
//    if (options.streamImport) {
  //    return this.stream(query, values, options);
    //}
      //types: this.mapFields(res.fields),

    const res = await this.query(query, values);
    return {
      rows: res.rows,
      types: res.fields
    };
  }

  async mapFields(fields) {
    return fields.map((f) => {
      const verticaType = this.getVerticaTypeForField(f.dataTypeID);
      if (!verticaType) {
        throw new Error(
            `Unable to detect type for field "${f.name}" with dataTypeID: ${f.dataTypeID}`
        );
      }

      return {
        name: f.name,
        type: this.toGenericType(verticaType)
      };
    });
  }

  readOnly() {
    return true;
  }

  async testConnection() {
    return this.query('select 1 as n');
  }

  async release() {
    this.pool.end();
  }

  informationSchemaQuery() {
    return `
      SELECT
        column_name,
        table_name, 
        table_schema,
        data_type
      FROM v_catalog.columns;
    `;
  }

  async createSchemaIfNotExists(schemaName) {
    return this.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName};`);
  }

  getTablesQuery(schemaName) {
    return this.query(
      `SELECT table_name FROM v_catalog.tables WHERE table_schema = ${this.param(0)}`,
      [schemaName]
    );
  }

  async getVerticaTypeForField(dataTypeID) {
    if (dataTypeID in NativeTypeToVerticaType) {
      return NativeTypeToVerticaType[dataTypeID].toLowerCase();
    }

    return null;
  }

  async tableColumnTypes(table) {
    const [schema, name] = table.split('.');

    const columns = await this.query(
      `SELECT
        column_name,
        data_type
      FROM v_catalog.columns
      WHERE table_name = ${this.param(0)}
        AND table_schema = ${this.param(1)}`,
      [name, schema]
    );

    return columns.map(c => ({ name: c.column_name, type: this.toGenericType(c.data_type) }));
  }

  toGenericType(columnType) {
    const type = columnType.toLowerCase().replace(/\([0-9,]+\)/, '');
    return VerticaTypeToGenericType[type] || defaultGenericType;
  }
}

module.exports = VerticaDriver;


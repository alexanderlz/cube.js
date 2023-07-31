import { BaseQuery } from './BaseQuery';

const GRANULARITY_TO_INTERVAL = {
  day: 'DD',
  week: 'W',
  hour: 'HH24',
  minute: 'mm',
  second: 'ss',
  month: 'MM',
  quarter: 'Q',
  year: 'YY'
};

export class VerticaQuery extends BaseQuery {
  convertTz(field) {
    return `${field} AT TIME ZONE '${this.timezone}'`;
  }

  // eslint-disable-next-line no-unused-vars
  timeStampParam(timeDimension) {
    return this.timeStampCast('?');
  }

  timeGroupedColumn(granularity, dimension) {
    return `TRUNC(${dimension}, '${GRANULARITY_TO_INTERVAL[granularity]}')`;
  }

  countDistinctApprox(sql) {
    return `APPROXIMATE_COUNT_DISTINCT(${sql})`;
  }

  // THIS IS A WORKAROUND!
  hllInit(sql) {
    return `APPROXIMATE_COUNT_DISTINCT(${sql})`;
  }

  hllMerge(sql) {
    return `APPROXIMATE_COUNT_DISTINCT(${sql})`;
  }

  hllCardinality(sql) {
    return `APPROXIMATE_COUNT_DISTINCT(${sql})`;
  }


  defaultRefreshKeyRenewalThreshold() {
    return 120;
  }

  defaultEveryRefreshKey() {
    return {
      every: '2 minutes'
    };
  }

  nowTimestampSql() {
    return 'CURRENT_TIMESTAMP';
  }
	
}

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
process.env.DB_SECRET_NAME = 'dbsecretname';
process.env.CONNECTION_NAME = 'connectionname';
process.env.METADATA_BUCKET = 'metadatabucket';
process.env.METADATA_BUCKET_KEY = 'metadatabucketkey';
process.env.IMPORT_BUCKET = 'importbucket';
process.env.MAX_MEMORY_SIZE = '500';

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: { '^@src/(.*)$': '<rootDir>/test/$1' },
};
# Advanced Topics

This part includes more advanced topics and is for more technical people.

## How to edit objects and fields - post deployment

The system writes `.schema.json` files to a bucket in S3. In order to change the objects and/or fields the system should import, changing these files is required. This task is a bit technical and as so may be difficult for some users to accomplish. Improper formatting or syntax errors will result in complete system failure.

### Adding/Removing Fields in an Existing Object

For a Salesforce Object which is already being imported to the system, to add or remove a field you must download the corresponding file in S3.

- Visit the AWS S3 console, and in the `sf-metadata-<installationId>` bucket, under the `schemas` folder will be all the files.
- Find the one that starts with the Salesforce Object name you intend to edit and download the file.
- In an editor of your choice, move fields within the JSON file to/from the `excluded` and `properties` top level fields.

  Fields in the `excluded` will not be imported, and fields in the `properties` will be imported.

  `Warning:` If you simply remove the field, it will get repopulated into the properties field so this does not work and so must be copied into the exclude section.

- Once complete, upload the file back to S3 with the same name.

The next time the step function runs to sync the data, your changes will be applied.

### Adding/Removing Salesforce Objects

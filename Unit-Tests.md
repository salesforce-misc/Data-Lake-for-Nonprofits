# Unit Tests

For information about running tests for create-react-app applications
<https://create-react-app.dev/docs/running-tests/>

## Mocks

Since Jest has not fully supported ESM yet, we used mocks for some third party libraries.
These mocks can be found under `src/__mocks__`
Following modules are being mocked here.

- react-markdown
- remark-gfm

## Models

### Field Model

- initialized properly
- address is a compound type
- location is a compound type
- any other type different than address and location is not a compound type
- can not exclude id type
- can not exclude certain names
- can exclude other field types
- can not toggle excluded prop if canExclude is false
- can not toggle excluded prop for compound type
- can toggle excluded prop for other types

### SFObject Model

- initialized properly
- set object using setObject action
- set fields using setFields action
- set fields using setFields action except compound fields
- set field using setField action
- set fields loaded using setFieldsLoaded action
- set selected using setSelected action
- set stale using markStale action
- get selectable fields using selectableFields view
- get listable fields using listableFields view
- get immutable fields using immutableFields view
- get selected fields using selectedFields view
- get user selected fields using userSelectedFields view
- get excluded fields using excludedFields view
- get all excluded fields using allExcludedFields view
- get number of fields using fieldsCount view
- get number of selected fields using selectedFieldsCount view
- get number of excluded fields using excludedFieldsCount view
- check the object is not default
- check the Account object is default

### Credentials Model

- initialized properly
- reset credentials using reset action
- root user
- non-root user
- non-empty credentials
- empty access key
- empty secret key

### DetectedInstallation Model

- initialized properly
- start date view
- started by view
- account id view
- appFlow connection name view

### UserAccessKey Model

- initialized properly
- set access key
- set status
- mark stale
- if it is active using the view

### User Model

- initialized properly
- set user
- set a new access key
- set an existing access key
- mark stale
- if the user does not have admin policy
- if the user has admin policy
- list access keys
- NO_POLICY access status
- NO_KEYS access status
- NOT_ACTIVE_KEYS access status
- VALID access status

## Stores

### Base Store

- initialized properly
- props after created with loading state
- props after created with reloading state
- props after created with an error
- set loading percentage
- increment loading percentage
- reset the store
- error message
- error message when doLoad is implemented

## Components

### ClickableImage

- snapshot
- render properly
- click event

### ClipboardField

- snapshot
- render text properly
- render password properly
- can copy a text

### CurvedBox

- snapshot
- render properly

### FieldsTable

- snapshot

#### FieldsTable -> EmptyMessage

- snapshot
- render null if fields prop is not empty
- render no mathces are found if search text is not empty
- render no fields are found

#### FieldsTable -> FieldsGrid

#### FieldsTable -> FieldsViewOptionsPanel

#### FieldsTable -> ImmutableField

#### FieldsTable -> ImmutableFieldsGrid

#### FieldsTable -> SelectableField

### Header

- snapshot
- render app title

### Markdown

- snapshot
- render properly

### ObjectsTable

#### ObjectsTable -> EmptyMessage

#### ObjectsTable -> ObjectRow

#### ObjectsTable -> ObjectsPanel

#### ObjectsTable -> ObjectsViewOptionsPanel

### OutlineButton

### PaginationButtons

### RetryErrorPanel

### StepsBanner

### StepsIndicator

### TimeAgo

### TimeInput

## Pages

### Home Page

### Step1 Page

#### CredentialsError

<!-- - Unit test to check rendering properly without an exception
- Unit test to check rendering properly with an invalid key exception
- Unit test to check rendering properly with a non-admin key exception
- Unit test to check rendering properly with an account mismatch exception
- Unit test to check rendering properly with a default exception
- Unit test to check rendering properly with an unknown exception -->

### CredentialsForm

### Step2 Page

### Step3 Page

### Step4 Page

### Step5 Page

### Step6 Page

### BackHome Page

### App
